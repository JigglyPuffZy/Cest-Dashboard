import { BookOpen, BarChart3 } from "lucide-react";

export const CompactPageSwitcher = ({ activePage, onPageChange, darkMode }) => {
  const pages = [
    { id: "starbooks", label: "STARBOOKS", icon: BookOpen },
    { id: "cest", label: "CEST", icon: BarChart3 }
  ];

  return (
    <div 
      className="inline-flex p-1 rounded-xl backdrop-blur-sm transition-all duration-300"
      style={{
        background: darkMode 
          ? 'rgba(30, 41, 59, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        boxShadow: darkMode 
          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
          : '0 4px 16px rgba(0, 0, 0, 0.06)'
      }}
    >
      {pages.map((page) => {
        const Icon = page.icon;
        const isActive = activePage === page.id;
        
        return (
          <button
            key={page.id}
            onClick={() => onPageChange(page.id)}
            className="relative px-4 py-2 rounded-lg transition-all duration-300 group"
            style={{
              background: isActive 
                ? 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)'
                : 'transparent',
              color: isActive ? '#ffffff' : (darkMode ? '#94a3b8' : '#64748b'),
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isActive 
                ? '0 4px 12px rgba(0, 74, 152, 0.3)'
                : 'none'
            }}
          >
            <div className="flex items-center gap-2">
              <Icon 
                className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-sm font-bold whitespace-nowrap">
                {page.label}
              </span>
            </div>

            {/* Hover Effect */}
            {!isActive && (
              <div 
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: darkMode 
                    ? 'rgba(148, 163, 184, 0.1)' 
                    : 'rgba(100, 116, 139, 0.05)'
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
