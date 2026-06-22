import { useState, useEffect } from "react";
import { GraduationCap, Plus, Search, Edit2, Trash2, BarChart3, X, AlertTriangle, BookOpen, DollarSign, Users } from "lucide-react";
import { COMPONENTS, COMP_COLORS, BENEF_TYPES } from "../../shared/constants";
import { supabase } from "../../shared/services/supabaseClient";
import { Modal, ModalPanel } from "../../components/ui/Modal";

const dbTrainings = {
  async getAll() {
    const { data, error } = await supabase.from("trainings").select("*")
      .or('is_archived.eq.false,is_archived.is.null')
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async create(row) {
    const { data, error } = await supabase.from("trainings").insert([row]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, row) {
    const { data, error } = await supabase.from("trainings").update(row).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async archive(id) {
    const { error } = await supabase.from("trainings")
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
  async permanentDelete(id) {
    const { error } = await supabase.from("trainings").delete().eq("id", id);
    if (error) throw error;
  },
};

const BLANK = {
  date: "", year: new Date().getFullYear(), municipality: "", community: "",
  title: "", budget: "", moa: "", component: "",
  beneficiary_types: [],
  male: "", female: "", total: "",
};

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, color = "#16a34a") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };
  return { toast, show };
}

// ─── Training Form Modal ─────────────────────────────────────────────────────
function TrainingModal({ initial, onSave, onClose, darkMode }) {
  const [f, setF] = useState(initial ? {
    ...BLANK, ...initial,
    beneficiary_types: initial.beneficiary_types || [],
    male: initial.male ?? "", female: initial.female ?? "", total: initial.total ?? "",
  } : { ...BLANK });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggleBenef = (k) => set("beneficiary_types",
    f.beneficiary_types.includes(k) ? f.beneficiary_types.filter(x => x !== k) : [...f.beneficiary_types, k]);

  const submit = async () => {
    const e = {};
    if (!f.title.trim()) e.title = "Required";
    if (!f.community.trim()) e.community = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await onSave({
      ...f,
      budget: f.budget !== "" ? Number(f.budget) : null,
      year: f.year !== "" ? Number(f.year) : null,
      male: f.male !== "" ? Number(f.male) : null,
      female: f.female !== "" ? Number(f.female) : null,
      total: f.total !== "" ? Number(f.total) : null,
    });
    setSaving(false);
  };

  const inp = {
    background: darkMode ? "#0f172a" : "#fff",
    border: `1px solid ${darkMode ? "#334155" : "#d1d5db"}`,
    color: darkMode ? "#e2e8f0" : "#1f2937",
    borderRadius: 10, padding: "10px 14px", fontSize: 13,
    width: "100%", outline: "none", boxSizing: "border-box",
  };
  const lbl = { display: "block", marginBottom: 5, fontSize: 12, fontWeight: 700, color: darkMode ? "#94a3b8" : "#374151" };

  return (
    <Modal onClose={onClose} zIndex={9999}>
      <ModalPanel maxWidth="max-w-[720px]">
      <div style={{ background: darkMode ? "#0f172a" : "#fff", borderRadius: 16, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.35)", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, position: "sticky", top: 0, background: darkMode ? "#0f172a" : "#fff", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#004A98,#10b981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: darkMode ? "#f8fafc" : "#0f172a" }}>{initial ? "Edit Training" : "Add Training"}</h2>
              <p style={{ margin: 0, fontSize: 11, color: darkMode ? "#64748b" : "#94a3b8" }}>Fill in the training details below</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div><label style={lbl}>Date</label><input type="date" value={f.date} onChange={e => set("date", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Year</label><input type="number" value={f.year} onChange={e => set("year", e.target.value)} style={inp} placeholder="2024" /></div>
            <div><label style={lbl}>Municipality / City</label><input value={f.municipality} onChange={e => set("municipality", e.target.value)} style={inp} placeholder="Enter municipality" /></div>
          </div>

          {/* Community */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Community / Beneficiaries <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={f.community} onChange={e => set("community", e.target.value)} style={{ ...inp, borderColor: errors.community ? "#ef4444" : (darkMode ? "#334155" : "#d1d5db") }} placeholder="Enter community" />
            {errors.community && <span style={{ color: "#ef4444", fontSize: 11 }}>{errors.community}</span>}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>List of Trainings Conducted <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea value={f.title} onChange={e => set("title", e.target.value)}
              style={{ ...inp, borderColor: errors.title ? "#ef4444" : (darkMode ? "#334155" : "#d1d5db"), minHeight: 90, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
              placeholder="Type training titles..." />
            {errors.title && <span style={{ color: "#ef4444", fontSize: 11 }}>{errors.title}</span>}
          </div>

          {/* Budget + MOA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div><label style={lbl}>Budget (₱)</label><input type="number" value={f.budget} onChange={e => set("budget", e.target.value)} style={inp} placeholder="0" /></div>
            <div><label style={lbl}>MOAs</label><input value={f.moa} onChange={e => set("moa", e.target.value)} style={inp} placeholder="e.g. LGU, DA" /></div>
          </div>

          {/* Component */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>CEST 2.0 Component</label>
            <select value={f.component} onChange={e => set("component", e.target.value)} style={inp}>
              <option value="">— Select Component —</option>
              {Object.entries(COMPONENTS).map(([k, v]) => <option key={k} value={k}>{k.toUpperCase()} — {v}</option>)}
            </select>
          </div>

          {/* Beneficiary Types */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>CEST 2.0 Beneficiaries</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {Object.entries(BENEF_TYPES).map(([k, v]) => (
                <button key={k} type="button" onClick={() => toggleBenef(k)} style={{
                  background: f.beneficiary_types.includes(k) ? "#004A98" : (darkMode ? "#1e293b" : "#f3f4f6"),
                  border: `1px solid ${f.beneficiary_types.includes(k) ? "#004A98" : (darkMode ? "#334155" : "#d1d5db")}`,
                  color: f.beneficiary_types.includes(k) ? "#fff" : (darkMode ? "#94a3b8" : "#374151"),
                  borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {f.beneficiary_types.includes(k) && <Check size={10} />}{v}
                </button>
              ))}
            </div>
          </div>

          {/* Beneficiary counts */}
          <div style={{ marginBottom: 22 }}>
            <label style={lbl}>No. of Beneficiaries</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[["male","Male"],["female","Female"],["total","Total"]].map(([k,l]) => (
                <div key={k}>
                  <label style={{ ...lbl, marginBottom: 4 }}>{l}</label>
                  <input type="number" min="0" value={f[k]} onChange={e => set(k, e.target.value)} style={inp} placeholder="0" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button onClick={onClose} style={{ background: darkMode ? "#1e293b" : "#f3f4f6", border: `1px solid ${darkMode ? "#334155" : "#d1d5db"}`, color: darkMode ? "#94a3b8" : "#374151", borderRadius: 10, padding: "10px 22px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancel</button>
            <button onClick={submit} disabled={saving} style={{ background: "linear-gradient(135deg,#004A98,#10b981)", border: "none", color: "#fff", borderRadius: 10, padding: "10px 28px", cursor: "pointer", fontSize: 13, fontWeight: 800, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "💾 Save Training"}
            </button>
          </div>
        </div>
      </div>
      </ModalPanel>
    </Modal>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TrainingsPage({ darkMode = false, onArchiveTraining, readOnly = false }) {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {type:'add'} | {type:'edit',data} | {type:'delete',data}
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const { toast, show: showToast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setTrainings(await dbTrainings.getAll()); }
    catch (e) { showToast("Failed to load trainings", "#ef4444"); }
    finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    try {
      if (data.id) {
        const { id, created_at, ...rest } = data;
        const updated = await dbTrainings.update(id, rest);
        setTrainings(ts => ts.map(t => t.id === id ? updated : t));
        showToast("Training updated");
      } else {
        const created = await dbTrainings.create(data);
        setTrainings(ts => [created, ...ts]);
        showToast("Training added");
      }
      setModal(null);
    } catch (e) { showToast(e.message, "#ef4444"); }
  };

  const handleDelete = async (id) => {
    const item = trainings.find(t => t.id === id);
    try {
      await dbTrainings.archive(id);
      setTrainings(ts => ts.filter(t => t.id !== id));
      // Send to archive in parent
      if (onArchiveTraining && item) {
        onArchiveTraining({ ...item, _type: 'training', archived_at: new Date().toISOString() });
      }
      showToast("Training moved to archive", "#f59e0b");
      setModal(null);
    } catch (e) { showToast(e.message, "#ef4444"); }
  };

  const years = ["All", ...Array.from(new Set(trainings.map(t => t.year).filter(Boolean))).sort()];
  const filtered = trainings.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || (t.title||"").toLowerCase().includes(q) || (t.community||"").toLowerCase().includes(q) || (t.municipality||"").toLowerCase().includes(q);
    const matchY = yearFilter === "All" || String(t.year) === String(yearFilter);
    return matchQ && matchY;
  });
  const totalBudget = filtered.reduce((s, t) => s + Number(t.budget || 0), 0);
  const totalBenef = filtered.reduce((s, t) => s + Number(t.total || 0), 0);

  const card = {
    background: darkMode ? "linear-gradient(145deg,#0f172a,#1e293b)" : "#fff",
    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
    borderRadius: 14,
    boxShadow: darkMode ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.06)",
  };
  const textPrimary = darkMode ? "#f8fafc" : "#0f172a";
  const textSub = darkMode ? "#94a3b8" : "#64748b";

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 16px", minHeight: "100vh", background: darkMode ? "#07101d" : "#f3f4f6" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 18, right: 18, zIndex: 9998, background: toast.color, color: "#fff", borderRadius: 10, padding: "11px 22px", fontWeight: 800, fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <TrainingModal initial={modal.data} onSave={handleSave} onClose={() => setModal(null)} darkMode={darkMode} />
      )}
      {modal?.type === "delete" && (
        <Modal onClose={() => setModal(null)} zIndex={9999}>
          <ModalPanel maxWidth="max-w-[400px]">
          <div style={{ ...card, width: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <AlertTriangle size={28} color="#ef4444" />
            </div>
            <h3 style={{ margin: "0 0 8px", color: textPrimary, fontSize: 17, fontWeight: 800 }}>Delete Training?</h3>
            <p style={{ color: textSub, fontSize: 13, marginBottom: 24 }}>"{modal.data.title?.slice(0, 60)}{modal.data.title?.length > 60 ? "…" : ""}"</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${darkMode ? "#334155" : "#d1d5db"}`, background: darkMode ? "#1e293b" : "#f3f4f6", color: textSub, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(modal.data.id)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
          </ModalPanel>
        </Modal>
      )}

      {/* Page Header */}
      <div style={{ ...card, padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#004A98,#10b981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: textPrimary }}>Trainings Conducted</h1>
              <p style={{ margin: 0, fontSize: 13, color: textSub }}>Track all training activities and beneficiary data</p>
            </div>
          </div>
          <button onClick={() => !readOnly && setModal({ type: "add" })} disabled={readOnly} style={{ display: "flex", alignItems: "center", gap: 8, background: readOnly ? "#94a3b8" : "linear-gradient(135deg,#004A98,#0066CC)", border: "none", color: "#fff", borderRadius: 12, padding: "12px 24px", cursor: readOnly ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 800, boxShadow: readOnly ? "none" : "0 4px 12px rgba(0,74,152,0.3)", opacity: readOnly ? 0.6 : 1 }}>
            <Plus size={18} /> Add Training
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Trainings", value: trainings.length, icon: <BookOpen size={20} />, color: "#004A98" },
          { label: "Filtered", value: filtered.length, icon: <Search size={20} />, color: "#8b5cf6" },
          { label: "Total Budget", value: `₱${totalBudget.toLocaleString()}`, icon: <DollarSign size={20} />, color: "#10b981" },
          { label: "Total Beneficiaries", value: totalBenef.toLocaleString(), icon: <Users size={20} />, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: textSub, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: textPrimary }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tab + Filters */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 10, background: darkMode ? "#1e293b" : "#f1f5f9" }}>
            {[{ id: "list", icon: <BookOpen size={14} />, label: "List" }, { id: "stats", icon: <BarChart3 size={14} />, label: "Stats" }].map(t => (
              <button key={t.id} onClick={() => setView(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: view === t.id ? "linear-gradient(135deg,#004A98,#0066CC)" : "transparent", color: view === t.id ? "#fff" : textSub, boxShadow: view === t.id ? "0 2px 8px rgba(0,74,152,0.3)" : "none" }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textSub }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search training / community / municipality…"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: textPrimary, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Year filter */}
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: textPrimary, fontSize: 13, outline: "none", minWidth: 130 }}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>

          <div style={{ padding: "10px 16px", borderRadius: 10, background: "#004A98", color: "#fff", fontSize: 13, fontWeight: 700 }}>
            {filtered.length} / {trainings.length}
          </div>
        </div>
      </div>

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div>
          {loading ? (
            <div style={{ ...card, padding: 60, textAlign: "center", color: textSub }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <p style={{ fontWeight: 700 }}>Loading trainings…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ ...card, padding: 60, textAlign: "center", color: textSub }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 17, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>No training records found</p>
              <p style={{ fontSize: 13 }}>Add a training record to get started</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(t => (
                <div key={t.id} style={{ ...card, padding: "20px 24px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
                    {/* Left */}
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        {t.year && <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 6, background: "linear-gradient(135deg,#004A98,#0066CC)", color: "#fff" }}>{t.year}</span>}
                        {t.municipality && <span style={{ fontSize: 12, fontWeight: 600, color: textSub }}>{t.municipality}</span>}
                        {t.date && <span style={{ fontSize: 11, color: textSub }}>{t.date}</span>}
                        {t.component && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: `${COMP_COLORS[t.component] || "#64748b"}20`, color: COMP_COLORS[t.component] || "#64748b", border: `1px solid ${COMP_COLORS[t.component] || "#64748b"}40` }}>
                            {t.component.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: textPrimary, lineHeight: 1.4, whiteSpace: "pre-line" }}>{t.title || "(no title)"}</h3>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: textSub }}><strong>Community:</strong> {t.community || "—"}</p>
                      {(t.beneficiary_types || []).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {t.beneficiary_types.map(bt => (
                            <span key={bt} style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                              {BENEF_TYPES[bt] || bt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div style={{ textAlign: "right", minWidth: 140 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: textSub, textTransform: "uppercase", letterSpacing: 1 }}>Budget</p>
                      <p style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: "#10b981" }}>₱{t.budget != null ? Number(t.budget).toLocaleString() : "0"}</p>
                      {t.moa && <p style={{ margin: "0 0 8px", fontSize: 12, color: textSub }}><strong>MOA:</strong> {t.moa}</p>}
                      <p style={{ margin: 0, fontSize: 12, color: textSub }}>M {t.male ?? 0} · F {t.female ?? 0} · Total {t.total ?? 0}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {!readOnly && (
                  <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${darkMode ? "#1e293b" : "#f1f5f9"}` }}>
                    <button onClick={() => setModal({ type: "edit", data: t })} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1e40af", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      <Edit2 size={13} /> Edit
                    </button>
                    <button onClick={() => setModal({ type: "delete", data: t })} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                  )}
                </div>
              ))}

              {/* Summary bar */}
              <div style={{ borderRadius: 12, padding: "18px 24px", background: "linear-gradient(135deg,#004A98,#0066CC)", color: "#fff", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16 }}>
                <div><p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.8 }}>Trainings shown</p><p style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>{filtered.length}</p></div>
                <div><p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.8 }}>Total budget</p><p style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>₱{totalBudget.toLocaleString()}</p></div>
                <div><p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.8 }}>Total beneficiaries</p><p style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>{totalBenef.toLocaleString()}</p></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STATS VIEW ── */}
      {view === "stats" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Component breakdown */}
          <div style={card}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: textPrimary }}>Component Distribution</h3>
            </div>
            <div style={{ padding: "18px 24px" }}>
              {Object.entries(COMPONENTS).map(([key, name]) => {
                const count = trainings.filter(t => t.component === key).length;
                if (!count) return null;
                const pct = Math.round((count / trainings.length) * 100);
                return (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{name}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: COMP_COLORS[key] }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: darkMode ? "#1e293b" : "#e5e7eb" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: `linear-gradient(90deg,${COMP_COLORS[key]},${COMP_COLORS[key]}99)`, transition: "width .5s" }} />
                    </div>
                  </div>
                );
              })}
              {!trainings.some(t => t.component) && <p style={{ color: textSub, fontSize: 13 }}>No component data yet.</p>}
            </div>
          </div>

          {/* Beneficiary type breakdown */}
          <div style={card}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: textPrimary }}>Beneficiary Types</h3>
            </div>
            <div style={{ padding: "18px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
              {Object.entries(BENEF_TYPES).map(([k, v]) => {
                const count = trainings.filter(t => (t.beneficiary_types || []).includes(k)).length;
                return (
                  <div key={k} style={{ padding: "14px 16px", borderRadius: 10, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                    <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: textSub, textTransform: "uppercase" }}>{v}</p>
                    <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: textPrimary }}>{count}</p>
                    <p style={{ margin: 0, fontSize: 11, color: textSub }}>trainings</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
