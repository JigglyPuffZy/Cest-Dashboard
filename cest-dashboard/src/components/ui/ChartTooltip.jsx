/**
 * Chart tooltips always use a white card for readability on dark chart backgrounds.
 */
export function ChartTooltip({ title, value, accentColor = "#004A98", hint, subtitle }) {
  return (
    <div
      className="px-3 py-2.5 rounded-xl border"
      style={{
        background: "#ffffff",
        borderColor: "#e2e8f0",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.14)",
        minWidth: "110px",
      }}
    >
      {title && (
        <p className="font-semibold text-xs mb-1 leading-snug" style={{ color: "#0f172a" }}>
          {title}
        </p>
      )}
      {value != null && value !== "" && (
        <p className="font-bold text-lg tabular-nums" style={{ color: accentColor }}>
          {value}
        </p>
      )}
      {hint && (
        <p className="text-xs mt-1" style={{ color: "#2563eb" }}>
          {hint}
        </p>
      )}
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: "#64748b" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function renderChartTooltip({
  active,
  payload,
  titleKey,
  valueFormatter = (v) => v,
  accentColor,
  hint,
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const title =
    (titleKey && item.payload?.[titleKey]) ||
    item.payload?.fullName ||
    item.payload?.name ||
    item.name ||
    "";
  const accent =
    accentColor ?? item.payload?.color ?? item.fill ?? "#004A98";

  return (
    <ChartTooltip
      title={title}
      value={valueFormatter(item.value)}
      accentColor={accent}
      hint={hint}
    />
  );
}
