// CEST 2.0 Components
export const COMPONENTS = {
  sel: "Sustainable Enterprise & Livelihoods",
  hn: "Health & Nutrition",
  hrd: "Human Resource Dev.",
  drrm: "DRRM & CCA",
  bgcet: "Bio-Circular-Green Economy",
  dg: "Digital Governance",
};

export const COMP_COLORS = {
  sel: "#eb9c25",
  hn: "#efd20f",
  hrd: "#3823f5",
  drrm: "#dc2626",
  bgcet: "#0ecb1a",
  dg: "#e319a7",
};

export const PIE_COLORS = ["#eb9c25", "#efd20f", "#3823f5", "#dc2626", "#0ecb1a", "#e319a7"];

// Status options
export const STATUS_OPTIONS = ["Ongoing", "Liquidated", "Finished"];

// Community types
export const COMMUNITY_TYPES = {
  gida: "GIDA",
  conflict: "Conflict",
  indigenous: "Indigenous",
  womens: "Women's",
  marginalized: "Marginalized",
  landless: "Landless",
  artisanal: "Artisanal",
};

export const COMMUNITY_COLORS = {
  gida: "#0891b2",
  conflict: "#dc2626",
  indigenous: "#7c3aed",
  womens: "#db2777",
  marginalized: "#d97706",
  landless: "#65a30d",
  artisanal: "#0f766e",
};

// KPI List
export const KPI_LIST = [
  {
    id: 1,
    key: "sel",
    color: "#eb9c25",
    title: "Sustainable Enterprise and Livelihoods",
    target: 5,
    indicators: ["No. of S&T-based livelihood projects implemented in communities with high poverty incidence"],
  },
  {
    id: 2,
    key: "hn",
    color: "#efd20f",
    title: "Health and Nutrition",
    target: 4,
    indicators: [
      "No. of S&T-based nutrition interventions conducted to support food security and safety",
      "No. of health and nutrition database tools deployed",
    ],
  },
  {
    id: 3,
    key: "hrd",
    color: "#3823f5",
    title: "Human Resource Development",
    target: 3,
    indicators: [
      "No. of e-learning tools deployed",
      "No. of trainings on S&T education conducted",
      "No. of DOST scholarship applicants",
    ],
  },
  {
    id: 4,
    key: "drrm",
    color: "#dc2626",
    title: "DRRM and CCA",
    target: 3,
    indicators: ["No. of DRRM and CCA Technologies deployed to advance DRRM and CCA processes in communities"],
  },
  {
    id: 5,
    key: "bgcet",
    color: "#0ecb1a",
    title: "Bio-Circular-Green Economy Technologies",
    target: 4,
    indicators: [
      "No. of bio-circular green economy technologies deployed",
      "No. of households adopting renewable energy systems",
      "Number of local plans and policies developed",
    ],
  },
  {
    id: 6,
    key: "dg",
    color: "#e319a7",
    title: "Digital Governance Tools",
    target: 3,
    indicators: [
      "No. of database tools and ICT-related technologies deployed to support digital governance in communities",
    ],
  },
];

// Default Settings
export const DEFAULT_SETTINGS = {
  name: "CEST Admin",
  email: "admin@cest.dost.gov.ph",
  role: "Administrator",
  showCharts: true,
  showEquipTable: true,
  showMuniSummary: true,
  defaultYear: "All",
  notifProjects: true,
  notifEquipment: true,
  notifBudget: true,
  notifReports: true,
  autoSave: true,
  confirmDelete: true,
  targets: KPI_LIST.reduce((a, k) => ({ ...a, [k.key]: k.target }), {}),
};

// LocalStorage Keys
export const LS_KEYS = {
  projects: "cest_projects",
  equipment: "cest_equipment",
  notifications: "cest_notifications",
  settings: "cest_settings",
};

// Beneficiary types for trainings
export const BENEF_TYPES = {
  gida: "GIDA Communities",
  conflict: "Communities-in-conflict",
  women: "Women's Organization",
  ip: "Indigenous People",
  marginal: "Marginalized Sector",
  landless: "Landless Rural Farmers",
  fisher: "Artisanal Fisher folks",
};

// Status color helper
export const getStatusColor = (status) => {
  if (status === "Ongoing") return { bg: "bg-green-100", text: "text-green-700", badge: "#dcfce7/#16a34a" };
  if (status === "Liquidated") return { bg: "bg-yellow-100", text: "text-yellow-700", badge: "#fef9c3/#b45309" };
  return { bg: "bg-blue-100", text: "text-blue-700", badge: "#e0e7ff/#4338ca" };
};
