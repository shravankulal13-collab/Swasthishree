const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Clean Initial Local Mock Store
let localMockStore = {
  rooms: [
    {
      id: 'room-101',
      room_number: '101',
      floor: 1,
      room_type: '1 Sharing',
      total_beds: 1,
      occupied_beds: 0,
      monthly_rent: 12000,
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Smart TV', 'Balcony', 'Geyser', 'Study Desk'],
      status: 'Available'
    },
    {
      id: 'room-102',
      room_number: '102',
      floor: 1,
      room_type: '2 Sharing',
      total_beds: 2,
      occupied_beds: 0,
      monthly_rent: 8500,
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Cupboard', 'Geyser', 'Study Table'],
      status: 'Available'
    },
    {
      id: 'room-103',
      room_number: '103',
      floor: 1,
      room_type: '2 Sharing',
      total_beds: 2,
      occupied_beds: 0,
      monthly_rent: 7500,
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobe', 'Ceiling Fan', 'Study Table'],
      status: 'Available'
    },
    {
      id: 'room-104',
      room_number: '104',
      floor: 1,
      room_type: '3 Sharing',
      total_beds: 3,
      occupied_beds: 0,
      monthly_rent: 6000,
      amenities: ['High-Speed Wi-Fi', 'Individual Lockers', 'Ceiling Fan', 'Common Balcony'],
      status: 'Available'
    },
    {
      id: 'room-201',
      room_number: '201',
      floor: 2,
      room_type: '1 Sharing',
      total_beds: 1,
      occupied_beds: 0,
      monthly_rent: 12000,
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Balcony', 'Study Desk'],
      status: 'Available'
    },
    {
      id: 'room-202',
      room_number: '202',
      floor: 2,
      room_type: '3 Sharing',
      total_beds: 3,
      occupied_beds: 0,
      monthly_rent: 6500,
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Cupboard', 'Geyser', 'Study Table'],
      status: 'Available'
    },
    {
      id: 'room-203',
      room_number: '203',
      floor: 2,
      room_type: '4 Sharing',
      total_beds: 4,
      occupied_beds: 0,
      monthly_rent: 5500,
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Separate Wardrobes', 'Study Area'],
      status: 'Available'
    },
    {
      id: 'room-204',
      room_number: '204',
      floor: 2,
      room_type: '5 Sharing',
      total_beds: 5,
      occupied_beds: 0,
      monthly_rent: 5000,
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobes', 'Ceiling Fan', 'Study Tables'],
      status: 'Available'
    }
  ],
  residents: [],
  payments: [],
  visitors: [],
  mess_timings: {
    breakfast: '7:30 AM - 9:30 AM',
    lunch: '12:30 PM - 2:30 PM',
    snacks: '5:00 PM - 6:30 PM',
    dinner: '7:30 PM - 9:30 PM'
  },
  mess_menu: [
    {
      id: 'menu-1',
      day_of_week: 'Monday',
      day_order: 1,
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
      special_notes: ''
    },
    {
      id: 'menu-2',
      day_of_week: 'Tuesday',
      day_order: 2,
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
      special_notes: ''
    },
    {
      id: 'menu-3',
      day_of_week: 'Wednesday',
      day_order: 3,
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
      special_notes: ''
    },
    {
      id: 'menu-4',
      day_of_week: 'Thursday',
      day_order: 4,
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
      special_notes: ''
    },
    {
      id: 'menu-5',
      day_of_week: 'Friday',
      day_order: 5,
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
      special_notes: ''
    },
    {
      id: 'menu-6',
      day_of_week: 'Saturday',
      day_order: 6,
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
      special_notes: ''
    },
    {
      id: 'menu-7',
      day_of_week: 'Sunday',
      day_order: 7,
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
      special_notes: ''
    }
  ],
  notices: [
    {
      id: 'not-1',
      title: 'Welcome to Swasthishree (ಸ್ವಸ್ತಿ ಶ್ರೀ) Portal',
      message: 'Official management portal for Swasthishree. Track resident admissions, bed allocations, dining schedules, and fee receipts.',
      category: 'General',
      priority: 'Important',
      is_pinned: true,
      published_at: new Date().toISOString()
    }
  ]
};

let rawSupabaseUrl = process.env.SUPABASE_URL;
let supabaseUrl = rawSupabaseUrl ? rawSupabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '') : null;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    isSupabaseConfigured = true;
    console.log(`📡 Supabase client initialized for: ${supabaseUrl}`);
  } catch (err) {
    console.error('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase environment variables not yet provided. Running in high-reliability local storage mode.');
}

// Connectivity & Status Health Checker
async function checkSupabaseStatus() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      mode: 'Local Dynamic Store (Awaiting Supabase keys)',
      supabaseUrl: supabaseUrl || 'Not configured',
      message: 'Add SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env to connect to live Supabase DB.'
    };
  }

  try {
    const { data, error } = await supabase.from('rooms').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        mode: 'Supabase Client Initialized (Tables Pending)',
        supabaseUrl,
        message: `Connected to Supabase endpoint, but table query returned: ${error.message}. Please run backend/supabase_schema.sql in Supabase SQL editor.`,
        error: error.message
      };
    }

    return {
      connected: true,
      mode: 'Live Supabase Cloud Database',
      supabaseUrl,
      message: '✅ Successfully connected to Supabase PostgreSQL Database & Storage!',
      dataSample: data
    };
  } catch (err) {
    return {
      connected: false,
      mode: 'Connection Error',
      supabaseUrl,
      message: `Failed to reach Supabase: ${err.message}`
    };
  }
}

// Resident Photo Uploader
async function uploadResidentPhoto(file) {
  if (!file) return null;

  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = path.extname(file.originalname) || '.jpg';

      const fileName =
        `resident_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 8)}${fileExt}`;

      const filePath = `avatars/${fileName}`;

      // Multer memoryStorage provides the file as a Buffer.
      const fileBuffer = file.buffer;

      const { data, error } = await supabase.storage
        .from('resident-photos')
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) {
        throw error;
      }

      if (data) {
        const { data: publicUrlData } =
          supabase.storage
            .from('resident-photos')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      }

      return null;
    } catch (err) {
      console.error(
        '⚠️ Supabase Storage upload error:',
        err.message
      );

      return null;
    }
  }

  return null;
}

module.exports = {
  supabase,
  isSupabaseConfigured,
  localMockStore,
  checkSupabaseStatus,
  uploadResidentPhoto
};
