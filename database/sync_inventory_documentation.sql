-- =====================================================
-- Sync Inventory and Documentation System
-- =====================================================
-- This creates a unified system where inventory items
-- automatically appear in documentation with proper
-- categorization and real-time sync
-- =====================================================

-- 1. Add category/tags columns to starbooks_units if not exists
ALTER TABLE starbooks_units 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Installation',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
ADD COLUMN IF NOT EXISTS documentation_notes TEXT;

-- 2. Create starbooks_images table for documentation photos
CREATE TABLE IF NOT EXISTS starbooks_images (
    id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT REFERENCES starbooks_units(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    category VARCHAR(50) DEFAULT 'General',
    is_primary BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_starbooks_images_unit_id ON starbooks_images(unit_id);
CREATE INDEX IF NOT EXISTS idx_starbooks_images_primary ON starbooks_images(unit_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_starbooks_units_category ON starbooks_units(category);

-- 4. Create trigger to update primary_image_url when image is marked as primary
CREATE OR REPLACE FUNCTION update_unit_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    -- If this image is marked as primary, update the unit's primary_image_url
    IF NEW.is_primary = true THEN
        -- First, unmark all other images for this unit as non-primary
        UPDATE starbooks_images 
        SET is_primary = false 
        WHERE unit_id = NEW.unit_id AND id != NEW.id;
        
        -- Update the unit's primary_image_url
        UPDATE starbooks_units 
        SET primary_image_url = NEW.image_url 
        WHERE id = NEW.unit_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_unit_primary_image ON starbooks_images;
CREATE TRIGGER trigger_update_unit_primary_image
    AFTER INSERT OR UPDATE OF is_primary ON starbooks_images
    FOR EACH ROW
    EXECUTE FUNCTION update_unit_primary_image();

-- 5. Create view for documentation (combines inventory with images)
CREATE OR REPLACE VIEW starbooks_documentation AS
SELECT 
    u.id,
    u.unit_code,
    u.location,
    u.municipality,
    u.province,
    u.status,
    u.category,
    u.tags,
    u.installation_date,
    u.primary_image_url,
    u.documentation_notes,
    u.notes,
    u.created_at,
    u.updated_at,
    u.is_archived,
    -- Aggregate all images for this unit
    COALESCE(
        json_agg(
            json_build_object(
                'id', i.id,
                'image_url', i.image_url,
                'caption', i.caption,
                'category', i.category,
                'is_primary', i.is_primary,
                'uploaded_at', i.uploaded_at
            ) ORDER BY i.is_primary DESC, i.uploaded_at DESC
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
    ) as images,
    -- Count of images
    COUNT(i.id) as image_count
FROM starbooks_units u
LEFT JOIN starbooks_images i ON u.id = i.unit_id
WHERE u.is_archived IS NULL OR u.is_archived = false
GROUP BY u.id, u.unit_code, u.location, u.municipality, u.province, 
         u.status, u.category, u.tags, u.installation_date, 
         u.primary_image_url, u.documentation_notes, u.notes,
         u.created_at, u.updated_at, u.is_archived;

-- 6. Create function to add image to unit
CREATE OR REPLACE FUNCTION add_starbooks_image(
    p_unit_id BIGINT,
    p_image_url TEXT,
    p_caption TEXT DEFAULT NULL,
    p_category VARCHAR(50) DEFAULT 'General',
    p_is_primary BOOLEAN DEFAULT false,
    p_uploaded_by VARCHAR(255) DEFAULT 'System'
)
RETURNS BIGINT AS $$
DECLARE
    v_image_id BIGINT;
BEGIN
    -- Insert the image
    INSERT INTO starbooks_images (
        unit_id, image_url, caption, category, is_primary, uploaded_by
    ) VALUES (
        p_unit_id, p_image_url, p_caption, p_category, p_is_primary, p_uploaded_by
    )
    RETURNING id INTO v_image_id;
    
    RETURN v_image_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Enable RLS on starbooks_images
ALTER TABLE starbooks_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated read access" ON starbooks_images;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON starbooks_images;
DROP POLICY IF EXISTS "Allow authenticated update access" ON starbooks_images;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON starbooks_images;

-- Create RLS policies
CREATE POLICY "Allow authenticated read access" 
    ON starbooks_images FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated insert access" 
    ON starbooks_images FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" 
    ON starbooks_images FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated delete access" 
    ON starbooks_images FOR DELETE 
    TO authenticated 
    USING (true);

-- 8. Update trigger for starbooks_images
CREATE TRIGGER update_starbooks_images_updated_at 
    BEFORE UPDATE ON starbooks_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Sample categories (you can customize these)
COMMENT ON COLUMN starbooks_units.category IS 'Categories: Installation, Training, Maintenance, Inspection, Event, Upgrade, Other';

-- 10. Verify setup
SELECT 
    'Setup Complete!' as status,
    COUNT(*) as total_units,
    COUNT(CASE WHEN primary_image_url IS NOT NULL THEN 1 END) as units_with_images
FROM starbooks_units
WHERE is_archived IS NULL OR is_archived = false;
