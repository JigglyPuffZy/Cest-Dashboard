import { WifiOff, LogIn } from "lucide-react";
import { GlassCard } from "./PageHeader";

export function GuestRequiresOnline({ darkMode, onStaffSignIn }) {
  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4"
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
          : "linear-gradient(135deg, #004A98 0%, #0066CC 50%, #004A98 100%)",
      }}
    >
      <GlassCard darkMode={darkMode} className="max-w-md w-full p-8 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(245, 158, 11, 0.15)" }}
        >
          <WifiOff className="w-7 h-7" style={{ color: "#f59e0b" }} />
        </div>
        <h2 className="text-lg font-bold mb-2" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
          Internet connection required
        </h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          Guest access needs an active connection to view project records. Offline viewing is only available for administrators.
        </p>
        {onStaffSignIn && (
          <button
            type="button"
            onClick={onStaffSignIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)" }}
          >
            <LogIn className="w-4 h-4" />
            Staff Sign In
          </button>
        )}
      </GlassCard>
    </div>
  );
}
