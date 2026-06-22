-- =====================================================
-- IMPORT EQUIPMENT DATA - ALL PROVINCES
-- =====================================================
-- Run this AFTER importing projects (01 and 02 files)
-- This imports equipment linked to projects
-- =====================================================
-- Component IDs used:
-- sel = Sustainable Enterprise & Livelihoods
-- hn = Health & Nutrition
-- hrd = Human Resource Development
-- drrm = DRRM & CCA
-- bgcet = Bio-Circular-Green Economy
-- dg = Digital Governance
-- =====================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- BATANES EQUIPMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- Uyugan Fishlanding Enhancement
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Fish Drying Facilities & Processing Equipment',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2021,
  'sel'
FROM projects p
WHERE p.project_title = 'Enhancement of the Ecosystem at Uyugan Fishlanding Livelihood Project'
LIMIT 1;

-- COVID Drink Project
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Beverage Processing Equipment & Bottling Machines',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2021,
  'sel'
FROM projects p
WHERE p.project_title = 'Establishment of Creative Ounch of Valuable Innovative Drink (COVID) Project'
LIMIT 1;

-- I-GAIN Garlic
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Garlic Processing Equipment & Drying Facilities',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2022,
  'sel'
FROM projects p
WHERE p.project_title = 'Itbayat Garlic Assistance Innovative Network (I-GAIN)'
LIMIT 1;

-- PERA Sa Basura 2023
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Vendo Collecting Machine',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2023,
  'bgcet'
FROM projects p
WHERE p.project_title = 'Provision of Envi Ready Assistance (PERA) Sa Basura thru Vendo Collecting Machine'
AND p.year = 2023
LIMIT 1;

-- PERA Sa Basura 2024
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Vendo Collecting Machine (Upgraded)',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2024,
  'bgcet'
FROM projects p
WHERE p.project_title = 'Provision of Envi Ready Assistance (PERA) sa Basura thru Vendo Collecting Machine'
AND p.year = 2024
LIMIT 1;

-- Security Help (Wash)
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Water Filtration System & Sanitation Equipment',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2024,
  'bgcet'
FROM projects p
WHERE p.project_title = 'Security Help (Wash) for Sustainable Supply'
LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- CAGAYAN EQUIPMENT (Key Projects)
-- ═══════════════════════════════════════════════════════════════════════════

-- STARBOOKS - Gabut
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'STARBOOKS Unit - Complete Workstation',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2023,
  'hrd'
FROM projects p
WHERE p.project_title = 'Provision of STARBOOKS units to remote and highland areas'
AND p.community LIKE '%Gabut%'
LIMIT 1;

-- Fish Drying Facility - Aparri
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Fish Drying Racks & Solar Dryers',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2020,
  'sel'
FROM projects p
WHERE p.project_title = 'Provided Drying Facility for fish and aramang products and trainings'
LIMIT 1;

-- Sarakat Weavers
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Handloom Weaving Machines',
  p.id,
  p.municipality_id,
  p.community,
  3,
  2020,
  'sel'
FROM projects p
WHERE p.project_title = 'Provided equipment for Sarakat Handloomed Weavers'
LIMIT 1;

-- Portable Biogas Digester
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Portable Biogas Digester',
  p.id,
  p.municipality_id,
  p.community,
  3,
  2020,
  'bgcet'
FROM projects p
WHERE p.project_title = 'Provided Portable Biogas Digester and trainings'
LIMIT 1;

-- Essential Oil Extraction
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Essential Oil Extraction Equipment',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2020,
  'sel'
FROM projects p
WHERE p.project_title = 'Establishment of Essential Oil Extraction Facility'
LIMIT 1;

-- Clean Water Access - Peñablanca
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Water Filtration System & Distribution Infrastructure',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2022,
  'bgcet'
FROM projects p
WHERE p.project_title = 'Access to Clean Water for Livable and Sustainable Communities'
LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- ISABELA EQUIPMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- Mobile Command & Control Vehicle
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Mobile Command & Control Vehicle (MoCCoV)',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2024,
  'drrm'
FROM projects p
WHERE p.project_title LIKE '%Mobile Command and Control Vehicle%'
AND p.community LIKE '%Isabela%'
LIMIT 1;

-- Unsinkable Portaboat
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Unsinkable Portaboat',
  p.id,
  p.municipality_id,
  p.community,
  2,
  2023,
  'drrm'
FROM projects p
WHERE p.project_title LIKE '%unsinkable portaboat%'
LIMIT 1;

-- Clean Potable Water - San Guillermo
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Water Filtration System & Storage Tanks',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2022,
  'bgcet'
