export const safeString = (value, fallback = '') => {
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  if (value && typeof value === 'object') {
    
    if (typeof value.name === 'string') return value.name;
    if (typeof value.title === 'string') return value.title;
    if (typeof value.project_title === 'string') return value.project_title;
    if (typeof value.equipment_name === 'string') return value.equipment_name;
    if (typeof value.id === 'string') return value.id;
    
    
    if (Array.isArray(value)) {
      return value.map(v => safeString(v)).filter(Boolean).join(', ');
    }
  }
  
  return fallback;
};


export const safeProjectTitle = (item) => {
  if (!item) return '';
  
  return safeString(item.project_title) ||
         safeString(item.project) ||
         safeString(item.projectName) ||
         (item.project && safeString(item.project.project_title)) ||
         '';
};


export const safeEquipmentName = (item) => {
  if (!item) return '';
  
  return safeString(item.equipment_name) ||
         safeString(item.equipmentName) ||
         safeString(item.name) ||
         '';
};


export const safeMunicipalityName = (item) => {
  if (!item) return '';
  
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item.name) return safeString(item.name);
  
  return '';
};


export const safeDisplayName = (item) => {
  if (!item) return 'Unknown Item';
  
  return safeProjectTitle(item) ||
         safeEquipmentName(item) ||
         safeString(item.title) ||
         safeString(item.name) ||
         'Unknown Item';
};

export const normalizeComponentList = (components) => {
  if (!components) return [];
  if (Array.isArray(components)) {
    return components
      .map((c) => {
        if (typeof c === 'string') return c.toLowerCase();
        if (c && typeof c === 'object') {
          return String(c.id || c.component?.id || c.component_id || '').toLowerCase();
        }
        return '';
      })
      .filter(Boolean);
  }
  if (typeof components === 'string') return [components.toLowerCase()];
  return [];
};
