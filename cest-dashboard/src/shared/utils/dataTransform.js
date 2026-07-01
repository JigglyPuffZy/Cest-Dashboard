const extractProvinceFromCommunity = (community) => {
  if (!community || typeof community !== 'string') return '';
  
  
  const provinces = ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'];
  for (const province of provinces) {
    if (community.includes(province)) {
      return province;
    }
  }
  
  return '';
};


const extractMunicipalityFromCommunity = (community) => {
  if (!community || typeof community !== 'string') return '';
  
  
  const match = community.match(/- ([^,]+),/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  
  const municipalities = [
    
    'Basco', 'Itbayat', 'Ivana', 'Mahatao', 'Sabtang', 'Uyugan',
    
    'Abulug', 'Alcala', 'Allacapan', 'Amulung', 'Aparri', 'Baggao', 'Ballesteros', 'Buguey',
    'Calayan', 'Camalaniugan', 'Claveria', 'Enrile', 'Gattaran', 'Gonzaga', 'Iguig', 'Lal-lo',
    'Lasam', 'Pamplona', 'Peñablanca', 'Piat', 'Rizal', 'Sanchez Mira', 'Sanchez-Mira', 
    'Santa Ana', 'Santa Praxedes', 'Sta. Praxedes', 'Santa Teresita', 'Sta. Teresita', 
    'Santo Niño', 'Sto. Niño', 'Solana', 'Tuao', 'Tuguegarao',
    
    'Alicia', 'Angadanan', 'Aurora', 'Benito Soliven', 'Burgos', 'Cabagan', 'Cabatuan',
    'Cauayan', 'Cordon', 'Delfin Albano', 'Dinapigue', 'Divilacan', 'Echague', 'Gamu',
    'Ilagan', 'Jones', 'Luna', 'Maconacon', 'Mallig', 'Naguilian', 'Palanan', 'Quezon',
    'Ramon', 'Reina Mercedes', 'Roxas', 'San Agustin', 'San Guillermo', 'San Isidro',
    'San Manuel', 'San Mariano', 'San Mateo', 'San Pablo', 'Santa Maria', 'Santiago', 'Santo Tomas', 'Tumauini',
    
    'Cabarroguis', 'Diffun', 'Maddela', 'Nagtipunan', 'Saguday', 'Aglipay',
    
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


export const transformProject = (project) => {
  if (!project) return null;
  
  
  const communityStr = typeof project.community === 'string' ? project.community : '';
  const extractedProvince = extractProvinceFromCommunity(communityStr);
  const extractedMunicipality = extractMunicipalityFromCommunity(communityStr);
  
  
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
    
    communities: project.project_community_types?.map(pct => pct.community_type?.id) || 
                 project.communities || [],
    
    project: typeof project.project_title === 'string' ? project.project_title : 
             typeof project.project === 'string' ? project.project : '',
    project_title: typeof project.project_title === 'string' ? project.project_title : 
                   typeof project.project === 'string' ? project.project : '',
    amountFunded: Number(project.amount_funded || project.amountFunded || 0),
    amountPerYear: Number(project.amount_per_year || project.amountPerYear || 0),
    
    municipality: municipalityValue,
    province: provinceValue,
    
    beneficiaries: project.beneficiaries || {},
    stakeholders: project.stakeholders || {}
  };
};


export const transformProjects = (projects = []) => {
  return projects.map(transformProject).filter(Boolean);
};


export const transformEquipment = (equipment) => {
  if (!equipment) return null;
  
  const transformed = {
    ...equipment,
    
    municipality: typeof equipment.municipality === 'object' ? equipment.municipality?.name || '' : 
                  typeof equipment.municipality === 'string' ? equipment.municipality : '',
    
    equipmentName: typeof equipment.equipment_name === 'string' ? equipment.equipment_name : 
                   typeof equipment.equipmentName === 'string' ? equipment.equipmentName : '',
    equipment_name: typeof equipment.equipment_name === 'string' ? equipment.equipment_name : 
                    typeof equipment.equipmentName === 'string' ? equipment.equipmentName : '',
    amountFunded: Number(equipment.amount_funded || equipment.amountFunded || 0),
    component: typeof equipment.component === 'object' ? equipment.component?.name || equipment.component?.id || '' :
               typeof equipment.component_id === 'string' ? equipment.component_id :
               typeof equipment.component === 'string' ? equipment.component : '',
    
    projectName: typeof equipment.project?.project_title === 'string' ? equipment.project.project_title : 
                 typeof equipment.project_title === 'string' ? equipment.project_title : 
                 typeof equipment.projectName === 'string' ? equipment.projectName : 
                 null,
    project_title: typeof equipment.project?.project_title === 'string' ? equipment.project.project_title : 
                   typeof equipment.project_title === 'string' ? equipment.project_title : 
                   null,
    
    project_id: equipment.project_id || (equipment.project?.id ? equipment.project.id : null)
  };
  
  return transformed;
};


export const transformEquipmentList = (equipment = []) => {
  return equipment.map(transformEquipment).filter(Boolean);
};
