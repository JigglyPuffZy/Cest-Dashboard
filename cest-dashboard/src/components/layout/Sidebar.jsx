import { 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  BarChart3, 
  LogOut, 
  Activity, 
  Archive, 
  ChevronLeft,
  AlertTriangle,
  BookOpen,
  Package,
  MapPin,
  Users,
  Settings
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COMPONENTS } from "../../shared/constants";
import dostLogo from "../../dost logo.png";
import cestLogo from "../../Cest Logo.png";
import starbooksLogo from "../../starbooks logo.png";
import { Modal, ModalPanel } from "../ui/Modal";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "dataentry", icon: FileText, label: "Data Entry" },
  { id: "trainings", icon: GraduationCap, label: "Trainings" },
  { id: "archive", icon: Archive, label: "Archive" },
];

const ROUTES = {
  dashboard: "/dashboard",
  analytics: "/analytics",
  archive: "/archive",
  dataentry: "/dataentry",
  trainings: "/trainings",
  starbooks: "/starbooks",
};

export const Sidebar = ({ 
  activePage, 
  setActivePage, 
  sidebarOpen, 
  setSidebarOpen, 
  darkMode, 
  isCollapsed, 
  setIsCollapsed,
  onLogout,
  onSwitchSystem
}) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const handleNavigation = (itemId) => {
    setActivePage(itemId);
    setSidebarOpen(false);
    
    const route = ROUTES[itemId];
    if (route) {
      navigate(route);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleSwitchClick = () => {
    setShowSwitchModal(true);
  };

  const confirmSwitch = () => {
    setShowSwitchModal(false);
    if (onSwitchSystem) {
      onSwitchSystem();
    }
  };

  const sidebarStyles = {
    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
    borderColor: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)',
    width: sidebarOpen || !isCollapsed ? '288px' : '80px',
    boxShadow: darkMode 
      ? '4px 0 20px rgba(0, 0, 0, 0.4)' 
      : '4px 0 20px rgba(0, 0, 0, 0.05)'
  };

  const headerStyles = {
    borderColor: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)',
    background: darkMode 
      ? 'linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.98) 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)'
  };

  const headerHoverStyles = {
    background: darkMode 
      ? 'linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 0.4) 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, rgba(241, 245, 249, 0.8) 100%)'
  };

  const logoStyles = {
    background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
    boxShadow: darkMode 
      ? '0 4px 12px rgba(0, 74, 152, 0.3)' 
      : '0 4px 12px rgba(0, 74, 152, 0.2)'
  };

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 h-screen
          border-r flex flex-col z-50 lg:z-auto
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        `}
        style={sidebarStyles}
      >
        {/* DOST Logo Header */}
        {!isCollapsed && (
          <div 
            className="px-6 pt-6 pb-4"
            style={{
              borderBottom: `1px solid ${darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)'}`,
              background: darkMode 
                ? 'linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.98) 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)'
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center p-3 transition-transform duration-300 hover:scale-105"
                style={{
                  background: '#ffffff',
                  boxShadow: darkMode 
                    ? '0 8px 24px rgba(0, 74, 152, 0.3)' 
                    : '0 8px 24px rgba(0, 74, 152, 0.2)',
                  border: `2px solid ${darkMode ? 'rgba(0, 74, 152, 0.2)' : 'rgba(0, 74, 152, 0.15)'}`
                }}
              >
                <img 
                  src={dostLogo} 
                  alt="DOST Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="text-center">
                <h2 
                  className="text-xs font-bold mb-0.5"
                  style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                >
                  Department of Science and Technology
                </h2>
                <p 
                  className="text-[10px] font-medium"
                  style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
                >
                  Region II - Cagayan Valley
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleToggle}
          className={`w-full border-b transition-all duration-200 group cursor-pointer ${
            isCollapsed ? 'px-4 py-6' : 'px-6 py-5'
          }`}
          style={headerStyles}
          onMouseEnter={(e) => e.currentTarget.style.background = headerHoverStyles.background}
          onMouseLeave={(e) => e.currentTarget.style.background = headerStyles.background}
          title={isCollapsed ? "Click to expand sidebar" : "Click to collapse sidebar"}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 p-2" 
                  style={{
                    ...logoStyles,
                    background: '#ffffff'
                  }}
                >
                  <img 
                    src={cestLogo} 
                    alt="DOST Logo" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h1 
                  className="text-base font-bold tracking-tight transition-colors duration-200" 
                  style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                >
                  CEST 2.0
                </h1>
                <p 
                  className="text-[11px] font-medium transition-colors duration-200" 
                  style={{ color: '#64748b' }}
                >
                  DOST Dashboard
                </p>
              </div>
              <div className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                <ChevronLeft 
                  className="w-4 h-4" 
                  style={{ color: darkMode ? '#94a3b8' : '#64748b' }} 
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 p-2" 
                style={{
                  ...logoStyles,
                  background: '#ffffff'
                }}
              >
                <img 
                  src={cestLogo} 
                  alt="DOST Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
          )}
        </button>

        <nav className={`flex-1 overflow-y-auto scrollbar-thin ${isCollapsed ? 'px-3 py-4' : 'px-4 py-4'}`}>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              const buttonStyles = {
                background: isActive 
                  ? 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)'
                  : 'transparent',
                boxShadow: isActive 
                  ? (darkMode ? '0 2px 8px rgba(0, 74, 152, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 2px 8px rgba(0, 74, 152, 0.3)')
                  : 'none'
              };

              const iconContainerStyles = {
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isActive 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : (darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.6)'),
                color: isActive ? '#ffffff' : (darkMode ? '#94a3b8' : '#64748b')
              };

              const labelColor = isActive ? '#ffffff' : (darkMode ? '#cbd5e1' : '#334155');

              const badgeStyles = {
                background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#004A98',
                color: '#ffffff'
              };

              const handleHover = (e, isHovering) => {
                if (!isActive) {
                  e.currentTarget.style.background = isHovering
                    ? (darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.8)')
                    : 'transparent';
                }
              };
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full group relative rounded-lg transition-all duration-200
                    ${isCollapsed ? 'flex justify-center' : 'flex items-center'}
                  `}
                  style={buttonStyles}
                  title={isCollapsed ? item.label : ""}
                  onMouseEnter={(e) => handleHover(e, true)}
                  onMouseLeave={(e) => handleHover(e, false)}
                >
                  {isActive && !isCollapsed && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full" 
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
                      }}
                    />
                  )}

                  <div className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} w-full`}>
                    <div 
                      className="flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                      style={iconContainerStyles}
                    >
                      <Icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </div>
                    
                    {!isCollapsed && (
                      <>
                        <span 
                          className="flex-1 text-left text-[13px] font-semibold tracking-wide"
                          style={{ color: labelColor }}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        <div 
          className={`border-t ${isCollapsed ? 'px-3 py-4' : 'px-4 py-4'} space-y-3`}
          style={{
            borderColor: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)'
          }}
        >
          {/* System Switcher */}
          {!isCollapsed && onSwitchSystem && (
            <button
              onClick={handleSwitchClick}
              className="w-full px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden"
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: `2px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)'}`,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = darkMode 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
              }}
            >
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300 p-1"
                    style={{ 
                      background: '#ffffff',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <img 
                      src={starbooksLogo} 
                      alt="STARBOOKS Logo" 
                      className="w-full h-full object-contain relative z-10" 
                    />
                  </div>
                  <div className="text-left">
                    <div 
                      className="text-xs font-bold"
                      style={{ color: '#10b981' }}
                    >
                      Switch to STARBOOKS
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className={`w-full rounded-lg transition-all duration-200 group ${
              isCollapsed ? 'flex justify-center' : 'flex items-center'
            }`}
            style={{
              background: darkMode ? 'rgba(220, 38, 38, 0.12)' : 'rgba(220, 38, 38, 0.08)',
              color: darkMode ? '#fca5a5' : '#dc2626'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(220, 38, 38, 0.18)' : 'rgba(220, 38, 38, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(220, 38, 38, 0.12)' : 'rgba(220, 38, 38, 0.08)';
            }}
            title={isCollapsed ? "Logout" : ""}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} w-full`}>
              <div 
                className="flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: darkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.15)'
                }}
              >
                <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </div>
              {!isCollapsed && (
                <span className="flex-1 text-left text-[13px] font-semibold tracking-wide">
                  Logout
                </span>
              )}
            </div>
          </button>
        </div>

        {!isCollapsed && (
          <div 
            className="px-4 py-3 border-t"
            style={{
              borderColor: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)',
              background: darkMode 
                ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 1) 100%)'
                : 'linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)'
            }}
          >
            <div className="text-center space-y-0.5">
              <p 
                className="text-[10px] font-semibold" 
                style={{ 
                  color: darkMode ? '#475569' : '#94a3b8',
                  letterSpacing: '0.02em'
                }}
              >
                © {new Date().getFullYear()} DOST
              </p>
              <p 
                className="text-[9px] font-medium" 
                style={{ 
                  color: darkMode ? '#334155' : '#cbd5e1',
                  letterSpacing: '0.01em'
                }}
              >
                Department of Science and Technology
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <Modal onClose={() => setShowLogoutModal(false)} zIndex={60}>
          <ModalPanel maxWidth="max-w-md">
            <div 
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{
                background: darkMode ? '#0f172a' : '#ffffff',
                border: `1px solid ${darkMode ? '#1e293b' : '#e5e7eb'}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Header */}
              <div 
                className="p-6 border-b"
                style={{ borderColor: darkMode ? '#1e293b' : '#e5e7eb' }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(220, 38, 38, 0.15)' }}
                  >
                    <AlertTriangle className="w-6 h-6" style={{ color: '#dc2626' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Confirm Logout
                    </h3>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Are you sure you want to log out?
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm mb-6" style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
                  You will be redirected to the login page and will need to sign in again to access the system.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                    style={{
                      background: darkMode ? '#1e293b' : '#f1f5f9',
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </ModalPanel>
        </Modal>
      )}

      {/* System Switch Confirmation Modal */}
      {showSwitchModal && (
        <Modal onClose={() => setShowSwitchModal(false)} zIndex={60} className="bg-black/70 backdrop-blur-md">
          <ModalPanel maxWidth="max-w-lg">
            <div 
              className="rounded-3xl shadow-2xl overflow-hidden relative"
              style={{
                background: darkMode 
                  ? 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: `2px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.1)'
              }}
            >
              {/* Animated Background Pattern */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.8) 0%, transparent 50%)',
                  animation: 'float 6s ease-in-out infinite'
                }}
              />

              {/* Header with Icon */}
              <div 
                className="relative p-8 border-b"
                style={{ 
                  borderColor: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)',
                  background: darkMode 
                    ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)'
                    : 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)'
                }}
              >
                <div className="flex items-start gap-5">
                  {/* Animated Icon Container */}
                  <div className="relative">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center relative p-3"
                      style={{ 
                        background: '#ffffff',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      <img 
                        src={starbooksLogo} 
                        alt="STARBOOKS Logo" 
                        className="w-full h-full object-contain relative z-10" 
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 
                      className="text-2xl font-bold mb-2"
                      style={{ 
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      Switch to STARBOOKS?
                    </h3>
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
                    >
                      You're about to switch to the Digital Library Management System
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-8">
                <div className="space-y-6">
                  {/* Feature Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Package, label: 'Inventory', color: '#10b981' },
                      { icon: MapPin, label: 'Locations', color: '#059669' },
                      { icon: Users, label: 'Users', color: '#10b981' },
                      { icon: BarChart3, label: 'Reports', color: '#059669' }
                    ].map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105"
                          style={{
                            background: darkMode 
                              ? 'rgba(16, 185, 129, 0.1)' 
                              : 'rgba(16, 185, 129, 0.05)',
                            border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${feature.color}20` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: feature.color }} strokeWidth={2.5} />
                          </div>
                          <span 
                            className="text-xs font-semibold"
                            style={{ color: darkMode ? '#cbd5e1' : '#475569' }}
                          >
                            {feature.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Info Box */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      background: darkMode 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : 'rgba(59, 130, 246, 0.05)',
                      border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`
                    }}
                  >
                    <div className="flex gap-3">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(59, 130, 246, 0.2)' }}
                      >
                        <span className="text-xs font-bold" style={{ color: '#3b82f6' }}>i</span>
                      </div>
                      <p 
                        className="text-xs leading-relaxed"
                        style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
                      >
                        Your current work will be saved. You can switch back to CEST anytime from the STARBOOKS sidebar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div 
                className="relative p-6 border-t"
                style={{ 
                  borderColor: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.8)',
                  background: darkMode 
                    ? 'rgba(15, 23, 42, 0.5)' 
                    : 'rgba(248, 250, 252, 0.5)'
                }}
              >
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSwitchModal(false)}
                    className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
                    style={{
                      background: darkMode ? '#1e293b' : '#f1f5f9',
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = darkMode ? '#334155' : '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = darkMode ? '#1e293b' : '#f1f5f9';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSwitch}
                    className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {/* Shine effect on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                        animation: 'shine 1.5s ease-in-out infinite'
                      }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Switch Now
                      <div 
                        className="w-5 h-5 rounded-md p-0.5"
                        style={{ 
                          background: '#ffffff'
                        }}
                      >
                        <img 
                          src={starbooksLogo} 
                          alt="STARBOOKS" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </ModalPanel>
        </Modal>
      )}
    </>
  );
};

