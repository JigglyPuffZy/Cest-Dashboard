-- =====================================================
-- Add Sample STARBOOKS Units for Testing Search
-- =====================================================
-- Run this ONLY if your starbooks_units table is empty
-- This will give you data to test the search functionality
-- =====================================================

-- First, check if table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM starbooks_units WHERE is_archived IS NULL OR is_archived = false) = 0 THEN
        RAISE NOTICE 'Table is empty, inserting sample data...';
        
        -- Insert sample STARBOOKS units
        INSERT INTO starbooks_units (
            unit_code,
            location,
            municipality,
            province,
            status,
            notes,
            installation_date,
            total_users,
            total_sessions
        ) VALUES
        (
            'STARBOOKS-2024-001',
            'Tuguegarao City Hall',
            'Tuguegarao City',
            'Cagayan',
            'Active',
            'Contact: Hon. Jefferson Soriano | Phone: +63 78 844 1621 | Email: mayor@tuguegarao.gov.ph | Condition: Excellent',
            '2024-01-15',
            450,
            1250
        ),
        (
            'STARBOOKS-2024-002',
            'Peñablanca Elementary School',
            'Peñablanca',
            'Cagayan',
            'Active',
            'Contact: Dr. Maria Santos | Phone: +63 78 844 2345 | Email: principal@penablanca-elem.edu.ph | Condition: Good',
            '2024-02-10',
            320,
            890
        ),
        (
            'STARBOOKS-2024-003',
            'Gonzaga Public Library',
            'Gonzaga',
            'Cagayan',
            'Maintenance',
            'Contact: Ms. Elena Rodriguez | Phone: +63 78 844 3456 | Email: librarian@gonzaga-library.gov.ph | Condition: Fair | Tablet replacement needed',
            '2023-11-20',
            180,
            420
        ),
        (
            'STARBOOKS-2024-004',
            'Aparri Community Center',
            'Aparri',
            'Cagayan',
            'Inactive',
            'Contact: Brgy. Capt. Roberto Valdez | Phone: +63 78 844 4567 | Email: captain@aparri-barangay.gov.ph | Condition: Poor | Requires major repairs',
            '2023-08-05',
            95,
            150
        ),
        (
            'STARBOOKS-2024-005',
            'Isabela State University',
            'Ilagan',
            'Isabela',
            'Active',
            'Contact: Dr. Ricardo Cruz | Phone: +63 78 622 1234 | Email: library@isu.edu.ph | Condition: Excellent',
            '2024-03-01',
            850,
            2100
        ),
        (
            'STARBOOKS-2024-006',
            'Santiago City Library',
            'Santiago City',
            'Isabela',
            'Active',
            'Contact: Ms. Carmen Reyes | Phone: +63 78 682 5678 | Email: library@santiago.gov.ph | Condition: Good',
            '2024-01-20',
            520,
            1450
        );
        
        RAISE NOTICE 'Sample data inserted successfully!';
    ELSE
        RAISE NOTICE 'Table already has data, skipping insert.';
    END IF;
END $$;

-- Verify the data was inserted
SELECT 
    unit_code,
    location,
    municipality,
    status,
    installation_date
FROM starbooks_units
WHERE is_archived IS NULL OR is_archived = false
ORDER BY installation_date DESC;

-- Show count
SELECT 
    COUNT(*) as total_active_units,
    COUNT(*) FILTER (WHERE status = 'Active') as active_units,
    COUNT(*) FILTER (WHERE status = 'Maintenance') as maintenance_units,
    COUNT(*) FILTER (WHERE status = 'Inactive') as inactive_units
FROM starbooks_units
WHERE is_archived IS NULL OR is_archived = false;