FROM projects p
WHERE p.project_title = 'Sustainable and Clean Potable Water for the Indigenous People in Sitio Dilukot, Burgos, San Guillermo, Isabela'
LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIRINO EQUIPMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- STARBOOKS - Ifugao Village
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'STARBOOKS Unit - Complete Workstation',
  p.id,
  p.municipality_id,
  p.community,
  2,
  2023,
  'hrd'
FROM projects p
WHERE p.project_title LIKE '%STARBOOKS%'
AND p.community LIKE '%Ifugao Village%'
LIMIT 1;

-- TUBIG-DOST
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Water Filtration System & Monitoring Equipment',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2025,
  'bgcet'
FROM projects p
WHERE p.project_title LIKE '%TUBIG-DOST%'
LIMIT 1;

-- Liwanag Sa Dilim
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Solar Power System & LED Lighting',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2025,
  'bgcet'
FROM projects p
WHERE p.project_title LIKE '%Liwanag Sa Dilim%'
LIMIT 1;

-- Indigenous Weaving Center
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Weaving Looms & Processing Equipment',
  p.id,
  p.municipality_id,
  p.community,
  5,
  2021,
  'sel'
FROM projects p
WHERE p.project_title LIKE '%Weaving Center for Indigenous%'
LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- NUEVA VIZCAYA EQUIPMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- Greenhouse Technology
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Greenhouse Structure & Irrigation System',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2019,
  'sel'
FROM projects p
WHERE p.project_title = 'Greenhouse Technology for Research and Development on Organic Production of High Value Crops'
LIMIT 1;

-- ILOVE S&T - Dupax Del Sur (Coffee)
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Coffee Processing Equipment',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2021,
  'sel'
FROM projects p
WHERE p.project_title = 'Intervention on Livelihood Operations by Valuing Entrepreneurship Through Science and Technology (ILOVE S&T) in Dupax Del Sur'
LIMIT 1;

-- Cacao Production
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Cacao Processing Machines & Fermentation Boxes',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2021,
  'sel'
FROM projects p
WHERE p.project_title = 'Strengthening Cacao production and processing in Nueva Vizcaya'
LIMIT 1;

-- ILOVE S&T for 4Ps (Ginger)
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Ginger Processing Equipment & Drying Facilities',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2022,
  'sel'
FROM projects p
WHERE p.project_title LIKE '%ILOVE S&T%4Ps%'
LIMIT 1;

-- STARBOOKS - Cabuuan
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'STARBOOKS Unit - Complete Workstation',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2023,
  'hrd'
FROM projects p
WHERE p.project_title LIKE '%STARBOOKS%'
AND p.community LIKE '%Cabuuan%'
LIMIT 1;

-- STARBOOKS - Bambang
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'STARBOOKS Units - Multiple Workstations',
  p.id,
  p.municipality_id,
  p.community,
  3,
  2024,
  'hrd'
FROM projects p
WHERE p.project_title LIKE '%Expanding Horizons%Bambang%'
LIMIT 1;

-- Abaca Fiber Production
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Abaca Processing Machines & Fiber Extraction Equipment',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2024,
  'sel'
FROM projects p
WHERE p.project_title LIKE '%Abaca Fiber Production%'
LIMIT 1;

-- Seedling Production & Food Processing
INSERT INTO equipment (equipment_name, project_id, municipality_id, community, units, year, component_id)
SELECT 
  'Seedling Production Equipment & Food Processing Machines',
  p.id,
  p.municipality_id,
  p.community,
  1,
  2025,
  'sel'
FROM projects p
WHERE p.project_title LIKE '%Seedling Production and Community-Based Food Processing%'
LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- Count equipment by province
SELECT 
  CASE 
    WHEN p.community LIKE '%Batanes%' THEN 'Batanes'
    WHEN p.community LIKE '%Cagayan%' THEN 'Cagayan'
    WHEN p.community LIKE '%Isabela%' THEN 'Isabela'
    WHEN p.community LIKE '%Quirino%' THEN 'Quirino'
    WHEN p.community LIKE '%Nueva Vizcaya%' THEN 'Nueva Vizcaya'
    ELSE 'Unknown'
  END as province,
  COUNT(e.id) as equipment_count
FROM equipment e
INNER JOIN projects p ON e.project_id = p.id
GROUP BY province
ORDER BY province;

-- Show all imported equipment
SELECT 
  e.equipment_name,
  p.project_title,
  e.units,
  e.year,
  e.component_id
FROM equipment e
INNER JOIN projects p ON e.project_id = p.id
ORDER BY e.year DESC, p.project_title;

-- Total count
SELECT COUNT(*) as total_equipment_imported FROM equipment;
