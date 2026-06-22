import { useState } from "react";
import { Settings, User, Bell, Palette, Database, Shield, Save, X } from "lucide-react";
import { Modal, ModalPanel } from "../../components/ui/Modal";

export const SettingsPage = ({ darkMode, setDarkMode, onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    // Profile
    name: "CEST Admin",
    email: "admin@cest.dost.gov.ph",
    role: "Administrator",
    department: "DOST Region II",
    
    // Notifications
    notifProjects: true,
    notifEquipment: true,
    notifBudget: true,
    notifReports: true,
    emailNotifications: true,
    
    // Appearance
    theme: darkMode ? "dark" : "light",
    compactMode: false,
    showAnimations: true,
    
    // Data & Privacy
    autoSave: true,
    confirmDelete: true,
    dataRetention: "30",
    exportFormat: "excel",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Update dark mode if theme changed
    if (settings.theme === "dark" && !darkMode) {
      setDarkMode(true);
    } else if (settings.theme === "light" && darkMode) {
      setDarkMode(false);
    }
    
    // Save to localStorage
    localStorage.setItem("cest_settings", JSON.stringify(settings));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "data", label: "Data & Privacy", icon: Database },
  ];

  return (
    <Modal onClose={onClose} className="bg-black/70 backdrop-blur-md">
      <ModalPanel maxWidth="max-w-5xl" className="rounded-2xl shadow-2xl overflow-hidden">
      <div 
        style={{
          background: darkMode ? '#1e293b' : '#ffffff',
          border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ 
          borderColor: darkMode ? '#334155' : '#e5e7eb',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(0, 74, 152, 0.15), rgba(0, 102, 204, 0.1))'
            : 'linear-gradient(135deg, rgba(0, 74, 152, 0.08), rgba(0, 102, 204, 0.05))'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ 
                background: 'linear-gradient(135deg, #004A98, #0066CC)',
                boxShadow: '0 4px 12px rgba(0, 74, 152, 0.3)'
              }}>
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  Settings
                </h2>
                <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Manage your preferences and system configuration
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
              style={{
                background: darkMode ? '#334155' : '#f1f5f9',
                color: darkMode ? '#f8fafc' : '#0f172a'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-180px)]">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r p-4" style={{ 
            borderColor: darkMode ? '#334155' : '#e5e7eb',
            background: darkMode ? '#0f172a' : '#f8fafc'
          }}>
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: isActive 
                        ? (darkMode ? 'rgba(0, 74, 152, 0.2)' : 'rgba(0, 74, 152, 0.1)')
                        : 'transparent',
                      color: isActive ? '#004A98' : (darkMode ? '#94a3b8' : '#64748b')
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-bold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto scrollbar-card">
            {activeTab === "profile" && (
              <ProfileTab settings={settings} setSettings={setSettings} darkMode={darkMode} />
            )}
            {activeTab === "notifications" && (
              <NotificationsTab settings={settings} setSettings={setSettings} darkMode={darkMode} />
            )}
            {activeTab === "appearance" && (
              <AppearanceTab settings={settings} setSettings={setSettings} darkMode={darkMode} />
            )}
            {activeTab === "data" && (
              <DataPrivacyTab settings={settings} setSettings={setSettings} darkMode={darkMode} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between" style={{ 
          borderColor: darkMode ? '#334155' : '#e5e7eb',
          background: darkMode ? '#1e293b' : '#f8fafc'
        }}>
          <div>
            {saved && (
              <span className="text-sm font-medium" style={{ color: '#10b981' }}>
                ✓ Settings saved successfully
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
              style={{
                background: darkMode ? '#334155' : '#e2e8f0',
                color: darkMode ? '#f8fafc' : '#0f172a'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 74, 152, 0.3)'
              }}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
      </ModalPanel>
    </Modal>
  );
};

