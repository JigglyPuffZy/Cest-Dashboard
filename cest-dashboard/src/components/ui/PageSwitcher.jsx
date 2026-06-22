import { BookOpen, BarChart3 } from "lucide-react";

export const PageSwitcher = ({ activePage, onPageChange, darkMode }) => {
  const pages = [
    { 
      id: "starbooks", 
      label: "STARBOOKS", 
      icon: BookOpen,
      description: "Digital Library Management"
    },
    { 
      id: "cest", 
      label: "CEST", 
      icon: BarChart3,
      description: "Project Analytics Dashboard"
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Segmented Control Container */}
      <div 
        className="relative p-1.5 rounded-2xl backdrop-blur-sm transition-all duration-300"
        style={{
          background: darkMode 
            ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        <div className="relative flex gap-2">
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = activePage === page.id;
            
            return (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className="relative flex-1 group transition-all duration-300"
                style={{
                  zIndex: isActive ? 2 : 1
                }}
              >
                {/* Active Background Slider */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-xl transition-all duration-500 ease-out"
                    style={{
                      background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
                      boxShadow: '0 8px 24px rgba(0, 74, 152, 0.4), 0 4px 12px rgba(0, 74, 152, 0.2)',
                      animation: 'slideIn 0.3s ease-out'
                    }}
                  />
                )}

                {/* Button Content */}
                <div 
                  className="relative px-6 py-4 rounded-xl transition-all duration-300"
                  style={{
                    transform: isActive ? 'translateY(-1px)' : 'translateY(0)'
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Icon */}
                    <div 
                      className="transition-all duration-300"
                      style={{
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        color: isActive ? '#ffffff' : (darkMode ? '#94a3b8' : '#64748b')
                      }}
                    >
                      <Icon 
                        className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" 
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <div 
                        className="text-sm font-bold transition-all duration-300"
                        style={{
                          color: isActive ? '#ffffff' : (darkMode ? '#94a3b8' : '#64748b'),
                          letterSpacing: isActive ? '0.5px' : '0px'
                        }}
                      >
                        {page.label}
                      </div>
                      <div 
                        className="text-xs mt-0.5 transition-all duration-300"
                        style={{
                          color: isActive ? 'rgba(255, 255, 255, 0.8)' : (darkMode ? '#64748b' : '#94a3b8'),
                          opacity: isActive ? 1 : 0.7
                        }}
                      >
                        {page.description}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  {!isActive && (
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: darkMode 
                          ? 'rgba(148, 163, 184, 0.1)' 
                          : 'rgba(100, 116, 139, 0.05)'
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Page Indicator */}
      <div className="mt-4 text-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300"
          style={{
            background: darkMode 
              ? 'rgba(0, 74, 152, 0.2)' 
              : 'rgba(0, 74, 152, 0.1)',
            color: '#004A98',
            border: `1px solid ${darkMode ? 'rgba(0, 74, 152, 0.3)' : 'rgba(0, 74, 152, 0.2)'}`
          }}
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#004A98' }}
          />
          Currently viewing: {pages.find(p => p.id === activePage)?.label}
        </div>
      </div>
    </div>
  );
};
