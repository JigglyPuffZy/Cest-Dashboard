// Optimized data transformation utilities for Supabase integration

/**
 * Extract province from community string
 * Format: "Partner Name - Municipality, Province"
 */
const extractProvinceFromCommunity = (community) => {
  if (!community || typeof community !== 'string') return '';
  
  // Check if community contains province name
  const provinces = ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'];
  for (const province of provinces) {
    if (community.includes(province)) {
      return province;
    }
  }
  
  return '';
};

/**
 * Extract municipality from community string
 * Format: "Partner Name - Municipality, Province"
 */
const extractMunicipalityFromCommunity = (community) => {
  if (!community || typeof community !== 'string') return '';
  
  // Try to extract from format: "Partner - Municipality, Province"
  const match = community.match(/- ([^,]+),/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no match, try to find municipality name directly
  const municipalities = [
    // Batanes
    'Basco', 'Itbayat', 'Ivana', 'Mahatao', 'Sabtang', 'Uyugan',
    // Cagayan
    'Abulug', 'Alcala', 'Allacapan', 'Amulung', 'Aparri', 'Baggao', 'Ballesteros', 'Buguey',
    'Calayan', 'Camalaniugan', 'Claveria', 'Enrile', 'Gattaran', 'Gonzaga', 'Iguig', 'Lal-lo',
    'Lasam', 'Pamplona', 'Peñablanca', 'Piat', 'Rizal', 'Sanchez Mira', 'Sanchez-Mira', 
    'Santa Ana', 'Santa Praxedes', 'Sta. Praxedes', 'Santa Teresita', 'Sta. Teresita', 
    'Santo Niño', 'Sto. Niño', 'Solana', 'Tuao', 'Tuguegarao',
    // Isabela
    'Alicia', 'Angadanan', 'Aurora', 'Benito Soliven', 'Burgos', 'Cabagan', 'Cabatuan',
    'Cauayan', 'Cordon', 'Delfin Albano', 'Dinapigue', 'Divilacan', 'Echague', 'Gamu',
    'Ilagan', 'Jones', 'Luna', 'Maconacon', 'Mallig', 'Naguilian', 'Palanan', 'Quezon',
    'Ramon', 'Reina Mercedes', 'Roxas', 'San Agustin', 'San Guillermo', 'San Isidro',
    'San Manuel', 'San Mariano', 'San Mateo', 'San Pablo', 'Santa Maria', 'Santiago', 'Santo Tomas', 'Tumauini',
    // Quirino
    'Cabarroguis', 'Diffun', 'Maddela', 'Nagtipunan', 'Saguday', 'Aglipay',
    // Nueva Vizcaya
    'Alfonso Castañeda', 'Ambaguio', 'Aritao', 'Bagabag', 'Bambang', 'Bayombong', 'Diadi',
    'Dupax del Norte', 'Dupax del Sur', 'Kasibu', 'Kayapa', 'Quezon', 'Santa Fe', 'Solano', 'Villaverde'
  ];
  
  for (const municipality of municipalities) {
    if (community.includes(municipality)) {
      return municipality;
    }
  }
  
  return '';
};

/**
 * Transform Supabase project data to frontend format
 * Handles both old localStorage and new Supabase structures
 */
export const transformProject = (project) => {
  if (!project) return null;
  
  // Extract province and municipality from community if not present
  const communityStr = typeof project.community === 'string' ? project.community : '';
  const extractedProvince = extractProvinceFromCommunity(communityStr);
  const extractedMunicipality = extractMunicipalityFromCommunity(communityStr);
  
  // Get province and municipality from database joins or extraction
  const provinceValue = typeof project.province === 'object' && project.province?.name 
    ? project.province.name 
    : typeof project.province === 'string' && project.province 
    ? project.province 
    : extractedProvince;
    
  const municipalityValue = typeof project.municipality === 'object' && project.municipality?.name 
    ? project.municipality.name 
    : typeof project.municipality === 'string' && project.municipality 
    ? project.municipality 
    : extractedMunicipality;
  
  const componentIds = (project.project_components || [])
    .map((pc) => pc.component?.id || pc.component_id)
    .filter(Boolean)
    .map((id) => String(id).toLowerCase());

  return {
    ...project,
    components: componentIds.length
      ? componentIds
      : (project.components || []).map((id) => String(id).toLowerCase()),
    // Standardize community types
    communities: project.project_community_types?.map(pct => pct.community_type?.id) || 
                 project.communities || [],
    // Standardize field names - ensure strings
    project: typeof project.project_title === 'string' ? project.project_title : 
             typeof project.project === 'string' ? project.project : '',
    project_title: typeof project.project_title === 'string' ? project.project_title : 
                   typeof project.project === 'string' ? project.project : '',
    amountFunded: Number(project.amount_funded || project.amountFunded || 0),
    amountPerYear: Number(project.amount_per_year || project.amountPerYear || 0),
    // Standardize location data - ALWAYS return strings
    municipality: municipalityValue,
    province: provinceValue,
    // Ensure required objects exist
    beneficiaries: project.beneficiaries || {},
    stakeholders: project.stakeholders || {}
  };
};

/**
 * Transform array of projects
 */
export const transformProjects = (projects = []) => {
  return projects.map(transformProject).filter(Boolean);
};

/**
 * Transform Supabase equipment data to frontend format
 */
export const transformEquipment = (equipment) => {
  if (!equipment) return null;
  
  const transformed = {
    ...equipment,
    // Standardize location data - ensure strings
    municipality: typeof equipment.municipality === 'object' ? equipment.municipality?.name || '' : 
                  typeof equipment.municipality === 'string' ? equipment.municipality : '',
    // Standardize equipment fields - ensure strings
    equipmentName: typeof equipment.equipment_name === 'string' ? equipment.equipment_name : 
                   typeof equipment.equipmentName === 'string' ? equipment.equipmentName : '',
    equipment_name: typeof equipment.equipment_name === 'string' ? equipment.equipment_name : 
                    typeof equipment.equipmentName === 'string' ? equipment.equipmentName : '',
    amountFunded: Number(equipment.amount_funded || equipment.amountFunded || 0),
    component: typeof equipment.component === 'object' ? equipment.component?.name || equipment.component?.id || '' :
               typeof equipment.component_id === 'string' ? equipment.component_id :
               typeof equipment.component === 'string' ? equipment.component : '',
    // Get project name from multiple possible sources - ensure strings
    projectName: typeof equipment.project?.project_title === 'string' ? equipment.project.project_title : 
                 typeof equipment.project_title === 'string' ? equipment.project_title : 
                 typeof equipment.projectName === 'string' ? equipment.projectName : 
                 null,
    project_title: typeof equipment.project?.project_title === 'string' ? equipment.project.project_title : 
                   typeof equipment.project_title === 'string' ? equipment.project_title : 
                   null,
    // Preserve project_id for linking
    project_id: equipment.project_id || (equipment.project?.id ? equipment.project.id : null)
  };
  
  // Debug logging for equipment transformation
  if (transformed.project_id || transformed.projectName || transformed.project_title) {
    console.log('Equipment with project link transformed:', {
      id: transformed.id,
      name: transformed.equipment_name,
      project_id: transformed.project_id,
      projectName: transformed.projectName,
      project_title: transformed.project_title
    });
  }
  
  return transformed;
};

/**
 * Transform array of equipment
 */
export const transformEquipmentList = (equipment = []) => {
  return equipment.map(transformEquipment).filter(Boolean);
};