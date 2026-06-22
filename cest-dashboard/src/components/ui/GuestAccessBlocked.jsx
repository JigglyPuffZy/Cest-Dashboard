import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "./PageHeader";

export function GuestAccessBlocked({ darkMode }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <GlassCard darkMode={darkMode} className="p-8 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.12)" }}
        >
          <ShieldAlert className="w-7 h-7" style={{ color: "#ef4444" }} />
        </div>
        <h2 className="text-lg font-bold mb-2" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
          Records are not available yet
        </h2>
        <p className="text-sm mb-6" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          Your guest access request must be approved before you can view project files and detailed data.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </GlassCard>
    </div>
  );
}
