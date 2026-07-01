import { MapPin, Package, Trash2, ChevronRight } from "lucide-react";
import { getAllProvinces } from "../../shared/data/regionII";
import { HoverTooltip } from "../ui/Tooltip";
import { FilterBar, FilterSelect } from "../ui/FilterBar";
import { ComponentBadges } from "../ui/ComponentBadges";
import { safeProjectTitle, safeEquipmentName } from "../../shared/utils/safeRender";

const REGION_II_PROVINCES = getAllProvinces().map((p) => p.name);

export function DataEntryFilters({
  searchTerm,
  setSearchTerm,
  filterProvince,
  setFilterProvince,
  filterStatus,
  setFilterStatus,
  darkMode,
  placeholder = "Search records...",
  showStatus = true,
}) {
  return (
    <FilterBar
      darkMode={darkMode}
      searchValue={searchTerm}
      onSearchChange={(e) => setSearchTerm(e.target.value)}
      placeholder={placeholder}
    >
      <FilterSelect
        darkMode={darkMode}
        value={filterProvince}
        onChange={(e) => setFilterProvince(e.target.value)}
        className="sm:min-w-[160px]"
      >
        <option value="All">All Provinces</option>
        {REGION_II_PROVINCES.map((province) => (
          <option key={province} value={province}>
            {province}
          </option>
        ))}
      </FilterSelect>
      {showStatus && (
        <FilterSelect
          darkMode={darkMode}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Liquidated">Liquidated</option>
          <option value="Finished">Finished</option>
        </FilterSelect>
      )}
    </FilterBar>
  );
}

export function ProjectRecordCard({
  project,
  index,
  darkMode,
  readOnly,
  onView,
  onDelete,
  fmt,
  getStatusColor,
  variant = "project",
}) {
  const isProject = variant === "project";
  const accent = isProject ? "#004A98" : "#10b981";
  const title = safeProjectTitle(project) || "Untitled Project";
  const municipality = typeof project.municipality === "object" ? project.municipality?.name : project.municipality;

  return (
    <article
      onClick={onView}
      className="rounded-xl border transition-all duration-200 cursor-pointer min-w-0 overflow-hidden sm:hover:shadow-md active:scale-[0.99]"
      style={{
        background: darkMode ? "#0f172a" : "#ffffff",
        borderColor: darkMode ? "#1e293b" : "#e2e8f0",
        borderLeftWidth: "3px",
        borderLeftColor: accent,
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md tabular-nums" style={{ background: `${accent}20`, color: accent }}>
              {project.year || "N/A"}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: darkMode ? "#1e293b" : "#f1f5f9", color: darkMode ? "#cbd5e1" : "#475569" }}>
              {isProject ? `Project #${index + 1}` : `Record #${index + 1}`}
            </span>
            {project.status && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!readOnly && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                style={{ color: "#ef4444" }}
                title="Move to Archive"
                aria-label="Archive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <ChevronRight className="w-4 h-4 opacity-40 hidden sm:block" style={{ color: darkMode ? "#94a3b8" : "#64748b" }} />
          </div>
        </div>

        <h3 className="font-sans text-sm sm:text-base font-semibold leading-snug mb-3 break-words" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
          {title}
        </h3>

        <div className="flex items-start gap-2 mb-3 min-w-0">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: darkMode ? "#64748b" : "#94a3b8" }} />
          <div className="min-w-0 text-xs sm:text-sm leading-relaxed" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            <span className="font-medium" style={{ color: darkMode ? "#cbd5e1" : "#475569" }}>
              {municipality || "Unknown location"}
            </span>
            {project.community && (
              <p className="mt-0.5 break-words">{project.community}</p>
            )}
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t"
          style={{ borderColor: darkMode ? "#1e293b" : "#e2e8f0" }}
        >
          <ComponentBadges components={project.components} darkMode={darkMode} />
          <p className="text-base sm:text-lg font-bold tabular-nums shrink-0" style={{ color: "#3b82f6" }}>
            {fmt(project.amountFunded || 0)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function EquipmentRecordCard({
  item,
  index,
  darkMode,
  readOnly,
  onView,
  onDelete,
  nested = false,
}) {
  const title = safeEquipmentName(item) || "Untitled Equipment";
  const municipality = typeof item.municipality === "object" ? item.municipality?.name : item.municipality;

  return (
    <article
      onClick={onView}
      className={`rounded-xl border transition-all duration-200 cursor-pointer min-w-0 overflow-hidden sm:hover:shadow-md active:scale-[0.99] ${nested ? "sm:ml-4" : ""}`}
      style={{
        background: darkMode ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
        borderColor: darkMode ? "#334155" : "#e2e8f0",
        borderLeftWidth: "3px",
        borderLeftColor: "#10b981",
      }}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md tabular-nums" style={{ background: "#10b98120", color: "#10b981" }}>
              {item.year || "N/A"}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: darkMode ? "#1e293b" : "#f1f5f9", color: darkMode ? "#cbd5e1" : "#475569" }}>
              Equipment #{index + 1}
            </span>
          </div>
          {!readOnly && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 shrink-0"
              style={{ color: "#ef4444" }}
              title="Move to Archive"
              aria-label="Archive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <h4 className="font-sans text-sm font-semibold mb-2 break-words" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
          {title}
        </h4>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          <div className="flex items-start gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="break-words">
              {municipality || "Unknown"}
              {item.community ? ` · ${item.community}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1 font-semibold shrink-0" style={{ color: "#10b981" }}>
            <Package className="w-3.5 h-3.5" />
            <span>{item.units || 0} units</span>
          </div>
        </div>
      </div>
    </article>
  );
}
