import { COMPONENTS, COMP_COLORS } from "../../shared/constants";
import { HoverTooltip } from "./Tooltip";

export function ComponentBadges({ components, darkMode, limit = 3 }) {
  if (!components?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {components.slice(0, limit).map((c, i) => {
        const key = typeof c === "object" ? c.id || c.component?.id || c : c;
        const name = typeof c === "object" ? c.name || c.component?.name || key : key;

        return (
          <HoverTooltip
            key={`${key}-${i}`}
            content={COMPONENTS[key] || name}
            position="auto"
            darkMode={darkMode}
            delay={150}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md cursor-help"
              style={{
                background: `${COMP_COLORS[key] || "#64748b"}18`,
                color: COMP_COLORS[key] || "#64748b",
                border: `1px solid ${COMP_COLORS[key] || "#64748b"}35`,
              }}
            >
              {String(key)?.toUpperCase() || "N/A"}
            </span>
          </HoverTooltip>
        );
      })}
      {components.length > limit && (
        <span
          className="text-[10px] px-2 py-1 rounded-md font-medium"
          style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
        >
          +{components.length - limit}
        </span>
      )}
    </div>
  );
}
