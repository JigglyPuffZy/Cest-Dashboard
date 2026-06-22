import { Clock, LogIn, ShieldAlert } from "lucide-react";
import { GlassCard } from "../../components/ui/PageHeader";

export function GuestPendingBanner({ darkMode, guestName, onSignIn }) {
  return (
    <GlassCard darkMode={darkMode} className="p-6 sm:p-8 mb-6">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
        >
          <Clock className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#d97706" }}>
            Access Pending
          </p>
          <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
            Hello, {guestName} — your request is under review
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            An administrator will review your guest access request shortly. Project files and detailed records stay hidden until you are approved.
          </p>
          <div className="flex items-start gap-2 text-xs rounded-xl p-3" style={{ background: darkMode ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
            <span style={{ color: darkMode ? "#fca5a5" : "#b91c1c" }}>
              Records are locked until approval. You will be able to browse dashboards in view-only mode once accepted.
            </span>
          </div>
        </div>
        {onSignIn && (
          <button
            type="button"
            onClick={onSignIn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)" }}
          >
            <LogIn className="w-4 h-4" />
            Staff Sign In
          </button>
        )}
      </div>
    </GlassCard>
  );
}

export function GuestDeclinedBanner({ darkMode, guestName, onSignIn }) {
  return (
    <GlassCard darkMode={darkMode} className="p-6 sm:p-8 mb-6">
      <h2 className="text-lg font-bold mb-2" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
        Access declined
      </h2>
      <p className="text-sm mb-4" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
        {guestName}, your guest access request was not approved. Please contact your DOST administrator or sign in with staff credentials.
      </p>
      {onSignIn && (
        <button
          type="button"
          onClick={onSignIn}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)" }}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      )}
    </GlassCard>
  );
}
