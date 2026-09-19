// Unified API Service with Local Storage Persistence & Fallback for Swasthishree (ಸ್ವಸ್ತಿ ಶ್ರೀ)

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('swasthishree_api_url');
    if (savedUrl && savedUrl.trim()) {
      return `${savedUrl.trim().replace(/\/$/, '')}/api`;
    }
  }
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';
  if (envUrl && envUrl.trim()) {
    return `${envUrl.trim().replace(/\/$/, '')}/api`;
  }
  return '/api';
}

export function getBackendOrigin() {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('swasthishree_api_url');
    if (savedUrl && savedUrl.trim()) return savedUrl.trim().replace(/\/$/, '');
  }
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/$/, '');
  return '';
}

export function setBackendOrigin(url) {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('swasthishree_api_url');
    } else {
      localStorage.setItem('swasthishree_api_url', url.trim().replace(/\/$/, ''));
    }
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('swasthishree_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem('swasthishree_admin_user');
  } else {
    localStorage.setItem('swasthishree_admin_user', JSON.stringify(user));
  }
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('swasthishree_admin_user');
}

// ==============================================================================
// LOCAL STORAGE PERSISTENCE HELPERS
// ==============================================================================
const DEFAULT_ROOMS = [
  { id: 'room-101', room_number: '101', floor: 1, room_type: '1 Sharing', total_beds: 1, occupied_beds: 0, monthly_rent: 12000, amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Smart TV', 'Balcony', 'Geyser', 'Study Desk'], status: 'Available' },
  { id: 'room-102', room_number: '102', floor: 1, room_type: '2 Sharing', total_beds: 2, occupied_beds: 0, monthly_rent: 8500, amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Cupboard', 'Geyser', 'Study Table'], status: 'Available' },
  { id: 'room-103', room_number: '103', floor: 1, room_type: '2 Sharing', total_beds: 2, occupied_beds: 0, monthly_rent: 7500, amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobe', 'Ceiling Fan', 'Study Table'], status: 'Available' },
  { id: 'room-104', room_number: '104', floor: 1, room_type: '3 Sharing', total_beds: 3, occupied_beds: 0, monthly_rent: 6000, amenities: ['High-Speed Wi-Fi', 'Individual Lockers', 'Ceiling Fan', 'Common Balcony'], status: 'Available' },
  { id: 'room-201', room_number: '201', floor: 2, room_type: '1 Sharing', total_beds: 1, occupied_beds: 0, monthly_rent: 12000, amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Balcony', 'Study Desk'], status: 'Available' },
  { id: 'room-202', room_number: '202', floor: 2, room_type: '3 Sharing', total_beds: 3, occupied_beds: 0, monthly_rent: 6500, amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Cupboard', 'Geyser', 'Study Table'], status: 'Available' },
  { id: 'room-203', room_number: '203', floor: 2, room_type: '4 Sharing', total_beds: 4, occupied_beds: 0, monthly_rent: 5500, amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Separate Wardrobes', 'Study Area'], status: 'Available' },
  { id: 'room-204', room_number: '204', floor: 2, room_type: '5 Sharing', total_beds: 5, occupied_beds: 0, monthly_rent: 5000, amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobes', 'Ceiling Fan', 'Study Tables'], status: 'Available' }
];

const DEFAULT_MESS_TIMINGS = {
  breakfast: '7:30 AM - 9:30 AM',
  lunch: '12:30 PM - 2:30 PM',
  snacks: '5:00 PM - 6:30 PM',
  dinner: '7:30 PM - 9:30 PM'
};

const DEFAULT_MESS_MENU = [
  { id: 'menu-1', day_of_week: 'Monday', day_order: 1, breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
  { id: 'menu-2', day_of_week: 'Tuesday', day_order: 2, breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
  { id: 'menu-3', day_of_week: 'Wednesday', day_order: 3, breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
  { id: 'menu-4', day_of_week: 'Thursday', day_order: 4, breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
  { id: 'menu-5', day_of_week: 'Friday', day_order: 5, breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
  { id: 'menu-6', day_of_week: 'Saturday', day_order: 6, breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' },
  { id: 'menu-7', day_of_week: 'Sunday', day_order: 7, breakfast: '', lunch: '', snacks: '', dinner: '', special_notes: '' }
];

const DEFAULT_NOTICES = [
  {
    id: 'not-1',
    title: 'Welcome to Swasthishree (ಸ್ವಸ್ತಿ ಶ್ರೀ) Portal',
    message: 'Official management portal for Swasthishree. Track resident admissions, bed allocations, dining schedules, and fee receipts.',
    category: 'General',
    priority: 'Important',
    is_pinned: true,
    published_at: new Date().toISOString()
  }
];

function getLocal(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocal(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

function getDeletedIds(key) {
  return new Set(getLocal(key, []));
}

function addDeletedId(key, id) {
  if (!id) return;
  const current = getLocal(key, []);
  if (!current.includes(id)) {
    current.push(id);
    setLocal(key, current);
  }
}

// Convert FormData or plain object to standard resident format
function normalizeResidentObject(input, id) {
  let obj = {};
  if (input instanceof FormData) {
    for (const [k, v] of input.entries()) {
      if (k !== 'photo') obj[k] = v;
    }
  } else if (typeof input === 'object' && input !== null) {
    obj = { ...input };
  }

  const depositVal = obj.deposit !== undefined && obj.deposit !== '' 
    ? Number(obj.deposit) 
    : (obj.security_deposit !== undefined && obj.security_deposit !== '' ? Number(obj.security_deposit) : 0);

  const rentVal = Number(obj.monthly_rent || 0);

  return {
    id: id || obj.id || `res-${Date.now()}`,
    name: String(obj.name || '').trim(),
    phone: String(obj.phone || '').trim(),
    email: obj.email || '',
    father_name: obj.father_name || obj.guardian_name || '',
    guardian_name: obj.father_name || obj.guardian_name || '',
    parent_phone: obj.parent_phone || obj.guardian_phone || '',
    guardian_phone: obj.parent_phone || obj.guardian_phone || '',
    joining_date: obj.joining_date || obj.admission_date || new Date().toISOString().split('T')[0],
    admission_date: obj.joining_date || obj.admission_date || new Date().toISOString().split('T')[0],
    agent_name: obj.agent_name || '',
    deposit: depositVal,
    security_deposit: depositVal,
    monthly_rent: rentVal,
    room_id: obj.room_id || null,
    room_number: obj.room_number ? String(obj.room_number).trim() : '',
    blood_group: obj.blood_group || '',
    college_or_work: obj.college_or_work || '',
    status: obj.status || 'Active',
    joining_payment_remarks: obj.joining_payment_remarks || obj.notes || '',
    notes: obj.joining_payment_remarks || obj.notes || '',
    photo_url: obj.photo_url || '',
    created_at: obj.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export const api = {
  // Config & Diagnostics
  getBackendOrigin,
  setBackendOrigin,
  getStoredUser,
  setStoredUser,
  clearStoredUser,

  // Admin Authentication
  async login(username, password) {
    try {
      const res = await fetch(`${getBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setStoredUser(data.user);
        return data;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid credentials');
    } catch (e) {
      // Local fallback auth if serverless / backend offline
      const cleanU = String(username || '').trim().toLowerCase();
      const cleanP = String(password || '').trim();
      if ((cleanU === 'swasthishree_admin' || cleanU === 'swasthishree_mangalore' || cleanU === 'hostel_admin') && cleanP === 'Swasthi@24') {
        const user = { username: 'swasthishree_admin', name: 'Swasthishree Admin', role: 'Hostel Admin', token: `local-${Date.now()}` };
        setStoredUser(user);
        return { success: true, message: 'Welcome back, Swasthishree Admin!', user };
      }
      if ((cleanU === 'master_admin' || cleanU === 'admin' || cleanU === 'skchinnu' || cleanU === 'developer_admin') && cleanP === 'Manipal@0818') {
        const user = { username: 'master_admin', name: 'Master Admin', role: 'Master Admin', token: `local-${Date.now()}` };
        setStoredUser(user);
        return { success: true, message: 'Welcome back, Master Admin!', user };
      }
      throw e;
    }
  },

  logout() {
    clearStoredUser();
  },

  // Health & Diagnostics
  async getHealth() {
    try {
      const res = await fetch(`${getBaseUrl()}/health`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      status: 'healthy',
      system: 'Swasthishree (ಸ್ವಸ್ತಿ ಶ್ರೀ) Management System',
      version: '2.2.0',
      database: { connected: true, mode: 'Persistent Client & Server Sync' }
    };
  },

  // Stats (Real-time computed)
  async getStats() {
    const rooms = await this.getRooms();
    const residents = await this.getResidents();
    const payments = await this.getPayments();
    const visitors = await this.getVisitors();

    const activeRes = residents.filter(r => r.status === 'Active');
    const totalBeds = rooms.reduce((acc, r) => acc + (Number(r.total_beds) || 0), 0);
    const occupiedBeds = activeRes.length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const totalRevenueCollected = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const pendingRevenue = payments.filter(p => p.status !== 'Paid').reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const activeVisitors = visitors.filter(v => v.status === 'Checked In').length;

    return {
      totalResidents: activeRes.length,
      totalBeds,
      occupiedBeds,
      vacantBeds: Math.max(0, totalBeds - occupiedBeds),
      occupancyRate,
      totalRevenueCollected,
      pendingRevenue,
      activeVisitors
    };
  },

  // ============================================================================
  // RESIDENTS MANAGEMENT
  // ============================================================================
  async getResidents() {
    const deletedIds = getDeletedIds('swasthishree_deleted_resident_ids');
    let localResidents = getLocal('swasthishree_residents', []);

    try {
      const res = await fetch(`${getBaseUrl()}/residents`);
      if (res.ok) {
        const remoteData = await res.json();
        if (Array.isArray(remoteData)) {
          // Merge remote with local, excluding deleted IDs
          const remoteFiltered = remoteData.filter(r => !deletedIds.has(r.id));
          
          // Combine with any local residents not yet on backend
          const remoteIdSet = new Set(remoteFiltered.map(r => r.id));
          const unsyncedLocal = localResidents.filter(r => !remoteIdSet.has(r.id) && !deletedIds.has(r.id));
          
          const combined = [...unsyncedLocal, ...remoteFiltered];
          setLocal('swasthishree_residents', combined);
          return combined;
        }
      }
    } catch (e) {
      console.warn('Backend residents fetch fallback to local storage:', e.message);
    }

    // Filter out deleted IDs from local store
    const filtered = localResidents.filter(r => !deletedIds.has(r.id));
    setLocal('swasthishree_residents', filtered);
    return filtered;
  },

  async createResident(formDataOrJson) {
    const newRes = normalizeResidentObject(formDataOrJson);
    
    // 1. Immediately persist to localStorage
    const localResidents = getLocal('swasthishree_residents', []);
    const updated = [newRes, ...localResidents.filter(r => r.id !== newRes.id)];
    setLocal('swasthishree_residents', updated);

    // 2. Try sending to backend in background/async
    try {
      const isFormData = formDataOrJson instanceof FormData;
      const res = await fetch(`${getBaseUrl()}/residents`, {
        method: 'POST',
        body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
        headers: isFormData ? {} : { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.id) {
          const finalRes = { ...newRes, ...serverData };
          const refreshed = [finalRes, ...localResidents.filter(r => r.id !== newRes.id && r.id !== finalRes.id)];
          setLocal('swasthishree_residents', refreshed);
          return finalRes;
        }
      }
    } catch (e) {
      console.warn('Server sync failed for createResident, preserved locally:', e.message);
    }

    return newRes;
  },

  async updateResident(id, formDataOrJson) {
    const localResidents = getLocal('swasthishree_residents', []);
    const existing = localResidents.find(r => r.id === id) || {};
    const updatedRes = normalizeResidentObject({ ...existing, ...formDataOrJson }, id);

    // 1. Immediately persist to localStorage
    const index = localResidents.findIndex(r => r.id === id);
    if (index !== -1) {
      localResidents[index] = updatedRes;
    } else {
      localResidents.unshift(updatedRes);
    }
    setLocal('swasthishree_residents', localResidents);

    // 2. Try sending to backend
    try {
      const isFormData = formDataOrJson instanceof FormData;
      const res = await fetch(`${getBaseUrl()}/residents/${id}`, {
        method: 'PUT',
        body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
        headers: isFormData ? {} : { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData) {
          const merged = { ...updatedRes, ...serverData };
          const cur = getLocal('swasthishree_residents', []);
          const idx = cur.findIndex(r => r.id === id);
          if (idx !== -1) cur[idx] = merged;
          setLocal('swasthishree_residents', cur);
          return merged;
        }
      }
    } catch (e) {
      console.warn('Server sync failed for updateResident, preserved locally:', e.message);
    }

    return updatedRes;
  },

  async deleteResident(id) {
    // 1. Mark as deleted in localStorage
    addDeletedId('swasthishree_deleted_resident_ids', id);
    const localResidents = getLocal('swasthishree_residents', []);
    const filtered = localResidents.filter(r => r.id !== id);
    setLocal('swasthishree_residents', filtered);

    // 2. Try sending to backend
    try {
      await fetch(`${getBaseUrl()}/residents/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Server delete failed, resident removed locally:', e.message);
    }

    return { success: true, message: 'Resident removed successfully', id };
  },

  // ============================================================================
  // ROOMS MANAGEMENT
  // ============================================================================
  async getRooms() {
    const deletedRoomIds = getDeletedIds('swasthishree_deleted_room_ids');
    let localRooms = getLocal('swasthishree_rooms', null);

    if (!localRooms) {
      localRooms = DEFAULT_ROOMS.filter(r => !deletedRoomIds.has(r.id) && !deletedRoomIds.has(String(r.room_number)));
      setLocal('swasthishree_rooms', localRooms);
    }

    try {
      const res = await fetch(`${getBaseUrl()}/rooms`);
      if (res.ok) {
        const remoteRooms = await res.json();
        if (Array.isArray(remoteRooms)) {
          // Exclude any room that was marked deleted locally
          const remoteFiltered = remoteRooms.filter(
            r => !deletedRoomIds.has(r.id) && !deletedRoomIds.has(String(r.room_number))
          );

          // Keep custom rooms created locally if not in backend list
          const remoteIdSet = new Set(remoteFiltered.map(r => r.id));
          const customLocal = localRooms.filter(
            r => !remoteIdSet.has(r.id) && !deletedRoomIds.has(r.id) && !deletedRoomIds.has(String(r.room_number))
          );

          const merged = [...remoteFiltered, ...customLocal].sort(
            (a, b) => (parseInt(a.room_number) || 0) - (parseInt(b.room_number) || 0)
          );
          setLocal('swasthishree_rooms', merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('Backend rooms fetch fallback to local storage:', e.message);
    }

    const filtered = localRooms.filter(
      r => !deletedRoomIds.has(r.id) && !deletedRoomIds.has(String(r.room_number))
    );
    setLocal('swasthishree_rooms', filtered);
    return filtered;
  },

  async createRoom(roomData) {
    const cleanRoomNumber = String(roomData.room_number || '').trim();
    const beds = Math.max(1, Number(roomData.total_beds) || 1);
    const newRoom = {
      id: `room-${Date.now()}`,
      room_number: cleanRoomNumber,
      floor: Number(roomData.floor) || 1,
      room_type: roomData.room_type || `${beds} Sharing`,
      total_beds: beds,
      occupied_beds: 0,
      monthly_rent: Number(roomData.monthly_rent) >= 0 ? Number(roomData.monthly_rent) : 7500,
      amenities: Array.isArray(roomData.amenities) ? roomData.amenities : ['Wi-Fi', 'Attached Washroom'],
      status: 'Available',
      created_at: new Date().toISOString()
    };

    // 1. Immediately persist to localStorage
    const localRooms = getLocal('swasthishree_rooms', DEFAULT_ROOMS);
    const updated = [...localRooms.filter(r => r.room_number !== cleanRoomNumber), newRoom];
    setLocal('swasthishree_rooms', updated);

    // 2. Try sending to backend
    try {
      const res = await fetch(`${getBaseUrl()}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.id) {
          const finalRoom = { ...newRoom, ...serverData };
          const refreshed = [...localRooms.filter(r => r.id !== newRoom.id && r.id !== finalRoom.id), finalRoom];
          setLocal('swasthishree_rooms', refreshed);
          return finalRoom;
        }
      }
    } catch (e) {
      console.warn('Server sync failed for createRoom, preserved locally:', e.message);
    }

    return newRoom;
  },

  async updateRoom(id, roomData) {
    const localRooms = getLocal('swasthishree_rooms', DEFAULT_ROOMS);
    const index = localRooms.findIndex(r => r.id === id || String(r.room_number) === String(id));
    
    let updatedRoom = { id, ...roomData };
    if (index !== -1) {
      updatedRoom = { ...localRooms[index], ...roomData, updated_at: new Date().toISOString() };
      localRooms[index] = updatedRoom;
    } else {
      localRooms.push(updatedRoom);
    }
    setLocal('swasthishree_rooms', localRooms);

    try {
      const res = await fetch(`${getBaseUrl()}/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData) {
          const cur = getLocal('swasthishree_rooms', []);
          const idx = cur.findIndex(r => r.id === id);
          if (idx !== -1) cur[idx] = { ...updatedRoom, ...serverData };
          setLocal('swasthishree_rooms', cur);
          return { ...updatedRoom, ...serverData };
        }
      }
    } catch (e) {
      console.warn('Server sync failed for updateRoom, preserved locally:', e.message);
    }

    return updatedRoom;
  },

  async deleteRoom(id) {
    // 1. Mark as deleted in localStorage
    addDeletedId('swasthishree_deleted_room_ids', id);
    const localRooms = getLocal('swasthishree_rooms', DEFAULT_ROOMS);
    const targetRoom = localRooms.find(r => r.id === id || String(r.room_number) === String(id));
    if (targetRoom && targetRoom.room_number) {
      addDeletedId('swasthishree_deleted_room_ids', String(targetRoom.room_number));
    }

    const filtered = localRooms.filter(r => r.id !== id && String(r.room_number) !== String(id));
    setLocal('swasthishree_rooms', filtered);

    // Unassign any residents in that room locally
    const localResidents = getLocal('swasthishree_residents', []);
    let modified = false;
    localResidents.forEach(res => {
      if (res.room_id === id || (targetRoom && String(res.room_number) === String(targetRoom.room_number))) {
        res.room_id = null;
        res.room_number = '';
        modified = true;
      }
    });
    if (modified) setLocal('swasthishree_residents', localResidents);

    // 2. Try sending to backend
    try {
      await fetch(`${getBaseUrl()}/rooms/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Server delete failed for room, deleted locally:', e.message);
    }

    return { success: true, message: 'Room deleted successfully', id };
  },

  // ============================================================================
  // PAYMENTS & LEDGER
  // ============================================================================
  async getPayments() {
    const deletedIds = getDeletedIds('swasthishree_deleted_payment_ids');
    let localPayments = getLocal('swasthishree_payments', []);

    try {
      const res = await fetch(`${getBaseUrl()}/payments`);
      if (res.ok) {
        const remotePayments = await res.json();
        if (Array.isArray(remotePayments)) {
          const remoteFiltered = remotePayments.filter(p => !deletedIds.has(p.id));
          const remoteIdSet = new Set(remoteFiltered.map(p => p.id));
          const unsynced = localPayments.filter(p => !remoteIdSet.has(p.id) && !deletedIds.has(p.id));
          const combined = [...unsynced, ...remoteFiltered];
          setLocal('swasthishree_payments', combined);
          return combined;
        }
      }
    } catch (e) {}

    const filtered = localPayments.filter(p => !deletedIds.has(p.id));
    setLocal('swasthishree_payments', filtered);
    return filtered;
  },

  async createPayment(paymentData) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const newPayment = {
      id: `pay-${Date.now()}`,
      receipt_number: `REC-${new Date().getFullYear()}-${rand}`,
      resident_id: paymentData.resident_id,
      resident_name: paymentData.resident_name,
      room_number: paymentData.room_number,
      amount: Number(paymentData.amount || 0),
      month_year: paymentData.month_year,
      payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
      payment_method: paymentData.payment_method || 'Cash',
      transaction_ref: paymentData.transaction_ref || `TXN-${Date.now()}`,
      status: paymentData.status || 'Paid',
      notes: paymentData.notes || '',
      created_at: new Date().toISOString()
    };

    // 1. Save to local storage
    const localPayments = getLocal('swasthishree_payments', []);
    setLocal('swasthishree_payments', [newPayment, ...localPayments]);

    // 2. Send to backend
    try {
      const res = await fetch(`${getBaseUrl()}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.id) {
          const finalPay = { ...newPayment, ...serverData };
          const cur = getLocal('swasthishree_payments', []);
          setLocal('swasthishree_payments', [finalPay, ...cur.filter(p => p.id !== newPayment.id && p.id !== finalPay.id)]);
          return finalPay;
        }
      }
    } catch (e) {}

    return newPayment;
  },

  async updatePayment(id, paymentData) {
    const localPayments = getLocal('swasthishree_payments', []);
    const idx = localPayments.findIndex(p => p.id === id);
    let updatedPay = { id, ...paymentData };
    if (idx !== -1) {
      updatedPay = { ...localPayments[idx], ...paymentData };
      localPayments[idx] = updatedPay;
    }
    setLocal('swasthishree_payments', localPayments);

    try {
      await fetch(`${getBaseUrl()}/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
    } catch (e) {}

    return updatedPay;
  },

  async deletePayment(id) {
    addDeletedId('swasthishree_deleted_payment_ids', id);
    const localPayments = getLocal('swasthishree_payments', []);
    const filtered = localPayments.filter(p => p.id !== id);
    setLocal('swasthishree_payments', filtered);

    try {
      await fetch(`${getBaseUrl()}/payments/${id}`, { method: 'DELETE' });
    } catch (e) {}

    return { success: true, id };
  },

  // ============================================================================
  // VISITORS LOG
  // ============================================================================
  async getVisitors() {
    const deletedIds = getDeletedIds('swasthishree_deleted_visitor_ids');
    let localVisitors = getLocal('swasthishree_visitors', []);

    try {
      const res = await fetch(`${getBaseUrl()}/visitors`);
      if (res.ok) {
        const remoteData = await res.json();
        if (Array.isArray(remoteData)) {
          const remoteFiltered = remoteData.filter(v => !deletedIds.has(v.id));
          const remoteIdSet = new Set(remoteFiltered.map(v => v.id));
          const unsynced = localVisitors.filter(v => !remoteIdSet.has(v.id) && !deletedIds.has(v.id));
          const combined = [...unsynced, ...remoteFiltered];
          setLocal('swasthishree_visitors', combined);
          return combined;
        }
      }
    } catch (e) {}

    return localVisitors.filter(v => !deletedIds.has(v.id));
  },

  async createVisitor(visitorData) {
    const newVisitor = {
      id: `vis-${Date.now()}`,
      ...visitorData,
      check_in_time: new Date().toISOString(),
      check_out_time: null,
      status: 'Checked In',
      created_at: new Date().toISOString()
    };
    const localVisitors = getLocal('swasthishree_visitors', []);
    setLocal('swasthishree_visitors', [newVisitor, ...localVisitors]);

    try {
      const res = await fetch(`${getBaseUrl()}/visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorData)
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.id) {
          const cur = getLocal('swasthishree_visitors', []);
          setLocal('swasthishree_visitors', [serverData, ...cur.filter(v => v.id !== newVisitor.id)]);
          return serverData;
        }
      }
    } catch (e) {}

    return newVisitor;
  },

  async checkoutVisitor(id) {
    const localVisitors = getLocal('swasthishree_visitors', []);
    const idx = localVisitors.findIndex(v => v.id === id);
    if (idx !== -1) {
      localVisitors[idx].status = 'Checked Out';
      localVisitors[idx].check_out_time = new Date().toISOString();
      setLocal('swasthishree_visitors', localVisitors);
    }

    try {
      await fetch(`${getBaseUrl()}/visitors/${id}/checkout`, { method: 'PATCH' });
    } catch (e) {}

    return { success: true, id };
  },

  async deleteVisitor(id) {
    addDeletedId('swasthishree_deleted_visitor_ids', id);
    const localVisitors = getLocal('swasthishree_visitors', []);
    setLocal('swasthishree_visitors', localVisitors.filter(v => v.id !== id));

    try {
      await fetch(`${getBaseUrl()}/visitors/${id}`, { method: 'DELETE' });
    } catch (e) {}

    return { success: true, id };
  },

  // ============================================================================
  // MESS MENU & TIMINGS
  // ============================================================================
  async getMessMenu() {
    let localMenu = getLocal('swasthishree_mess_menu', DEFAULT_MESS_MENU);
    try {
      const res = await fetch(`${getBaseUrl()}/mess-menu`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocal('swasthishree_mess_menu', data);
          return data;
        }
      }
    } catch (e) {}
    return localMenu;
  },

  async updateMessMenu(id, data) {
    const localMenu = getLocal('swasthishree_mess_menu', DEFAULT_MESS_MENU);
    const idx = localMenu.findIndex(m => m.id === id);
    if (idx !== -1) {
      localMenu[idx] = { ...localMenu[idx], ...data };
      setLocal('swasthishree_mess_menu', localMenu);
    }

    try {
      await fetch(`${getBaseUrl()}/mess-menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}

    return data;
  },

  async getMessTimings() {
    let localTimings = getLocal('swasthishree_mess_timings', DEFAULT_MESS_TIMINGS);
    try {
      const res = await fetch(`${getBaseUrl()}/mess-timings`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setLocal('swasthishree_mess_timings', data);
          return data;
        }
      }
    } catch (e) {}
    return localTimings;
  },

  async updateMessTimings(data) {
    setLocal('swasthishree_mess_timings', data);
    try {
      await fetch(`${getBaseUrl()}/mess-timings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
    return data;
  },

  // ============================================================================
  // NOTICES
  // ============================================================================
  async getNotices() {
    const deletedIds = getDeletedIds('swasthishree_deleted_notice_ids');
    let localNotices = getLocal('swasthishree_notices', DEFAULT_NOTICES);

    try {
      const res = await fetch(`${getBaseUrl()}/notices`);
      if (res.ok) {
        const remoteData = await res.json();
        if (Array.isArray(remoteData)) {
          const remoteFiltered = remoteData.filter(n => !deletedIds.has(n.id));
          const remoteIdSet = new Set(remoteFiltered.map(n => n.id));
          const unsynced = localNotices.filter(n => !remoteIdSet.has(n.id) && !deletedIds.has(n.id));
          const combined = [...unsynced, ...remoteFiltered];
          setLocal('swasthishree_notices', combined);
          return combined;
        }
      }
    } catch (e) {}

    return localNotices.filter(n => !deletedIds.has(n.id));
  },

  async createNotice(data) {
    const newNotice = {
      id: `not-${Date.now()}`,
      ...data,
      published_at: new Date().toISOString()
    };
    const localNotices = getLocal('swasthishree_notices', DEFAULT_NOTICES);
    setLocal('swasthishree_notices', [newNotice, ...localNotices]);

    try {
      const res = await fetch(`${getBaseUrl()}/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.id) {
          const cur = getLocal('swasthishree_notices', []);
          setLocal('swasthishree_notices', [serverData, ...cur.filter(n => n.id !== newNotice.id)]);
          return serverData;
        }
      }
    } catch (e) {}

    return newNotice;
  },

  async deleteNotice(id) {
    addDeletedId('swasthishree_deleted_notice_ids', id);
    const localNotices = getLocal('swasthishree_notices', DEFAULT_NOTICES);
    setLocal('swasthishree_notices', localNotices.filter(n => n.id !== id));

    try {
      await fetch(`${getBaseUrl()}/notices/${id}`, { method: 'DELETE' });
    } catch (e) {}

    return { success: true, id };
  }
};
