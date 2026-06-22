-- =====================================================
-- IMPORT ALL 66 PROJECTS - ALL 5 PROVINCES
-- =====================================================
-- Run this AFTER deleting all projects
-- This file contains ALL projects from Excel
-- =====================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- BATANES (6 projects)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO projects (project_title, municipality_id, community, amount_funded, status, year) VALUES
('Enhancement of the Ecosystem at Uyugan Fishlanding Livelihood Project', 
 (SELECT id FROM municipalities WHERE name = 'Uyugan' AND province_id = 'batanes' LIMIT 1), 
 'Uyugan Fishlanding Community - Uyugan, Batanes', 840000, 'Finished', 2021),

('Establishment of Creative Ounch of Valuable Innovative Drink (COVID) Project', 
 (SELECT id FROM municipalities WHERE name = 'Sabtang' AND province_id = 'batanes' LIMIT 1), 
 'Sabtang Community - Sabtang, Batanes', 710000, 'Finished', 2021),

('Itbayat Garlic Assistance Innovative Network (I-GAIN)', 
 (SELECT id FROM municipalities WHERE name = 'Itbayat' AND province_id = 'batanes' LIMIT 1), 
 'Garlic and Onion Farmers; Garlic Retailers - Itbayat, Batanes', 560000, 'Finished', 2022),

('Provision of Envi Ready Assistance (PERA) Sa Basura thru Vendo Collecting Machine', 
 (SELECT id FROM municipalities WHERE name = 'Basco' AND province_id = 'batanes' LIMIT 1), 
 'LGU Basco - Basco, Batanes', 700000, 'Finished', 2023),

('Provision of Envi Ready Assistance (PERA) sa Basura thru Vendo Collecting Machine', 
 (SELECT id FROM municipalities WHERE name = 'Basco' AND province_id = 'batanes' LIMIT 1), 
 'LGU Basco - Basco, Batanes', 800000, 'Finished', 2024),

('Security Help (Wash) for Sustainable Supply', 
 (SELECT id FROM municipalities WHERE name = 'Ivana' AND province_id = 'batanes' LIMIT 1), 
 'LGU Ivana - Ivana, Batanes', 1000000, 'Finished', 2024);

-- ═══════════════════════════════════════════════════════════════════════════
-- CAGAYAN (25 projects)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO projects (project_title, municipality_id, community, amount_funded, status, year) VALUES
('Provided Drying Facility for fish and aramang products and trainings', 
 (SELECT id FROM municipalities WHERE name = 'Aparri' AND province_id = 'cagayan' LIMIT 1), 
 'Punta Fisherfolks - Aparri, Cagayan', 0, 'Finished', 2020),

('Community Empowerment thru Science and Technology (CESTEEPH) Phase II', 
 (SELECT id FROM municipalities WHERE name = 'Gonzaga' AND province_id = 'cagayan' LIMIT 1), 
 'Fisherfolks and Farmers in Gonzaga - Gonzaga, Cagayan', 1652000, 'Finished', 2020),

('Provided equipment for Sarakat Handloomed Weavers', 
 (SELECT id FROM municipalities WHERE name = 'Santa Praxedes' AND province_id = 'cagayan' LIMIT 1), 
 'Minanga, Sta. Praxedes', 0, 'Finished', 2020),

('Provided Drying facilities', 
 (SELECT id FROM municipalities WHERE name = 'Calayan' AND province_id = 'cagayan' LIMIT 1), 
 'Fisherfolks and farmers in Calayan - Calayan, Babuyan Claro, Cagayan', 0, 'Finished', 2020),

('Provided Portable Biogas Digester and trainings', 
 (SELECT id FROM municipalities WHERE name = 'Gattaran' AND province_id = 'cagayan' LIMIT 1), 
 'Barangay Pina Este, Mabuno & Tanglagan - Gattaran, Cagayan', 0, 'Finished', 2020),

('Establishment of Essential Oil Extraction Facility', 
 (SELECT id FROM municipalities WHERE name = 'Lal-lo' AND province_id = 'cagayan' LIMIT 1), 
 'Rural Improvement Club Lal-lo - Lal-lo, Cagayan', 0, 'Finished', 2020),

