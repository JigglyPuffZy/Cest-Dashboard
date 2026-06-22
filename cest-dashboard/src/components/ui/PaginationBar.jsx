import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFilterInputStyle } from "./FilterBar";

function getPageNumbers(current, total) {
  const items = [];
  let lastAdded = 0;

  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || (page >= current - 1 && page <= current + 1)) {
      if (lastAdded && page - lastAdded > 1) {
        items.push({ type: "ellipsis", key: `ellipsis-${page}` });
      }
      items.push({ type: "page", page });
      lastAdded = page;
    }
  }

  return items;
}

export function PaginationBar({
  darkMode,
  currentPage,
  totalPages,
  onPageChange,
  rangeStart,
  rangeEnd,
  totalCount,
  itemLabel = "items",
}) {
  if (totalPages <= 1) return null;

  const inputStyle = getFilterInputStyle(darkMode);
  const textMuted = darkMode ? "#94a3b8" : "#64748b";
  const textPrimary = darkMode ? "#f8fafc" : "#0f172a";
  const activeBg = "linear-gradient(135deg, #004A98 0%, #0066CC 100%)";

  const navButtonStyle = (disabled) => ({
    ...(disabled ? inputStyle : {}),
    background: disabled ? (darkMode ? "#1e293b" : "#f1f5f9") : activeBg,
    color: disabled ? textMuted : "#ffffff",
    border: disabled ? inputStyle.border : "1px solid transparent",
  });

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl min-w-0 w-full"
      style={{
        background: darkMode ? "#0f172a" : "#ffffff",
        border: `1px solid ${darkMode ? "#1e293b" : "#e2e8f0"}`,
      }}
    >
      <p className="text-xs sm:text-sm text-center sm:text-left leading-relaxed" style={{ color: textMuted }}>
        Showing{" "}
        <span className="font-semibold tabular-nums" style={{ color: textPrimary }}>
          {rangeStart}
        </span>
        {" – "}
        <span className="font-semibold tabular-nums" style={{ color: textPrimary }}>
          {rangeEnd}
        </span>
        {" of "}
        <span className="font-semibold tabular-nums" style={{ color: textPrimary }}>
          {totalCount}
        </span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center justify-center sm:justify-end gap-2 w-full min-w-0">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed"
          style={navButtonStyle(currentPage === 1)}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>Prev</span>
        </button>

        <span
          className="sm:hidden text-sm font-semibold tabular-nums px-1 shrink-0 whitespace-nowrap"
          style={{ color: textPrimary }}
        >
          {currentPage} / {totalPages}
        </span>

        <div className="hidden sm:flex items-center gap-1 shrink-0">
          {getPageNumbers(currentPage, totalPages).map((item) =>
            item.type === "ellipsis" ? (
              <span key={item.key} className="px-1 text-sm select-none" style={{ color: textMuted }}>
                …
              </span>
            ) : (
              <button
                key={item.page}
                type="button"
                onClick={() => onPageChange(item.page)}
                className="w-9 h-9 rounded-xl text-sm font-semibold tabular-nums transition-colors"
                style={
                  item.page === currentPage
                    ? { background: activeBg, color: "#ffffff" }
                    : inputStyle
                }
              >
                {item.page}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed"
          style={navButtonStyle(currentPage === totalPages)}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}
