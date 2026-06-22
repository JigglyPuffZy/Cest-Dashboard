import { useState } from "react";
import { UserPlus } from "lucide-react";
import { GlassCard } from "./PageHeader";
import { useAuth } from "../../shared/hooks/useAuth.jsx";

export function GuestNameRequestCard({ darkMode }) {
  const { submitGuestAccessRequest, loading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputStyle = {
    background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(241, 245, 249, 0.9)",
    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
    color: darkMode ? "#f8fafc" : "#0f172a",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last) {
      setError("Please enter your first and last name.");
      return;
    }
    setSubmitting(true);
    try {
      await submitGuestAccessRequest(first, last);
    } catch (err) {
      setError(err.message || "Could not submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard darkMode={darkMode} className="p-6 sm:p-8 mb-6">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)" }}
        >
          <UserPlus className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#004A98" }}>
            Guest access
          </p>
          <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
            Tell us your name to request access
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            Enter your name below. An administrator will review your request before project records become visible.
          </p>

          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-xs font-medium"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: darkMode ? "#cbd5e1" : "#475569" }}>
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Juan"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: darkMode ? "#cbd5e1" : "#475569" }}>
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dela Cruz"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)" }}
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? "Submitting…" : "Request Guest Access"}
            </button>
          </form>
        </div>
      </div>
    </GlassCard>
  );
}
