// Safe rendering utilities to prevent "Objects are not valid as a React child" errors

/**
 * Safely extracts a string value from a potentially complex object
 * @param {any} value - The value to extract string from
 * @param {string} fallback - Fallback string if extraction fails
 * @returns {string} - Safe string value
 */
export const safeString = (value, fallback = '') => {
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  if (value && typeof value === 'object') {
    // Try common string properties
    if (typeof value.name === 'string') return value.name;
    if (typeof value.title === 'string') return value.title;
    if (typeof value.project_title === 'string') return value.project_title;
    if (typeof value.equipment_name === 'string') return value.equipment_name;
    if (typeof value.id === 'string') return value.id;
    
    // If it's an array, join with commas
    if (Array.isArray(value)) {
      return value.map(v => safeString(v)).filter(Boolean).join(', ');
    }
  }
  
  return fallback;
};

/**
 * Safely extracts project title from various possible formats
 * @param {any} item - The item containing project information
 * @returns {string} - Safe project title string
 */
export const safeProjectTitle = (item) => {
  if (!item) return '';
  
  return safeString(item.project_title) ||
         safeString(item.project) ||
         safeString(item.projectName) ||
         (item.project && safeString(item.project.project_title)) ||
         '';
};

/**
 * Safely extracts equipment name from various possible formats
 * @param {any} item - The item containing equipment information
 * @returns {string} - Safe equipment name string
 */
export const safeEquipmentName = (item) => {
  if (!item) return '';
  
  return safeString(item.equipment_name) ||
         safeString(item.equipmentName) ||
         safeString(item.name) ||
         '';
};

/**
 * Safely extracts municipality name from various possible formats
 * @param {any} item - The item containing municipality information
 * @returns {string} - Safe municipality name string
 */
export const safeMunicipalityName = (item) => {
  if (!item) return '';
  
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item.name) return safeString(item.name);
  
  return '';
};

/**
 * Safely extracts any display name from an item (project or equipment)
 * @param {any} item - The item to extract display name from
 * @returns {string} - Safe display name string
 */
export const safeDisplayName = (item) => {
  if (!item) return 'Unknown Item';
  
  return safeProjectTitle(item) ||
         safeEquipmentName(item) ||
         safeString(item.title) ||
         safeString(item.name) ||
         'Unknown Item';
};