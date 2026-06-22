import { Search, RefreshCw } from "lucide-react";

export function getFilterInputStyle(darkMode) {
  return {
    background: darkMode ? "#1e293b" : "#f8fafc",
    color: darkMode ? "#f8fafc" : "#0f172a",
    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
  };
}

export function FilterSelect({ darkMode, value, onChange, children, className = "" }) {
  const inputStyle = getFilterInputStyle(darkMode);
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full sm:w-auto sm:min-w-[140px] px-4 py-3 rounded-xl text-sm outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500/30 ${className}`}
      style={inputStyle}
    >
      {children}
    </select>
  );
}

export function FilterBar({
  darkMode,
  searchValue,
  onSearchChange,
  placeholder = "Search...",
  children,
  onRefresh,
  refreshLabel = "Refresh",
  resultText,
  className = "",
}) {
  const inputStyle = getFilterInputStyle(darkMode);

  return (
    <div className={`mb-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <div className="relative flex-1 min-w-0 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: darkMode ? "#64748b" : "#94a3b8" }}
          />
          <input
            type="search"
            placeholder={placeholder}
            value={searchValue}
            onChange={onSearchChange}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30"
            style={inputStyle}
          />
        </div>
        {children}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-90 focus:ring-2 focus:ring-blue-500/30 shrink-0"
            style={inputStyle}
            title={refreshLabel}
          >
            <RefreshCw className="w-4 h-4 shrink-0" style={{ color: "#3b82f6" }} />
            <span style={{ color: darkMode ? "#cbd5e1" : "#475569" }}>{refreshLabel}</span>
          </button>
        )}
      </div>
      {resultText && (
        <p className="mt-3 text-xs sm:text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          {resultText}
        </p>
      )}
    </div>
  );
}
