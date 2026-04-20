-- Add province column to equipment table for better filtering
-- Run this in your Supabase SQL Editor

-- Add province column to equipment table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'equipment' AND column_name = 'province') THEN
        ALTER TABLE equipment ADD COLUMN province TEXT DEFAULT 'Cagayan';
    END IF;
END $$;

-- Check if equipment table has municipality or municipality_id column
DO $$
DECLARE
    has_municipality_column boolean;
    has_municipality_id_column boolean;
BEGIN
    -- Check for municipality column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'municipality'
    ) INTO has_municipality_column;
    
    -- Check for municipality_id column  
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipment' AND column_name = 'municipality_id'
    ) INTO has_municipality_id_column;
    
    -- Update based on which column exists
    IF has_municipality_column THEN
        -- Direct municipality column exists
        RAISE NOTICE 'Using municipality column for province updates';
        
        -- Cagayan municipalities
        UPDATE equipment 
        SET province = 'Cagayan' 
        WHERE municipality IN (
          'Abulug', 'Alcala', 'Allacapan', 'Amulung', 'Aparri', 'Baggao', 'Ballesteros', 
          'Buguey', 'Calayan', 'Camalaniugan', 'Claveria', 'Enrile', 'Gattaran', 
          'Gonzaga', 'Iguig', 'Lal-lo', 'Lasam', 'Pamplona', 'Peñablanca', 'Piat', 
          'Rizal', 'Sanchez-Mira', 'Santa Ana', 'Santa Praxedes', 'Santa Teresita', 
          'Santo Niño', 'Solana', 'Tuao', 'Tuguegarao City'
        );

        -- Isabela municipalities  
        UPDATE equipment 
        SET province = 'Isabela' 
        WHERE municipality IN (
          'Alicia', 'Angadanan', 'Aurora', 'Benito Soliven', 'Burgos', 'Cabagan', 
          'Cabatuan', 'City of Cauayan', 'Cordon', 'Delfin Albano', 'Dinapigue', 
          'Divilacan', 'Echague', 'Gamu', 'City of Ilagan', 'Jones', 'Luna', 
          'Maconacon', 'Mallig', 'Naguilian', 'Palanan', 'Quezon', 'Quirino', 
          'Ramon', 'Reina Mercedes', 'Roxas', 'San Agustin', 'San Guillermo', 
          'San Isidro', 'San Manuel', 'San Mariano', 'San Mateo', 'San Pablo', 
          'Santa Maria', 'City of Santiago', 'Santo Tomas', 'Tumauini'
        );
        
    ELSIF has_municipality_id_column THEN
        -- municipality_id foreign key exists, need to join with municipalities table
        RAISE NOTICE 'Using municipality_id column with municipalities table for province updates';
        
        -- Check if municipalities table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'municipalities') THEN
            -- Cagayan municipalities
            UPDATE equipment 
            SET province = 'Cagayan' 
            WHERE municipality_id IN (
                SELECT id FROM municipalities 
                WHERE name IN (
                  'Abulug', 'Alcala', 'Allacapan', 'Amulung', 'Aparri', 'Baggao', 'Ballesteros', 
                  'Buguey', 'Calayan', 'Camalaniugan', 'Claveria', 'Enrile', 'Gattaran', 
                  'Gonzaga', 'Iguig', 'Lal-lo', 'Lasam', 'Pamplona', 'Peñablanca', 'Piat', 
                  'Rizal', 'Sanchez-Mira', 'Santa Ana', 'Santa Praxedes', 'Santa Teresita', 
                  'Santo Niño', 'Solana', 'Tuao', 'Tuguegarao City'
                )
            );

            -- Isabela municipalities  
            UPDATE equipment 
            SET province = 'Isabela' 
            WHERE municipality_id IN (
                SELECT id FROM municipalities 
                WHERE name IN (
                  'Alicia', 'Angadanan', 'Aurora', 'Benito Soliven', 'Burgos', 'Cabagan', 
                  'Cabatuan', 'City of Cauayan', 'Cordon', 'Delfin Albano', 'Dinapigue', 
                  'Divilacan', 'Echague', 'Gamu', 'City of Ilagan', 'Jones', 'Luna', 
                  'Maconacon', 'Mallig', 'Naguilian', 'Palanan', 'Quezon', 'Quirino', 
                  'Ramon', 'Reina Mercedes', 'Roxas', 'San Agustin', 'San Guillermo', 
                  'San Isidro', 'San Manuel', 'San Mariano', 'San Mateo', 'San Pablo', 
                  'Santa Maria', 'City of Santiago', 'Santo Tomas', 'Tumauini'
                )
            );
        ELSE
            RAISE NOTICE 'Municipalities table not found, setting all equipment to Cagayan province';
            UPDATE equipment SET province = 'Cagayan' WHERE province IS NULL;
        END IF;
        
    ELSE
        RAISE NOTICE 'No municipality or municipality_id column found, setting all equipment to Cagayan province';
        UPDATE equipment SET province = 'Cagayan' WHERE province IS NULL;
    END IF;
END $$;

-- Create index for better performance on province filtering
CREATE INDEX IF NOT EXISTS idx_equipment_province ON equipment(province);

-- Verify the update
SELECT province, COUNT(*) as count 
FROM equipment 
GROUP BY province 
ORDER BY province;