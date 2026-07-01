import { CloudUpload, Loader2, RefreshCw } from "lucide-react";

export function PendingSyncBanner({
  darkMode,
  pendingCount = 0,
  failedCount = 0,
  isSyncing = false,
  items = [],
  onSyncNow,
}) {
  if (!pendingCount && !failedCount) return null;

  const preview = items
    .filter((item) => item.status !== "failed")
    .slice(0, 3)
    .map((item) => item.label)
    .join(" · ");

  return (
    <div
      className="mx-auto mb-4 max-w-[1400px] rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{
        background: darkMode ? "rgba(59, 130, 246, 0.12)" : "rgba(219, 234, 254, 0.95)",
        borderColor: darkMode ? "rgba(59, 130, 246, 0.35)" : "#93c5fd",
        color: darkMode ? "#bfdbfe" : "#1d4ed8",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {isSyncing ? (
          <Loader2 className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />
        ) : (
          <CloudUpload className="w-5 h-5 shrink-0 mt-0.5" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {isSyncing
              ? "Uploading pending changes…"
              : `${pendingCount} change${pendingCount === 1 ? "" : "s"} waiting to upload`}
          </p>
          <p className="text-xs mt-0.5 leading-relaxed opacity-90 truncate">
            {preview || "Saved on this device while offline. They will upload automatically when internet returns."}
            {failedCount > 0 ? ` · ${failedCount} failed` : ""}
          </p>
        </div>
      </div>

      {!isSyncing && pendingCount > 0 && navigator.onLine && onSyncNow && (
        <button
          type="button"
          onClick={onSyncNow}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold shrink-0"
          style={{
            background: darkMode ? "rgba(59, 130, 246, 0.2)" : "#2563eb",
            color: darkMode ? "#dbeafe" : "#ffffff",
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Upload now
        </button>
      )}
    </div>
  );
}
