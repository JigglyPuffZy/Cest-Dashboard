import { useState } from "react";
import { Archive, RotateCcw, Trash2, AlertTriangle, FileText, Package, MapPin, Search } from "lucide-react";
import { fmt } from "../../shared/utils/helpers";
import { safeDisplayName, safeString, normalizeComponentList } from "../../shared/utils/safeRender";
import { ComponentBadges } from "../../components/ui/ComponentBadges";
import { Modal, ModalPanel } from "../../components/ui/Modal";

function getArchivedTitle(item) {
  return (
    item.project_title ||
    item.project ||
    item.equipment_name ||
    item.equipmentName ||
    item.title ||
    "Untitled"
  );
}

function getMunicipalityName(item) {
  if (!item?.municipality) return "";
  return typeof item.municipality === "object"
    ? item.municipality?.name || ""
    : String(item.municipality);
}

export const ArchivePage = ({ archivedProjects, onRestore, onPermanentDelete, darkMode, readOnly = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const filtered = (archivedProjects || []).filter((item) => {
    const name = getArchivedTitle(item);
    const muni = getMunicipalityName(item);
    const q = searchTerm.toLowerCase();
    return !searchTerm || name.toLowerCase().includes(q) || muni.toLowerCase().includes(q);
  });

  const cardStyle = {
    background: darkMode ? "#0f172a" : "#ffffff",
    border: `1px solid ${darkMode ? "#1e293b" : "#e5e7eb"}`,
    boxShadow: darkMode ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.05)",
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Archive className="w-8 h-8" style={{ color: "#004A98" }} />
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
            Archive
          </h1>
          <p className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            Deleted records — restore or permanently remove them
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{
          background: darkMode ? "rgba(245,158,11,0.1)" : "#fef3c7",
          border: `1px solid ${darkMode ? "rgba(245,158,11,0.2)" : "#fcd34d"}`,
        }}
      >
        <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#f59e0b" }} />
        <p className="text-xs" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          Records here can be <strong>restored</strong> back to the database or <strong>permanently deleted</strong>.
          Permanent deletion cannot be undone.
        </p>
      </div>

      <div className="rounded-xl p-4" style={cardStyle}>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search archived records..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
            style={{
              background: darkMode ? "#1e293b" : "#f8fafc",
              color: darkMode ? "#f8fafc" : "#0f172a",
              border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          {filtered.length} archived record{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <Archive className="w-16 h-16 mx-auto mb-4" style={{ color: darkMode ? "#475569" : "#cbd5e1" }} />
          <p className="text-lg font-semibold mb-1" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
            {searchTerm ? "No results found" : "Archive is empty"}
          </p>
          <p className="text-sm" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>
            {searchTerm ? "Try a different search term" : "Deleted records will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isEquipment = item._type === "equipment";
            const isTraining = item._type === "training";
            const title = getArchivedTitle(item);
            const muni = getMunicipalityName(item);
            const community = safeString(item.community);
            const archivedDate = item.archived_at || item.archivedAt || item.archivedDate;
            const components = normalizeComponentList(item.components);

            return (
              <div key={`${item._type}-${item.id}`} className="rounded-xl p-5" style={cardStyle}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: isEquipment
                          ? "rgba(16,185,129,0.1)"
                          : isTraining
                            ? "rgba(139,92,246,0.1)"
                            : "rgba(0,74,152,0.1)",
                      }}
                    >
                      {isEquipment ? (
                        <Package className="w-5 h-5" style={{ color: "#10b981" }} />
                      ) : isTraining ? (
                        <span style={{ fontSize: 18 }}>🎓</span>
                      ) : (
                        <FileText className="w-5 h-5" style={{ color: "#004A98" }} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: isEquipment ? "#10b981" : isTraining ? "#8b5cf6" : "#004A98",
                            color: "#fff",
                          }}
                        >
                          {isEquipment ? "Equipment" : isTraining ? "Training" : "Project"}
                        </span>
                        {item.year && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{
                              background: darkMode ? "#334155" : "#f1f5f9",
                              color: darkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            {item.year}
                          </span>
                        )}
                        {archivedDate && (
                          <span className="text-xs" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>
                            Archived {new Date(archivedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold mb-1" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
                        {title}
                      </h3>

                      {muni && (
                        <div
                          className="flex items-center gap-1 text-xs mb-2"
                          style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
                        >
                          <MapPin className="w-3 h-3" />
                          <span>
                            {muni}
                            {community ? ` • ${community}` : ""}
                          </span>
                        </div>
                      )}

                      {!isEquipment && components.length > 0 && (
                        <ComponentBadges components={components} darkMode={darkMode} />
                      )}

                      {isEquipment && item.units && (
                        <p className="text-xs mt-2" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                          {item.units} units
                        </p>
                      )}

                      {!isEquipment && item.amount_funded && (
                        <p className="text-sm font-bold mt-1" style={{ color: "#10b981" }}>
                          {fmt(item.amount_funded)}
                        </p>
                      )}
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => onRestore(item.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          background: darkMode ? "rgba(16,185,129,0.1)" : "#f0fdf4",
                          color: "#10b981",
                          border: `1px solid ${darkMode ? "rgba(16,185,129,0.2)" : "#86efac"}`,
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          background: darkMode ? "rgba(239,68,68,0.1)" : "#fef2f2",
                          color: "#ef4444",
                          border: `1px solid ${darkMode ? "rgba(239,68,68,0.2)" : "#fecaca"}`,
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(null)}>
          <ModalPanel maxWidth="max-w-sm">
            <div
              className="rounded-2xl p-6 shadow-2xl"
              style={{
                background: darkMode ? "#1e293b" : "#ffffff",
                border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.1)" }}
                >
                  <AlertTriangle className="w-6 h-6" style={{ color: "#ef4444" }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
                    Permanent Delete
                  </h3>
                  <p className="text-xs" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                    This cannot be undone
                  </p>
                </div>
              </div>
              <p
                className="text-sm p-3 rounded-xl mb-4"
                style={{
                  background: darkMode ? "#0f172a" : "#f8fafc",
                  color: darkMode ? "#94a3b8" : "#64748b",
                }}
              >
                &quot;{safeDisplayName(showDeleteConfirm)}&quot;
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                  style={{
                    background: darkMode ? "#334155" : "#f1f5f9",
                    color: darkMode ? "#94a3b8" : "#64748b",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onPermanentDelete(showDeleteConfirm.id);
                    setShowDeleteConfirm(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </ModalPanel>
        </Modal>
      )}
    </div>
  );
};
