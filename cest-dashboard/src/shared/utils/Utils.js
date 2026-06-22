import { 
  COMPONENTS, 
  COMP_COLORS, 
  KPI_LIST, 
  DEFAULT_SETTINGS, 
  LS_KEYS 
} from "../constants";

// ── Currency formatter ──
export const fmt = (v) => v ? `₱${Number(v).toLocaleString("en-PH")}` : "₱0";

// ── localStorage helpers ──
export function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage save error:", e);
  }
}

// ── Open uploaded file in new tab or trigger download ──
export function openUploadedFile(fileData, fileName) {
  if (!fileData) return;
  if (
    fileData.startsWith("data:application/pdf") ||
    fileData.startsWith("data:image")
  ) {
    window.open(fileData, "_blank");
  } else {
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName || "project-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ── Open project profile as PDF in new tab ──
export function openProjectAsPDF(p) {
  const compBadges = p.components.map(c => `
    <div style="display:inline-flex;align-items:center;gap:8px;background:${COMP_COLORS[c]}18;border:1px solid ${COMP_COLORS[c]}40;border-radius:8px;padding:7px 14px;margin:4px 6px 4px 0;">
      <span style="width:9px;height:9px;border-radius:50%;background:${COMP_COLORS[c]};display:inline-block;"></span>
      <span style="font-size:12px;font-weight:800;color:${COMP_COLORS[c]};text-transform:uppercase;">${c}</span>
      <span style="font-size:11px;color:#6b7280;">— ${COMPONENTS[c]}</span>
    </div>
  `).join("");

  const commBadges = (p.communities||[]).map(c => `
    <div style="display:inline-flex;align-items:center;gap:6px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:5px 10px;margin:3px;">
      <span style="font-size:11px;font-weight:700;color:#0369a1;">${COMMUNITY_TYPES[c]||c}</span>
    </div>
  `).join("");

  const statusColor = p.status==="Ongoing"?"#16a34a":p.status==="Liquidated"?"#d97706":"#4338ca";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${p.project} — CEST 2.0</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;color:#111827;}
    @media print{body{background:#fff;}.no-print{display:none!important;}.page{box-shadow:none;margin:0;border-radius:0;max-width:100%;}}
    .page{max-width:820px;margin:32px auto;background:#fff;border-radius:14px;box-shadow:0 4px 32px rgba(0,0,0,0.13);overflow:hidden;}
    .header{background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);padding:28px 32px 22px;}
    .header-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px;}
    .agency-label{font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;}
    .project-title{font-size:20px;font-weight:900;color:#fff;line-height:1.35;}
    .header-meta{font-size:12px;color:rgba(255,255,255,0.75);margin-top:8px;line-height:1.6;}
    .status-badge{display:inline-block;background:${statusColor};color:#fff;border-radius:20px;padding:4px 16px;font-size:12px;font-weight:800;margin-right:6px;}
    .print-btn{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;border-radius:8px;padding:8px 18px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;}
    .body{padding:28px 32px;}
    .section-label{font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;margin-top:20px;}
    .section-label:first-child{margin-top:0;}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px;}
    .info-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;}
    .info-card .label{font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px;}
    .info-card .value{font-size:14px;font-weight:800;color:#111827;}
    .info-card .value.money{font-size:18px;color:#16a34a;}
    .stats-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:4px;}
    .stats-box{border-radius:10px;padding:14px 18px;}
    .stats-box.green{background:#f0fdf4;}
    .stats-box.purple{background:#f5f3ff;}
    .box-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:12px;}
    .stats-box.green .box-title{color:#16a34a;}
    .stats-box.purple .box-title{color:#7c3aed;}
    .stats-inner{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;}
    .num{font-size:22px;font-weight:900;}
    .num.green{color:#16a34a;}
    .num.purple{color:#7c3aed;}
    .sublabel{font-size:9px;color:#6b7280;font-weight:600;margin-top:2px;}
    .footer{background:#1e3a5f;color:rgba(255,255,255,0.6);font-size:10px;padding:14px 32px;display:flex;justify-content:space-between;align-items:center;}
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div style="flex:1;">
        <div class="agency-label">DOST — CEST 2.0 Project Profile</div>
        <div class="project-title">${p.project}</div>
        <div class="header-meta">
          <span class="status-badge">${p.status}</span>
          ${p.municipality} &nbsp;·&nbsp; Year ${p.year}
        </div>
      </div>
      <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save PDF</button>
    </div>
    <div>${compBadges}</div>
  </div>
  <div class="body">
    <div class="section-label">📋 Project Information</div>
    <div class="info-grid">
      <div class="info-card"><div class="label">📍 Municipality / City</div><div class="value">${p.municipality}</div></div>
      <div class="info-card"><div class="label">📅 Year</div><div class="value">${p.year}</div></div>
      <div class="info-card" style="grid-column:span 2;"><div class="label">👥 Community / Beneficiaries</div><div class="value">${p.community || "—"}</div></div>
      <div class="info-card"><div class="label">💰 Amount Funded</div><div class="value money">${fmt(p.amountFunded)}</div></div>
      <div class="info-card"><div class="label">📆 Amount per Year</div><div class="value">${p.amountPerYear ? fmt(p.amountPerYear) : "—"}</div></div>
    </div>

    ${p.components.length > 0 ? `
    <div class="section-label">🧩 CEST 2.0 Components</div>
    <div style="background:#f8faff;border-radius:10px;padding:14px 18px;margin-bottom:4px;">${compBadges}</div>
    ` : ""}

    ${(p.communities||[]).length > 0 ? `
    <div class="section-label">🏘️ Community Types</div>
    <div style="background:#f0f9ff;border-radius:10px;padding:14px 18px;margin-bottom:4px;">${commBadges}</div>
    ` : ""}

    <div class="section-label">👥 Beneficiaries & Stakeholders</div>
    <div class="stats-row">
      <div class="stats-box green">
        <div class="box-title">👥 No. of Beneficiaries</div>
        <div class="stats-inner">
          <div><div class="num green">${p.beneficiaries?.male||0}</div><div class="sublabel">Male</div></div>
          <div><div class="num green">${p.beneficiaries?.female||0}</div><div class="sublabel">Female</div></div>
          <div><div class="num green">${p.beneficiaries?.ips||0}</div><div class="sublabel">IP's</div></div>
          <div><div class="num green">${p.beneficiaries?.fourps||0}</div><div class="sublabel">4P's</div></div>
          <div><div class="num green">${p.beneficiaries?.pwd||0}</div><div class="sublabel">PWD</div></div>
          <div><div class="num green">${p.beneficiaries?.senior||0}</div><div class="sublabel">Senior</div></div>
          <div><div class="num green">${p.beneficiaries?.total||0}</div><div class="sublabel">Total</div></div>
        </div>
      </div>
      <div class="stats-box purple">
        <div class="box-title">🏛️ Stakeholders</div>
        <div class="stats-inner">
          <div><div class="num purple">${p.stakeholders?.lgu||0}</div><div class="sublabel">LGU</div></div>
          <div><div class="num purple">${p.stakeholders?.plgu||0}</div><div class="sublabel">PLGU</div></div>
          <div><div class="num purple">${p.stakeholders?.blgu||0}</div><div class="sublabel">BLGU</div></div>
          <div><div class="num purple">${p.stakeholders?.pnp||0}</div><div class="sublabel">PNP</div></div>
          <div><div class="num purple">${p.stakeholders?.suc||0}</div><div class="sublabel">SUC</div></div>
          <div><div class="num purple">${p.stakeholders?.others||0}</div><div class="sublabel">${p.stakeholders?.othersLabel||"Others"}</div></div>
        </div>
      </div>
    </div>

    <div class="section-label">✍️ Prepared By</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:8px;padding-bottom:8px;">
      ${["Prepared by","Reviewed by","Approved by"].map(label=>`
        <div style="text-align:center;">
          <div style="border-top:2px solid #374151;margin-top:48px;padding-top:8px;">
            <div style="font-size:11px;font-weight:700;color:#374151;">${label}</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Signature over Printed Name</div>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
  <div class="footer">
    <span>DOST — Community Empowerment thru Science &amp; Technology (CEST 2.0)</span>
    <span>Generated: ${new Date().toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"})}</span>
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}


// ─── HARDCODED INITIAL PROJECTS (from spreadsheet) ────────────────────────────
export const INITIAL_PROJECTS = [

  // ── 2020 ──────────────────────────────────────────────────────────────────
  {
    id: 1,
    year: 2020,
    province: "Cagayan",
    municipality: "Aparri",
    community: "Punta Fisherfolks - Aparri, Cagayan",
    project: "Provided Drying Facility for fish and aramang products and trainings on the said products",
    amountFunded: null,
    amountPerYear: 1902000,
    components: ["sel"],
    communities: ["artisanal"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 0 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 2,
    year: 2020,
    province: "Cagayan",
    municipality: "Gonzaga",
    community: "Fisherfolks and Farmers in Gonzaga - Gonzaga, Cagayan",
    project: "Community Empowerment thru Science and Technology, Education, Environment Protection, and Health (CESTEEPH): A Collaborative Community-based Program for the Conservation, Restoration, and Sustainable Utilization of Mangrove Ecosystems in Gonzaga, Cagayan (PHASE II) and Upgrading of Agrifishery Products in Cagayan",
    amountFunded: null,
    amountPerYear: 1652000,
    components: ["sel", "hn", "hrd", "drrm"],
    communities: ["artisanal"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 4 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 3,
    year: 2020,
    municipality: "Santa Praxedes",
    community: "Minanga, Sta. Praxedes",
    project: "Provided equipment for Sarakat Handloomed Weavers; Training on Sarakat Dye to 19 people",
    amountFunded: null,
    amountPerYear: null,
    components: ["sel"],
    communities: ["indigenous"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 0 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 4,
    year: 2020,
    municipality: "Calayan",
    community: "Fisherfolks and farmers in Calayan - Calayan, Babuyan Claro, Cagayan",
    project: "Provided Drying facilities; Training on fish based products Processing to 24 people",
    amountFunded: null,
    amountPerYear: null,
    components: ["sel", "hrd", "drrm"],
    communities: ["artisanal"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 3 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 5,
    year: 2020,
    municipality: "Gattaran",
    community: "Barangay Pina Este, Mabuno & Tanglagan - Gattaran, Cagayan",
    project: "Provided Portable Biogas Digester and trainings on the said technology to 3 barangays (19 participants); Livelihood training for banana chips production; Established production facility for banana chips at Brgy. Mabuno; Livelihood training on soap making; Provided Carageenan and Portasol to 300 farmers in Gattaran, Cagayan",
    amountFunded: null,
    amountPerYear: null,
    components: ["sel", "hrd", "drrm"],
    communities: [],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 3 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 6,
    year: 2020,
    municipality: "Lal-lo",
    community: "Rural Improvement Club Lal-lo - Lal-lo, Cagayan",
    project: "Establishment of Essential Oil Extraction Facility; Training on product development of essential oil from citronella",
    amountFunded: null,
    amountPerYear: null,
    components: ["sel", "hrd", "drrm"],
    communities: ["womens"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 3 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 7,
    year: 2020,
    municipality: "Gonzaga",
    community: "Farmers and Fisherfolks in Gonzaga - Gonzaga, Cagayan",
    project: "Provided 20 Portable Solar Dryer; Conducted orientation and livelihood training on use of PORTASOL",
    amountFunded: null,
    amountPerYear: null,
    components: ["sel"],
    communities: ["artisanal"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 8,
    year: 2020,
    municipality: "Abulug",
    community: "Fisherfolks in Abulug - Abulug, Cagayan",
    project: "S&T Support to Fishing Industry: Process and Quality Improvement on the Fish-based Products of Fisherfolks of Abulug, Cagayan",
    amountFunded: 250000,
    amountPerYear: null,
    components: ["sel"],
    communities: ["artisanal"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── 2021 ──────────────────────────────────────────────────────────────────
  {
    id: 9,
    year: 2021,
    municipality: "Gonzaga",
    community: "CSU Gonzaga - Gonzaga, Cagayan",
    project: "Capability Building, Livelihood Development, and Environmental Protection for Climate Change Vulnerable Coastal Communities in Buguey, Cagayan Amidst the Pandemic.",
    amountFunded: 883872,
    amountPerYear: 4673872,
    components: ["sel", "drrm"],
    communities: [],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 2 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 10,
    year: 2021,
    municipality: "Santa Teresita",
    community: "Laguna de Cagayan Handicrafts Association - Sta. Teresita, Cagayan",
    project: "Innovating the Handicrafts and Fiber Production Processes of Laguna de Cagayan Handicrafts Association.",
    amountFunded: 750000,
    amountPerYear: null,
    components: ["sel"],
    communities: ["womens"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 11,
    year: 2021,
    municipality: "Santa Praxedes",
    community: "Gamet Gatherers and Sarakat Weavers - Sta. Praxedes, Cagayan",
    project: "Empowering Local Communities through S&T Innovation Strategies in the Municipality of Sta. Praxedes, Cagayan.",
    amountFunded: 840000,
    amountPerYear: null,
    components: ["sel"],
    communities: ["indigenous"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 12,
    year: 2021,
    municipality: "Sanchez-Mira",
    community: "Sanchez Mira, Cagayan",
    project: "Empowering Local Communities through Sustained S&T Innovations Strategies in Sanchez Mira, Cagayan",
    amountFunded: 800000,
    amountPerYear: null,
    components: ["sel"],
    communities: [],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 1, othersLabel: "Others" },
  },
  {
    id: 13,
    year: 2021,
    municipality: "Alcala",
    community: "Cabuluan Community - Cabuluan, Alcala, Cagayan",
    project: "S&T Community Empowerment Support to EO 70 \"Institutionalization of the Whole of Nation Approach in Attaining Inclusive and Sustainable Peace\" in Conflict-Affected and Vulnerable Communities in Cagayan",
    amountFunded: 200000,
    amountPerYear: null,
    components: ["sel", "hrd"],
    communities: ["conflict"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 2 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 14,
    year: 2021,
    municipality: "Santo Niño",
    community: "Sta. Felicitas Community - Sta. Felicitas, Sto. Niño, Cagayan",
    project: "S&T Community Empowerment Support to EO 70 \"Institutionalization of the Whole of Nation Approach in Attaining Inclusive and Sustainable Peace\" in Conflict-Affected and Vulnerable Communities in Cagayan",
    amountFunded: 200000,
    amountPerYear: null,
    components: ["hrd", "drrm"],
    communities: ["conflict"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 2 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 15,
    year: 2021,
    municipality: "Santo Niño",
    community: "Lagum Community - Lagum, Sto. Niño, Cagayan",
    project: "S&T Community Empowerment Support to EO 70 \"Institutionalization of the Whole of Nation Approach in Attaining Inclusive and Sustainable Peace\" in Conflict-Affected and Vulnerable Communities in Cagayan",
    amountFunded: 300000,
    amountPerYear: null,
    components: ["hrd", "bgcet"],
    communities: ["conflict"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 2 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 16,
    year: 2021,
    municipality: "Aparri",
    community: "Fuga Community - Fuga Island, Aparri, Cagayan",
    project: "CEST GIA: Promoting Health and Sanitation in Fuga Island through Access to Clean and Potable Water",
    amountFunded: 700000,
    amountPerYear: null,
    components: ["hrd", "drrm"],
    communities: ["gida"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 2 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── 2022 ──────────────────────────────────────────────────────────────────
  {
    id: 17,
    year: 2022,
    municipality: "Peñablanca",
    community: "Pentur Farmers Agricultural Cooperative - Bical, Peñablanca, Cagayan",
    project: "Access to Clean Water for Livable and Sustainable Communities.",
    amountFunded: 400000,
    amountPerYear: 400000,
    components: ["hrd"],
    communities: [],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 18,
    year: 2022,
    municipality: "Gonzaga",
    community: "CSU Gonzaga - Gonzaga, Cagayan",
    project: "Science, Technology and Innovation (STI) Support to Yarn Production using Fiber from Pineapple",
    amountFunded: 500000,
    amountPerYear: 1000000,
    components: ["hrd"],
    communities: [],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── 2023 ──────────────────────────────────────────────────────────────────
  {
    id: 19,
    year: 2023,
    municipality: "Amulung",
    community: "Gabut Integrated School - Amulung, Cagayan; Aridowen Integrated School - Sta. Teresita, Cagayan; Dalin Elementary School - Baggao, Cagayan",
    project: "Provision of S&T Innovation Support for Sustainable and Resilient Local Communities in Cagayan Valley (Provision of STARBOOKS units to the remote and highland areas of N. Viscaya, Quirino, and Cagayan)",
    amountFunded: null,
    amountPerYear: 0,
    components: ["sel"],
    communities: ["gida"],
    status: "Finished",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── 2024 ──────────────────────────────────────────────────────────────────
  {
    id: 20,
    year: 2024,
    province: "Cagayan",
    municipality: "Claveria",
    community: "Claveria Handicrafts Association - Claveria, Cagayan",
    project: "Innovating the Handicrafts and Abaca Fiber Production Processes of Claveria, Cagayan",
    amountFunded: 500000,
    amountPerYear: 1150000,
    components: ["sel"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 21,
    year: 2024,
    municipality: "Lal-lo",
    community: "RIC Lallo - Lal-lo, Cagayan",
    project: "Innovating the Essential Oil Livelihood Project of RIC Lal-lo in support to the Development of Citronella Industry in the Region",
    amountFunded: 650000,
    amountPerYear: null,
    components: ["sel"],
    communities: ["womens"],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── 2025 ──────────────────────────────────────────────────────────────────
  {
    id: 22,
    year: 2025,
    province: "Cagayan",
    municipality: "Peñablanca",
    community: "Brgy. Baliuag, Peñablanca, Cagayan",
    project: "Technology-Based Solutions for Safe and Sustainable Water Access in Brgy. Baliuag, Peñablanca, Cagayan",
    amountFunded: 450000,
    amountPerYear: 1750000,
    components: ["hn"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 0 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 23,
    year: 2025,
    municipality: "Calayan",
    community: "RIC Calayan - Calayan Island, Cagayan",
    project: "Strengthening S&T-Based Livelihoods in Calayan Island through Value-Adding Technologies for Honey and Fish Processing",
    amountFunded: 500000,
    amountPerYear: null,
    components: ["sel"],
    communities: ["gida"],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 0 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 24,
    year: 2025,
    municipality: "Amulung",
    community: "Brgy. Manalo, Amulung - Amulung, Cagayan",
    project: "Technology-Based Solutions for Safe and Sustainable Water Access and Digital Literacy in Barangay Manalo, Amulung East",
    amountFunded: 500000,
    amountPerYear: null,
    components: ["hrd", "drrm"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 2 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 25,
    year: 2025,
    municipality: "Gattaran",
    community: "Brgy. Tanglagan, Gattaran - Gattaran, Cagayan",
    project: "Strengthening Rural Livelihoods and Education Through Science, Technology, and Innovation in Barangay Tanglagan",
    amountFunded: 300000,
    amountPerYear: null,
    components: ["sel"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 0 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── Batanes Province ──────────────────────────────────────────────────────
  {
    id: 26,
    year: 2024,
    province: "Batanes",
    municipality: "Basco",
    community: "Basco Farmers Association - Basco, Batanes",
    project: "Climate-Resilient Agriculture and Livelihood Development in Batanes",
    amountFunded: 450000,
    amountPerYear: 700000,
    components: ["sel", "drrm"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 27,
    year: 2025,
    province: "Batanes",
    municipality: "Ivana",
    community: "Ivana Cooperative - Ivana, Batanes",
    project: "Sustainable Fishing and Marine Resource Management in Ivana",
    amountFunded: 380000,
    amountPerYear: null,
    components: ["sel", "bgcet"],
    communities: ["artisanal"],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 27.5,
    year: 2024,
    province: "Batanes",
    municipality: "Mahatao",
    community: "Mahatao Fishing Community - Mahatao, Batanes",
    project: "Marine Biodiversity Conservation and Sustainable Fishing Practices",
    amountFunded: 320000,
    amountPerYear: null,
    components: ["bgcet", "drrm"],
    communities: ["artisanal"],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── Isabela Province ──────────────────────────────────────────────────────
  {
    id: 28,
    year: 2024,
    province: "Isabela",
    municipality: "Cauayan",
    community: "Cauayan Farmers Cooperative - Cauayan, Isabela",
    project: "Rice and Corn Production Enhancement Through Modern Agricultural Technology",
    amountFunded: 520000,
    amountPerYear: 850000,
    components: ["sel", "hrd"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 2 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 29,
    year: 2025,
    province: "Isabela",
    municipality: "Tuguegarao",
    community: "Tuguegarao Urban Farmers - Tuguegarao, Isabela",
    project: "Urban Agriculture and Community Food Security Initiative",
    amountFunded: 480000,
    amountPerYear: null,
    components: ["sel", "hn"],
    communities: ["gida"],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 29.5,
    year: 2024,
    province: "Isabela",
    municipality: "Echague",
    community: "Echague Pineapple Farmers - Echague, Isabela",
    project: "Pineapple Processing and Export-Quality Product Development",
    amountFunded: 410000,
    amountPerYear: null,
    components: ["sel", "hrd"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── Nueva Vizcaya Province ────────────────────────────────────────────────
  {
    id: 30,
    year: 2024,
    province: "Nueva Vizcaya",
    municipality: "Bayombong",
    community: "Bayombong Coffee Farmers Association - Bayombong, Nueva Vizcaya",
    project: "Coffee Production and Value-Adding Technologies for Highland Communities",
    amountFunded: 490000,
    amountPerYear: 780000,
    components: ["sel", "hrd"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 31,
    year: 2025,
    province: "Nueva Vizcaya",
    municipality: "Solano",
    community: "Solano Indigenous Peoples Community - Solano, Nueva Vizcaya",
    project: "Indigenous Knowledge and Modern Technology Integration for Sustainable Livelihoods",
    amountFunded: 460000,
    amountPerYear: null,
    components: ["sel", "bgcet"],
    communities: ["indigenous"],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 31.5,
    year: 2024,
    province: "Nueva Vizcaya",
    municipality: "Kasibu",
    community: "Kasibu Vegetable Farmers - Kasibu, Nueva Vizcaya",
    project: "Highland Vegetable Production and Cold Chain Management",
    amountFunded: 400000,
    amountPerYear: null,
    components: ["sel", "hrd"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },

  // ── Quirino Province ──────────────────────────────────────────────────────
  {
    id: 32,
    year: 2024,
    province: "Quirino",
    municipality: "Cabarroguis",
    community: "Cabarroguis Farmers Association - Cabarroguis, Quirino",
    project: "Sustainable Agriculture and Agroforestry Development in Quirino",
    amountFunded: 440000,
    amountPerYear: 680000,
    components: ["sel", "bgcet"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 1, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 33,
    year: 2025,
    province: "Quirino",
    municipality: "Diffun",
    community: "Diffun Women's Cooperative - Diffun, Quirino",
    project: "Women Empowerment Through Handicrafts and Livelihood Skills Development",
    amountFunded: 420000,
    amountPerYear: null,
    components: ["sel", "hrd"],
    communities: ["womens"],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
  {
    id: 33.5,
    year: 2024,
    province: "Quirino",
    municipality: "Nagtipunan",
    community: "Nagtipunan Rice Farmers - Nagtipunan, Quirino",
    project: "Rice Farming Modernization and Climate-Smart Agriculture",
    amountFunded: 380000,
    amountPerYear: null,
    components: ["sel", "drrm"],
    communities: [],
    status: "Ongoing",
    fileData: null, fileName: "", fileType: "",
    beneficiaries: { male: 0, female: 0, ips: 0, fourps: 0, pwd: 0, senior: 0, total: 1 },
    stakeholders: { lgu: 0, plgu: 0, blgu: 0, pnp: 0, suc: 0, others: 0, othersLabel: "" },
  },
];


// ─── HARDCODED INITIAL EQUIPMENT (from spreadsheet) ───────────────────────────
export const INITIAL_EQUIPMENT = [

  // ── 2020 ──────────────────────────────────────────────────────────────────
  { id: 1,  year: 2020, municipality: "Aparri",         community: "Punta Fisherfolks - Aparri, Cagayan",                                    equipment: "Fish Drying Equipment",                        units: 1,    unitsPerYear: null, component: "sel" },
  { id: 2,  year: 2020, municipality: "Gonzaga",        community: "Fisherfolks and Farmers in Gonzaga - Gonzaga, Cagayan",                   equipment: "Fish Drying Equipment",                        units: 25,   unitsPerYear: null, component: "sel" },
  { id: 3,  year: 2020, municipality: "Gonzaga",        community: "Fisherfolks and Farmers in Gonzaga - Gonzaga, Cagayan",                   equipment: "Aquasilviculture of crab",                     units: 2,    unitsPerYear: null, component: "sel" },
  { id: 4,  year: 2020, municipality: "Gonzaga",        community: "Fisherfolks and Farmers in Gonzaga - Gonzaga, Cagayan",                   equipment: "Ceramic water filter",                         units: 1,    unitsPerYear: null, component: "hn"  },
  { id: 5,  year: 2020, municipality: "Santa Praxedes", community: "Minanga, Sta. Praxedes",                                                  equipment: "Weaving equipment",                            units: 1,    unitsPerYear: null, component: "sel" },
  { id: 6,  year: 2020, municipality: "Calayan",        community: "Fisherfolks and farmers in Calayan - Calayan, Babuyan Claro, Cagayan",    equipment: "Fish Drying Equipment",                        units: 1,    unitsPerYear: null, component: "sel" },
  { id: 7,  year: 2020, municipality: "Gattaran",       community: "Barangay Pina Este, Mabuno & Tanglagan - Gattaran, Cagayan",              equipment: "Portable biogas digester",                     units: 1,    unitsPerYear: null, component: "bgcet" },
  { id: 8,  year: 2020, municipality: "Gattaran",       community: "Barangay Pina Este, Mabuno & Tanglagan - Gattaran, Cagayan",              equipment: "Production facility for banana chips",         units: 1,    unitsPerYear: null, component: "sel" },
  { id: 9,  year: 2020, municipality: "Gattaran",       community: "Barangay Pina Este, Mabuno & Tanglagan - Gattaran, Cagayan",              equipment: "Sun drying trays (Portasol)",                  units: 1,    unitsPerYear: null, component: "sel" },
  { id: 10, year: 2020, municipality: "Lal-lo",         community: "Rural Improvement Club Lal-lo - Lal-lo, Cagayan",                         equipment: "Essential Oil Extraction Facility",            units: 1,    unitsPerYear: null, component: "sel" },
  { id: 11, year: 2020, municipality: "Abulug",         community: "Fisherfolks in Abulug - Abulug, Cagayan",                                 equipment: "Fermentation drums with resealable cover",     units: 1,    unitsPerYear: null, component: "sel" },
  { id: 12, year: 2020, municipality: "Abulug",         community: "Fisherfolks in Abulug - Abulug, Cagayan",                                 equipment: "Stainless working table",                      units: 1,    unitsPerYear: null, component: "sel" },
  { id: 13, year: 2020, municipality: "Abulug",         community: "Fisherfolks in Abulug - Abulug, Cagayan",                                 equipment: "Foot stamp sealer",                            units: 1,    unitsPerYear: null, component: "sel" },
  { id: 14, year: 2020, municipality: "Abulug",         community: "Fisherfolks in Abulug - Abulug, Cagayan",                                 equipment: "Heat gun blower",                              units: 1,    unitsPerYear: null, component: "sel" },
  { id: 15, year: 2020, municipality: "Abulug",         community: "Fisherfolks in Abulug - Abulug, Cagayan",                                 equipment: "Industrial gas stove with LPG tank",           units: 1,    unitsPerYear: null, component: "sel" },
  { id: 16, year: 2020, municipality: "Abulug",         community: "Fisherfolks in Abulug - Abulug, Cagayan",                                 equipment: "Digital weighing scale",                       units: 1,    unitsPerYear: null, component: "sel" },

  // ── 2021 ──────────────────────────────────────────────────────────────────
  { id: 17, year: 2021, municipality: "Aparri",         community: "Fuga Community - Fuga Island, Aparri, Cagayan",                           equipment: "Freshwater Distribution System",               units: 1,    unitsPerYear: null, component: "hn"  },

  // ── 2022 ──────────────────────────────────────────────────────────────────
  { id: 18, year: 2022, municipality: "Gonzaga",        community: "CSU Gonzaga - Gonzaga, Cagayan",                                          equipment: "Decorticating Machine",                        units: 2,    unitsPerYear: null, component: "sel" },

  // ── 2023 ──────────────────────────────────────────────────────────────────
  { id: 19, year: 2023, municipality: "Amulung",        community: "Gabut Integrated School - Amulung, Cagayan; Aridowen Integrated School - Sta. Teresita, Cagayan; Dalin Elementary School - Baggao, Cagayan", equipment: "STARBOOKS", units: 3, unitsPerYear: null, component: "hrd" },

  // ── 2025 ──────────────────────────────────────────────────────────────────
  { id: 20, year: 2025, municipality: "Peñablanca",     community: "Brgy. Baliuag, Peñablanca, Cagayan",                                      equipment: "Solar-powered water system",                   units: 1,    unitsPerYear: null, component: "hn"  },
  { id: 21, year: 2025, municipality: "Calayan",        community: "RIC Calayan - Calayan Island, Cagayan",                                   equipment: "Electric Meat/Fish Grinder",                   units: 1,    unitsPerYear: null, component: "sel" },
  { id: 22, year: 2025, municipality: "Calayan",        community: "RIC Calayan - Calayan Island, Cagayan",                                   equipment: "12L Capacity Pressure Cooker",                 units: 1,    unitsPerYear: null, component: "sel" },
  { id: 23, year: 2025, municipality: "Calayan",        community: "RIC Calayan - Calayan Island, Cagayan",                                   equipment: "Commercial burner",                            units: 1,    unitsPerYear: null, component: "sel" },
  { id: 24, year: 2025, municipality: "Calayan",        community: "RIC Calayan - Calayan Island, Cagayan",                                   equipment: "Inverter Chest-type Freezer",                  units: 1,    unitsPerYear: null, component: "sel" },
  { id: 25, year: 2025, municipality: "Calayan",        community: "RIC Calayan - Calayan Island, Cagayan",                                   equipment: "Heavy Duty Electric Noodle Cutter",            units: 1,    unitsPerYear: null, component: "sel" },
  { id: 26, year: 2025, municipality: "Calayan",        community: "RIC Calayan - Calayan Island, Cagayan",                                   equipment: "Honey bucket with dual-layer filter",          units: 1,    unitsPerYear: null, component: "sel" },
  { id: 27, year: 2025, municipality: "Calayan",        community: "RIC Calayan - Calayan Island, Cagayan",                                   equipment: "Closed type stainless steel honey presser",    units: 1,    unitsPerYear: null, component: "sel" },
  { id: 28, year: 2025, municipality: "Amulung",        community: "Brgy. Manalo, Amulung - Amulung, Cagayan",                                equipment: "SAFEWTRS Technology",                          units: 1,    unitsPerYear: null, component: "hn"  },
  { id: 29, year: 2025, municipality: "Amulung",        community: "Brgy. Manalo, Amulung - Amulung, Cagayan",                                equipment: "STARBOOKS",                                    units: 1,    unitsPerYear: null, component: "hrd" },
];