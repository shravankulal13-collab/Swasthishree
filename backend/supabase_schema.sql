-- ==============================================================================
-- SWASTHISHREE (ಸ್ವಸ್ತಿ ಶ್ರೀ) LUXURY LIVING & HOSTEL MANAGEMENT
-- Supabase Database Schema
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Go to "SQL Editor" on the left navigation bar
-- 3. Click "New Query", paste this entire script and click "Run"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROOMS TABLE
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(50) NOT NULL UNIQUE,
    floor INTEGER NOT NULL DEFAULT 1,
    room_type VARCHAR(50) NOT NULL DEFAULT '2 Sharing',
    total_beds INTEGER NOT NULL DEFAULT 2,
    occupied_beds INTEGER NOT NULL DEFAULT 0,
    monthly_rent NUMERIC(10,2) NOT NULL DEFAULT 7500.00,
    amenities TEXT[] DEFAULT ARRAY['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobe', 'Study Desk & Chair'],
    status VARCHAR(20) DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESIDENTS TABLE
CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(30),
    admission_date DATE DEFAULT CURRENT_DATE,
    monthly_rent NUMERIC(10,2) DEFAULT 7500.00,
    security_deposit NUMERIC(10,2) DEFAULT 10000.00,
    blood_group VARCHAR(10) DEFAULT 'B+',
    college_or_work VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active',
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
    resident_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(50),
    amount NUMERIC(10,2) NOT NULL,
    month_year VARCHAR(30) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    transaction_ref VARCHAR(100),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Paid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VISITORS TABLE
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
    resident_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(50),
    visitor_name VARCHAR(255) NOT NULL,
    relation VARCHAR(100) DEFAULT 'Friend',
    phone VARCHAR(30),
    purpose VARCHAR(255),
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'Checked In',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MESS MENU TABLE
CREATE TABLE IF NOT EXISTS mess_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week VARCHAR(20) NOT NULL UNIQUE,
    day_order INTEGER NOT NULL DEFAULT 1,
    breakfast TEXT NOT NULL,
    lunch TEXT NOT NULL,
    snacks TEXT NOT NULL,
    dinner TEXT NOT NULL,
    special_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTICES & ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    priority VARCHAR(20) DEFAULT 'Normal',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,
    expires_at DATE
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_residents_room_id ON residents(room_id);
CREATE INDEX IF NOT EXISTS idx_residents_status ON residents(status);
CREATE INDEX IF NOT EXISTS idx_payments_resident_id ON payments(resident_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);

-- ==============================================================================
-- TRIGGER: AUTO-SYNC ROOM OCCUPANCY COUNT
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    -- Update previous room if room_id changed or resident deleted/vacated
    IF (TG_OP = 'UPDATE' AND OLD.room_id IS NOT NULL AND OLD.room_id IS DISTINCT FROM NEW.room_id)
       OR (TG_OP = 'DELETE' AND OLD.room_id IS NOT NULL) THEN
        UPDATE rooms
        SET occupied_beds = (
            SELECT COUNT(*) FROM residents WHERE room_id = OLD.room_id AND status = 'Active'
        ),
        status = CASE 
            WHEN (SELECT COUNT(*) FROM residents WHERE room_id = OLD.room_id AND status = 'Active') >= total_beds THEN 'Full'
            ELSE 'Available'
        END,
        updated_at = NOW()
        WHERE id = OLD.room_id;
    END IF;

    -- Update new room
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.room_id IS NOT NULL THEN
        UPDATE rooms
        SET occupied_beds = (
            SELECT COUNT(*) FROM residents WHERE room_id = NEW.room_id AND status = 'Active'
        ),
        status = CASE 
            WHEN (SELECT COUNT(*) FROM residents WHERE room_id = NEW.room_id AND status = 'Active') >= total_beds THEN 'Full'
            ELSE 'Available'
        END,
        updated_at = NOW()
        WHERE id = NEW.room_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_room_occupancy ON residents;
CREATE TRIGGER trg_update_room_occupancy
AFTER INSERT OR UPDATE OR DELETE ON residents
FOR EACH ROW EXECUTE FUNCTION update_room_occupancy();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all residents" ON residents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all visitors" ON visitors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all mess_menu" ON mess_menu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all notices" ON notices FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (for resident photos)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resident-photos', 'resident-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Storage Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resident-photos');

CREATE POLICY "Public Storage Insert Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resident-photos');

