const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');

if (!process.env.CLOUDFLARE_WORKER) {
  require('dotenv').config();
}

const {
  supabase,
  isSupabaseConfigured,
  localMockStore,
  checkSupabaseStatus,
  uploadResidentPhoto
} = require('./src/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static uploads directory
// Cloudflare Workers compatible upload handling.
// Files are kept in memory and uploaded directly to Supabase Storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}-${rand}`;
}

function isDummyPhoto(url) {
  if (!url || typeof url !== 'string') return true;
  const clean = url.trim().toLowerCase();
  if (!clean || clean === 'null' || clean === 'undefined' || clean === 'none') return true;
  if (clean.includes('unsplash.com')) return true;
  if (clean.includes('placeholder')) return true;
  if (clean.includes('dummy')) return true;
  if (clean.includes('example.com')) return true;
  return false;
}

// Resident Data Normalizer & DB Mapper
function formatResident(r) {
  if (!r) return null;
  let agentName = '';
  let joiningRemarks = '';
  let userNotes = r.notes || '';

  if (userNotes && typeof userNotes === 'string') {
    if (userNotes.startsWith('{') && userNotes.endsWith('}')) {
      try {
        const parsed = JSON.parse(userNotes);
        agentName = parsed.agent_name || '';
        joiningRemarks = parsed.joining_payment_remarks || '';
        userNotes = parsed.notes || '';
      } catch (e) {}
    } else if (userNotes.includes('Agent:')) {
      const match = userNotes.match(/Agent:\s*([^|\n]+)/);
      if (match) agentName = match[1].trim();
      joiningRemarks = userNotes;
    }
  }

  const depositValue = r.security_deposit !== null && r.security_deposit !== undefined
    ? Number(r.security_deposit)
    : (r.deposit !== null && r.deposit !== undefined ? Number(r.deposit) : 10000);

  return {
    ...r,
    father_name: r.guardian_name || r.father_name || '',
    guardian_name: r.guardian_name || r.father_name || '',
    parent_phone: r.guardian_phone || r.parent_phone || '',
    guardian_phone: r.guardian_phone || r.parent_phone || '',
    joining_date: r.admission_date || r.joining_date || '',
    admission_date: r.admission_date || r.joining_date || '',
    deposit: depositValue,
    security_deposit: depositValue,
    monthly_rent: Number(r.monthly_rent || 7500),
    agent_name: agentName || r.agent_name || '',
    joining_payment_remarks: joiningRemarks || r.joining_payment_remarks || userNotes || '',
    notes: userNotes,
    photo_url: isDummyPhoto(r.photo_url) ? '' : r.photo_url
  };
}

// Prepare payload for Supabase / database with safe type casting & room resolution
async function prepareResidentDbPayload(body, photoUrl) {
  let roomId = body.room_id && body.room_id !== '' && body.room_id !== 'null' && body.room_id !== 'undefined' ? body.room_id : null;
  let roomNumber = body.room_number ? String(body.room_number).trim() : '';

  // Auto-resolve roomId from roomNumber or vice-versa
  if (!roomId && roomNumber && isSupabaseConfigured && supabase) {
    try {
      const { data: foundRoom } = await supabase.from('rooms').select('id, room_number').eq('room_number', roomNumber).maybeSingle();
      if (foundRoom) {
        roomId = foundRoom.id;
      }
    } catch (e) {}
  } else if (roomId && !roomNumber && isSupabaseConfigured && supabase) {
    try {
      const { data: foundRoom } = await supabase.from('rooms').select('id, room_number').eq('id', roomId).maybeSingle();
      if (foundRoom) {
        roomNumber = foundRoom.room_number;
      }
    } catch (e) {}
  }

  if (!roomId && roomNumber && !isSupabaseConfigured) {
    const foundRoom = localMockStore.rooms.find(r => r.room_number === roomNumber);
    if (foundRoom) roomId = foundRoom.id;
  } else if (roomId && !roomNumber && !isSupabaseConfigured) {
    const foundRoom = localMockStore.rooms.find(r => r.id === roomId);
    if (foundRoom) roomNumber = foundRoom.room_number;
  }

  const fatherName = body.father_name || body.guardian_name || '';
  const parentPhone = body.parent_phone || body.guardian_phone || '';
  const admissionDate = body.joining_date || body.admission_date || new Date().toISOString().split('T')[0];
  const deposit = Number(body.deposit !== undefined && body.deposit !== '' ? body.deposit : (body.security_deposit || 10000));
  const rent = Number(body.monthly_rent || 7500);
  const agentName = body.agent_name || '';
  const remarks = body.joining_payment_remarks || '';
  const userNotes = body.notes || '';

  // Store metadata safely in notes
  let notesValue = userNotes;
  if (agentName || remarks) {
    notesValue = JSON.stringify({
      agent_name: agentName,
      joining_payment_remarks: remarks,
      notes: userNotes
    });
  }

  const payload = {
    name: String(body.name || '').trim(),
    room_id: roomId,
    room_number: roomNumber,
    phone: String(body.phone || '').trim(),
    email: body.email || '',
    guardian_name: fatherName,
    guardian_phone: parentPhone,
    admission_date: admissionDate,
    monthly_rent: rent,
    security_deposit: deposit,
    blood_group: body.blood_group || 'B+',
    college_or_work: body.college_or_work || '',
    status: body.status || 'Active',
    notes: notesValue,
    updated_at: new Date().toISOString()
  };

  if (photoUrl && !isDummyPhoto(photoUrl)) {
    payload.photo_url = photoUrl;
  } else if (body.photo_url !== undefined && body.photo_url !== null) {
    payload.photo_url = isDummyPhoto(body.photo_url) ? '' : body.photo_url;
  }

  return payload;
}

