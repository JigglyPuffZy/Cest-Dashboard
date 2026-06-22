-- ============================================
-- PARTNER AGENCIES FROM EXCEL DATA
-- Source: CEST Program Dashboard (Cagayan Valley).xlsx
-- ============================================

-- Based on the 65 projects, here are the partner agencies/communities mentioned:

-- ============================================
-- PARTNER AGENCIES / COMMUNITIES
-- ============================================

-- Note: The Excel file shows "community" field which contains partner organizations
-- These are the unique partner agencies/communities from the 65 projects:

-- BATANES PARTNERS
-- 1. Uyugan Fishlanding Community
-- 2. Sabtang Community
-- 3. Garlic and Onion Farmers; Garlic Retailers
-- 4. LGU Basco
-- 5. LGU Ivana

-- CAGAYAN PARTNERS
-- 1. Punta Fisherfolks
-- 2. Fisherfolks and Farmers in Gonzaga
-- 3. Minanga, Sta. Praxedes
-- 4. Fisherfolks and farmers in Calayan
-- 5. Barangay Pina Este, Mabuno & Tanglagan
-- 6. Rural Improvement Club Lal-lo
-- 7. Fisherfolks in Abulug
-- 8. CSU Gonzaga
-- 9. Laguna de Cagayan Handicrafts Association
-- 10. Gamet Gatherers and Sarakat Weavers
-- 11. Sanchez Mira Community
-- 12. Cabuluan Community
-- 13. Sta. Felicitas Community
-- 14. Lagum Community
-- 15. Fuga Community
-- 16. Pentur Farmers Agricultural Cooperative
-- 17. Gabut Integrated School
-- 18. Claveria Handicrafts Association
-- 19. RIC Lallo
-- 20. Brgy. Baliuag
-- 21. RIC Calayan
-- 22. Brgy. Manalo
-- 23. Brgy. Tanglagan

-- ISABELA PARTNERS
-- 1. San Agustin Community
-- 2. Echague Community
-- 3. Jones Community
-- 4. Cauayan Community
-- 5. San Mariano Community
-- 6. Ilagan Community
-- 7. San Guillermo Community
-- 8. PLGU Isabela

-- QUIRINO PARTNERS
-- 1. Governor's Rapids Natures Advocate Credit Cooperative (GRNACC)
-- 2. St. Joseph Credit Cooperative
-- 3. Villarose Community, Brgy. Calaocan
-- 4. Calaocan Community
-- 5. Barangay Gomez Community
-- 6. Ifugao Village Integrated School
-- 7. PLGU Quirino
-- 8. Brgy. Calaocan
-- 9. Brgy. Matmad

-- NUEVA VIZCAYA PARTNERS
-- 1. Alfonso Castañeda Community
-- 2. Gawad Kalinga Ari-tau
-- 3. Belance Community
-- 4. Bugkalot Coffee Growers MPC
-- 5. Ambaguio Community
-- 6. NV Cacao Growers MPC
-- 7. BARACBAC
-- 8. Cabuaan Ginger Association
-- 9. Cabuuan Elementary School
-- 10. Elementary Schools
-- 11. Kayapa Forestland Associations Agriventures, Inc. (KAFPI)
-- 12. Nueva Vizcaya-Abaca Farmers Social Enterprise

-- ============================================
-- IF YOU HAVE A partner_agencies TABLE
-- ============================================

-- Check if partner_agencies table exists
-- SELECT * FROM partner_agencies LIMIT 5;

-- If you want to insert these as separate partner agencies:
/*
INSERT INTO partner_agencies (name, type, province_id) VALUES
-- BATANES
('Uyugan Fishlanding Community', 'Community Organization', (SELECT id FROM provinces WHERE name = 'Batanes')),
('Sabtang Community', 'Community Organization', (SELECT id FROM provinces WHERE name = 'Batanes')),
('Garlic and Onion Farmers Association', 'Farmers Association', (SELECT id FROM provinces WHERE name = 'Batanes')),
('LGU Basco', 'Local Government Unit', (SELECT id FROM provinces WHERE name = 'Batanes')),
('LGU Ivana', 'Local Government Unit', (SELECT id FROM provinces WHERE name = 'Batanes')),

-- CAGAYAN
('Punta Fisherfolks', 'Fisherfolks Association', (SELECT id FROM provinces WHERE name = 'Cagayan')),
('CSU Gonzaga', 'State University', (SELECT id FROM provinces WHERE name = 'Cagayan')),
('Rural Improvement Club Lal-lo', 'Community Organization', (SELECT id FROM provinces WHERE name = 'Cagayan')),
('Laguna de Cagayan Handicrafts Association', 'Handicrafts Association', (SELECT id FROM provinces WHERE name = 'Cagayan')),
('Pentur Farmers Agricultural Cooperative', 'Cooperative', (SELECT id FROM provinces WHERE name = 'Cagayan')),
('Claveria Handicrafts Association', 'Handicrafts Association', (SELECT id FROM provinces WHERE name = 'Cagayan')),

-- ISABELA
('PLGU Isabela', 'Provincial Government', (SELECT id FROM provinces WHERE name = 'Isabela')),

-- QUIRINO
('Governor''s Rapids Natures Advocate Credit Cooperative', 'Cooperative', (SELECT id FROM provinces WHERE name = 'Quirino')),
('St. Joseph Credit Cooperative', 'Cooperative', (SELECT id FROM provinces WHERE name = 'Quirino')),
('PLGU Quirino', 'Provincial Government', (SELECT id FROM provinces WHERE name = 'Quirino')),

-- NUEVA VIZCAYA
('Bugkalot Coffee Growers MPC', 'Multi-Purpose Cooperative', (SELECT id FROM provinces WHERE name = 'Nueva Vizcaya')),
('NV Cacao Growers MPC', 'Multi-Purpose Cooperative', (SELECT id FROM provinces WHERE name = 'Nueva Vizcaya')),
('Cabuaan Ginger Association', 'Farmers Association', (SELECT id FROM provinces WHERE name = 'Nueva Vizcaya')),
('Kayapa Forestland Associations Agriventures, Inc.', 'Cooperative', (SELECT id FROM provinces WHERE name = 'Nueva Vizcaya')),
('Nueva Vizcaya-Abaca Farmers Social Enterprise', 'Social Enterprise', (SELECT id FROM provinces WHERE name = 'Nueva Vizcaya'))
ON CONFLICT (name) DO NOTHING;
*/

-- ============================================
-- SUMMARY OF PARTNER TYPES
-- ============================================

-- Partner Agency Types found in Excel:
-- 1. Community Organizations (Barangay communities, Indigenous groups)
-- 2. Fisherfolks Associations
-- 3. Farmers Associations
-- 4. Cooperatives (Credit, Agricultural, Multi-Purpose)
-- 5. Local Government Units (LGU, BLGU, PLGU)
-- 6. State Universities and Colleges (SUC)
-- 7. Handicrafts Associations
-- 8. Schools (Elementary, Integrated)
-- 9. Social Enterprises

-- ============================================
-- NOTES
-- ============================================

-- The "community" field in the projects table contains the full partner description
-- Example: "Uyugan Fishlanding Community - Uyugan, Batanes"
-- Format: [Partner Name] - [Municipality], [Province]

-- If you need to extract partner agencies separately, you can:
-- 1. Create a partner_agencies table
-- 2. Link projects to partner_agencies via project_partner junction table
-- 3. Or keep them in the community field as they are now (simpler approach)
