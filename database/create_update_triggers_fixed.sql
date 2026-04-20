-- Create update triggers for automatic updated_at timestamps
-- Run this in Supabase SQL Editor

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at 
    BEFORE UPDATE ON equipment 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starbooks_units_updated_at 
    BEFORE UPDATE ON starbooks_units 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starbooks_categories_updated_at 
    BEFORE UPDATE ON starbooks_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starbooks_content_updated_at 
    BEFORE UPDATE ON starbooks_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test the trigger by updating a project (find the first project and update it)
UPDATE projects 
SET project = project 
WHERE id = (SELECT id FROM projects LIMIT 1);

-- Verify the trigger worked - show all projects with timestamps
SELECT id, LEFT(project, 50) as project_title, created_at, updated_at 
FROM projects 
ORDER BY id 
LIMIT 3;