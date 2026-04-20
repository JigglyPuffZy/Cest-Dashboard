-- After running add_province_to_equipment.sql, update your supabaseClient.js
-- Replace the equipment queries with these versions that include province:

/*
// Update these functions in cest-dashboard/src/shared/services/supabaseClient.js

// ── Equipment ─────────────────────────────────────────────────────────────
async getEquipment() {
  const { data, error } = await supabase.from('equipment')
    .select(`*, municipality:municipalities(name), province`)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
},

async getArchivedEquipment() {
  const { data, error } = await supabase.from('equipment')
    .select(`*, municipality:municipalities(name), province`)
    .eq('is_archived', true).order('archived_at', { ascending: false })
  if (error) return []
  return data || []
},

async createEquipment(equipment) {
  const equipmentData = {
    year: equipment.year || new Date().getFullYear(),
    municipality_id: equipment.municipality_id,
    community: equipment.community || '',
    equipment_name: equipment.equipment_name || 'Unknown Equipment',
    units: parseInt(equipment.units) || 0,
    units_per_year: equipment.units_per_year ? parseInt(equipment.units_per_year) : null,
    component_id: equipment.component_id || 'sel',
    province: equipment.province || 'Cagayan'
  }
  const { data, error } = await supabase.from('equipment').insert([equipmentData]).select()
  if (error) throw error
  return data[0]
},
*/