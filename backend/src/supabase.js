const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

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
  mess_menu: [
    {
      id: 'menu-1',
      day_of_week: 'Monday',
      breakfast: 'Idli, Sambar, Coconut Chutney, Tea/Coffee',
      lunch: 'South Indian Meals: Rice, Sambar, Rasam, Beans Poriyal, Curd, Papad',
      snacks: 'Veg Puff & Tea / Badam Milk',
      dinner: 'Chapati, Paneer Butter Masala, Jeera Rice, Dal Fry, Salad',
      special_notes: 'Fresh fruit served with dinner'
    },
    {
      id: 'menu-2',
      day_of_week: 'Tuesday',
      breakfast: 'Poori with Potato Sagu, Fruit Bowl, Tea/Coffee',
      lunch: 'Steamed Rice, Tomato Rasam, Drumstick Dal, Cabbage Sabzi, Buttermilk',
      snacks: 'Onion Pakoda & Filter Coffee',
      dinner: 'Veg Pulao, Raita, Mixed Veg Curry, Phulka, Sweet Kheer',
      special_notes: 'Special Payasam on Tuesday night'
    },
    {
      id: 'menu-3',
      day_of_week: 'Wednesday',
      breakfast: 'Masala Dosa with Chutney & Sambar, Boiled Eggs / Banana',
      lunch: 'Ghee Rice, Chicken Curry (Non-Veg) / Paneer Curry (Veg), Dal Tadka, Salad',
      snacks: 'Samosa with Mint Chutney & Tea',
      dinner: 'Roti, Dal Makhani, Steamed Rice, Curd Rice, Papad',
      special_notes: 'Non-Veg & Special Veg feast'
    },
    {
      id: 'menu-4',
      day_of_week: 'Thursday',
      breakfast: 'Set Dosa, Vegetable Kurma, Filter Coffee',
      lunch: 'Full Rice Meals, Ridge Gourd Dal, Aloo Fry, Rasam, Curd',
      snacks: 'Biscuits, Banana & Masala Chai',
      dinner: 'Phulka, Kadai Veg, Lemon Rice, Rasam, Gulab Jamun',
      special_notes: 'Hot Gulab Jamun dessert'
    },
    {
      id: 'menu-5',
      day_of_week: 'Friday',
      breakfast: 'Upma, Kesari Bath (Chow Chow Bath), Chutney, Coffee',
      lunch: 'Mangalore Style Fish Curry (Non-Veg) / Paneer Ghee Roast (Veg), Rice, Rasam',
      snacks: 'Veg Cutlet & Lemon Tea',
      dinner: 'North Indian Thali: Butter Naan, Shahi Paneer, Dal Fry, Jeera Rice',
      special_notes: 'Weekend kickoff dinner'
    },
    {
      id: 'menu-6',
      day_of_week: 'Saturday',
      breakfast: 'Aloo Paratha with Curd & Pickle, Tea/Coffee',
      lunch: 'Bisi Bele Bath, Boondi, Steamed Rice, Pepper Rasam, Curd',
      snacks: 'Mirchi Bajji & Filter Tea',
      dinner: 'Fried Rice, Veg Manchurian / Chilli Chicken, Hakka Noodles, Ice Cream',
      special_notes: 'Chinese Combo Night'
    },
    {
      id: 'menu-7',
      day_of_week: 'Sunday',
      breakfast: 'Special Masala Omelette / Bread Butter Jam / Poha, Juice',
      lunch: 'Special Sunday Dum Biryani (Chicken/Veg), Salan, Raitha, Egg, Dessert',
      snacks: 'Sweet Corn / Maggi & Chai',
      dinner: 'Soft Phulkas, Dal Tadka, Steamed Rice, Tomato Rasam, Ice Cream',
      special_notes: 'Extended breakfast timings: 8:00 AM - 10:30 AM'
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
      const fileName = `resident_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const fileBuffer = fs.readFileSync(file.path);
      const { data, error } = await supabase.storage
        .from('resident-photos')
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('resident-photos')
          .getPublicUrl(filePath);

        try { fs.unlinkSync(file.path); } catch (e) {}
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('⚠️ Supabase Storage upload error, falling back to local static URL:', err.message);
    }
  }

  return `/uploads/${file.filename}`;
}

module.exports = {
  supabase,
  isSupabaseConfigured,
  localMockStore,
  checkSupabaseStatus,
  uploadResidentPhoto
};