-- ==============================================================================
-- INITIAL SETUP: ROOM STRUCTURE & MESS MENU (FRESH START - 0 RESIDENTS)
-- ==============================================================================
INSERT INTO rooms (room_number, floor, room_type, total_beds, occupied_beds, monthly_rent, amenities) VALUES
('101', 1, '1 Sharing', 1, 0, 12000.00, ARRAY['Attached Washroom', 'High-Speed Wi-Fi', 'Smart TV', 'Balcony', 'Geyser', 'Study Desk']),
('102', 1, '2 Sharing', 2, 0, 8500.00, ARRAY['Attached Washroom', 'High-Speed Wi-Fi', 'Cupboard', 'Geyser', 'Study Table']),
('103', 1, '2 Sharing', 2, 0, 7500.00, ARRAY['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobe', 'Ceiling Fan', 'Study Table']),
('104', 1, '3 Sharing', 3, 0, 6000.00, ARRAY['High-Speed Wi-Fi', 'Individual Lockers', 'Ceiling Fan', 'Common Balcony']),
('201', 2, '1 Sharing', 1, 0, 12000.00, ARRAY['Attached Washroom', 'High-Speed Wi-Fi', 'Balcony', 'Study Desk']),
('202', 2, '3 Sharing', 3, 0, 6500.00, ARRAY['Attached Washroom', 'High-Speed Wi-Fi', 'Cupboard', 'Geyser', 'Study Table']),
('203', 2, '4 Sharing', 4, 0, 5500.00, ARRAY['Attached Washroom', 'High-Speed Wi-Fi', 'Separate Wardrobes', 'Study Area']),
('204', 2, '5 Sharing', 5, 0, 5000.00, ARRAY['Attached Washroom', 'High-Speed Wi-Fi', 'Personal Wardrobe', 'Ceiling Fan', 'Study Table'])
ON CONFLICT (room_number) DO NOTHING;

INSERT INTO mess_menu (day_of_week, day_order, breakfast, lunch, snacks, dinner, special_notes) VALUES
('Monday', 1, 'Idli, Sambar, Coconut Chutney, Tea/Coffee', 'South Indian Meals: Rice, Sambar, Rasam, Beans Poriyal, Curd, Papad', 'Veg Puff & Tea / Badam Milk', 'Chapati, Paneer Butter Masala, Jeera Rice, Dal Fry, Salad', 'Fresh fruit served with dinner'),
('Tuesday', 2, 'Poori with Potato Sagu, Fruit Bowl, Tea/Coffee', 'Steamed Rice, Tomato Rasam, Drumstick Dal, Cabbage Sabzi, Buttermilk', 'Onion Pakoda & Filter Coffee', 'Veg Pulao, Raita, Mixed Veg Curry, Phulka, Sweet Kheer', 'Special Payasam on Tuesday night'),
('Wednesday', 3, 'Masala Dosa with Chutney & Sambar, Boiled Eggs / Banana', 'Ghee Rice, Chicken Curry (Non-Veg) / Paneer Curry (Veg), Dal Tadka, Salad', 'Samosa with Mint Chutney & Tea', 'Roti, Dal Makhani, Steamed Rice, Curd Rice, Papad', 'Non-Veg & Special Veg feast'),
('Thursday', 4, 'Set Dosa, Vegetable Kurma, Filter Coffee', 'Full Rice Meals, Ridge Gourd Dal, Aloo Fry, Rasam, Curd', 'Biscuits, Banana & Masala Chai', 'Phulka, Kadai Veg, Lemon Rice, Rasam, Gulab Jamun', 'Hot Gulab Jamun dessert'),
('Friday', 5, 'Upma, Kesari Bath (Chow Chow Bath), Chutney, Coffee', 'Mangalore Style Fish Curry (Non-Veg) / Paneer Ghee Roast (Veg), Rice, Rasam', 'Veg Cutlet & Lemon Tea', 'North Indian Thali: Butter Naan, Shahi Paneer, Dal Fry, Jeera Rice', 'Special Weekend dinner'),
('Saturday', 6, 'Aloo Paratha with Curd & Pickle, Tea/Coffee', 'Bisi Bele Bath, Boondi, Steamed Rice, Pepper Rasam, Curd', 'Mirchi Bajji & Filter Tea', 'Fried Rice, Veg Manchurian / Chilli Chicken, Hakka Noodles, Ice Cream', 'Chinese Combo Night'),
('Sunday', 7, 'Special Masala Omelette / Bread Butter Jam / Poha, Juice', 'Special Sunday Dum Biryani (Chicken/Veg), Salan, Raitha, Egg, Dessert', 'Sweet Corn / Maggi & Chai', 'Soft Phulkas, Dal Tadka, Steamed Rice, Tomato Rasam, Ice Cream', 'Extended breakfast timings: 8:00 AM - 10:30 AM')
ON CONFLICT (day_of_week) DO NOTHING;

INSERT INTO notices (title, message, category, priority, is_pinned, expires_at) VALUES
('Welcome to Swasthishree Luxury Living Portal', 'Welcome to the official management and resident portal of Swasthishree. All room registrations, dining schedules, and payments can be tracked here.', 'General', 'Important', true, CURRENT_DATE + 60)
ON CONFLICT DO NOTHING;

SELECT 'Swasthishree clean database schema successfully initialized!' AS status;