('Farmers and Fisherfolks in Gonzaga', 
 (SELECT id FROM municipalities WHERE name = 'Gonzaga' AND province_id = 'cagayan' LIMIT 1), 
 'Farmers and Fisherfolks in Gonzaga - Gonzaga, Cagayan', 0, 'Finished', 2020),

('S&T Support to Fishing Industry: Process and Quality Improvement', 
 (SELECT id FROM municipalities WHERE name = 'Abulug' AND province_id = 'cagayan' LIMIT 1), 
 'Fisherfolks in Abulug - Abulug, Cagayan', 250000, 'Finished', 2020),

('Capability Building, Livelihood Development, and Environmental Protection', 
 (SELECT id FROM municipalities WHERE name = 'Gonzaga' AND province_id = 'cagayan' LIMIT 1), 
 'CSU Gonzaga - Gonzaga, Cagayan', 883872, 'Finished', 2021),

('Innovating the Handicrafts and Fiber Production Processes', 
 (SELECT id FROM municipalities WHERE name = 'Santa Teresita' AND province_id = 'cagayan' LIMIT 1), 
 'Laguna de Cagayan Handicrafts Association - Sta. Teresita, Cagayan', 750000, 'Finished', 2021),

('Empowering Local Communities through S&T Innovation Strategies', 
 (SELECT id FROM municipalities WHERE name = 'Santa Praxedes' AND province_id = 'cagayan' LIMIT 1), 
 'Gamet Gatherers and Sarakat Weavers - Sta. Praxedes, Cagayan', 840000, 'Finished', 2021),

('Empowering Local Communities through Sustained S&T Innovations', 
 (SELECT id FROM municipalities WHERE name = 'Sanchez-Mira' AND province_id = 'cagayan' LIMIT 1), 
 'Sanchez Mira, Cagayan', 800000, 'Finished', 2021),

('S&T Community Empowerment Support to EO 70 - Alcala', 
 (SELECT id FROM municipalities WHERE name = 'Alcala' AND province_id = 'cagayan' LIMIT 1), 
 'Cabuluan Community - Cabuluan, Alcala, Cagayan', 200000, 'Finished', 2021),

('S&T Community Empowerment Support to EO 70 - Santo Niño (Sta. Felicitas)', 
 (SELECT id FROM municipalities WHERE name = 'Santo Niño' AND province_id = 'cagayan' LIMIT 1), 
 'Sta. Felicitas Community - Sta. Felicitas, Sto. Niño, Cagayan', 200000, 'Finished', 2021),

('S&T Community Empowerment Support to EO 70 - Santo Niño (Lagum)', 
 (SELECT id FROM municipalities WHERE name = 'Santo Niño' AND province_id = 'cagayan' LIMIT 1), 
 'Lagum Community - Lagum, Sto. Niño, Cagayan', 300000, 'Finished', 2021),

('CEST GIA: Promoting Health and Sanitation in Fuga Island', 
 (SELECT id FROM municipalities WHERE name = 'Aparri' AND province_id = 'cagayan' LIMIT 1), 
 'Fuga Community - Fuga Island, Aparri, Cagayan', 700000, 'Finished', 2021),

('Access to Clean Water for Livable and Sustainable Communities', 
 (SELECT id FROM municipalities WHERE name = 'Peñablanca' AND province_id = 'cagayan' LIMIT 1), 
 'Pentur Farmers Agricultural Cooperative - Bical, Peñablanca, Cagayan', 400000, 'Finished', 2022),

('Science, technology and Innovation (STI) Support to Yarn Production', 
 (SELECT id FROM municipalities WHERE name = 'Gonzaga' AND province_id = 'cagayan' LIMIT 1), 
 'CSU Gonzaga - Gonzaga, Cagayan', 500000, 'Finished', 2022),

('Provision of STARBOOKS units to remote and highland areas', 
 (SELECT id FROM municipalities WHERE name = 'Amulung' AND province_id = 'cagayan' LIMIT 1), 
 'Gabut Integrated School - Amulung, Cagayan', 0, 'Finished', 2023),

('Innovating the Handicrafts and Abaca Fiber Production', 
 (SELECT id FROM municipalities WHERE name = 'Claveria' AND province_id = 'cagayan' LIMIT 1), 
 'Claveria Handicrafts Association - Claveria, Cagayan', 500000, 'Ongoing', 2024),