// Profile Tab
const ProfileTab = ({ settings, setSettings, darkMode }) => {
  const inputStyle = {
    background: darkMode ? '#0f172a' : '#ffffff',
    color: darkMode ? '#f8fafc' : '#0f172a',
    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
          Profile Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Full Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Email Address
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Role
            </label>
            <input
              type="text"
              value={settings.role}
              onChange={(e) => setSettings({ ...settings, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Department
            </label>
            <input
              type="text"
              value={settings.department}
              onChange={(e) => setSettings({ ...settings, department: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Tab
const NotificationsTab = ({ settings, setSettings, darkMode }) => {
  const toggles = [
    { key: "notifProjects", label: "Project Updates", desc: "Get notified when projects are added or updated" },
    { key: "notifEquipment", label: "Equipment Updates", desc: "Get notified about equipment changes" },
    { key: "notifBudget", label: "Budget Alerts", desc: "Receive alerts about budget thresholds" },
    { key: "notifReports", label: "Report Generation", desc: "Notifications when reports are ready" },
    { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {toggles.map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                background: darkMode ? '#0f172a' : '#f8fafc',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
              }}
            >
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  {toggle.label}
                </p>
                <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  {toggle.desc}
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, [toggle.key]: !settings[toggle.key] })}
                className="relative w-14 h-7 rounded-full transition-all duration-200"
                style={{
                  background: settings[toggle.key] ? '#004A98' : (darkMode ? '#334155' : '#cbd5e1')
                }}
              >
                <div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-200"
                  style={{
                    left: settings[toggle.key] ? '32px' : '4px'
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Appearance Tab
const AppearanceTab = ({ settings, setSettings, darkMode }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
          Theme
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSettings({ ...settings, theme: "light" })}
            className="p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: settings.theme === "light" ? '#004A98' : (darkMode ? '#334155' : '#e2e8f0'),
              background: settings.theme === "light" ? 'rgba(0, 74, 152, 0.1)' : (darkMode ? '#0f172a' : '#ffffff')
            }}
          >
            <div className="w-full h-32 rounded-lg mb-3" style={{ background: 'linear-gradient(135deg, #f8fafc, #e0e7ff)' }}></div>
            <p className="text-sm font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>Light Mode</p>
          </button>
          <button
            onClick={() => setSettings({ ...settings, theme: "dark" })}
            className="p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: settings.theme === "dark" ? '#004A98' : (darkMode ? '#334155' : '#e2e8f0'),
              background: settings.theme === "dark" ? 'rgba(0, 74, 152, 0.1)' : (darkMode ? '#0f172a' : '#ffffff')
            }}
          >
            <div className="w-full h-32 rounded-lg mb-3" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}></div>
            <p className="text-sm font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>Dark Mode</p>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
          Display Options
        </h3>
        <div className="space-y-4">
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: darkMode ? '#0f172a' : '#f8fafc',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
            }}
          >
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                Compact Mode
              </p>
              <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Reduce spacing for more content on screen
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
              className="relative w-14 h-7 rounded-full transition-all duration-200"
              style={{
                background: settings.compactMode ? '#004A98' : (darkMode ? '#334155' : '#cbd5e1')
              }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-200"
                style={{
                  left: settings.compactMode ? '32px' : '4px'
                }}
              />
            </button>
          </div>
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: darkMode ? '#0f172a' : '#f8fafc',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
            }}
          >
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                Animations
              </p>
              <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Enable smooth transitions and animations
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, showAnimations: !settings.showAnimations })}
              className="relative w-14 h-7 rounded-full transition-all duration-200"
              style={{
                background: settings.showAnimations ? '#004A98' : (darkMode ? '#334155' : '#cbd5e1')
              }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-200"
                style={{
                  left: settings.showAnimations ? '32px' : '4px'
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data & Privacy Tab
const DataPrivacyTab = ({ settings, setSettings, darkMode }) => {
  const inputStyle = {
    background: darkMode ? '#0f172a' : '#ffffff',
    color: darkMode ? '#f8fafc' : '#0f172a',
    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
          Data Management
        </h3>
        <div className="space-y-4">
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: darkMode ? '#0f172a' : '#f8fafc',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
            }}
          >
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                Auto-Save
              </p>
              <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Automatically save changes as you work
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
              className="relative w-14 h-7 rounded-full transition-all duration-200"
              style={{
                background: settings.autoSave ? '#004A98' : (darkMode ? '#334155' : '#cbd5e1')
              }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-200"
                style={{
                  left: settings.autoSave ? '32px' : '4px'
                }}
              />
            </button>
          </div>
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: darkMode ? '#0f172a' : '#f8fafc',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
            }}
          >
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                Confirm Before Delete
              </p>
              <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Show confirmation dialog before deleting items
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, confirmDelete: !settings.confirmDelete })}
              className="relative w-14 h-7 rounded-full transition-all duration-200"
              style={{
                background: settings.confirmDelete ? '#004A98' : (darkMode ? '#334155' : '#cbd5e1')
              }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-200"
                style={{
                  left: settings.confirmDelete ? '32px' : '4px'
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
          Export Settings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Data Retention (days)
            </label>
            <div className="relative">
              <select
                value={settings.dataRetention}
                onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                style={{
                  ...inputStyle,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${darkMode ? '%23f8fafc' : '%230f172a'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="7" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>7 days</option>
                <option value="30" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>30 days</option>
                <option value="90" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>90 days</option>
                <option value="365" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>1 year</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Export Format
            </label>
            <div className="relative">
              <select
                value={settings.exportFormat}
                onChange={(e) => setSettings({ ...settings, exportFormat: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                style={{
                  ...inputStyle,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${darkMode ? '%23f8fafc' : '%230f172a'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="excel" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>Excel (.xlsx)</option>
                <option value="csv" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>CSV (.csv)</option>
                <option value="json" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>JSON (.json)</option>
                <option value="pdf" style={{ background: darkMode ? '#0f172a' : '#ffffff' }}>PDF (.pdf)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
