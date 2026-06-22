import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Package, Info, FileText, MapPin, X, Eye } from "lucide-react";
import { fmt, getStatusColor, getCardStyle, formatCurrencyShort } from "../../shared/utils/helpers";
import { COMPONENTS, COMP_COLORS } from "../../shared/constants";
import { HoverTooltip } from "../../components/ui/Tooltip";
import { getAllProvinces } from "../../shared/data/regionII";
import { transformProjects, transformEquipmentList } from "../../shared/utils/dataTransform";
import { safeString, safeProjectTitle, safeEquipmentName, safeDisplayName } from "../../shared/utils/safeRender";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Peso Icon
const PesoIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 6h8a4 4 0 0 1 0 8H8V6z" />
    <line x1="8" y1="6" x2="8" y2="20" />
    <line x1="4" y1="10" x2="12" y2="10" />
    <line x1="4" y1="14" x2="12" y2="14" />
  </svg>
);

export const Dashboard = ({ projects = [], equipment = [], uniqueComm = 0, darkMode }) => {
  const navigate = useNavigate();

  // Transform Supabase data structure to match expected format
  const transformedProjects = transformProjects(projects);
  const transformedEquipment = transformEquipmentList(equipment || []);
  const [selectedView, setSelectedView] = useState("overview");
  const [yearFilter, setYearFilter] = useState("All");
  const [componentModal, setComponentModal] = useState(null); // NEW: For component modal
  const [provinceFilter, setProvinceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [componentFilter, setComponentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showComponentLegend, setShowComponentLegend] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const totalFunds = transformedProjects.reduce((s, p) => s + Number(p.amountFunded || 0), 0);
  const years = ["All", ...Array.from(new Set(transformedProjects.map((p) => Number(p.year)).filter(Boolean))).sort()];

  const filteredProjects = transformedProjects.filter((p) => {
    const matchSearch = !search || p.project?.toLowerCase().includes(search.toLowerCase()) || 
                        p.community?.toLowerCase().includes(search.toLowerCase()) || 
                        p.municipality?.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter === "All" || String(p.year) === String(yearFilter);
    const provinceName = typeof p.province === 'object' ? p.province?.name : p.province;
    const matchProvince = provinceFilter === "All" || provinceName === provinceFilter;
    const matchStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchComponent = componentFilter === "all" || (p.components || []).includes(componentFilter);
    return matchSearch && matchYear && matchProvince && matchStatus && matchComponent;
  });

  // Get official provinces for region overview
  const officialProvinces = getAllProvinces();

  const barData = officialProvinces
    .map((province) => {
      const provinceProjects = transformedProjects.filter(
        (p) => p.province?.toLowerCase() === province.name.toLowerCase()
      );
      return {
        name: province.code,
        fullName: province.name,
        id: province.id,
        budget: provinceProjects.reduce((s, p) => s + Number(p.amountFunded || 0), 0),
      };
    })
    .sort((a, b) => b.budget - a.budget);

  const compCounts = Object.entries(COMPONENTS)
    .map(([k]) => ({
      name: k.toUpperCase(),
      fullName: COMPONENTS[k],
      value: transformedProjects.filter((p) => p.components?.includes(k)).length,
    }))
    .filter((d) => d.value > 0);

  // Bright pastel color palette for pie chart - Blue, Green, Pink, Yellow/Orange, Violet/Purple, Light Blue
  const PIE_COLORS = ["#60A5FA", "#34D399", "#F472B6", "#FBBF24", "#A78BFA", "#93C5FD"];
  
  // Bright pastel color palette for bar chart - Purple, Pink, Yellow/Gold, Green, Blue, Red/Coral, Teal/Cyan
  const BAR_COLORS = ["#A78BFA", "#F472B6", "#FBBF24", "#34D399", "#60A5FA", "#FB7185", "#2DD4BF"];

  // Modern card style with subtle elevation
  const cardStyle = getCardStyle(darkMode);

  const handleViewDetails = (item, index) => {
    const itemWithDisplayId = {
      ...item,
      displayId: `Project #${index + 1}`
    };
    setSelectedItem(itemWithDisplayId);
    setShowDetailModal(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Enhanced Premium Tab Design - Minimized with Blue Theme */}
      <div className="flex items-center justify-center mb-8 px-2 sm:px-4">
        <div className="flex gap-1.5 sm:gap-3 p-1.5 sm:p-2.5 rounded-2xl w-full max-w-2xl" style={{ 
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.6))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)'}`,
          boxShadow: darkMode 
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          {[
            { 
              id: "overview", 
              label: "Overview", 
              gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              iconColor: "#3B82F6",
              glowColor: "rgba(59, 130, 246, 0.4)"
            },
            { 
              id: "projects", 
              label: "Projects", 
              gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              iconColor: "#3B82F6",
              glowColor: "rgba(59, 130, 246, 0.4)"
            },
            { 
              id: "analytics", 
              label: "Analytics", 
              gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              iconColor: "#3B82F6",
              glowColor: "rgba(59, 130, 246, 0.4)"
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className="relative flex-1 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-3 group justify-center whitespace-nowrap"
              style={
                selectedView === tab.id
                  ? {
                      background: tab.gradient,
                      color: '#ffffff',
                      boxShadow: `0 8px 20px -5px ${tab.glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.1) inset`,
                      transform: 'translateY(-1px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }
                  : {
                      background: darkMode 
                        ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.3), rgba(31, 41, 55, 0.3))'
                        : 'linear-gradient(135deg, rgba(249, 250, 251, 0.8), rgba(243, 244, 246, 0.6))',
                      color: darkMode ? '#9CA3AF' : '#6B7280',
                      border: `1px solid ${darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.8)'}`,
                      boxShadow: 'none'
                    }
              }
            >
              {/* Hover gradient overlay */}
              {selectedView !== tab.id && (
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(75, 85, 99, 0.5), rgba(55, 65, 81, 0.5))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))',
                  }}
                ></div>
              )}
              
              {/* Icon Container */}
              <div 
                className="relative z-10 w-5 h-5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                style={
                  selectedView === tab.id
                    ? {
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                      }
                    : {
                        background: darkMode 
                          ? 'linear-gradient(135deg, rgba(75, 85, 99, 0.4), rgba(55, 65, 81, 0.4))'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(249, 250, 251, 0.6))',
                        border: `1px solid ${darkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(229, 231, 235, 0.8)'}`,
                        boxShadow: 'none'
                      }
                }
              >
                {tab.id === "overview" && (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ 
                      color: selectedView === tab.id ? '#ffffff' : (darkMode ? '#9CA3AF' : '#6B7280'),
                      filter: selectedView === tab.id ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'
                    }}>
                    <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                  </svg>
                )}
                {tab.id === "projects" && (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ 
                      color: selectedView === tab.id ? '#ffffff' : (darkMode ? '#9CA3AF' : '#6B7280'),
                      filter: selectedView === tab.id ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'
                    }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                )}
                {tab.id === "analytics" && (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ 
                      color: selectedView === tab.id ? '#ffffff' : (darkMode ? '#9CA3AF' : '#6B7280'),
                      filter: selectedView === tab.id ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'
                    }}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                )}
              </div>
              
              <span className="relative z-10 font-semibold tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedView === "overview" && (
        <>
          {/* Overall Summary Section - Clean Modern Design */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6" style={{
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            border: `1px solid ${darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.6)'}`,
            boxShadow: darkMode 
              ? '0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : '0 10px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
          }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)'
              }}>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  Overall Summary
                </h2>
                <p className="text-[10px] sm:text-xs font-medium hidden sm:block" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Combined results across all CEST 2.0 projects in Region II
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto">
              <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105" style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)',
                border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.2)'}`,
                boxShadow: darkMode 
                  ? '0 4px 12px rgba(59, 130, 246, 0.15)'
                  : '0 4px 12px rgba(59, 130, 246, 0.1)'
              }}>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: '#3B82F6' }}>
                  Total Projects
                </p>
                <p className="text-xl sm:text-3xl font-black mb-0.5 sm:mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  {transformedProjects.length}
                </p>
                <p className="text-[10px] sm:text-xs font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Active & Completed
                </p>
              </div>
              
              <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105" style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)',
                border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.2)'}`,
                boxShadow: darkMode 
                  ? '0 4px 12px rgba(16, 185, 129, 0.15)'
                  : '0 4px 12px rgba(16, 185, 129, 0.1)'
              }}>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: '#3B82F6' }}>
                  Total Budget
                </p>
                <p className="text-xl sm:text-3xl font-black mb-0.5 sm:mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  {formatCurrencyShort(totalFunds)}
                </p>
                <p className="text-[10px] sm:text-xs font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Amount Funded
                </p>
              </div>
              
              <div className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105" style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%)',
                border: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.2)'}`,
                boxShadow: darkMode 
                  ? '0 4px 12px rgba(139, 92, 246, 0.15)'
                  : '0 4px 12px rgba(139, 92, 246, 0.1)'
              }}>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2" style={{ color: '#8B5CF6' }}>
                  Communities
                </p>
                <p className="text-xl sm:text-3xl font-black mb-0.5 sm:mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  {uniqueComm}
                </p>
                <p className="text-[10px] sm:text-xs font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Served
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Premium Stats Grid with Micro-interactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { 
                label: "Total Projects", 
                value: transformedProjects.length, 
                icon: TrendingUp, 
                color: "#004A98", 
                bgColor: "rgba(0, 74, 152, 0.1)",
                gradient: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)"
              },
              { 
                label: "Communities", 
                value: uniqueComm, 
                icon: Users, 
                color: "#60A5FA", 
                bgColor: "rgba(96, 165, 250, 0.1)",
                gradient: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)"
              },
              { 
                label: "Total Budget", 
                value: fmt(totalFunds), 
                icon: PesoIcon, 
                color: "#004A98", 
                bgColor: "rgba(0, 74, 152, 0.1)",
                gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label} 
                  className="group rounded-2xl p-6 transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl relative overflow-hidden cursor-pointer" 
                  style={{
                    ...cardStyle,
                    animationDelay: `${index * 150}ms`,
                    background: darkMode 
                      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
                      : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 0.5)'}`,
                    boxShadow: darkMode 
                      ? '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : '0 10px 40px rgba(0, 74, 152, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {/* Animated background gradient on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ background: stat.gradient }}
                  ></div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-20 group-hover:opacity-60 transition-opacity duration-500" style={{ background: stat.color }}></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full opacity-30 group-hover:opacity-80 transition-opacity duration-700" style={{ background: stat.color }}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                        style={{ 
                          background: stat.bgColor,
                          boxShadow: `0 8px 25px ${stat.color}20`
                        }}
                      >
                        <Icon className="w-6 h-6 transition-all duration-300" style={{ color: stat.color }} />
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: stat.color }}
                      ></div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        {stat.label}
                      </p>
                      <p className="text-3xl font-black group-hover:scale-110 transition-transform duration-300" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        {stat.value}
                      </p>
                    </div>
                    
                    {/* Progress bar animation */}
                    <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-1000 group-hover:w-full"
                        style={{ 
                          backgroundColor: stat.color,
                          width: '60%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Premium Recent Projects Section */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  Recent Projects
                </h2>
                <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                  Latest activities and updates
                </p>
              </div>
              <button
                onClick={() => setSelectedView("projects")}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
                  color: '#ffffff',
                }}
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {transformedProjects.slice(0, 5).map((p, index) => (
                <div
                  key={`${p.id}-${index}`}
                  onClick={() => handleViewDetails(p, index)}
                  className="group p-4 rounded-lg border transition-all duration-300 hover:shadow-md hover:border-blue-500/30 cursor-pointer"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)'
                      : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    borderColor: darkMode ? '#334155' : '#e2e8f0',
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md" style={{ 
                          background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)', 
                          color: '#ffffff'
                        }}>
                          {p.year}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md" style={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                          color: '#ffffff'
                        }}>
                          Project #{index + 1}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                          {typeof p.municipality === 'object' ? p.municipality?.name || 'Unknown' : p.municipality || 'Unknown'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        {p.project}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getStatusColor(p.status, darkMode)}`}>
                          {p.status}
                        </span>
                        {(p.components || []).filter(Boolean).slice(0, 2).map((c, index) => (
                          <HoverTooltip
                            key={`${c}-${index}`}
                            content={COMPONENTS[c] || c}
                            position="auto"
                            darkMode={darkMode}
                            delay={150}
                          >
                            <span 
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl cursor-help transition-all duration-300 hover:scale-110 hover:shadow-lg relative overflow-hidden group" 
                              style={{ 
                                background: `linear-gradient(135deg, ${COMP_COLORS[c] || '#64748b'}15, ${COMP_COLORS[c] || '#64748b'}25)`,
                                color: COMP_COLORS[c] || '#64748b',
                                border: `2px solid ${COMP_COLORS[c] || '#64748b'}30`,
                                boxShadow: `0 3px 10px ${COMP_COLORS[c] || '#64748b'}20`
                              }}
                            >
                              {/* Shine effect */}
                              <div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-all duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"
                                style={{ width: '50%' }}
                              />
                              <span className="relative z-10">{c?.toUpperCase() || 'N/A'}</span>
                            </span>
                          </HoverTooltip>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium mb-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Budget
                      </p>
                      <p className="text-xl font-bold" style={{ color: '#3b82f6' }}>
                        {p.amountFunded ? fmt(p.amountFunded) : 'Not Specified'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Projects Tab */}
      {selectedView === "projects" && (
        <>
          {/* Enhanced Filters Section */}
          <div className="rounded-2xl p-6" style={{
            ...cardStyle,
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            border: `2px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
            boxShadow: darkMode 
              ? '0 10px 40px rgba(0, 0, 0, 0.3)'
              : '0 10px 40px rgba(0, 0, 0, 0.08)'
          }}>
            {/* Filters Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  Filters
                </h3>
                <p className="text-xs font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Search and filter projects
                </p>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 transition-colors duration-200" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-300"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
              
              {/* Status Dropdown */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <svg className="w-5 h-5" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-10 py-3.5 rounded-xl text-sm font-medium outline-none cursor-pointer transition-all duration-300 appearance-none status-dropdown"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    minWidth: '180px',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <option value="all" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>All Status</option>
                  <option value="ongoing" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Ongoing</option>
                  <option value="finished" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Finished</option>
                  <option value="planned" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Planned</option>
                  <option value="liquidated" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Liquidated</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {/* Province Dropdown */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <MapPin className="w-5 h-5" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} />
                </div>
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="pl-12 pr-10 py-3.5 rounded-xl text-sm font-medium outline-none cursor-pointer transition-all duration-300 appearance-none"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    minWidth: '180px',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <option value="All" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>All Provinces</option>
                  <option value="Batanes" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Batanes</option>
                  <option value="Cagayan" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Cagayan</option>
                  <option value="Isabela" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Isabela</option>
                  <option value="Nueva Vizcaya" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Nueva Vizcaya</option>
                  <option value="Quirino" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>Quirino</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <svg className="w-5 h-5" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="pl-12 pr-10 py-3.5 rounded-xl text-sm font-medium outline-none cursor-pointer transition-all duration-300 appearance-none"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    minWidth: '180px',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y} style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>{y === "All" ? "All Years" : y}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {/* Components Dropdown */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <svg className="w-5 h-5" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </div>
                <select
                  value={componentFilter}
                  onChange={(e) => setComponentFilter(e.target.value)}
                  className="pl-12 pr-10 py-3.5 rounded-xl text-sm font-medium outline-none cursor-pointer transition-all duration-300 appearance-none"
                  style={{
                    background: darkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    minWidth: '200px',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? '#334155' : '#e2e8f0';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <option value="all" style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>All Components</option>
                  {Object.keys(COMPONENTS).map((key) => (
                    <option key={key} value={key} style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', padding: '8px' }}>{COMPONENTS[key]}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Results Counter */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#3B82F6' }}></div>
                <p className="text-sm font-semibold" style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
                  Showing <span className="text-blue-500 font-bold">{filteredProjects.length}</span> of <span className="font-bold">{transformedProjects.length}</span> projects
                </p>
              </div>
              {(search || yearFilter !== "All" || statusFilter !== "all" || componentFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch('');
                    setYearFilter('All');
                    setStatusFilter('all');
                    setComponentFilter('all');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-3">
            {filteredProjects.map((p, index) => (
              <div 
                key={`${p.id}-${index}`} 
                onClick={() => handleViewDetails(p, index)}
                className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01] cursor-pointer" 
                style={cardStyle}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: '#004A98', color: '#ffffff' }}>
                        {p.year}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: '#3b82f6', color: '#ffffff' }}>
                        Project #{index + 1}
                      </span>
                      <span className="text-sm font-medium" style={{ color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                        {typeof p.municipality === 'object' ? p.municipality?.name || 'Unknown' : p.municipality || 'Unknown'}
                      </span>
                      <span style={{ color: darkMode ? '#6b7280' : '#cbd5e1' }}>•</span>
                      <span className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        {p.community}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-semibold mb-3" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      {p.project}
                    </h3>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(p.status, darkMode)}`}>
                        {p.status}
                      </span>
                      {(p.components || []).filter(Boolean).map((c, index) => (
                        <HoverTooltip
                          key={`${c}-${index}`}
                          content={COMPONENTS[c] || c}
                          position="auto"
                          darkMode={darkMode}
                          delay={150}
                        >
                          <span 
                            className="text-xs font-medium px-3 py-1.5 rounded-xl cursor-help transition-all duration-300 hover:scale-110 hover:shadow-lg relative overflow-hidden group" 
                            style={{ 
                              background: `linear-gradient(135deg, ${COMP_COLORS[c] || '#64748b'}15, ${COMP_COLORS[c] || '#64748b'}25)`,
                              color: COMP_COLORS[c] || '#64748b',
                              border: `2px solid ${COMP_COLORS[c] || '#64748b'}30`,
                              boxShadow: `0 3px 10px ${COMP_COLORS[c] || '#64748b'}20`
                            }}
                          >
                            {/* Shine effect */}
                            <div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-all duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"
                              style={{ width: '50%' }}
                            />
                            <span className="relative z-10">{c?.toUpperCase() || 'N/A'}</span>
                          </span>
                        </HoverTooltip>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                      Budget
                    </p>
                    <p className="text-2xl font-semibold" style={{ color: p.amountFunded > 0 ? '#3b82f6' : (darkMode ? '#94a3b8' : '#6b7280') }}>
                      {p.amountFunded > 0 ? fmt(p.amountFunded) : 'Not Specified'}
                    </p>
                    {p.amountPerYear > 0 && (
                      <p className="text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        {fmt(p.amountPerYear)}/year
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {selectedView === "analytics" && (
        <>
          {/* Header with Component Legend Button */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                Region II Analytics
              </h2>
              <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                Aggregated data across Region II provinces - Click any province to drill down
              </p>
            </div>
            <button
              onClick={() => setShowComponentLegend(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: darkMode ? '#1e293b' : '#f8fafc',
                color: '#004A98',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              }}
            >
              <Info className="w-4 h-4" />
              Component Legend
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Modern Bar Chart - Provinces */}
                <div className="rounded-xl p-6" style={cardStyle}>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    Budget Distribution
                  </h3>
                  <p className="text-sm mb-6" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                    Top provinces by budget - Click to drill down
                  </p>
                  
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#6b7280", fontWeight: 500 }}
                        angle={0}
                        textAnchor="middle"
                        interval={0}
                        tickLine={false}
                        axisLine={{ stroke: darkMode ? "#334155" : "#e5e7eb", strokeWidth: 1 }}
                        height={35}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#6b7280", fontWeight: 500 }} 
                        tickFormatter={formatCurrencyShort} 
                        tickLine={false} 
                        axisLine={false}
                        width={60}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div 
                                className="p-3 rounded-lg cursor-pointer"
                                style={{
                                  background: darkMode ? '#0f172a' : '#ffffff',
                                  border: `1px solid ${darkMode ? '#1e293b' : '#e5e7eb'}`,
                                  boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => navigate(`/analytics/provinces/${payload[0].payload.id}`)}
                              >
                                <p className="font-semibold text-xs mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                  {payload[0].payload.fullName}
                                </p>
                                <p className="font-bold text-lg" style={{ color: '#004A98' }}>
                                  {formatCurrencyShort(payload[0].value)}
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#3b82f6' }}>
                                  Click to view details →
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: darkMode ? 'rgba(148, 163, 184, 0.05)' : 'rgba(226, 232, 240, 0.5)' }}
                      />
                      <Bar 
                        dataKey="budget" 
                        radius={[8, 8, 0, 0]} 
                        maxBarSize={50}
                        onClick={(data) => navigate(`/analytics/provinces/${data.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {barData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                            stroke={darkMode ? '#0f172a' : '#ffffff'}
                            strokeWidth={2}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Modern Donut Chart */}
                <div className="rounded-xl p-6" style={cardStyle}>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    Component Distribution
                  </h3>
                  <p className="text-sm mb-6" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                    CEST 2.0 breakdown
                  </p>
                  
                  {compCounts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={compCounts}
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          innerRadius={70}
                          dataKey="value"
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {compCounts.map((_, i) => (
                            <Cell 
                              key={i} 
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                              stroke={darkMode ? '#0f172a' : '#ffffff'}
                              strokeWidth={3}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div 
                                  className="p-3 rounded-lg"
                                  style={{
                                    background: darkMode ? '#0f172a' : '#ffffff',
                                    border: `1px solid ${darkMode ? '#1e293b' : '#e5e7eb'}`,
                                    boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  <p className="font-semibold text-xs mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                    {payload[0].payload.fullName}
                                  </p>
                                  <p className="font-bold text-lg" style={{ color: payload[0].fill }}>
                                    {payload[0].value}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[350px]">
                      <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        No data available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Component Analysis */}
              <div className="rounded-xl p-6" style={cardStyle}>
                <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  Component Analysis
                </h3>
                <p className="text-sm mb-6" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                  Detailed breakdown by component
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(COMPONENTS).map(([key, name]) => {
                    const count = transformedProjects.filter((p) => p.components?.includes(key)).length;
                    const percentage = transformedProjects.length > 0 ? ((count / transformedProjects.length) * 100).toFixed(1) : 0;
                    const componentProjects = transformedProjects.filter((p) => p.components?.includes(key));
                    
                    return (
                      <div 
                        key={key}
                        onClick={() => setComponentModal({ key, name, projects: componentProjects, count, percentage })}
                        className="p-5 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer hover:shadow-lg"
                        style={{
                          background: darkMode ? '#1e293b' : '#f8fafc',
                          borderColor: darkMode ? '#334155' : '#e2e8f0'
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: `${COMP_COLORS[key]}20`, color: COMP_COLORS[key] }}>
                            {key.toUpperCase()}
                          </span>
                          <span className="text-2xl font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                            {count}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium mb-3" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                          {name}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? '#0f172a' : '#e5e7eb' }}>
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${percentage}%`, backgroundColor: COMP_COLORS[key] }}
                            ></div>
                          </div>
                          <p className="text-xs font-medium" style={{ color: COMP_COLORS[key] }}>
                            {percentage}% of projects
                          </p>
                        </div>
                        
                        {/* Click indicator */}
                        <div className="mt-3 pt-3 border-t flex items-center justify-center gap-2" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                          <Eye className="w-3 h-3" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                          <span className="text-xs font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                            Click to view projects
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quarterly Monitoring Section */}
              <div className="rounded-xl p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Quarterly Monitoring
                    </h3>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                      Project status breakdown by quarter
                    </p>
                  </div>
                  {/* Glassmorphism Calendar Icon */}
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: darkMode 
                        ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(167, 139, 250, 0.15))'
                        : 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(167, 139, 250, 0.2))',
                      backdropFilter: 'blur(10px)',
                      border: `2px solid ${darkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(96, 165, 250, 0.4)'}`,
                      boxShadow: darkMode 
                        ? '0 8px 32px rgba(96, 165, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 8px 32px rgba(96, 165, 250, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    {/* Animated gradient background */}
                    <div 
                      className="absolute inset-0 opacity-50"
                      style={{
                        background: 'linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6)',
                        backgroundSize: '200% 200%',
                        animation: 'gradient-shift 3s ease infinite'
                      }}
                    />
                    {/* Calendar Icon SVG */}
                    <svg 
                      className="w-7 h-7 relative z-10" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                      <rect x="7" y="14" width="2" height="2" fill="currentColor"></rect>
                      <rect x="11" y="14" width="2" height="2" fill="currentColor"></rect>
                      <rect x="15" y="14" width="2" height="2" fill="currentColor"></rect>
                    </svg>
                  </div>
                </div>
                
                {(() => {
                  // Calculate quarterly statistics
                  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
                  const currentYear = new Date().getFullYear();
                  
                  // Group projects by status for current year
                  const currentYearProjects = transformedProjects.filter(p => Number(p.year) === currentYear);
                  
                  const quarterlyData = quarters.map((quarter, index) => {
                    // For demo purposes, distribute projects across quarters
                    // In production, you'd filter by actual quarter dates
                    const quarterProjects = currentYearProjects.filter((_, i) => i % 4 === index);
                    
                    return {
                      quarter,
                      ongoing: quarterProjects.filter(p => p.status === "Ongoing").length,
                      liquidated: quarterProjects.filter(p => p.status === "Liquidated").length,
                      finished: quarterProjects.filter(p => p.status === "Finished").length,
                      total: quarterProjects.length
                    };
                  });
                  
                  return (
                    <div className="space-y-4">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quarterlyData.map((q, index) => (
                          <div 
                            key={q.quarter}
                            className="p-4 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer"
                            style={{
                              background: darkMode 
                                ? `linear-gradient(135deg, ${PIE_COLORS[index]}15, ${PIE_COLORS[index]}08)`
                                : `linear-gradient(135deg, ${PIE_COLORS[index]}10, ${PIE_COLORS[index]}05)`,
                              borderColor: `${PIE_COLORS[index]}40`,
                              borderWidth: '2px'
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ 
                                background: PIE_COLORS[index], 
                                color: '#ffffff' 
                              }}>
                                {q.quarter}
                              </span>
                              <span className="text-2xl font-black" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                {q.total}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Ongoing</span>
                                <span className="font-bold" style={{ color: '#34D399' }}>{q.ongoing}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Liquidated</span>
                                <span className="font-bold" style={{ color: '#FBBF24' }}>{q.liquidated}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Finished</span>
                                <span className="font-bold" style={{ color: '#60A5FA' }}>{q.finished}</span>
                              </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ 
                              backgroundColor: darkMode ? '#1e293b' : '#f1f5f9' 
                            }}>
                              <div 
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ 
                                  width: `${q.total > 0 ? (q.finished / q.total) * 100 : 0}%`,
                                  background: `linear-gradient(90deg, ${PIE_COLORS[index]}, ${PIE_COLORS[(index + 1) % PIE_COLORS.length]})`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Detailed Table */}
                      <div className="overflow-x-auto rounded-xl border" style={{ 
                        borderColor: darkMode ? '#334155' : '#e2e8f0',
                        background: darkMode ? '#1e293b' : '#f8fafc'
                      }}>
                        <table className="w-full">
                          <thead>
                            <tr style={{ 
                              background: darkMode ? '#0f172a' : '#ffffff',
                              borderBottom: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                            }}>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                                Quarter
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#34D399' }}>
                                Ongoing
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#FBBF24' }}>
                                Liquidated
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#60A5FA' }}>
                                Finished
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                Total
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                                Completion %
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {quarterlyData.map((q, index) => (
                              <tr 
                                key={q.quarter}
                                className="transition-colors duration-200 hover:bg-opacity-50"
                                style={{ 
                                  borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                                  background: index % 2 === 0 
                                    ? (darkMode ? 'rgba(30, 41, 59, 0.3)' : 'rgba(248, 250, 252, 0.5)')
                                    : 'transparent'
                                }}
                              >
                                <td className="px-4 py-3">
                                  <span className="text-sm font-bold px-3 py-1.5 rounded-lg" style={{ 
                                    background: `${PIE_COLORS[index]}20`,
                                    color: PIE_COLORS[index]
                                  }}>
                                    {q.quarter}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-sm font-bold" style={{ color: '#34D399' }}>
                                    {q.ongoing}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-sm font-bold" style={{ color: '#FBBF24' }}>
                                    {q.liquidated}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-sm font-bold" style={{ color: '#60A5FA' }}>
                                    {q.finished}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-sm font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                    {q.total}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-16 h-2 rounded-full overflow-hidden" style={{ 
                                      backgroundColor: darkMode ? '#0f172a' : '#e5e7eb' 
                                    }}>
                                      <div 
                                        className="h-full rounded-full"
                                        style={{ 
                                          width: `${q.total > 0 ? (q.finished / q.total) * 100 : 0}%`,
                                          backgroundColor: PIE_COLORS[index]
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                                      {q.total > 0 ? Math.round((q.finished / q.total) * 100) : 0}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Summary Note */}
                      <div className="p-4 rounded-xl" style={{
                        background: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.08)',
                        border: `1px solid ${darkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(96, 165, 250, 0.2)'}`
                      }}>
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#60A5FA' }} />
                          <div>
                            <p className="text-sm font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                              Quarterly Monitoring Information
                            </p>
                            <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                              This section displays project status distribution across quarters for the current year ({currentYear}). 
                              Data is automatically updated based on project status changes and completion dates.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
        </>
      )}

      {/* Component Legend Modal */}
      {showComponentLegend && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-backdrop-fade-in"
            onClick={() => setShowComponentLegend(false)}
          />
        <div 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl z-50 animate-modal-fade-in"
          style={{
            background: darkMode ? '#0f172a' : '#ffffff',
            border: `1px solid ${darkMode ? '#1e293b' : '#e5e7eb'}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: darkMode ? '#1e293b' : '#e5e7eb' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                  CEST 2.0 Component Legend
                </h2>
                <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                  Community Empowerment through Science & Technology
                </p>
              </div>
              <button
                onClick={() => setShowComponentLegend(false)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: darkMode ? '#1e293b' : '#f1f5f9',
                  color: darkMode ? '#f8fafc' : '#0f172a'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {Object.entries(COMPONENTS).map(([key, fullName]) => (
              <div 
                key={key}
                className="p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: `${COMP_COLORS[key]}10`,
                  borderColor: `${COMP_COLORS[key]}40`
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${COMP_COLORS[key]}30` }}
                  >
                    <span className="text-xl font-bold" style={{ color: COMP_COLORS[key] }}>
                      {key.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold mb-1" style={{ color: COMP_COLORS[key] }}>
                      {key.toUpperCase()}
                    </h3>
                    <p className="text-base font-semibold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      {fullName}
                    </p>
                    <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                      {key === 'sel' && 'Focuses on sustainable livelihood projects and enterprise development in communities'}
                      {key === 'hn' && 'Addresses health and nutrition needs through science and technology interventions'}
                      {key === 'hrd' && 'Develops human resources through education, training, and capacity building'}
                      {key === 'drrm' && 'Disaster Risk Reduction Management and Climate Change Adaptation initiatives'}
                      {key === 'bgcet' && 'Promotes bio-circular-green economy technologies for sustainable development'}
                      {key === 'dg' && 'Implements digital governance tools and ICT solutions for communities'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t" style={{ borderColor: darkMode ? '#1e293b' : '#e5e7eb' }}>
            <button
              onClick={() => setShowComponentLegend(false)}
              className="w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
                color: '#ffffff'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </>
    )}

    {/* Detail Modal */}
    {showDetailModal && selectedItem && (() => {
      const isProject = !!(selectedItem.project || selectedItem.project_title);
      const title = selectedItem.project || selectedItem.project_title || selectedItem.equipment_name || selectedItem.equipmentName || 'Unknown';
      const municipality = typeof selectedItem.municipality === 'object' ? selectedItem.municipality?.name : selectedItem.municipality;
      const province = typeof selectedItem.province === 'object' ? selectedItem.province?.name : selectedItem.province;
      const benef = selectedItem.beneficiaries || {};
      const benefTotal = (benef.male||0)+(benef.female||0)+(benef.ips||0)+(benef.fourps||0)+(benef.pwd||0)+(benef.senior||0);
      const communities = selectedItem.communities || [];
      const components = selectedItem.components || [];

      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowDetailModal(false)}>
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            style={{
              background: darkMode 
                ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: `1px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(96, 165, 250, 0.15)'}`,
              boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.8)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Enhanced Header Banner with Vibrant Gradient */}
            <div className="relative p-8 rounded-t-3xl overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)',
                boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
              }}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10"
                style={{ 
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px)',
                  backgroundSize: '30px 30px',
                  animation: 'float 20s ease-in-out infinite'
                }} />
              
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-5 flex-1">
                  {/* Glassmorphism Icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                    }}>
                    {isProject ? <FileText className="w-8 h-8 text-white" /> : <Package className="w-8 h-8 text-white" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.3)',
                          backdropFilter: 'blur(10px)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}>
                        {selectedItem.displayId}
                      </span>
                      <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                        {selectedItem.year || 'N/A'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight mb-2">{title}</h2>
                    <p className="text-sm text-white/90 flex items-center gap-2 font-medium">
                      <MapPin className="w-4 h-4" />
                      {municipality || 'Unknown'}{province ? `, ${province}` : ''}
                      {selectedItem.community ? ` • ${selectedItem.community}` : ''}
                    </p>
                  </div>
                </div>
                
                <button onClick={() => setShowDetailModal(false)}
                  className="p-3 rounded-xl transition-all duration-200 hover:scale-110 flex-shrink-0"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">

              {/* PROJECT INFORMATION SECTION */}
              {isProject && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="pb-3 border-b" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                    <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Project Information
                    </h3>
                  </div>

                  {/* Form-like Layout */}
                  <div className="space-y-4">
                    {/* Year */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Year
                      </label>
                      <div className="px-4 py-3 rounded-lg" style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                      }}>
                        <p className="text-base font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          {selectedItem.year || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Province */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Province
                      </label>
                      <div className="px-4 py-3 rounded-lg" style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                      }}>
                        <p className="text-base font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          {province || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Municipality */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Municipality
                      </label>
                      <div className="px-4 py-3 rounded-lg" style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                      }}>
                        <p className="text-base font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          {municipality || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Community */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Community / Beneficiaries
                      </label>
                      <div className="px-4 py-3 rounded-lg" style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                      }}>
                        <p className="text-base font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          {selectedItem.community || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* MOA */}
                    {selectedItem.moa && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                          MOA
                        </label>
                        <div className="px-4 py-3 rounded-lg" style={{ 
                          background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                        }}>
                          <p className="text-base font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                            {selectedItem.moa}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STATUS & PARTNER AGENCIES SECTION */}
              {isProject && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="pb-3 border-b" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                    <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Project Status & Partners
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Status */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Status
                      </label>
                      <div className="px-4 py-3 rounded-lg" style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                      }}>
                        <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border-2 inline-block ${getStatusColor(selectedItem.status, darkMode)}`}>
                          {selectedItem.status || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Partner Agencies */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Partner Agencies
                      </label>
                      <div className="px-4 py-3 rounded-lg" style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                      }}>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.has_lgu && (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ 
                              background: 'rgba(59, 130, 246, 0.15)', 
                              color: '#3B82F6',
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>LGU</span>
                          )}
                          {selectedItem.has_pnp && (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ 
                              background: 'rgba(59, 130, 246, 0.15)', 
                              color: '#3B82F6',
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>PNP</span>
                          )}
                          {selectedItem.has_suc && (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ 
                              background: 'rgba(59, 130, 246, 0.15)', 
                              color: '#3B82F6',
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>SUC</span>
                          )}
                          {!selectedItem.has_lgu && !selectedItem.has_pnp && !selectedItem.has_suc && (
                            <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                              No partner data available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUDGET SECTION */}
              {isProject && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="pb-3 border-b" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                    <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Budget Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Amount Funded */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Amount Funded
                      </label>
                      <div className="px-4 py-3 rounded-lg" style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                      }}>
                        <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                          {(selectedItem.amountFunded || selectedItem.amount_funded) 
                            ? fmt(selectedItem.amountFunded || selectedItem.amount_funded) 
                            : 'Not Specified'}
                        </p>
                      </div>
                    </div>

                    {/* Amount Per Year */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        Amount Per Year
                      </label>
                      <div className="px-4 py-3 rounded-lg" style={{ 
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                      }}>
                        <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>
                          {(selectedItem.amountPerYear || selectedItem.amount_per_year) 
                            ? fmt(selectedItem.amountPerYear || selectedItem.amount_per_year) 
                            : 'Not Specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Components with better styling */}
              {isProject && components.length > 0 && (
                <div className="p-6 rounded-2xl" style={{ 
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(45, 212, 191, 0.1), rgba(16, 185, 129, 0.05))'
                    : 'linear-gradient(135deg, rgba(45, 212, 191, 0.08), rgba(16, 185, 129, 0.04))',
                  border: `2px solid ${darkMode ? 'rgba(45, 212, 191, 0.3)' : 'rgba(45, 212, 191, 0.2)'}`,
                  boxShadow: '0 4px 12px rgba(45, 212, 191, 0.1)'
                }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#2DD4BF' }}>CEST Components</p>
                  <div className="flex flex-wrap gap-2">
                    {components.map((c, i) => {
                      const componentKey = typeof c === 'object' ? c.id || c.component?.id || c : c;
                      const componentName = typeof c === 'object' ? c.name || c.component?.name || componentKey : componentKey;
                      return (
                        <HoverTooltip
                          key={i}
                          content={COMPONENTS[componentKey] || componentName}
                          position="auto"
                          darkMode={darkMode}
                          delay={150}
                        >
                          <span 
                            className="px-4 py-2 rounded-2xl text-xs font-bold cursor-help transition-all duration-300 hover:scale-110 hover:shadow-xl relative overflow-hidden group"
                            style={{ 
                              background: `linear-gradient(135deg, ${COMP_COLORS[componentKey] || '#64748b'}15, ${COMP_COLORS[componentKey] || '#64748b'}25)`, 
                              color: COMP_COLORS[componentKey] || '#64748b', 
                              border: `2px solid ${COMP_COLORS[componentKey] || '#64748b'}40`,
                              boxShadow: `0 4px 15px ${COMP_COLORS[componentKey] || '#64748b'}20`
                            }}
                          >
                            {/* Shine effect on hover */}
                            <div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                              style={{ width: '50%' }}
                            />
                            <span className="relative z-10">{String(componentKey)?.toUpperCase()}</span>
                          </span>
                        </HoverTooltip>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Equipment Details */}
              {isProject && (() => {
                // Get equipment linked to this project
                const projectTitle = safeProjectTitle(selectedItem);
                const linkedEquipment = transformedEquipment.filter(eq => {
                  const isLinkedToProject = (
                    // Link by project_id (most reliable)
                    (eq.project_id && selectedItem.id && String(eq.project_id) === String(selectedItem.id)) ||
                    // Link by matching project titles (direct comparison)
                    (projectTitle && eq.project_title && projectTitle === eq.project_title) ||
                    // Link by matching project titles (transformed)
                    (projectTitle && safeProjectTitle(eq) && projectTitle === safeProjectTitle(eq)) ||
                    // Legacy linking methods
                    (eq.projectName === projectTitle) ||
                    (eq.project?.project_title === projectTitle)
                  );
                  return isLinkedToProject;
                });

                if (linkedEquipment.length === 0) return null;

                return (
                  <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                      Equipment Details <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        {linkedEquipment.length} item{linkedEquipment.length !== 1 ? 's' : ''}
                      </span>
                    </p>
                    <div className="space-y-3">
                      {linkedEquipment.map((eq, index) => (
                        <div 
                          key={`equipment-${eq.id}-${index}`}
                          className="p-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                          style={{
                            background: darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)',
                            borderColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                            borderLeft: '3px solid #3b82f6'
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#3b82f6', color: '#ffffff' }}>
                                  {eq.year || 'N/A'}
                                </span>
                                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#f59e0b', color: '#ffffff' }}>
                                  Equipment #{index + 1}
                                </span>
                              </div>
                              <h5 className="text-sm font-semibold mb-1" style={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}>
                                {safeEquipmentName(eq) || 'Untitled Equipment'}
                              </h5>
                              <div className="flex items-center gap-3 text-xs mb-2" style={{ color: darkMode ? '#cbd5e1' : '#4b5563' }}>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="font-semibold">{eq.municipality || 'Unknown Location'}</span>
                                </div>
                                <span>•</span>
                                <span className="font-semibold">{eq.community || 'N/A'}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  <span className="font-semibold">{eq.units || 0} units</span>
                                </div>
                              </div>
                              {/* Component badge */}
                              {eq.component_id && (
                                <div className="flex items-center gap-1">
                                  <span 
                                    className="text-xs font-medium px-2 py-1 rounded-lg"
                                    style={{
                                      background: `${COMP_COLORS[eq.component_id] || '#64748b'}20`,
                                      color: COMP_COLORS[eq.component_id] || '#64748b',
                                      border: `1px solid ${COMP_COLORS[eq.component_id] || '#64748b'}40`
                                    }}
                                  >
                                    {String(eq.component_id)?.toUpperCase() || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium mb-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                                Total Units
                              </p>
                              <p className="text-lg font-bold" style={{ color: '#3b82f6' }}>
                                {eq.units || 0}
                              </p>
                              {eq.units_per_year && (
                                <p className="text-xs mt-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                                  {eq.units_per_year}/year
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Beneficiaries */}
              {isProject && benefTotal > 0 && (
                <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                    No. of Beneficiaries <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: '#004A9820', color: '#004A98' }}>Total: {benefTotal}</span>
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[['Male', benef.male], ['Female', benef.female], ['IPs', benef.ips], ['4Ps', benef.fourps], ['PWD', benef.pwd], ['Senior', benef.senior]].map(([label, val]) => (
                      <div key={label} className="text-center p-2 rounded-xl" style={{ background: darkMode ? '#1e293b' : '#f1f5f9' }}>
                        <p className="text-lg font-bold" style={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}>{val || 0}</p>
                        <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Types */}
              {isProject && communities.length > 0 && (
                <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Community Types</p>
                  <div className="flex flex-wrap gap-2">
                    {communities.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize"
                        style={{ background: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#cbd5e1' : '#374151' }}>
                        🏘️ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachment */}
              {selectedItem.file_name && selectedItem.file_data && (
                <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Attachment</p>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: darkMode ? '#1e293b' : '#f1f5f9' }}>
                    <FileText className="w-8 h-8 flex-shrink-0" style={{ color: '#ef4444' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{selectedItem.file_name}</p>
                      <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>PDF Document</p>
                    </div>
                    <button
                      onClick={() => window.open(selectedItem.file_data, '_blank')}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #004A98, #0066CC)' }}>
                      <Eye className="w-3 h-3" /> View PDF
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer with Close button */}
            <div className="px-6 pb-6 pt-4 flex justify-end gap-3 border-t sticky bottom-0"
              style={{
                borderColor: darkMode ? '#334155' : '#e2e8f0',
                background: darkMode ? 'linear-gradient(145deg, #1e293b, #0f172a)' : 'linear-gradient(145deg, #ffffff, #f8fafc)'
              }}>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#94a3b8' : '#64748b' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      );
    })()}
    
    {/* Enhanced CSS Animations */}
    <style>{`
      @keyframes backdrop-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes modal-fade-in {
        from { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(0.9);
        }
        to { 
          opacity: 1; 
          transform: translate(-50%, -50%) scale(1);
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-5px) rotate(1deg); }
        66% { transform: translateY(2px) rotate(-1deg); }
      }
      
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 5px rgba(0, 74, 152, 0.3); }
        50% { box-shadow: 0 0 20px rgba(0, 74, 152, 0.6); }
      }
      
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes shine {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      .animate-backdrop-fade-in {
        animation: backdrop-fade-in 0.3s ease-out;
      }
      
      .animate-modal-fade-in {
        animation: modal-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
    `}</style>

      {/* Component Projects Modal */}
      {componentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl" style={{
            background: darkMode ? '#1e293b' : '#ffffff',
            border: `2px solid ${COMP_COLORS[componentModal.key]}40`
          }}>
            {/* Modal Header */}
            <div className="p-6 border-b" style={{
              background: `linear-gradient(135deg, ${COMP_COLORS[componentModal.key]}15, ${COMP_COLORS[componentModal.key]}25)`,
              borderColor: darkMode ? '#334155' : '#e2e8f0'
            }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold px-3 py-1.5 rounded-lg" style={{ 
                      backgroundColor: COMP_COLORS[componentModal.key], 
                      color: '#ffffff'
                    }}>
                      {componentModal.key.toUpperCase()}
                    </span>
                    <span className="text-2xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      {componentModal.count} Projects
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    {componentModal.name}
                  </h3>
                  <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {componentModal.percentage}% of all projects
                  </p>
                </div>
                <button
                  onClick={() => setComponentModal(null)}
                  className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable Project List */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {componentModal.projects.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: darkMode ? '#64748b' : '#9ca3af' }} />
                  <p className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    No projects found
                  </p>
                  <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    No projects are assigned to this component yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {componentModal.projects.map((project, index) => (
                    <div
                      key={`${project.id}-${index}`}
                      onClick={() => {
                        setComponentModal(null);
                        handleViewDetails(project, index);
                      }}
                      className="p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer"
                      style={{
                        background: darkMode ? '#0f172a' : '#f8fafc',
                        borderColor: darkMode ? '#334155' : '#e2e8f0',
                        borderLeft: `4px solid ${COMP_COLORS[componentModal.key]}`
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold px-2 py-1 rounded" style={{ 
                              background: '#3b82f6', 
                              color: '#ffffff'
                            }}>
                              {project.year || 'N/A'}
                            </span>
                            <span className="text-xs font-bold px-2 py-1 rounded" style={{ 
                              background: COMP_COLORS[componentModal.key], 
                              color: '#ffffff'
                            }}>
                              Project #{index + 1}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                              {typeof project.municipality === 'object' ? project.municipality?.name : project.municipality}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold mb-2 line-clamp-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                            {project.project || project.project_title || 'Untitled Project'}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold px-2 py-1 rounded border ${getStatusColor(project.status, darkMode)}`}>
                              {project.status}
                            </span>
                            <div className="flex items-center gap-1 text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                              <MapPin className="w-3 h-3" />
                              <span>{project.community || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium mb-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                            Budget
                          </p>
                          <p className="text-lg font-bold" style={{ color: COMP_COLORS[componentModal.key] }}>
                            {project.amountFunded ? fmt(project.amountFunded) : 'Not Specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex items-center justify-between" style={{
              background: darkMode ? '#0f172a' : '#f8fafc',
              borderColor: darkMode ? '#334155' : '#e2e8f0'
            }}>
              <p className="text-sm font-medium" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Total: {componentModal.count} projects • {componentModal.percentage}% of portfolio
              </p>
              <button
                onClick={() => setComponentModal(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${COMP_COLORS[componentModal.key]}, ${COMP_COLORS[componentModal.key]}dd)`,
                  color: '#ffffff'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