('Innovating the Essential Oil Livelihood Project', 
 (SELECT id FROM municipalities WHERE name = 'Lal-lo' AND province_id = 'cagayan' LIMIT 1), 
 'RIC Lallo - Lal-lo, Cagayan', 650000, 'Ongoing', 2024),

('Technology-Based Solutions for Safe and Sustainable Water Access', 
 (SELECT id FROM municipalities WHERE name = 'Peñablanca' AND province_id = 'cagayan' LIMIT 1), 
 'Brgy. Baliuag, Peñablanca, Cagayan', 450000, 'Ongoing', 2025),

('Strengthening S&T-Based Livelihoods in Calayan Island', 
 (SELECT id FROM municipalities WHERE name = 'Calayan' AND province_id = 'cagayan' LIMIT 1), 
 'RIC Calayan - Calayan Island, Cagayan', 500000, 'Ongoing', 2025),

('Technology-Based Solutions for Safe Water Access and Digital Literacy', 
 (SELECT id FROM municipalities WHERE name = 'Amulung' AND province_id = 'cagayan' LIMIT 1), 
 'Brgy. Manalo, Amulung - Amulung, Cagayan', 500000, 'Ongoing', 2025),

('Strengthening Rural Livelihoods and Education Through STI', 
 (SELECT id FROM municipalities WHERE name = 'Gattaran' AND province_id = 'cagayan' LIMIT 1), 
 'Brgy. Tanglagan, Gattaran - Gattaran, Cagayan', 300000, 'Ongoing', 2025);

-- ═══════════════════════════════════════════════════════════════════════════
-- ISABELA (11 projects)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO projects (project_title, municipality_id, community, amount_funded, status, year) VALUES
('Empowering Local Communities through S&T Innovation Strategies in the Municipality of San Agustin, Isabela', 
 (SELECT id FROM municipalities WHERE name = 'San Agustin' AND province_id = 'isabela' LIMIT 1), 
 'San Agustin Community', 340000, 'Finished', 2021),

('Empowering Local Communities through S&T Innovation Strategies in the Municipality of Echague, Isabela', 
 (SELECT id FROM municipalities WHERE name = 'Echague' AND province_id = 'isabela' LIMIT 1), 
 'Echague Community', 500000, 'Finished', 2021),

('S&T Community Empowerment Support to EO 70 in Conflict-Affected and Vulnerable Communities in Jones Isabela', 
 (SELECT id FROM municipalities WHERE name = 'Jones' AND province_id = 'isabela' LIMIT 1), 
 'Jones Community', 500000, 'Finished', 2021),

('S&T Community Empowerment Support to EO 70 in Conflict-Affected and Vulnerable Communities in the City of Cauayan, Isabela', 
 (SELECT id FROM municipalities WHERE name = 'Cauayan City' AND province_id = 'isabela' LIMIT 1), 
 'Cauayan City Community', 600000, 'Finished', 2021),

('S&T Community Empowerment Support to EO 70 in Conflict-Affected and Vulnerable Communities in San Mariano Isabela', 
 (SELECT id FROM municipalities WHERE name = 'San Mariano' AND province_id = 'isabela' LIMIT 1), 
 'San Mariano Community', 300000, 'Finished', 2021),

('Sustaining Local Community thru CEST in Sitio Lagis, Brgy. Sindun Bayabo, City of Ilagan', 
 (SELECT id FROM municipalities WHERE name = 'Ilagan City' AND province_id = 'isabela' LIMIT 1), 
 'Sitio Lagis, Brgy. Sindun Bayabo, City of Ilagan', 600000, 'Finished', 2021),

('Community Empowerment Support to PROJECT SUBLI in Accordance to EO70', 
 (SELECT id FROM municipalities WHERE name = 'San Agustin' AND province_id = 'isabela' LIMIT 1), 
 'San Agustin Community', 300000, 'Finished', 2021),

('Sustainable and Clean Potable Water for the Indigenous People in Sitio Dilukot, Burgos, San Guillermo, Isabela', 
 (SELECT id FROM municipalities WHERE name = 'San Guillermo' AND province_id = 'isabela' LIMIT 1), 
 'Sitio Dilukot, Burgos, San Guillermo', 600000, 'Finished', 2022),

