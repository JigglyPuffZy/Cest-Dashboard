-- =====================================================
-- STARBOOKS Storage Bucket and Image Management Setup
-- =====================================================

-- 1. Create Storage Bucket for STARBOOKS Images
-- Note: This needs to be done in Supabase Dashboard Storage section
-- Bucket name: 'starbooks-images'
-- Public: true (for easy access)
-- File size limit: 50MB
-- Allowed file types: image/*

-- 2. Create STARBOOKS Units Table
CREATE TABLE IF NOT EXISTS starbooks_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    municipality_id UUID REFERENCES municipalities(id),
    province_id UUID REFERENCES provinces(id),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Inactive')),
    condition VARCHAR(50) DEFAULT 'Excellent' CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor')),
    date_deployed DATE DEFAULT CURRENT_DATE,
    last_maintenance DATE,
    beneficiaries INTEGER DEFAULT 0,
    monthly_usage INTEGER DEFAULT 0,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    notes TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    uptime DECIMAL(5,2) DEFAULT 100.0 CHECK (uptime >= 0 AND uptime <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create STARBOOKS Components Table
CREATE TABLE IF NOT EXISTS starbooks_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create STARBOOKS Unit Components Junction Table
CREATE TABLE IF NOT EXISTS starbooks_unit_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID REFERENCES starbooks_units(id) ON DELETE CASCADE,
    component_id UUID REFERENCES starbooks_components(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(unit_id, component_id)
);

-- 5. Create STARBOOKS Images Table
CREATE TABLE IF NOT EXISTS starbooks_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID REFERENCES starbooks_units(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL, -- Path in Supabase storage
    file_size INTEGER,
    mime_type VARCHAR(100),
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create STARBOOKS Specifications Table
CREATE TABLE IF NOT EXISTS starbooks_specifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID REFERENCES starbooks_units(id) ON DELETE CASCADE,
    kiosk_model VARCHAR(100),
    laptop_specs TEXT,
    tablet_count INTEGER DEFAULT 0,
    solar_capacity VARCHAR(100),
    internet_connection VARCHAR(100),
    power_backup VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create STARBOOKS Usage Statistics Table
CREATE TABLE IF NOT EXISTS starbooks_usage_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID REFERENCES starbooks_units(id) ON DELETE CASCADE,
    daily_average INTEGER DEFAULT 0,
    peak_hours VARCHAR(100),
    popular_content JSONB DEFAULT '[]',
    user_demographics JSONB DEFAULT '{"students": 0, "teachers": 0, "researchers": 0, "general": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create STARBOOKS Maintenance History Table
CREATE TABLE IF NOT EXISTS starbooks_maintenance_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID REFERENCES starbooks_units(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    technician VARCHAR(255),
    notes TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Insert Default Components
INSERT INTO starbooks_components (name, description) VALUES
('Kiosk', 'Main STARBOOKS kiosk unit'),
('Laptop', 'Laptop computer for content access'),
('Tablets', 'Tablet devices for mobile access'),
('Solar Panel', 'Solar power system'),
('UPS', 'Uninterruptible Power Supply'),
('Internet Modem', 'Internet connectivity device')
ON CONFLICT DO NOTHING;

-- 10. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_starbooks_units_municipality ON starbooks_units(municipality_id);
CREATE INDEX IF NOT EXISTS idx_starbooks_units_status ON starbooks_units(status);
CREATE INDEX IF NOT EXISTS idx_starbooks_units_serial ON starbooks_units(serial_number);
CREATE INDEX IF NOT EXISTS idx_starbooks_images_unit ON starbooks_images(unit_id);
CREATE INDEX IF NOT EXISTS idx_starbooks_images_primary ON starbooks_images(unit_id, is_primary);

-- 11. Create RLS Policies
ALTER TABLE starbooks_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_unit_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_maintenance_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all STARBOOKS data
CREATE POLICY "Allow authenticated read access" ON starbooks_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON starbooks_components FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON starbooks_unit_components FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON starbooks_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON starbooks_specifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON starbooks_usage_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON starbooks_maintenance_history FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete STARBOOKS data
CREATE POLICY "Allow authenticated write access" ON starbooks_units FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON starbooks_components FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON starbooks_unit_components FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON starbooks_images FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON starbooks_specifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON starbooks_usage_stats FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON starbooks_maintenance_history FOR ALL TO authenticated USING (true);

-- 12. Create Update Triggers
CREATE OR REPLACE FUNCTION update_starbooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_starbooks_units_updated_at
    BEFORE UPDATE ON starbooks_units
    FOR EACH ROW
    EXECUTE FUNCTION update_starbooks_updated_at();

CREATE TRIGGER update_starbooks_images_updated_at
    BEFORE UPDATE ON starbooks_images
    FOR EACH ROW
    EXECUTE FUNCTION update_starbooks_updated_at();

CREATE TRIGGER update_starbooks_specifications_updated_at
    BEFORE UPDATE ON starbooks_specifications
    FOR EACH ROW
    EXECUTE FUNCTION update_starbooks_updated_at();

CREATE TRIGGER update_starbooks_usage_stats_updated_at
    BEFORE UPDATE ON starbooks_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_starbooks_updated_at();

-- 13. Create Storage Policies (Run these in Supabase SQL Editor after creating the bucket)
-- Note: Replace 'starbooks-images' with your actual bucket name

-- Allow authenticated users to upload images
-- INSERT INTO storage.policies (name, bucket_id, policy, definition)
-- VALUES (
--     'Allow authenticated uploads',
--     'starbooks-images',
--     'INSERT',
--     'auth.role() = ''authenticated'''
-- );

-- Allow public read access to images
-- INSERT INTO storage.policies (name, bucket_id, policy, definition)
-- VALUES (
--     'Allow public read access',
--     'starbooks-images',
--     'SELECT',
--     'true'
-- );

-- Allow authenticated users to update their uploads
-- INSERT INTO storage.policies (name, bucket_id, policy, definition)
-- VALUES (
--     'Allow authenticated updates',
--     'starbooks-images',
--     'UPDATE',
--     'auth.role() = ''authenticated'''
-- );

-- Allow authenticated users to delete their uploads
-- INSERT INTO storage.policies (name, bucket_id, policy, definition)
-- VALUES (
--     'Allow authenticated deletes',
--     'starbooks-images',
--     'DELETE',
--     'auth.role() = ''authenticated'''
-- );

COMMENT ON TABLE starbooks_units IS 'Main STARBOOKS units/kiosks deployed across Region II';
COMMENT ON TABLE starbooks_images IS 'Images associated with STARBOOKS units stored in Supabase Storage';
COMMENT ON TABLE starbooks_components IS 'Available components that can be installed in STARBOOKS units';
COMMENT ON TABLE starbooks_specifications IS 'Technical specifications for each STARBOOKS unit';
COMMENT ON TABLE starbooks_usage_stats IS 'Usage statistics and analytics for STARBOOKS units';
COMMENT ON TABLE starbooks_maintenance_history IS 'Maintenance and service history for STARBOOKS units';