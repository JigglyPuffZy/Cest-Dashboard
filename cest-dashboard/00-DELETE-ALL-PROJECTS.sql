-- =====================================================
-- STEP 0: DELETE ALL PROJECTS (Run this FIRST)
-- =====================================================

DELETE FROM project_components;
DELETE FROM project_community_types;
DELETE FROM projects;

-- Verify: Should show 0
SELECT COUNT(*) as remaining_projects FROM projects;