('Building smart and resilient community through establishment and adoption of unsinkable portaboat in Cauayan City, Isabela', 
 (SELECT id FROM municipalities WHERE name = 'Cauayan City' AND province_id = 'isabela' LIMIT 1), 
 'Cauayan City', 0, 'Ongoing', 2023),

('Science and Technology-based approach for Resilient Disaster Risk Management Provision of Mobile Command and Control Vehicle for the Province of Quirino and Isabela', 
 (SELECT id FROM municipalities WHERE name = 'Cauayan City' AND province_id = 'isabela' LIMIT 1), 
 'Province of Isabela', 5600000, 'Ongoing', 2024),

('Sustainable Community Livelihood and Preservation of S&T Ecotourism in LGU Echague, Isabela', 
 (SELECT id FROM municipalities WHERE name = 'Echague' AND province_id = 'isabela' LIMIT 1), 
 'LGU Echague', 650000, 'Ongoing', 2025);

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIRINO (10 projects)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO projects (project_title, municipality_id, community, amount_funded, status, year) VALUES
('Empowering Local Communities through S&T Support to Governor''s Rapids Nature Advocates Credit Cooperative (GRNACC) in Maddela', 
 (SELECT id FROM municipalities WHERE name = 'Maddela' AND province_id = 'quirino' LIMIT 1), 
 'Governor''s Rapids Natures Advocate Credit Cooperative', 555300, 'Finished', 2021),

('Empowering Local Communities through S&T Support to Weaving Center for Indigenous Non-Timber Products of Kankana-ey Tribe in Quirino Province', 
 (SELECT id FROM municipalities WHERE name = 'Maddela' AND province_id = 'quirino' LIMIT 1), 
 'St. Joseph Credit Cooperative', 310000, 'Finished', 2021),

('Empowering Local Communities thru S&T Support to EO 70 in Barangay Villarose, Cabarroguis, Quirino', 
 (SELECT id FROM municipalities WHERE name = 'Cabarroguis' AND province_id = 'quirino' LIMIT 1), 
 'Villarose Community, Brgy. Calaocan', 180000, 'Finished', 2021),

('S&T Community Empowerment in support to EO 70 in conflict affected and vulnerable communities in the municipality of Cabarroguis', 
 (SELECT id FROM municipalities WHERE name = 'Cabarroguis' AND province_id = 'quirino' LIMIT 1), 
 'Calaocan Community', 420000, 'Finished', 2021),

('S&T Support to Governor''s Rapids Nature Advocate Credit Cooperative', 
 (SELECT id FROM municipalities WHERE name = 'Maddela' AND province_id = 'quirino' LIMIT 1), 
 'Governors Rapids Nature Advocate Credit Cooperative', 400000, 'Finished', 2022),

('Empowering Local Communities through S&T Support to EO 70 in Barangay Gomez, Cabarroguis, Quirino', 
 (SELECT id FROM municipalities WHERE name = 'Cabarroguis' AND province_id = 'quirino' LIMIT 1), 
 'Barangay Gomez Community', 100000, 'Finished', 2022),

('Provision of S&T Innovation Support for Sustainable and Resilient Local Communities in Cagayan Valley (STARBOOKS)', 
 (SELECT id FROM municipalities WHERE name = 'Diffun' AND province_id = 'quirino' LIMIT 1), 
 'Ifugao Village Integrated School, Wasid Integrated School', 0, 'Finished', 2023),

('Science and Technology based approach for Resilient Disaster Risk Management: Provision of Mobile Command and Control Vehicle (MoCCoV)', 
 (SELECT id FROM municipalities WHERE name = 'Cabarroguis' AND province_id = 'quirino' LIMIT 1), 
 'PLGU Quirino', 0, 'Ongoing', 2024),

('Empowering Communities with TUBIG-DOST Project: Technology-Driven Universal and Community-Based S&T Innovation for GIDA Areas', 
 (SELECT id FROM municipalities WHERE name = 'Cabarroguis' AND province_id = 'quirino' LIMIT 1), 
 'Brgy. Calaocan', 542500, 'Ongoing', 2025),