// Sync room bed occupancy helper
async function syncRoomOccupancy(roomId, roomNumber) {
  try {
    if (isSupabaseConfigured && supabase) {
      let targetRoomId = roomId;
      if (!targetRoomId && roomNumber) {
        const { data: rm } = await supabase.from('rooms').select('id').eq('room_number', roomNumber).maybeSingle();
        if (rm) targetRoomId = rm.id;
      }
      if (!targetRoomId) return;

      const { data: targetRoom } = await supabase.from('rooms').select('id, room_number, total_beds').eq('id', targetRoomId).maybeSingle();
      if (!targetRoom) return;

      const { count } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .or(`room_id.eq.${targetRoom.id},room_number.eq.${targetRoom.room_number}`)
        .eq('status', 'Active');

      const occ = count || 0;
      const status = occ >= targetRoom.total_beds ? 'Full' : 'Available';

      await supabase
        .from('rooms')
        .update({ occupied_beds: occ, status, updated_at: new Date().toISOString() })
        .eq('id', targetRoom.id);
    }
  } catch (err) {
    console.warn('⚠️ Room sync non-critical notice:', err.message);
  }
}

// ==============================================================================
// 0. ADMIN AUTHENTICATION API
// ==============================================================================
const ADMIN_ACCOUNTS = [
  {
    username: 'swasthishree_admin',
    aliases: ['swasthishree_mangalore', 'hostel_admin'],
    password: 'Swasthi@24',
    name: 'Swasthishree Admin',
    role: 'Hostel Admin'
  },
  {
    username: 'master_admin',
    aliases: ['admin', 'skchinnu', 'developer_admin'],
    password: 'Manipal@0818',
    name: 'Master Admin',
    role: 'Master Admin'
  }
];

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both username and password' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const matchedAccount = ADMIN_ACCOUNTS.find(
      acc => (acc.username.toLowerCase() === cleanUsername || (acc.aliases && acc.aliases.includes(cleanUsername))) &&
             acc.password === cleanPassword
    );

    if (!matchedAccount) {
      return res.status(401).json({ error: 'Invalid username or password. Access denied.' });
    }

    const token = `auth-${Buffer.from(`${matchedAccount.username}:${Date.now()}`).toString('base64')}`;
    const userPayload = {
      username: matchedAccount.username,
      name: matchedAccount.name,
      role: matchedAccount.role,
      token,
      loggedInAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: `Welcome back, ${matchedAccount.name}!`,
      user: userPayload
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ==============================================================================
app.get('/api/health', async (req, res) => {
  const supabaseStatus = await checkSupabaseStatus();
  res.json({
    status: 'healthy',
    system: 'Swasthishree (ಸ್ವಸ್ತಿ ಶ್ರೀ) Hostel & Resident Management Server',
    version: '2.2.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: supabaseStatus
  });
});

// ==============================================================================
// 2. DASHBOARD KPI & ANALYTICS
// ==============================================================================
app.get('/api/stats', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const [
          { count: totalResidents },
          { data: roomsData },
          { data: paymentsData },
          { count: activeVisitors }
        ] = await Promise.all([
          supabase.from('residents').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
          supabase.from('rooms').select('total_beds, occupied_beds, monthly_rent'),
          supabase.from('payments').select('amount, status'),
          supabase.from('visitors').select('*', { count: 'exact', head: true }).eq('status', 'Checked In')
        ]);

        const totalBeds = roomsData?.reduce((acc, r) => acc + (Number(r.total_beds) || 0), 0) || 0;
        const occupiedBeds = totalResidents || 0;
        const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
        
        const totalRevenueCollected = paymentsData?.filter(p => p.status === 'Paid').reduce((acc, p) => acc + Number(p.amount || 0), 0) || 0;
        const pendingRevenue = paymentsData?.filter(p => p.status === 'Pending' || p.status === 'Overdue').reduce((acc, p) => acc + Number(p.amount || 0), 0) || 0;

        return res.json({
          totalResidents: occupiedBeds,
          totalBeds,
          occupiedBeds,
          vacantBeds: Math.max(0, totalBeds - occupiedBeds),
          occupancyRate,
          totalRevenueCollected,
          pendingRevenue,
          activeVisitors: activeVisitors || 0
        });
      } catch (e) {
        console.warn('Supabase stats error, falling back to local store:', e.message);
      }
    }

    // Dynamic stats from local mock store
    const activeRes = localMockStore.residents.filter(r => r.status === 'Active');
    const totalBeds = localMockStore.rooms.reduce((acc, r) => acc + (Number(r.total_beds) || 0), 0);
    const occupiedBeds = activeRes.length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const totalRevenueCollected = localMockStore.payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const pendingRevenue = localMockStore.payments.filter(p => p.status !== 'Paid').reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const activeVisitors = localMockStore.visitors.filter(v => v.status === 'Checked In').length;

    res.json({
      totalResidents: activeRes.length,
      totalBeds,
      occupiedBeds,
      vacantBeds: Math.max(0, totalBeds - occupiedBeds),
      occupancyRate,
      totalRevenueCollected,
      pendingRevenue,
      activeVisitors
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 3. RESIDENTS MANAGEMENT API
// ==============================================================================
app.get('/api/residents', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('residents')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(formatResident);
          return res.json(formatted);
        }
      } catch (e) {
        console.warn('Supabase get residents error, falling back to local store:', e.message);
      }
    }

    const formatted = localMockStore.residents.map(formatResident);
    res.json(formatted);
  } catch (err) {
    console.error('Error getting residents:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/residents', upload.single('photo'), async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Resident Name and Phone number are required.' });
    }

    let photoUrl = req.body.photo_url || '';
    if (req.file) {
      try {
        photoUrl = await uploadResidentPhoto(req.file);
      } catch (e) {}
    }

    const dbPayload = await prepareResidentDbPayload(req.body, photoUrl);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('residents')
          .insert([dbPayload])
          .select()
          .single();

        if (!error && data) {
          await syncRoomOccupancy(dbPayload.room_id, dbPayload.room_number);
          return res.status(201).json(formatResident(data));
        }
      } catch (e) {
        console.warn('Supabase create resident error, falling back to local store:', e.message);
      }
    }

    const newResident = {
      id: `res-${Date.now()}`,
      ...dbPayload,
      father_name: req.body.father_name || req.body.guardian_name || '',
      parent_phone: req.body.parent_phone || req.body.guardian_phone || '',
      joining_date: req.body.joining_date || req.body.admission_date || '',
      agent_name: req.body.agent_name || '',
      deposit: Number(req.body.deposit !== undefined ? req.body.deposit : (req.body.security_deposit || 0)),
      joining_payment_remarks: req.body.joining_payment_remarks || req.body.notes || '',
      created_at: new Date().toISOString()
    };
    localMockStore.residents.unshift(newResident);

    if (newResident.room_id || newResident.room_number) {
      const targetRoom = localMockStore.rooms.find(r => r.id === newResident.room_id || r.room_number === newResident.room_number);
      if (targetRoom) {
        targetRoom.occupied_beds = (targetRoom.occupied_beds || 0) + 1;
        if (targetRoom.occupied_beds >= targetRoom.total_beds) {
          targetRoom.status = 'Full';
        }
      }
    }

    res.status(201).json(formatResident(newResident));
  } catch (err) {
    console.error('Error creating resident:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/residents/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;

    let photoUrl = req.body.photo_url;
    if (req.file) {
      try {
        photoUrl = await uploadResidentPhoto(req.file);
      } catch (e) {}
    }

    const dbPayload = await prepareResidentDbPayload(req.body, photoUrl);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: previous } = await supabase.from('residents').select('room_id, room_number').eq('id', id).maybeSingle();

        const { data, error } = await supabase
          .from('residents')
          .update(dbPayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          if (previous) {
            await syncRoomOccupancy(previous.room_id, previous.room_number);
          }
          await syncRoomOccupancy(dbPayload.room_id, dbPayload.room_number);

          return res.json(formatResident(data));
        }
      } catch (e) {
        console.warn('Supabase update resident error, falling back to local store:', e.message);
      }
    }

    const index = localMockStore.residents.findIndex(r => r.id === id);
    if (index === -1) {
      const fallbackRes = { id, ...dbPayload, created_at: new Date().toISOString() };
      localMockStore.residents.unshift(fallbackRes);
      return res.json(formatResident(fallbackRes));
    }

    localMockStore.residents[index] = {
      ...localMockStore.residents[index],
      ...dbPayload,
      father_name: req.body.father_name || req.body.guardian_name || localMockStore.residents[index].father_name,
      parent_phone: req.body.parent_phone || req.body.guardian_phone || localMockStore.residents[index].parent_phone,
      joining_date: req.body.joining_date || req.body.admission_date || localMockStore.residents[index].joining_date,
      agent_name: req.body.agent_name || localMockStore.residents[index].agent_name,
      deposit: req.body.deposit !== undefined ? Number(req.body.deposit) : localMockStore.residents[index].deposit,
      joining_payment_remarks: req.body.joining_payment_remarks || localMockStore.residents[index].joining_payment_remarks
    };

    res.json(formatResident(localMockStore.residents[index]));
  } catch (err) {
    console.error('Error updating resident:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/residents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase.from('residents').select('room_id, room_number').eq('id', id).maybeSingle();
        const { error } = await supabase.from('residents').delete().eq('id', id);
        if (!error) {
          if (existing) {
            await syncRoomOccupancy(existing.room_id, existing.room_number);
          }
          return res.json({ message: 'Resident removed successfully', id });
        }
      } catch (e) {
        console.warn('Supabase delete resident error, falling back to local store:', e.message);
      }
    }

    const index = localMockStore.residents.findIndex(r => r.id === id);
    if (index !== -1) {
      const resident = localMockStore.residents[index];
      localMockStore.residents.splice(index, 1);
      
      if (resident.room_id || resident.room_number) {
        const room = localMockStore.rooms.find(r => r.id === resident.room_id || r.room_number === resident.room_number);
        if (room && room.occupied_beds > 0) {
          room.occupied_beds -= 1;
          room.status = 'Available';
        }
      }
    }
    res.json({ message: 'Resident removed successfully', id });
  } catch (err) {
    console.error('Error deleting resident:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 4. ROOMS & BED MANAGEMENT API
// ==============================================================================
app.get('/api/rooms', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const [
          { data: roomsData, error: roomsError },
          { data: residentsData, error: resError }
        ] = await Promise.all([
          supabase.from('rooms').select('*'),
          supabase.from('residents').select('id, room_id, room_number, status').eq('status', 'Active')
        ]);

        if (!roomsError && roomsData) {
          const activeResidents = residentsData || [];
          const roomsWithOccupancy = roomsData.map(room => {
            const occ = activeResidents.filter(r => (r.room_id && r.room_id === room.id) || (r.room_number && String(r.room_number) === String(room.room_number))).length;
            const totalBeds = Number(room.total_beds) || 1;
            return {
              ...room,
              occupied_beds: occ,
              status: occ >= totalBeds ? 'Full' : 'Available'
            };
          });

          roomsWithOccupancy.sort((a, b) => (parseInt(a.room_number) || 0) - (parseInt(b.room_number) || 0));
          return res.json(roomsWithOccupancy);
        }
      } catch (e) {
        console.warn('Supabase get rooms error, falling back to local store:', e.message);
      }
    }

    const activeResidents = localMockStore.residents.filter(r => r.status === 'Active');
    const roomsWithOccupancy = localMockStore.rooms.map(room => {
      const occ = activeResidents.filter(r => (r.room_id && r.room_id === room.id) || (r.room_number && String(r.room_number) === String(room.room_number))).length;
      const totalBeds = Number(room.total_beds) || 1;
      return {
        ...room,
        occupied_beds: occ,
        status: occ >= totalBeds ? 'Full' : 'Available'
      };
    });

    roomsWithOccupancy.sort((a, b) => (parseInt(a.room_number) || 0) - (parseInt(b.room_number) || 0));
    res.json(roomsWithOccupancy);
  } catch (err) {
    console.error('Error getting rooms:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { room_number, floor, room_type, total_beds, monthly_rent, amenities } = req.body;

    if (!room_number || !String(room_number).trim()) {
      return res.status(400).json({ error: 'Room number is required' });
    }

    const cleanRoomNumber = String(room_number).trim();
    const beds = Math.max(1, Number(total_beds) || 1);
    const price = Number(monthly_rent) >= 0 ? Number(monthly_rent) : 7500;
    const floorNum = Number(floor) || 1;
    const amenitiesArr = Array.isArray(amenities)
      ? amenities
      : (typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()).filter(Boolean) : ['Wi-Fi', 'Attached Washroom', 'Cupboard']);

    const payload = {
      room_number: cleanRoomNumber,
      floor: floorNum,
      room_type: room_type || `${beds} Sharing`,
      total_beds: beds,
      occupied_beds: 0,
      monthly_rent: price,
      amenities: amenitiesArr,
      status: 'Available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase.from('rooms').select('id').eq('room_number', cleanRoomNumber).maybeSingle();
        if (existing) {
          return res.status(400).json({ error: `Room "${cleanRoomNumber}" already exists. Please choose a different room number.` });
        }

        const { data, error } = await supabase.from('rooms').insert([payload]).select().single();
        if (!error && data) {
          return res.status(201).json(data);
        }
      } catch (e) {
        console.warn('Supabase create room error, falling back to local store:', e.message);
      }
    }

    const existingMock = localMockStore.rooms.find(r => String(r.room_number).trim().toLowerCase() === cleanRoomNumber.toLowerCase());
    if (existingMock) {
      return res.status(400).json({ error: `Room "${cleanRoomNumber}" already exists. Please choose a different room number.` });
    }

    const newRoom = { id: `room-${Date.now()}`, ...payload };
    localMockStore.rooms.push(newRoom);
    res.status(201).json(newRoom);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, floor, room_type, total_beds, monthly_rent, amenities, status } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (room_number !== undefined) updates.room_number = String(room_number).trim();
    if (floor !== undefined) updates.floor = Number(floor) || 1;
    if (total_beds !== undefined) updates.total_beds = Math.max(1, Number(total_beds) || 1);
    if (room_type !== undefined) updates.room_type = room_type;
    else if (total_beds !== undefined) updates.room_type = `${updates.total_beds} Sharing`;
    if (monthly_rent !== undefined) updates.monthly_rent = Number(monthly_rent) >= 0 ? Number(monthly_rent) : 0;
    if (amenities !== undefined) {
      updates.amenities = Array.isArray(amenities)
        ? amenities
        : (typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()).filter(Boolean) : []);
    }
    if (status !== undefined) updates.status = status;

    if (isSupabaseConfigured && supabase) {
      try {
        if (updates.room_number) {
          const { data: duplicate } = await supabase
            .from('rooms')
            .select('id')
            .eq('room_number', updates.room_number)
            .neq('id', id)
            .maybeSingle();
          if (duplicate) {
            return res.status(400).json({ error: `Room number "${updates.room_number}" is already used by another room.` });
          }
        }

        const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select().single();
        if (!error && data) {
          if (updates.room_number) {
            await supabase.from('residents').update({ room_number: updates.room_number }).eq('room_id', id);
          }
          await syncRoomOccupancy(id, updates.room_number);
          return res.json(data);
        }
      } catch (e) {
        console.warn('Supabase update room error, falling back to local store:', e.message);
      }
    }

    const index = localMockStore.rooms.findIndex(r => r.id === id || String(r.room_number) === String(id));
    if (index === -1) return res.status(404).json({ error: 'Room not found' });

    if (updates.room_number) {
      const duplicateMock = localMockStore.rooms.find(
        (r, idx) => idx !== index && String(r.room_number).trim().toLowerCase() === updates.room_number.toLowerCase()
      );
      if (duplicateMock) {
        return res.status(400).json({ error: `Room number "${updates.room_number}" is already used by another room.` });
      }
    }

    const oldRoomNumber = localMockStore.rooms[index].room_number;
    localMockStore.rooms[index] = { ...localMockStore.rooms[index], ...updates };

    if (updates.room_number && updates.room_number !== oldRoomNumber) {
      localMockStore.residents.forEach(res => {
        if (res.room_id === id || String(res.room_number) === String(oldRoomNumber)) {
          res.room_number = updates.room_number;
        }
      });
    }

    res.json(localMockStore.rooms[index]);
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: targetRoom } = await supabase.from('rooms').select('id, room_number').eq('id', id).maybeSingle();
        if (targetRoom) {
          await supabase.from('residents').update({ room_id: null, room_number: '' }).or(`room_id.eq.${targetRoom.id},room_number.eq.${targetRoom.room_number}`);
        }

        const { error } = await supabase.from('rooms').delete().eq('id', id);
        if (!error) {
          return res.json({ message: 'Room deleted successfully', id });
        }
      } catch (e) {
        console.warn('Supabase delete room error, falling back to local store:', e.message);
      }
    }

    const targetRoomIndex = localMockStore.rooms.findIndex(r => r.id === id || String(r.room_number) === String(id));
    if (targetRoomIndex !== -1) {
      const targetRoom = localMockStore.rooms[targetRoomIndex];
      localMockStore.residents.forEach(res => {
        if (res.room_id === targetRoom.id || String(res.room_number) === String(targetRoom.room_number)) {
          res.room_id = null;
          res.room_number = '';
        }
      });
      localMockStore.rooms.splice(targetRoomIndex, 1);
    }

    res.json({ message: 'Room deleted successfully', id });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 5. PAYMENTS & BILLING API
