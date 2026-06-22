-- =====================================================
-- IMPORT ALL COMPONENT MAPPINGS
-- =====================================================
-- Run this AFTER importing projects
-- Uses ON CONFLICT to prevent duplicate errors
-- =====================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- BATANES COMPONENTS
-- ═══════════════════════════════════════════════════════════════════════════

WITH batanes_projects AS (
    SELECT p.id, p.project_title, p.year
    FROM projects p
    JOIN municipalities m ON p.municipality_id = m.id
    WHERE m.province_id = 'batanes'
)
INSERT INTO project_components (project_id, component_id)
SELECT id, 'sel' FROM batanes_projects WHERE project_title LIKE '%Uyugan Fishlanding%'
UNION ALL
SELECT id, 'hn' FROM batanes_projects WHERE project_title LIKE '%COVID%'
UNION ALL
SELECT id, 'sel' FROM batanes_projects WHERE project_title LIKE '%I-GAIN%'
UNION ALL
SELECT id, 'sel' FROM batanes_projects WHERE project_title LIKE '%PERA%' AND year = 2023
UNION ALL
SELECT id, 'sel' FROM batanes_projects WHERE project_title LIKE '%PERA%' AND year = 2024
UNION ALL
SELECT id, 'hn' FROM batanes_projects WHERE project_title LIKE '%Wash%'
ON CONFLICT (project_id, component_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- CAGAYAN COMPONENTS
-- ═══════════════════════════════════════════════════════════════════════════

WITH cagayan_projects AS (
    SELECT p.id, p.project_title, p.year
    FROM projects p
    JOIN municipalities m ON p.municipality_id = m.id
    WHERE m.province_id = 'cagayan'
)
INSERT INTO project_components (project_id, component_id)
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Drying Facility for fish%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%CESTEEPH%'
UNION ALL
SELECT id, 'hn' FROM cagayan_projects WHERE project_title LIKE '%CESTEEPH%'
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%CESTEEPH%'
UNION ALL
SELECT id, 'drrm' FROM cagayan_projects WHERE project_title LIKE '%CESTEEPH%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Sarakat Handloomed%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Drying facilities%' AND year = 2020
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%Drying facilities%' AND year = 2020
UNION ALL
SELECT id, 'drrm' FROM cagayan_projects WHERE project_title LIKE '%Drying facilities%' AND year = 2020
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%Biogas Digester%'
UNION ALL
SELECT id, 'drrm' FROM cagayan_projects WHERE project_title LIKE '%Biogas Digester%'
UNION ALL
SELECT id, 'bgcet' FROM cagayan_projects WHERE project_title LIKE '%Biogas Digester%'
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%Essential Oil Extraction%' AND year = 2020
UNION ALL
SELECT id, 'drrm' FROM cagayan_projects WHERE project_title LIKE '%Essential Oil Extraction%' AND year = 2020
UNION ALL
SELECT id, 'bgcet' FROM cagayan_projects WHERE project_title LIKE '%Essential Oil Extraction%' AND year = 2020
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Fishing Industry%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Capability Building, Livelihood%'
UNION ALL
SELECT id, 'drrm' FROM cagayan_projects WHERE project_title LIKE '%Capability Building, Livelihood%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Handicrafts and Fiber Production Processes%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Empowering Local Communities through S&T Innovation Strategies%' AND year = 2021
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Sustained S&T Innovations%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Alcala%'
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%Alcala%'
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%Sta. Felicitas%'
UNION ALL
SELECT id, 'drrm' FROM cagayan_projects WHERE project_title LIKE '%Sta. Felicitas%'
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%Lagum%'
UNION ALL
SELECT id, 'bgcet' FROM cagayan_projects WHERE project_title LIKE '%Lagum%'
UNION ALL
SELECT id, 'hn' FROM cagayan_projects WHERE project_title LIKE '%Fuga Island%'
UNION ALL
SELECT id, 'drrm' FROM cagayan_projects WHERE project_title LIKE '%Fuga Island%'
UNION ALL
SELECT id, 'hn' FROM cagayan_projects WHERE project_title LIKE '%Clean Water for Livable%'
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%Yarn Production%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%STARBOOKS%' AND year = 2023
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Handicrafts and Abaca%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Essential Oil Livelihood%'
UNION ALL
SELECT id, 'hn' FROM cagayan_projects WHERE project_title LIKE '%Safe and Sustainable Water%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Calayan Island%'
UNION ALL
SELECT id, 'hrd' FROM cagayan_projects WHERE project_title LIKE '%Digital Literacy%'
UNION ALL
SELECT id, 'drrm' FROM cagayan_projects WHERE project_title LIKE '%Digital Literacy%'
UNION ALL
SELECT id, 'sel' FROM cagayan_projects WHERE project_title LIKE '%Rural Livelihoods and Education%'
ON CONFLICT (project_id, component_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- ISABELA COMPONENTS
-- ═══════════════════════════════════════════════════════════════════════════

WITH isabela_projects AS (
    SELECT p.id, p.project_title, p.year
    FROM projects p
    JOIN municipalities m ON p.municipality_id = m.id
    WHERE m.province_id = 'isabela'
)
INSERT INTO project_components (project_id, component_id)
SELECT id, 'sel' FROM isabela_projects WHERE project_title LIKE '%San Agustin%' AND year = 2021 AND project_title LIKE '%Innovation Strategies%'
UNION ALL
SELECT id, 'hrd' FROM isabela_projects WHERE project_title LIKE '%San Agustin%' AND year = 2021 AND project_title LIKE '%Innovation Strategies%'
UNION ALL
SELECT id, 'hrd' FROM isabela_projects WHERE project_title LIKE '%Echague%' AND year = 2021 AND project_title LIKE '%Innovation Strategies%'
UNION ALL
SELECT id, 'hrd' FROM isabela_projects WHERE project_title LIKE '%Jones%'
UNION ALL
SELECT id, 'drrm' FROM isabela_projects WHERE project_title LIKE '%Jones%'
UNION ALL
SELECT id, 'hrd' FROM isabela_projects WHERE project_title LIKE '%Cauayan%' AND year = 2021
UNION ALL
SELECT id, 'drrm' FROM isabela_projects WHERE project_title LIKE '%Cauayan%' AND year = 2021
UNION ALL
SELECT id, 'hrd' FROM isabela_projects WHERE project_title LIKE '%San Mariano%'
UNION ALL
SELECT id, 'drrm' FROM isabela_projects WHERE project_title LIKE '%San Mariano%'
UNION ALL
SELECT id, 'hrd' FROM isabela_projects WHERE project_title LIKE '%Ilagan%'
UNION ALL
SELECT id, 'drrm' FROM isabela_projects WHERE project_title LIKE '%Ilagan%'
UNION ALL
SELECT id, 'hrd' FROM isabela_projects WHERE project_title LIKE '%SUBLI%'
UNION ALL
SELECT id, 'hn' FROM isabela_projects WHERE project_title LIKE '%San Guillermo%'
UNION ALL
SELECT id, 'drrm' FROM isabela_projects WHERE project_title LIKE '%portaboat%'
UNION ALL
SELECT id, 'drrm' FROM isabela_projects WHERE project_title LIKE '%Mobile Command%'
UNION ALL
SELECT id, 'sel' FROM isabela_projects WHERE project_title LIKE '%Ecotourism%'
UNION ALL
SELECT id, 'drrm' FROM isabela_projects WHERE project_title LIKE '%Ecotourism%'
ON CONFLICT (project_id, component_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIRINO COMPONENTS
-- ═══════════════════════════════════════════════════════════════════════════

WITH quirino_projects AS (
    SELECT p.id, p.project_title, p.year
    FROM projects p
    JOIN municipalities m ON p.municipality_id = m.id
    WHERE m.province_id = 'quirino'
)
INSERT INTO project_components (project_id, component_id)
SELECT id, 'sel' FROM quirino_projects WHERE project_title LIKE '%GRNACC%' AND year = 2021
UNION ALL
SELECT id, 'hrd' FROM quirino_projects WHERE project_title LIKE '%Weaving Center%'
UNION ALL
SELECT id, 'drrm' FROM quirino_projects WHERE project_title LIKE '%Weaving Center%'
UNION ALL
SELECT id, 'hrd' FROM quirino_projects WHERE project_title LIKE '%Villarose%'
UNION ALL
SELECT id, 'drrm' FROM quirino_projects WHERE project_title LIKE '%Villarose%'
UNION ALL
SELECT id, 'hrd' FROM quirino_projects WHERE project_title LIKE '%conflict affected%' AND year = 2021
UNION ALL
SELECT id, 'drrm' FROM quirino_projects WHERE project_title LIKE '%conflict affected%' AND year = 2021
UNION ALL
SELECT id, 'sel' FROM quirino_projects WHERE project_title LIKE '%GRNACC%' AND year = 2022
UNION ALL
SELECT id, 'hrd' FROM quirino_projects WHERE project_title LIKE '%GRNACC%' AND year = 2022
UNION ALL
SELECT id, 'drrm' FROM quirino_projects WHERE project_title LIKE '%GRNACC%' AND year = 2022
UNION ALL
SELECT id, 'hrd' FROM quirino_projects WHERE project_title LIKE '%Gomez%'
UNION ALL
SELECT id, 'hrd' FROM quirino_projects WHERE project_title LIKE '%STARBOOKS%' AND year = 2023
UNION ALL
SELECT id, 'drrm' FROM quirino_projects WHERE project_title LIKE '%MoCCoV%'
UNION ALL
SELECT id, 'hn' FROM quirino_projects WHERE project_title LIKE '%TUBIG%'
UNION ALL
SELECT id, 'bgcet' FROM quirino_projects WHERE project_title LIKE '%Liwanag%'
ON CONFLICT (project_id, component_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- NUEVA VIZCAYA COMPONENTS
-- ═══════════════════════════════════════════════════════════════════════════

WITH nv_projects AS (
    SELECT p.id, p.project_title, p.year
    FROM projects p
    JOIN municipalities m ON p.municipality_id = m.id
    WHERE m.province_id = 'nueva vizcaya'
)
INSERT INTO project_components (project_id, component_id)
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Greenhouse Technology%'
UNION ALL
SELECT id, 'hrd' FROM nv_projects WHERE project_title LIKE '%Greenhouse Technology%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Alfonso Castañeda%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Gawad Kalinga%'
UNION ALL
SELECT id, 'hn' FROM nv_projects WHERE project_title LIKE '%Gawad Kalinga%'
UNION ALL
SELECT id, 'hrd' FROM nv_projects WHERE project_title LIKE '%Gawad Kalinga%'
UNION ALL
SELECT id, 'drrm' FROM nv_projects WHERE project_title LIKE '%Gawad Kalinga%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Belance%'
UNION ALL
SELECT id, 'hrd' FROM nv_projects WHERE project_title LIKE '%Belance%'
UNION ALL
SELECT id, 'drrm' FROM nv_projects WHERE project_title LIKE '%Belance%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Dupax Del Sur%'
UNION ALL
SELECT id, 'hrd' FROM nv_projects WHERE project_title LIKE '%Dupax Del Sur%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Ambaguio%'
UNION ALL
SELECT id, 'hrd' FROM nv_projects WHERE project_title LIKE '%Ambaguio%'
UNION ALL
SELECT id, 'drrm' FROM nv_projects WHERE project_title LIKE '%Ambaguio%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Cacao%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Santa Fe%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%4Ps%'
UNION ALL
SELECT id, 'hrd' FROM nv_projects WHERE project_title LIKE '%STARBOOKS%' AND year = 2023
UNION ALL
SELECT id, 'hrd' FROM nv_projects WHERE project_title LIKE '%Bambang%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%KAFPI%' AND year = 2024
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Abaca Fiber%'
UNION ALL
SELECT id, 'sel' FROM nv_projects WHERE project_title LIKE '%Integrated Science%'
UNION ALL
SELECT id, 'hrd' FROM nv_projects WHERE project_title LIKE '%Integrated Science%'
UNION ALL
SELECT id, 'drrm' FROM nv_projects WHERE project_title LIKE '%Integrated Science%'
ON CONFLICT (project_id, component_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 
    m.province_id,
    COUNT(DISTINCT p.id) as projects,
    COUNT(pc.component_id) as components
FROM projects p
JOIN municipalities m ON p.municipality_id = m.id
LEFT JOIN project_components pc ON p.id = pc.project_id
GROUP BY m.province_id
ORDER BY m.province_id;

-- Expected:
-- batanes: 6 projects, 6 components
-- cagayan: 25 projects, 42 components
-- isabela: 11 projects, 18 components
-- nueva vizcaya: 14 projects, 23 components
-- quirino: 10 projects, 13 components