('Liwanag Sa Dilim: Leveraging Innovations for Widespread Access to Novel and Appropriate Green Technologies at Barangay Matmad, Nagtipunan, Quirino', 
 (SELECT id FROM municipalities WHERE name = 'Nagtipunan' AND province_id = 'quirino' LIMIT 1), 
 'Brgy. Matmad', 461500, 'Ongoing', 2025);

-- ═══════════════════════════════════════════════════════════════════════════
-- NUEVA VIZCAYA (14 projects)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO projects (project_title, municipality_id, community, amount_funded, status, year) VALUES
('Greenhouse Technology for Research and Development on Organic Production of High Value Crops', 
 (SELECT id FROM municipalities WHERE name = 'Dupax del Norte' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'LGU Dupax del Norte', 360000, 'Finished', 2019),

('Livelihood and entrepreneurship for Alfonso Castañeda Coco Producers Association', 
 (SELECT id FROM municipalities WHERE name = 'Alfonso Castañeda' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Alfonso Castañeda', 0, 'Finished', 2020),

('Livelihood and entrepreneurship for Gawad Kalinga Ari-tau', 
 (SELECT id FROM municipalities WHERE name = 'Aritao' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Aritao', 0, 'Finished', 2020),

('Dupax del Norte, Belance', 
 (SELECT id FROM municipalities WHERE name = 'Dupax del Norte' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Dupax del Norte, Belance', 0, 'Finished', 2020),

('Intervention on Livelihood Operations by Valuing Entrepreneurship Through Science and Technology (ILOVE S&T) in Dupax Del Sur', 
 (SELECT id FROM municipalities WHERE name = 'Dupax del Sur' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Bugkalot Coffee Growers MPC, Isinay Weavers Inc.', 840000, 'Finished', 2021),

('Intervention on Livelihood Operations by Valuing Entrepreneurship through Science and Technology (ILOVE S&T) in Ambaguio', 
 (SELECT id FROM municipalities WHERE name = 'Ambaguio' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Ambaguio Community', 450000, 'Finished', 2021),

('Strengthening Cacao production and processing in Nueva Vizcaya', 
 (SELECT id FROM municipalities WHERE name = 'Bayombong' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'NV Cacao Growers MPC', 150000, 'Finished', 2021),

('Intervention on Livelihood Operations by Valuing Entrepreneurship through Science and Technology (ILOVE S&T) in Santa Fe', 
 (SELECT id FROM municipalities WHERE name = 'Santa Fe' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'BARACBAC, IMSWAP', 200000, 'Finished', 2021),

('Intervention on Livelihood Operations by Valuing Entrepreneurship through S&T (ILOVE S&T) for 4Ps Beneficiaries', 
 (SELECT id FROM municipalities WHERE name = 'Bayombong' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Cabuaan Ginger Association - Cabuaan', 1000000, 'Finished', 2022),

('Provision of S&T Innovation Support for Sustainable and Resilient Local Communities in Cagayan Valley (STARBOOKS)', 
 (SELECT id FROM municipalities WHERE name = 'Bayombong' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Cabuuan Elementary School', 0, 'Finished', 2023),

('Expanding Horizons, Empowering Minds: Bringing STI in Bambang through STARBOOKS', 
 (SELECT id FROM municipalities WHERE name = 'Bambang' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Elementary Schools', 300000, 'Ongoing', 2024),

('Intervention on Livelihood Operations by Valuing Entrepreneurship through Science and Technology (ILOVE S&T) for KAFPI', 
 (SELECT id FROM municipalities WHERE name = 'Kayapa' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Kayapa Forestland Associations Agriventures, Inc.', 300000, 'Ongoing', 2024),

('Empowering Sustainable Livelihoods through Abaca Fiber Production of NV-AFSE', 
 (SELECT id FROM municipalities WHERE name = 'Bayombong' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'Nueva Vizcaya-Abaca Farmers Social Enterprise', 500000, 'Ongoing', 2024),

('Integrated Science and Technology Support for Sustainable Seedling Production and Community-Based Food Processing Enterprises in Kayapa, Nueva Vizcaya', 
 (SELECT id FROM municipalities WHERE name = 'Kayapa' AND province_id = 'nueva vizcaya' LIMIT 1), 
 'KAFPI, TWARDI', 650000, 'Ongoing', 2025);

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 
    'Projects imported successfully' as status,
    COUNT(*) as total_projects
FROM projects;

-- Should show 66 projects