// ==============================================================================
app.get('/api/payments', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return res.json(data || []);
    }

    res.json(localMockStore.payments);
  } catch (err) {
    console.error('Error getting payments:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const {
      resident_id,
      resident_name,
      room_number,
      amount,
      month_year,
      payment_date,
      payment_method,
      transaction_ref,
      status,
      notes
    } = req.body;

    if (!amount || !month_year) {
      return res.status(400).json({ error: 'Amount and Month/Year are required.' });
    }

    const receipt_number = req.body.receipt_number || generateReceiptNumber();

    const payload = {
      resident_id: resident_id || null,
      resident_name: resident_name || 'Resident',
      room_number: room_number || '',
      amount: Number(amount),
      month_year,
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      payment_method: payment_method || 'UPI',
      transaction_ref: transaction_ref || `${payment_method || 'UPI'}-${Date.now()}`,
      receipt_number,
      status: status || 'Paid',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('payments').insert([payload]).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    const newPayment = { id: `pay-${Date.now()}`, ...payload };
    localMockStore.payments.unshift(newPayment);
    res.status(201).json(newPayment);
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.amount) updates.amount = Number(updates.amount);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    const index = localMockStore.payments.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    localMockStore.payments[index] = { ...localMockStore.payments[index], ...updates };
    res.json(localMockStore.payments[index]);
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
      return res.json({ message: 'Payment record deleted', id });
    }

    localMockStore.payments = localMockStore.payments.filter(p => p.id !== id);
    res.json({ message: 'Payment record deleted', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 6. VISITORS & GATE LOG API
// ==============================================================================
app.get('/api/visitors', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('check_in_time', { ascending: false });

      if (error) throw error;
      return res.json(data || []);
    }

    res.json(localMockStore.visitors);
  } catch (err) {
    console.error('Error getting visitors:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visitors', async (req, res) => {
  try {
    const { resident_id, resident_name, room_number, visitor_name, relation, phone, purpose } = req.body;

    if (!visitor_name) {
      return res.status(400).json({ error: 'Visitor name is required' });
    }

    const payload = {
      resident_id: resident_id || null,
      resident_name: resident_name || '',
      room_number: room_number || '',
      visitor_name,
      relation: relation || 'Friend',
      phone: phone || '',
      purpose: purpose || 'Visit',
      check_in_time: new Date().toISOString(),
      status: 'Checked In',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('visitors').insert([payload]).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    const newVisitor = { id: `vis-${Date.now()}`, ...payload };
    localMockStore.visitors.unshift(newVisitor);
    res.status(201).json(newVisitor);
  } catch (err) {
    console.error('Error logging visitor:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/visitors/:id/checkout', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      status: 'Checked Out',
      check_out_time: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('visitors').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    }

    const index = localMockStore.visitors.findIndex(v => v.id === id);
    if (index === -1) return res.status(404).json({ error: 'Visitor not found' });
    localMockStore.visitors[index] = { ...localMockStore.visitors[index], ...updates };
    res.json(localMockStore.visitors[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/visitors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('visitors').delete().eq('id', id);
      if (error) throw error;
      return res.json({ message: 'Visitor entry deleted', id });
    }

    localMockStore.visitors = localMockStore.visitors.filter(v => v.id !== id);
    res.json({ message: 'Visitor entry deleted', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 7. MESS MENU API
// ==============================================================================
app.get('/api/mess-menu', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('mess_menu')
        .select('*')
        .order('day_order', { ascending: true });

      if (error) throw error;
      return res.json(data || []);
    }

    res.json(localMockStore.mess_menu);
  } catch (err) {
    console.error('Error getting mess menu:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/mess-menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { breakfast, lunch, snacks, dinner, special_notes } = req.body;
    const updates = {
      breakfast,
      lunch,
      snacks,
      dinner,
      special_notes: special_notes || '',
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('mess_menu').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    }

    const index = localMockStore.mess_menu.findIndex(m => m.id === id || m.day_of_week === req.body.day_of_week);
    if (index === -1) return res.status(404).json({ error: 'Day menu not found' });
    localMockStore.mess_menu[index] = { ...localMockStore.mess_menu[index], ...updates };
    res.json(localMockStore.mess_menu[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mess-timings', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('notices').select('*').eq('category', 'MessTimings').maybeSingle();
      if (data && data.message) {
        try {
          return res.json(JSON.parse(data.message));
        } catch (e) {}
      }
    }
    res.json(localMockStore.mess_timings || {
      breakfast: '7:30 AM - 9:30 AM',
      lunch: '12:30 PM - 2:30 PM',
      snacks: '5:00 PM - 6:30 PM',
      dinner: '7:30 PM - 9:30 PM'
    });
  } catch (err) {
    res.json(localMockStore.mess_timings);
  }
});

app.put('/api/mess-timings', async (req, res) => {
  try {
    const { breakfast, lunch, snacks, dinner } = req.body;
    const timings = {
      breakfast: breakfast || '',
      lunch: lunch || '',
      snacks: snacks || '',
      dinner: dinner || ''
    };

    localMockStore.mess_timings = timings;

    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase.from('notices').select('id').eq('category', 'MessTimings').maybeSingle();
      if (existing) {
        await supabase.from('notices').update({
          message: JSON.stringify(timings),
          title: 'Dining Timings Configuration'
        }).eq('id', existing.id);
      } else {
        await supabase.from('notices').insert([{
          title: 'Dining Timings Configuration',
          message: JSON.stringify(timings),
          category: 'MessTimings',
          priority: 'Normal',
          is_pinned: false
        }]);
      }
    }

    res.json(timings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 8. NOTICES & ANNOUNCEMENTS API
// ==============================================================================
app.get('/api/notices', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });

      if (error) throw error;
      return res.json(data || []);
    }

    res.json(localMockStore.notices);
  } catch (err) {
    console.error('Error getting notices:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices', async (req, res) => {
  try {
    const { title, message, category, priority, is_pinned, expires_at } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const payload = {
      title,
      message,
      category: category || 'General',
      priority: priority || 'Normal',
      is_pinned: Boolean(is_pinned),
      published_at: new Date().toISOString(),
      expires_at: expires_at || null
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notices').insert([payload]).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    const newNotice = { id: `not-${Date.now()}`, ...payload };
    localMockStore.notices.unshift(newNotice);
    res.status(201).json(newNotice);
  } catch (err) {
    console.error('Error creating notice:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notices').delete().eq('id', id);
      return res.json({ message: 'Notice deleted', id });
    }
    localMockStore.notices = localMockStore.notices.filter(n => n.id !== id);
    res.json({ message: 'Notice deleted', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 9. SERVE FRONTEND (Single-port deployment for Replit / Render / VPS)
// ==============================================================================


// Central 404 & Error Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🏢 SWASTHISHREE (ಸ್ವಸ್ತಿ ಶ್ರೀ) SERVER STARTED`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=============================================================\n`);
});

module.exports = app;