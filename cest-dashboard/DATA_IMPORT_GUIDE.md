# 📊 CEST Database Import Guide

## ✅ COMPLETED FIXES

### 1. DataEntryPage Error - FIXED ✓
**Error:** `Cannot access 'getProvinceFromMunicipality' before initialization`

**Solution:** Moved the `getProvinceFromMunicipality` function declaration **before** the `createCombinedGroups` function that uses it.

**File:** `src/features/data-entry/DataEntryPage.jsx`

---

## 📁 SQL FILES CREATED

### 1. **insert-65-real-projects.sql** ✓
- Contains all 65 real CEST projects from Excel
- Total Budget: ₱35,585,172
- Breakdown by Province:
  - **Batanes**: 6 projects, ₱4,610,000
  - **Cagayan**: 25 projects, ₱10,875,872
  - **Isabela**: 11 projects, ₱9,990,000
  - **Quirino**: 10 projects, ₱2,969,300
  - **Nueva Vizcaya**: 13 projects, ₱7,140,000
- **Status values fixed**: Uses only 'Ongoing', 'Finished', 'Liquidated' (not 'Completed')

### 2. **get-province-municipality-ids.sql** ✓ NEW
- Inserts 5 provinces (Region II - Cagayan Valley)
- Inserts all municipalities from the 65 projects
- Includes verification queries
- Uses `ON CONFLICT DO NOTHING` to avoid duplicates

### 3. **import-partner-agencies.sql** ✓ NEW
- Lists all partner agencies/communities from Excel
- Organized by province
- Includes partner types (Cooperatives, LGUs, Associations, etc.)
- Contains commented SQL for inserting into partner_agencies table (if needed)

---

## 🚀 STEP-BY-STEP IMPORT PROCESS

### Step 1: Clean Existing Data (Optional)
If you want to start fresh, run:
```sql
-- Delete all existing projects
DELETE FROM projects;
```

### Step 2: Import Provinces & Municipalities
Run this file in Supabase SQL Editor:
```
get-province-municipality-ids.sql
```

This will:
- Insert 5 provinces (Batanes, Cagayan, Isabela, Nueva Vizcaya, Quirino)
- Insert all municipalities mentioned in the 65 projects
- Skip duplicates automatically

### Step 3: Import 65 Real Projects
Run this file in Supabase SQL Editor:
```
insert-65-real-projects.sql
```

This will:
- Insert all 65 projects from Excel
- Use correct status values ('Ongoing', 'Finished', 'Liquidated')
- Include verification queries at the end

### Step 4: Verify Import
The SQL file includes verification queries that will show:
- Project count per province
- Total budget per province
- Overall totals

Expected results:
```
Province         | Projects | Budget
-----------------|----------|-------------
Batanes          | 6        | ₱4,610,000
Cagayan          | 25       | ₱10,875,872
Isabela          | 11       | ₱9,990,000
Nueva Vizcaya    | 13       | ₱7,140,000
Quirino          | 10       | ₱2,969,300
-----------------|----------|-------------
TOTAL            | 65       | ₱35,585,172
```

---

## 📋 PARTNER AGENCIES INFORMATION

The Excel file contains partner agencies in the "community" field. These are stored in the format:
```
[Partner Name] - [Municipality], [Province]
```

Example: `"Uyugan Fishlanding Community - Uyugan, Batanes"`

### Partner Types Found:
1. **Community Organizations** (Barangay communities, Indigenous groups)
2. **Fisherfolks Associations**
3. **Farmers Associations**
4. **Cooperatives** (Credit, Agricultural, Multi-Purpose)
5. **Local Government Units** (LGU, BLGU, PLGU)
6. **State Universities and Colleges** (SUC)
7. **Handicrafts Associations**
8. **Schools** (Elementary, Integrated)
9. **Social Enterprises**

See `import-partner-agencies.sql` for the complete list.

---

## ⚠️ IMPORTANT NOTES

### Database Status Constraint
Your database only accepts these status values:
- `'Ongoing'`
- `'Finished'`
- `'Liquidated'`

**DO NOT USE:** 'Completed', 'completed', or any other values.

### Province Detection
The DataEntryPage now automatically detects provinces from municipality names using a mapping function. If a project doesn't have a province field, it will be determined from the municipality.

### Community Field
The `community` field contains both the partner agency name and location. This is the simplest approach and matches the Excel data structure.

---

## 🔍 VERIFICATION QUERIES

After importing, run these queries to verify:

```sql
-- Check total projects
SELECT COUNT(*) as total_projects FROM projects;

-- Check projects by province
SELECT 
    CASE 
        WHEN community LIKE '%Batanes%' THEN 'Batanes'
        WHEN community LIKE '%Cagayan%' THEN 'Cagayan'
        WHEN community LIKE '%Isabela%' THEN 'Isabela'
        WHEN community LIKE '%Quirino%' THEN 'Quirino'
        WHEN community LIKE '%Nueva Vizcaya%' THEN 'Nueva Vizcaya'
        ELSE 'Unknown'
    END as province,
    COUNT(*) as project_count,
    SUM(amount_funded) as total_budget
FROM projects
GROUP BY province
ORDER BY province;

-- Check status distribution
SELECT status, COUNT(*) as count FROM projects GROUP BY status;

-- Check year distribution
SELECT year, COUNT(*) as count FROM projects GROUP BY year ORDER BY year;
```

---

## 🎯 EXPECTED DASHBOARD RESULTS

After importing the 65 projects, your dashboard should show:

### Overall Summary
- **Total Projects**: 65
- **Total Budget**: ₱35,585,172
- **Provinces**: 5
- **STARBOOKS Units**: 504 (from separate table)
- **Communities**: 48

### By Province
- **Batanes**: 6 projects (9.2%)
- **Cagayan**: 25 projects (38.5%)
- **Isabela**: 11 projects (16.9%)
- **Nueva Vizcaya**: 13 projects (20.0%)
- **Quirino**: 10 projects (15.4%)

### By Status
- **Ongoing**: Projects from 2024-2025
- **Finished**: Projects from 2020-2024
- **Liquidated**: (if any)

---

## 🐛 TROUBLESHOOTING

### Error: "violates check constraint projects_status_check"
**Solution:** Make sure all status values are exactly: 'Ongoing', 'Finished', or 'Liquidated' (case-sensitive)

### Error: "Cannot access 'getProvinceFromMunicipality' before initialization"
**Solution:** Already fixed in DataEntryPage.jsx

### Dashboard still shows 120 projects
**Solution:** 
1. Delete old projects: `DELETE FROM projects;`
2. Run `insert-65-real-projects.sql`
3. Refresh your dashboard

### Projects not showing correct province
**Solution:** The province is determined from the municipality name or the community field. Check the `getProvinceFromMunicipality` function in DataEntryPage.jsx

---

## 📞 NEXT STEPS

1. ✅ DataEntryPage error is fixed
2. ✅ SQL files are ready
3. 🔄 Run `get-province-municipality-ids.sql` in Supabase
4. 🔄 Run `insert-65-real-projects.sql` in Supabase
5. 🔄 Refresh your dashboard to see 65 real projects
6. ✅ Verify the numbers match the Excel file

---

## 📊 DATA SOURCE

**Source File:** CEST Program Dashboard (Cagayan Valley).xlsx  
**Date Extracted:** May 13, 2026  
**Total Records:** 65 projects  
**Total Budget:** ₱35,585,172  
**Region:** Region II - Cagayan Valley
