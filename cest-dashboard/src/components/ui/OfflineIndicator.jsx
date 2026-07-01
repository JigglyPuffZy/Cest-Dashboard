import { WifiOff } from "lucide-react";

export function OfflineIndicator({ darkMode, cachedAt, className = "" }) {
  const formatted =
    cachedAt &&
    new Date(cachedAt).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div
      className={`mx-auto mb-4 max-w-[1400px] rounded-xl border px-4 py-3 flex items-start gap-3 ${className}`}
      style={{
        background: darkMode ? "rgba(245, 158, 11, 0.12)" : "rgba(254, 243, 199, 0.95)",
        borderColor: darkMode ? "rgba(245, 158, 11, 0.35)" : "#fcd34d",
        color: darkMode ? "#fcd34d" : "#92400e",
      }}
      role="status"
      aria-live="polite"
    >
      <WifiOff className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">You are offline</p>
        <p className="text-xs mt-0.5 leading-relaxed opacity-90">
          Showing the last saved admin copy of project data from this device.
          {formatted ? ` Last synced ${formatted}.` : ""} Changes will sync when you reconnect.
        </p>
      </div>
    </div>
  );
}
