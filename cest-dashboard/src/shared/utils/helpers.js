// Currency formatter
export const fmt = (v) => (v ? `₱${Number(v).toLocaleString("en-PH")}` : "₱0");

// Short currency formatter for charts
export const formatCurrencyShort = (value) => {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}k`;
  return `₱${value}`;
};

// Status color helper
export const getStatusColor = (status, darkMode = false) => {
  const colors = {
    Ongoing: darkMode 
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
      : "text-emerald-700 bg-emerald-50 border-emerald-200",
    Liquidated: darkMode 
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
      : "text-amber-700 bg-amber-50 border-amber-200",
    Finished: darkMode 
      ? "text-blue-400 bg-blue-500/10 border-blue-500/20" 
      : "text-blue-700 bg-blue-50 border-blue-200"
  };
  return colors[status] || colors.Finished;
};

// Card style helper - Enhanced with glassmorphism
export const getCardStyle = (darkMode = false) => ({
  background: darkMode 
    ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: `1px solid ${darkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'}`,
  boxShadow: darkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset' 
    : '0 8px 32px rgba(0, 74, 152, 0.08), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
});

// Input style helper - Enhanced with better focus states
export const getInputStyle = (darkMode = false, isFocused = false) => ({
  background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
  color: darkMode ? '#f8fafc' : '#0f172a',
  border: `2px solid ${isFocused ? '#004A98' : (darkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)')}`,
  boxShadow: isFocused 
    ? '0 0 0 4px rgba(0, 74, 152, 0.1), 0 4px 12px rgba(0, 74, 152, 0.15)' 
    : 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
});

// Button style helper - New utility
export const getButtonStyle = (variant = 'primary', darkMode = false) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 16px rgba(0, 74, 152, 0.3)',
      border: 'none'
    },
    secondary: {
      background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.8)',
      color: darkMode ? '#f8fafc' : '#0f172a',
      boxShadow: 'none',
      border: `1px solid ${darkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)'}`
    },
    danger: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
      border: 'none'
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
      border: 'none'
    }
  };
  return variants[variant] || variants.primary;
};

// Open uploaded file in new tab or trigger download
export function openUploadedFile(fileData, fileName) {
  if (!fileData) return;
  
  if (fileData.startsWith("data:application/pdf") || fileData.startsWith("data:image")) {
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

// Generate project PDF
export function openProjectAsPDF(project, COMPONENTS, COMP_COLORS, COMMUNITY_TYPES, fmt) {
  const p = project;
  
  const compBadges = p.components
    .map(
      (c) => `
    <div style="display:inline-flex;align-items:center;gap:8px;background:${COMP_COLORS[c]}18;border:1px solid ${COMP_COLORS[c]}40;border-radius:8px;padding:7px 14px;margin:4px 6px 4px 0;">
      <span style="width:9px;height:9px;border-radius:50%;background:${COMP_COLORS[c]};display:inline-block;"></span>
      <span style="font-size:12px;font-weight:800;color:${COMP_COLORS[c]};text-transform:uppercase;">${c}</span>
      <span style="font-size:11px;color:#6b7280;">— ${COMPONENTS[c]}</span>
    </div>
  `
    )
    .join("");

  const commBadges = (p.communities || [])
    .map(
      (c) => `
    <div style="display:inline-flex;align-items:center;gap:6px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:5px 10px;margin:3px;">
      <span style="font-size:11px;font-weight:700;color:#0369a1;">${COMMUNITY_TYPES[c] || c}</span>
    </div>
  `
    )
    .join("");

  const statusColor = p.status === "Ongoing" ? "#16a34a" : p.status === "Liquidated" ? "#d97706" : "#4338ca";

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
    .header-meta{font-size:12px;color:rgba(255,255,255,0.75);margin-top:6px;line-height:1.6;}
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

    ${
      p.components.length > 0
        ? `
    <div class="section-label">🧩 CEST 2.0 Components</div>
    <div style="background:#f8faff;border-radius:10px;padding:14px 18px;margin-bottom:4px;">${compBadges}</div>
    `
        : ""
    }

    ${
      (p.communities || []).length > 0
        ? `
    <div class="section-label">🏘️ Community Types</div>
    <div style="background:#f0f9ff;border-radius:10px;padding:14px 18px;margin-bottom:4px;">${commBadges}</div>
    `
        : ""
    }

    <div class="section-label">👥 Beneficiaries & Stakeholders</div>
    <div class="stats-row">
      <div class="stats-box green">
        <div class="box-title">👥 No. of Beneficiaries</div>
        <div class="stats-inner">
          <div><div class="num green">${p.beneficiaries?.male || 0}</div><div class="sublabel">Male</div></div>
          <div><div class="num green">${p.beneficiaries?.female || 0}</div><div class="sublabel">Female</div></div>
          <div><div class="num green">${p.beneficiaries?.ips || 0}</div><div class="sublabel">IP's</div></div>
          <div><div class="num green">${p.beneficiaries?.fourps || 0}</div><div class="sublabel">4P's</div></div>
          <div><div class="num green">${p.beneficiaries?.pwd || 0}</div><div class="sublabel">PWD</div></div>
          <div><div class="num green">${p.beneficiaries?.senior || 0}</div><div class="sublabel">Senior</div></div>
          <div><div class="num green">${p.beneficiaries?.total || 0}</div><div class="sublabel">Total</div></div>
        </div>
      </div>
      <div class="stats-box purple">
        <div class="box-title">🏛️ Stakeholders</div>
        <div class="stats-inner">
          <div><div class="num purple">${p.stakeholders?.lgu || 0}</div><div class="sublabel">LGU</div></div>
          <div><div class="num purple">${p.stakeholders?.plgu || 0}</div><div class="sublabel">PLGU</div></div>
          <div><div class="num purple">${p.stakeholders?.blgu || 0}</div><div class="sublabel">BLGU</div></div>
          <div><div class="num purple">${p.stakeholders?.pnp || 0}</div><div class="sublabel">PNP</div></div>
          <div><div class="num purple">${p.stakeholders?.suc || 0}</div><div class="sublabel">SUC</div></div>
          <div><div class="num purple">${p.stakeholders?.others || 0}</div><div class="sublabel">${
    p.stakeholders?.othersLabel || "Others"
  }</div></div>
        </div>
      </div>
    </div>

    <div class="section-label">✍️ Prepared By</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:8px;padding-bottom:8px;">
      ${["Prepared by", "Reviewed by", "Approved by"]
        .map(
          (label) => `
        <div style="text-align:center;">
          <div style="border-top:2px solid #374151;margin-top:48px;padding-top:8px;">
            <div style="font-size:11px;font-weight:700;color:#374151;">${label}</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Signature over Printed Name</div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
  <div class="footer">
    <span>DOST — Community Empowerment thru Science &amp; Technology (CEST 2.0)</span>
    <span>Generated: ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</span>
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}
