import { Menu, Sun, Moon, Bell, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Modal, ModalPanel } from "../ui/Modal";

const NAV_LABELS = {
  dashboard: "Dashboard",
  dataentry: "Data Entry",
  analytics: "Analytics",
  archive: "Archive",
  trainings: "Trainings",
  monitoring: "Monitoring",
  "admin": "User Access",
  starbooks: "STARBOOKS Inventory",
  "starbooks-archive": "STARBOOKS Archive",
  "starbooks-docs": "Documentation",
};

export const TopBar = ({
  activePage,
  notificationCount = 0,
  setShowNotifications,
  setSidebarOpen,
  darkMode,
  setDarkMode,
  projects = [],
  onNavigateToProject,
  starbooksUnits = [],
  onNavigateToStarbooksUnit,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const headerStyles = {
    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: darkMode ? '#1e293b' : '#e2e8f0',
    boxShadow: darkMode 
      ? '0 4px 24px rgba(0, 0, 0, 0.3)' 
      : '0 4px 24px rgba(0, 74, 152, 0.08)'
  };

  const buttonStyles = {
    color: darkMode ? '#94a3b8' : '#475569',
    background: darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.05)'
  };

  const themeButtonStyles = {
    backgroundColor: darkMode ? '#422006' : '#fef3c7',
    borderColor: darkMode ? '#92400e' : '#fcd34d',
    color: darkMode ? '#fbbf24' : '#d97706',
    boxShadow: darkMode 
      ? '0 4px 12px rgba(251, 191, 36, 0.3)' 
      : '0 4px 12px rgba(217, 119, 6, 0.3)'
  };

  const isStarbooksPage = activePage?.startsWith('starbooks');

  const filteredProjects = (() => {
    try {
      return projects.filter(p => {
        if (searchQuery.length === 0) return false;
        
        const query = searchQuery.toLowerCase();
        
        
        const projectMatch = p.project?.toLowerCase().includes(query);
        
        
        let municipalityMatch = false;
        if (typeof p.municipality === 'string') {
          municipalityMatch = p.municipality.toLowerCase().includes(query);
        } else if (p.municipality?.name) {
          municipalityMatch = p.municipality.name.toLowerCase().includes(query);
        }
        
        
        const communityMatch = p.community?.toLowerCase().includes(query);
        
        
        const yearMatch = p.year?.toString().includes(searchQuery);
        
        return projectMatch || municipalityMatch || communityMatch || yearMatch;
      });
    } catch (error) {
      console.error('Search filter error:', error);
      return [];
    }
  })();

  const filteredStarbooksUnits = (() => {
    try {
      return starbooksUnits.filter(unit => {
        if (searchQuery.length === 0) return false;
        
        const query = searchQuery.toLowerCase();
        
        
        const locationMatch = (unit.location || '').toLowerCase().includes(query);
        const municipalityMatch = (unit.municipality || '').toLowerCase().includes(query);
        const serialMatch = (unit.serialNumber || unit.unit_code || '').toLowerCase().includes(query);
        const statusMatch = (unit.status || '').toLowerCase().includes(query);
        const provinceMatch = (unit.province || '').toLowerCase().includes(query);
        
        return locationMatch || municipalityMatch || serialMatch || statusMatch || provinceMatch;
      });
    } catch (error) {
      console.error('STARBOOKS search filter error:', error);
      return [];
    }
  })();

  
  const searchResults = isStarbooksPage ? filteredStarbooksUnits : filteredProjects;
  const searchTitle = isStarbooksPage ? 'Search STARBOOKS Units' : 'Search Projects';
  const searchPlaceholder = isStarbooksPage 
    ? "Type to search... (e.g., 'Tuguegarao', 'Active', 'STARBOOKS-2024')"
    : "Type to search... (e.g., 'Isabela', 'SEL', '2023')";

  const handleSearchClick = () => {
    setShowSearch(true);
    setShowNotifications?.(false);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showSearch) {
        handleCloseSearch();
      }
    };

    if (showSearch) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showSearch]);

  return (
    <>
      <header 
        className="h-20 px-6 flex items-center justify-between border-b backdrop-blur-xl relative overflow-hidden"
        style={headerStyles}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          color: '#004A98'
        }} />

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="lg:hidden p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
            style={buttonStyles}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
              {NAV_LABELS[activePage] || "CEST 2.0 Dashboard"}
            </h1>
            <p className="text-xs font-semibold" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              Welcome back! Here's your overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSearchClick}
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110 group"
              style={buttonStyles}
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 border-2 group"
              style={themeButtonStyles}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              ) : (
                <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications?.((v) => !v);
                setShowSearch(false);
              }}
              className="relative p-2.5 rounded-xl transition-all duration-200 hover:scale-110 group"
              style={buttonStyles}
              title="Notifications & Activity"
            >
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {showSearch && (
        <Modal onClose={handleCloseSearch} className="bg-black/70 backdrop-blur-md">
          <ModalPanel maxWidth="max-w-3xl">
            <div 
              className="rounded-3xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                border: `2px solid ${darkMode ? '#1e293b' : '#e5e7eb'}`,
                maxHeight: '80vh'
              }}
            >
              
              <div 
                className="p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)'
                }}
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{searchTitle}</h2>
                        <p className="text-sm text-white/80">{isStarbooksPage ? 'Find units by location, municipality, or serial number' : 'Find projects by name, location, or year'}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseSearch}
                      className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 hover:rotate-90"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full px-6 py-4 rounded-2xl text-base font-medium outline-none transition-all duration-300 shadow-xl"
                      style={{
                        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        border: `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 74, 152, 0.2)'}`
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.3)' : '#004A98';
                        e.target.style.boxShadow = '0 0 0 4px rgba(0, 74, 152, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 74, 152, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                      >
                        <X className="w-4 h-4" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                      </button>
                    )}
                  </div>

                  
                  {searchQuery && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/90">
                        {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                      </p>
                      <p className="text-xs text-white/70">
                        Press ESC to close
                      </p>
                    </div>
                  )}
                </div>
              </div>

              
              <div className="max-h-[50vh] overflow-y-auto">
                {searchQuery.length === 0 ? (
                  <div className="p-12 text-center">
                    <div 
                      className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center"
                      style={{ background: darkMode ? 'rgba(0, 74, 152, 0.1)' : 'rgba(0, 74, 152, 0.05)' }}
                    >
                      <Search className="w-10 h-10" style={{ color: darkMode ? '#475569' : '#cbd5e1' }} />
                    </div>
                    <p className="text-base font-semibold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Start searching
                    </p>
                    <p className="text-sm" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                      {isStarbooksPage ? 'Type location, municipality, serial number, or status' : 'Type project name, municipality, community, or year'}
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-12 text-center">
                    <div 
                      className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center"
                      style={{ background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }}
                    >
                      <Search className="w-10 h-10" style={{ color: darkMode ? '#ef4444' : '#f87171' }} />
                    </div>
                    <p className="text-base font-semibold mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      No results found
                    </p>
                    <p className="text-sm" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                      Try different keywords or check spelling
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {isStarbooksPage ? (
                      searchResults.slice(0, 10).map((unit, index) => (
                        <button
                          key={unit.id}
                          onClick={() => {
                            if (onNavigateToStarbooksUnit) {
                              onNavigateToStarbooksUnit(unit);
                            }
                            handleCloseSearch();
                          }}
                          className="w-full p-4 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                          style={{
                            background: darkMode ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                            boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                            animationDelay: `${index * 50}ms`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#10b981';
                            e.currentTarget.style.boxShadow = darkMode ? '0 8px 24px rgba(16, 185, 129, 0.3)' : '0 8px 24px rgba(16, 185, 129, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = darkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)';
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          
                          <div className="flex items-start justify-between gap-4 relative z-10">
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="text-base font-bold mb-2 line-clamp-2 group-hover:text-green-600 transition-colors"
                                style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                              >
                                {unit.location}
                              </h4>
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span 
                                  className="text-xs px-3 py-1 rounded-lg font-bold font-mono"
                                  style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#ffffff',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                  }}
                                >
                                  {unit.serialNumber || unit.unit_code}
                                </span>
                                <span 
                                  className="text-sm font-semibold"
                                  style={{ color: darkMode ? '#cbd5e1' : '#475569' }}
                                >
                                  📍 {unit.municipality}, {unit.province}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="text-xs px-2 py-1 rounded-lg font-semibold"
                                  style={{
                                    background: unit.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 
                                               unit.status === 'Maintenance' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: unit.status === 'Active' ? '#10b981' : 
                                           unit.status === 'Maintenance' ? '#f59e0b' : '#ef4444'
                                  }}
                                >
                                  {unit.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p 
                                className="text-xs font-semibold mb-1 uppercase tracking-wide"
                                style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
                              >
                                Users
                              </p>
                              <p 
                                className="text-xl font-bold"
                                style={{ color: '#8b5cf6' }}
                              >
                                {(unit.beneficiaries || unit.total_users || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      searchResults.slice(0, 10).map((project, index) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          if (onNavigateToProject) {
                            onNavigateToProject(project);
                          }
                          handleCloseSearch();
                        }}
                        className="w-full p-4 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                        style={{
                          background: darkMode ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                          boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                          animationDelay: `${index * 50}ms`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#004A98';
                          e.currentTarget.style.boxShadow = darkMode ? '0 8px 24px rgba(0, 74, 152, 0.3)' : '0 8px 24px rgba(0, 74, 152, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
                          e.currentTarget.style.boxShadow = darkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)';
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-base font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
                              style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                            >
                              {project.project}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span 
                                className="text-xs px-3 py-1 rounded-lg font-bold"
                                style={{
                                  background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
                                  color: '#ffffff',
                                  boxShadow: '0 2px 8px rgba(0, 74, 152, 0.3)'
                                }}
                              >
                                {project.year}
                              </span>
                              <span 
                                className="text-sm font-semibold"
                                style={{ color: darkMode ? '#cbd5e1' : '#475569' }}
                              >
                                📍 {typeof project.municipality === 'string' ? project.municipality : project.municipality?.name || 'Unknown'}
                              </span>
                              {project.community && (
                                <>
                                  <span style={{ color: darkMode ? '#475569' : '#cbd5e1' }}>•</span>
                                  <span 
                                    className="text-sm"
                                    style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
                                  >
                                    {project.community}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-xs px-2 py-1 rounded-lg font-semibold"
                                style={{
                                  background: project.status === 'Ongoing' ? 'rgba(16, 185, 129, 0.15)' : 
                                             project.status === 'Finished' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: project.status === 'Ongoing' ? '#10b981' : 
                                         project.status === 'Finished' ? '#3b82f6' : '#f59e0b'
                                }}
                              >
                                {project.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p 
                              className="text-xs font-semibold mb-1 uppercase tracking-wide"
                              style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
                            >
                              Budget
                            </p>
                            <p 
                              className="text-xl font-bold"
                              style={{ color: '#10b981' }}
                            >
                              ₱{(Number(project.amountFunded || 0) / 1000).toFixed(0)}K
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                    )}
                    {searchResults.length > 10 && (
                      <div 
                        className="text-center py-4 rounded-2xl"
                        style={{ background: darkMode ? 'rgba(0, 74, 152, 0.1)' : 'rgba(0, 74, 152, 0.05)' }}
                      >
                        <p 
                          className="text-sm font-semibold"
                          style={{ color: isStarbooksPage ? '#10b981' : '#004A98' }}
                        >
                          +{searchResults.length - 10} more results available
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ModalPanel>
        </Modal>
      )}
    </>
  );
};
