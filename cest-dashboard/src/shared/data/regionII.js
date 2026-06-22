// ═══════════════════════════════════════════════════════════════════════════
// REGION II (CAGAYAN VALLEY) - COMPLETE ADMINISTRATIVE STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
// Source: Philippine Statistics Authority (PSA) - PSGC Dataset
// Last Updated: March 2026
// ═══════════════════════════════════════════════════════════════════════════

export const REGION_II_STRUCTURE = {
  regionCode: "02",
  regionName: "Cagayan Valley",
  provinces: [
    {
      id: "batanes",
      code: "BTN",
      name: "Batanes",
      municipalities: [
        { name: "Basco", type: "municipality" },
        { name: "Itbayat", type: "municipality" },
        { name: "Ivana", type: "municipality" },
        { name: "Mahatao", type: "municipality" },
        { name: "Sabtang", type: "municipality" },
        { name: "Uyugan", type: "municipality" },
      ],
    },
    {
      id: "cagayan",
      code: "CAG",
      name: "Cagayan",
      municipalities: [
        { name: "Tuguegarao City", type: "city" },
        { name: "Abulug", type: "municipality" },
        { name: "Alcala", type: "municipality" },
        { name: "Allacapan", type: "municipality" },
        { name: "Amulung", type: "municipality" },
        { name: "Aparri", type: "municipality" },
        { name: "Baggao", type: "municipality" },
        { name: "Ballesteros", type: "municipality" },
        { name: "Buguey", type: "municipality" },
        { name: "Calayan", type: "municipality" },
        { name: "Camalaniugan", type: "municipality" },
        { name: "Claveria", type: "municipality" },
        { name: "Enrile", type: "municipality" },
        { name: "Gattaran", type: "municipality" },
        { name: "Gonzaga", type: "municipality" },
        { name: "Iguig", type: "municipality" },
        { name: "Lal-lo", type: "municipality" },
        { name: "Lasam", type: "municipality" },
        { name: "Pamplona", type: "municipality" },
        { name: "Peñablanca", type: "municipality" },
        { name: "Piat", type: "municipality" },
        { name: "Rizal", type: "municipality" },
        { name: "Sanchez-Mira", type: "municipality" },
        { name: "Santa Ana", type: "municipality" },
        { name: "Santa Praxedes", type: "municipality" },
        { name: "Santa Teresita", type: "municipality" },
        { name: "Santo Niño", type: "municipality" },
        { name: "Solana", type: "municipality" },
        { name: "Tuao", type: "municipality" },
      ],
    },
    {
      id: "isabela",
      code: "ISA",
      name: "Isabela",
      municipalities: [
        { name: "Ilagan City", type: "city" },
        { name: "Cauayan City", type: "city" },
        { name: "Santiago City", type: "city" },
        { name: "Alicia", type: "municipality" },
        { name: "Angadanan", type: "municipality" },
        { name: "Aurora", type: "municipality" },
        { name: "Benito Soliven", type: "municipality" },
        { name: "Burgos", type: "municipality" },
        { name: "Cabagan", type: "municipality" },
        { name: "Cabatuan", type: "municipality" },
        { name: "Cordon", type: "municipality" },
        { name: "Delfin Albano", type: "municipality" },
        { name: "Dinapigue", type: "municipality" },
        { name: "Divilacan", type: "municipality" },
        { name: "Echague", type: "municipality" },
        { name: "Gamu", type: "municipality" },
        { name: "Jones", type: "municipality" },
        { name: "Luna", type: "municipality" },
        { name: "Maconacon", type: "municipality" },
        { name: "Mallig", type: "municipality" },
        { name: "Naguilian", type: "municipality" },
        { name: "Palanan", type: "municipality" },
        { name: "Quezon", type: "municipality" },
        { name: "Quirino", type: "municipality" },
        { name: "Ramon", type: "municipality" },
        { name: "Reina Mercedes", type: "municipality" },
        { name: "Roxas", type: "municipality" },
        { name: "San Agustin", type: "municipality" },
        { name: "San Guillermo", type: "municipality" },
        { name: "San Isidro", type: "municipality" },
        { name: "San Manuel", type: "municipality" },
        { name: "San Mariano", type: "municipality" },
        { name: "San Mateo", type: "municipality" },
        { name: "San Pablo", type: "municipality" },
        { name: "Santa Maria", type: "municipality" },
        { name: "Santo Tomas", type: "municipality" },
        { name: "Tumauini", type: "municipality" },
      ],
    },
    {
      id: "nueva-vizcaya",
      code: "NVZ",
      name: "Nueva Vizcaya",
      municipalities: [
        { name: "Bayombong", type: "municipality" },
        { name: "Solano", type: "municipality" },
        { name: "Alfonso Castañeda", type: "municipality" },
        { name: "Ambaguio", type: "municipality" },
        { name: "Aritao", type: "municipality" },
        { name: "Bagabag", type: "municipality" },
        { name: "Bambang", type: "municipality" },
        { name: "Diadi", type: "municipality" },
        { name: "Dupax del Norte", type: "municipality" },
        { name: "Dupax del Sur", type: "municipality" },
        { name: "Kasibu", type: "municipality" },
        { name: "Kayapa", type: "municipality" },
        { name: "Quezon", type: "municipality" },
        { name: "Santa Fe", type: "municipality" },
        { name: "Villaverde", type: "municipality" },
      ],
    },
    {
      id: "quirino",
      code: "QUI",
      name: "Quirino",
      municipalities: [
        { name: "Cabarroguis", type: "municipality" },
        { name: "Diffun", type: "municipality" },
        { name: "Maddela", type: "municipality" },
        { name: "Nagtipunan", type: "municipality" },
        { name: "Saguday", type: "municipality" },
        { name: "Aglipay", type: "municipality" },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE BARANGAY DATA (Tuguegarao City Example)
// ═══════════════════════════════════════════════════════════════════════════
// Note: This is a sample structure. In production, barangay data should be
// loaded from the complete PSGC dataset or your database.
// ═══════════════════════════════════════════════════════════════════════════

export const SAMPLE_BARANGAYS = {
  "Tuguegarao City": [
    "Ugac Norte",
    "Ugac Sur",
    "Centro 1",
    "Centro 2",
    "Centro 3",
    "Centro 4",
    "Centro 5",
    "Centro 6",
    "Centro 7",
    "Centro 8",
    "Centro 9",
    "Centro 10",
    "Centro 11",
    "Centro 12",
    "Atulayan Norte",
    "Atulayan Sur",
    "Cataggaman Nuevo",
    "Cataggaman Pardo",
    "Annafunan East",
    "Annafunan West",
    "Balzain East",
    "Balzain West",
    "Caritan Norte",
    "Caritan Sur",
    "Linao East",
    "Linao West",
    "Namabbalan Norte",
    "Namabbalan Sur",
    "Pengue-Ruyu",
    "Tagga",
    "Larion Alto",
    "Larion Bajo",
    "Leonarda",
    "Pallua Norte",
    "Pallua Sur",
    "Reyes",
    "San Gabriel",
    "Tanza",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all provinces in Region II
 * @returns {Array} Array of province objects
 */
export const getAllProvinces = () => {
  return REGION_II_STRUCTURE.provinces.map((province) => ({
    id: province.id,
    code: province.code,
    name: province.name,
    municipalityCount: province.municipalities.length,
  }));
};

/**
 * Get all municipalities/cities for a specific province
 * @param {string} provinceId - Province ID (e.g., 'cagayan')
 * @returns {Array} Array of municipality objects
 */
export const getMunicipalitiesByProvince = (provinceId) => {
  const province = REGION_II_STRUCTURE.provinces.find((p) => p.id === provinceId);
  return province ? province.municipalities : [];
};

/**
 * Get province by ID
 * @param {string} provinceId - Province ID
 * @returns {Object|null} Province object or null
 */
export const getProvinceById = (provinceId) => {
  return REGION_II_STRUCTURE.provinces.find((p) => p.id === provinceId) || null;
};

/**
 * Get province by name
 * @param {string} provinceName - Province name
 * @returns {Object|null} Province object or null
 */
export const getProvinceByName = (provinceName) => {
  return (
    REGION_II_STRUCTURE.provinces.find(
      (p) => p.name.toLowerCase() === provinceName.toLowerCase()
    ) || null
  );
};

/**
 * Get total count of municipalities/cities in Region II
 * @returns {number} Total count
 */
export const getTotalMunicipalityCount = () => {
  return REGION_II_STRUCTURE.provinces.reduce(
    (total, province) => total + province.municipalities.length,
    0
  );
};

/**
 * Search municipalities across all provinces
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching municipalities with province info
 */
export const searchMunicipalities = (searchTerm) => {
  const results = [];
  const term = searchTerm.toLowerCase();

  REGION_II_STRUCTURE.provinces.forEach((province) => {
    province.municipalities.forEach((municipality) => {
      if (municipality.name.toLowerCase().includes(term)) {
        results.push({
          ...municipality,
          province: province.name,
          provinceId: province.id,
        });
      }
    });
  });

  return results;
};

/**
 * Validate if a municipality exists in a province
 * @param {string} provinceId - Province ID
 * @param {string} municipalityName - Municipality name
 * @returns {boolean} True if exists
 */
export const municipalityExistsInProvince = (provinceId, municipalityName) => {
  const province = getProvinceById(provinceId);
  if (!province) return false;

  return province.municipalities.some(
    (m) => m.name.toLowerCase() === municipalityName.toLowerCase()
  );
};

/**
 * Get statistics for Region II
 * @returns {Object} Statistics object
 */
export const getRegionStatistics = () => {
  const provinces = REGION_II_STRUCTURE.provinces;
  const totalMunicipalities = getTotalMunicipalityCount();
  const totalCities = provinces.reduce(
    (count, province) =>
      count + province.municipalities.filter((m) => m.type === "city").length,
    0
  );

  return {
    regionName: REGION_II_STRUCTURE.regionName,
    regionCode: REGION_II_STRUCTURE.regionCode,
    provinceCount: provinces.length,
    municipalityCount: totalMunicipalities - totalCities,
    cityCount: totalCities,
    totalLGUs: totalMunicipalities,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════

export default REGION_II_STRUCTURE;
