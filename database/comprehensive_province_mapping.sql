-- Comprehensive province mapping for all Philippines provinces
-- This extends the basic Cagayan/Isabela mapping to support all provinces
-- Run this after the basic add_province_to_equipment.sql

-- Update equipment records with comprehensive province mapping
-- This is a more complete mapping that you can extend as needed

-- Region I - Ilocos Region
UPDATE equipment SET province = 'Ilocos Norte' 
WHERE municipality_id IN (SELECT id FROM municipalities WHERE name IN (
  'Adams', 'Bacarra', 'Badoc', 'Bangui', 'Banna', 'Batac City', 'Burgos', 
  'Carasi', 'Currimao', 'Dingras', 'Dumalneg', 'Laoag City', 'Marcos', 
  'Nueva Era', 'Pagudpud', 'Paoay', 'Pasuquin', 'Piddig', 'Pinili', 
  'San Nicolas', 'Sarrat', 'Solsona', 'Vintar'
)) OR municipality IN (
  'Adams', 'Bacarra', 'Badoc', 'Bangui', 'Banna', 'Batac City', 'Burgos', 
  'Carasi', 'Currimao', 'Dingras', 'Dumalneg', 'Laoag City', 'Marcos', 
  'Nueva Era', 'Pagudpud', 'Paoay', 'Pasuquin', 'Piddig', 'Pinili', 
  'San Nicolas', 'Sarrat', 'Solsona', 'Vintar'
);

UPDATE equipment SET province = 'Ilocos Sur' 
WHERE municipality_id IN (SELECT id FROM municipalities WHERE name IN (
  'Alilem', 'Banayoyo', 'Bantay', 'Burgos', 'Cabugao', 'Candon City', 
  'Caoayan', 'Cervantes', 'Galimuyod', 'Gregorio del Pilar', 'Lidlidda', 
  'Magsingal', 'Nagbukel', 'Narvacan', 'Quirino', 'Salcedo', 'San Emilio', 
  'San Esteban', 'San Ildefonso', 'San Juan', 'San Vicente', 'Santa', 
  'Santa Catalina', 'Santa Cruz', 'Santa Lucia', 'Santa Maria', 'Santiago', 
  'Santo Domingo', 'Sigay', 'Sinait', 'Sugpon', 'Suyo', 'Tagudin', 'Vigan City'
)) OR municipality IN (
  'Alilem', 'Banayoyo', 'Bantay', 'Burgos', 'Cabugao', 'Candon City', 
  'Caoayan', 'Cervantes', 'Galimuyod', 'Gregorio del Pilar', 'Lidlidda', 
  'Magsingal', 'Nagbukel', 'Narvacan', 'Quirino', 'Salcedo', 'San Emilio', 
  'San Esteban', 'San Ildefonso', 'San Juan', 'San Vicente', 'Santa', 
  'Santa Catalina', 'Santa Cruz', 'Santa Lucia', 'Santa Maria', 'Santiago', 
  'Santo Domingo', 'Sigay', 'Sinait', 'Sugpon', 'Suyo', 'Tagudin', 'Vigan City'
);

UPDATE equipment SET province = 'La Union' 
WHERE municipality_id IN (SELECT id FROM municipalities WHERE name IN (
  'Agoo', 'Aringay', 'Bacnotan', 'Bagulin', 'Balaoan', 'Bangar', 'Bauang', 
  'Burgos', 'Caba', 'Luna', 'Naguilian', 'Pugo', 'Rosario', 'San Fernando City', 
  'San Gabriel', 'San Juan', 'Santo Tomas', 'Santol', 'Sudipen', 'Tubao'
)) OR municipality IN (
  'Agoo', 'Aringay', 'Bacnotan', 'Bagulin', 'Balaoan', 'Bangar', 'Bauang', 
  'Burgos', 'Caba', 'Luna', 'Naguilian', 'Pugo', 'Rosario', 'San Fernando City', 
  'San Gabriel', 'San Juan', 'Santo Tomas', 'Santol', 'Sudipen', 'Tubao'
);

UPDATE equipment SET province = 'Pangasinan' 
WHERE municipality_id IN (SELECT id FROM municipalities WHERE name IN (
  'Agno', 'Aguilar', 'Alaminos City', 'Alcala', 'Anda', 'Asingan', 'Balungao', 
  'Bani', 'Basista', 'Bautista', 'Bayambang', 'Binalonan', 'Binmaley', 'Bolinao', 
  'Bugallon', 'Burgos', 'Calasiao', 'Dagupan City', 'Dasol', 'Infanta', 'Labrador', 
  'Laoac', 'Lingayen', 'Mabini', 'Malasiqui', 'Manaoag', 'Mangaldan', 'Mangatarem', 
  'Mapandan', 'Natividad', 'Pozorrubio', 'Rosales', 'San Carlos City', 'San Fabian', 
  'San Jacinto', 'San Manuel', 'San Nicolas', 'San Quintin', 'Santa Barbara', 
  'Santa Maria', 'Santo Tomas', 'Sison', 'Sual', 'Tayug', 'Umingan', 'Urbiztondo', 
  'Urdaneta City', 'Villasis'
)) OR municipality IN (
  'Agno', 'Aguilar', 'Alaminos City', 'Alcala', 'Anda', 'Asingan', 'Balungao', 
  'Bani', 'Basista', 'Bautista', 'Bayambang', 'Binalonan', 'Binmaley', 'Bolinao', 
  'Bugallon', 'Burgos', 'Calasiao', 'Dagupan City', 'Dasol', 'Infanta', 'Labrador', 
  'Laoac', 'Lingayen', 'Mabini', 'Malasiqui', 'Manaoag', 'Mangaldan', 'Mangatarem', 
  'Mapandan', 'Natividad', 'Pozorrubio', 'Rosales', 'San Carlos City', 'San Fabian', 
  'San Jacinto', 'San Manuel', 'San Nicolas', 'San Quintin', 'Santa Barbara', 
  'Santa Maria', 'Santo Tomas', 'Sison', 'Sual', 'Tayug', 'Umingan', 'Urbiztondo', 
  'Urdaneta City', 'Villasis'
);

-- Add more regions as needed...
-- This is just a sample showing how to extend the mapping

-- Verify the comprehensive update
SELECT province, COUNT(*) as count 
FROM equipment 
GROUP BY province 
ORDER BY province;