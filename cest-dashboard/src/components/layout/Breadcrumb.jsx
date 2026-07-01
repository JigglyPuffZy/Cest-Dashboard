import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

export const Breadcrumb = ({ items, darkMode }) => {
  const navigate = useNavigate();

  
  const theme = useMemo(() => ({
    textColor: darkMode ? "#94a3b8" : "#64748b",
    textHover: darkMode ? "#e2e8f0" : "#1e293a",
    bgColor: darkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(255, 255, 255, 0.8)",
    bgHover: darkMode ? "rgba(51, 65, 85, 0.8)" : "rgba(241, 245, 249, 0.95)",
    activeGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    borderColor: darkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.15)",
    chevronColor: darkMode ? "#64748b" : "#94a3b8",
    shadow: darkMode 
      ? "0 4px 12px rgba(0, 0, 0, 0.3)" 
      : "0 2px 8px rgba(0, 0, 0, 0.08)",
    shadowHover: darkMode 
      ? "0 6px 20px rgba(59, 130, 246, 0.3)" 
      : "0 4px 12px rgba(59, 130, 246, 0.2)",
  }), [darkMode]);

  return (
    <nav 
      className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin relative"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.chevronColor} transparent`,
        minHeight: '48px',
        zIndex: 10,
      }}
    >
      {}
      <button
        onClick={() => navigate("/dashboard")}
        className="group flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap flex-shrink-0 relative overflow-hidden"
        style={{
          color: theme.textColor,
          backgroundColor: theme.bgColor,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: theme.shadow,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.bgHover;
          e.currentTarget.style.color = theme.textHover;
          e.currentTarget.style.boxShadow = theme.shadowHover;
          e.currentTarget.style.borderColor = "#3b82f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.bgColor;
          e.currentTarget.style.color = theme.textColor;
          e.currentTarget.style.boxShadow = theme.shadow;
          e.currentTarget.style.borderColor = theme.borderColor;
        }}
        aria-label="Go to Dashboard"
      >
        {}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{ background: theme.activeGradient }}
        />
        
        <Home className="w-4 h-4 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
        <span className="hidden sm:inline relative z-10">Dashboard</span>
      </button>

      {}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 flex-shrink-0">
          {}
          <ChevronRight 
            className="w-4 h-4 flex-shrink-0 transition-all duration-300" 
            style={{ 
              color: theme.chevronColor,
              opacity: 0.6,
            }} 
          />
          
          {}
          {item.path ? (
            <button
              onClick={() => navigate(item.path)}
              className="group px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap relative overflow-hidden"
              style={{
                color: theme.textColor,
                backgroundColor: theme.bgColor,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: theme.shadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgHover;
                e.currentTarget.style.color = theme.textHover;
                e.currentTarget.style.boxShadow = theme.shadowHover;
                e.currentTarget.style.borderColor = "#3b82f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgColor;
                e.currentTarget.style.color = theme.textColor;
                e.currentTarget.style.boxShadow = theme.shadow;
                e.currentTarget.style.borderColor = theme.borderColor;
              }}
              aria-label={`Go to ${item.label}`}
            >
              {}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ background: theme.activeGradient }}
              />
              <span className="relative z-10">{item.label}</span>
            </button>
          ) : (
            <div
              className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap relative overflow-hidden"
              style={{
                background: theme.activeGradient,
                color: '#ffffff',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
              aria-current="page"
            >
              {}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 3s infinite',
                }}
              />
              <span className="relative z-10">{item.label}</span>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};
