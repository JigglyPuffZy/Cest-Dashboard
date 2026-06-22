/**
 * Consistent page header for government users — clear title, context, optional actions.
 */
export function PageHeader({ eyebrow, title, description, actions, darkMode, className = "" }) {
  return (
    <header
      className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: darkMode ? "#64748b" : "#94a3b8" }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="text-xl sm:text-2xl font-bold tracking-tight"
          style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-2 text-sm leading-relaxed max-w-2xl"
            style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export function GlassCard({ children, darkMode, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{
        background: darkMode
          ? "linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)"
          : "linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)",
        borderColor: darkMode ? "rgba(148, 163, 184, 0.15)" : "rgba(226, 232, 240, 0.9)",
        boxShadow: darkMode
          ? "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 8px 32px rgba(0, 74, 152, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = "#004A98", darkMode }) {
  return (
    <GlassCard darkMode={darkMode} className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p
            className="text-[11px] sm:text-xs font-medium mb-1"
            style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
          >
            {label}
          </p>
          <p
            className="text-xl sm:text-2xl font-bold tabular-nums truncate"
            style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
          >
            {value}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
