import { useState } from "react";
import { Plus, FileText, Package, TrendingUp, MapPin, Building2, Users, Calendar, X, Search, Filter, Eye, Trash2 } from "lucide-react";
import { COMP_COLORS, COMPONENTS } from "../../shared/constants";
import { AddProjectEquipmentModal } from "../../components/forms/AddProjectEquipmentModalFixed";
import { transformProjects, transformEquipmentList } from "../../shared/utils/dataTransform";
import { HoverTooltip } from "../../components/ui/Tooltip";
import { safeString, safeProjectTitle, safeEquipmentName, safeDisplayName } from "../../shared/utils/safeRender";
import { Modal, ModalPanel } from "../../components/ui/Modal";

// Region II (Cagayan Valley) Provinces
const REGION_II_PROVINCES = [
  'Batanes',
  'Cagayan', 
  'Isabela',
  'Nueva Vizcaya',
  'Quirino'
];

export const DataEntryPage = ({ projects = [], equipment = [], onAddProject, onAddEquipment, onDeleteProject, onDeleteEquipment, onUpdateProject, onUpdateEquipment, darkMode, isLoading = false, readOnly = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeView, setActiveView] = useState('combined');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterProvince, setFilterProvince] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState(null); // { item, type }

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center animate-pulse" style={{
            background: darkMode ? 'rgba(0, 74, 152, 0.1)' : 'rgba(0, 74, 152, 0.05)'
          }}>
            <FileText className="w-8 h-8" style={{ color: '#004A98' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
            Loading Data...
          </h3>
          <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
            Please wait while we fetch your projects and equipment
          </p>
        </div>
      </div>
    );
  }

  // Transform data to handle Supabase structure
  const transformedProjects = transformProjects(projects || []);
  const transformedEquipment = transformEquipmentList(equipment || []);

  const handleViewDetails = (item, index) => {
    const itemWithDisplayId = {
      ...item,
      displayId: (item.project_title || item.project) ? `Project #${index + 1}` : `Equipment #${index + 1}`
    };
    setSelectedItem(itemWithDisplayId);
    setShowDetailModal(true);
  };

  // Helper function to determine province from municipality
  const getProvinceFromMunicipality = (municipality) => {
    // Handle both direct municipality name and municipality object with name property
    const municipalityName = typeof municipality === 'string' ? municipality : municipality?.name;
    if (!municipalityName) return 'Cagayan';
    
    // Province mapping based on municipalities
    const provinceMapping = {
      // Cagayan
      'Abulug': 'Cagayan', 'Alcala': 'Cagayan', 'Allacapan': 'Cagayan', 'Amulung': 'Cagayan', 
      'Aparri': 'Cagayan', 'Baggao': 'Cagayan', 'Ballesteros': 'Cagayan', 'Buguey': 'Cagayan', 
      'Calayan': 'Cagayan', 'Camalaniugan': 'Cagayan', 'Claveria': 'Cagayan', 'Enrile': 'Cagayan', 
      'Gattaran': 'Cagayan', 'Gonzaga': 'Cagayan', 'Iguig': 'Cagayan', 'Lal-lo': 'Cagayan', 
      'Lasam': 'Cagayan', 'Pamplona': 'Cagayan', 'Peñablanca': 'Cagayan', 'Piat': 'Cagayan', 
      'Rizal': 'Cagayan', 'Sanchez-Mira': 'Cagayan', 'Santa Ana': 'Cagayan', 'Santa Praxedes': 'Cagayan', 
      'Santa Teresita': 'Cagayan', 'Santo Niño': 'Cagayan', 'Solana': 'Cagayan', 'Tuao': 'Cagayan', 
      'Tuguegarao City': 'Cagayan',
      
      // Isabela
      'Alicia': 'Isabela', 'Angadanan': 'Isabela', 'Aurora': 'Isabela', 'Benito Soliven': 'Isabela', 
      'Burgos': 'Isabela', 'Cabagan': 'Isabela', 'Cabatuan': 'Isabela', 'City of Cauayan': 'Isabela', 
      'Cordon': 'Isabela', 'Delfin Albano': 'Isabela', 'Dinapigue': 'Isabela', 'Divilacan': 'Isabela', 
      'Echague': 'Isabela', 'Gamu': 'Isabela', 'City of Ilagan': 'Isabela', 'Jones': 'Isabela', 
      'Luna': 'Isabela', 'Maconacon': 'Isabela', 'Mallig': 'Isabela', 'Naguilian': 'Isabela', 
      'Palanan': 'Isabela', 'Quezon': 'Isabela', 'Quirino': 'Isabela', 'Ramon': 'Isabela', 
      'Reina Mercedes': 'Isabela', 'Roxas': 'Isabela', 'San Agustin': 'Isabela', 'San Guillermo': 'Isabela', 
      'San Isidro': 'Isabela', 'San Manuel': 'Isabela', 'San Mariano': 'Isabela', 'San Mateo': 'Isabela', 
      'San Pablo': 'Isabela', 'Santa Maria': 'Isabela', 'City of Santiago': 'Isabela', 'Santo Tomas': 'Isabela', 
      'Tumauini': 'Isabela',
      
      // Add more provinces as needed - this is a basic mapping for Region II
      // You can extend this with other regions' municipalities
    };
    
    return provinceMapping[municipalityName] || 'Cagayan'; // Default to Cagayan
  };

  // Create combined project-equipment groups with filtering
  const createCombinedGroups = () => {
    const groups = [];
    
    // Filter projects first
    const filteredProjectsForCombined = transformedProjects.filter(p => {
      if (!p) return false;
      const matchesSearch = !searchTerm || 
        (p.project && p.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.project_title && p.project_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.municipality && p.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.community && p.community.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      
      // Province filtering - use database province if available, otherwise determine from municipality
      let itemProvince = p.province || getProvinceFromMunicipality(p.municipality);
      const matchesProvince = filterProvince === 'All' || itemProvince === filterProvince;
      
      return matchesSearch && matchesStatus && matchesProvince;
    });
    
    // Add projects with their linked equipment
    filteredProjectsForCombined.forEach((project, projectIndex) => {
      const projectEquipment = transformedEquipment.filter(eq => {
        // First check if equipment is linked to this project
        const projectTitle = safeProjectTitle(project);
        const equipmentProjectTitle = safeProjectTitle(eq);
        
        const isLinkedToProject = (
          // Link by project_id (most reliable)
          (eq.project_id && project.id && String(eq.project_id) === String(project.id)) ||
          // Link by matching project titles (direct comparison)
          (projectTitle && eq.project_title && projectTitle === eq.project_title) ||
          // Link by matching project titles (transformed)
          (projectTitle && equipmentProjectTitle && projectTitle === equipmentProjectTitle) ||
          // Legacy linking methods
          (eq.projectName === projectTitle) ||
          (eq.project?.project_title === projectTitle)
        );
        
        if (!isLinkedToProject) return false;
        
        // Then apply search filter to equipment
        const matchesSearch = !searchTerm || 
          (eq.equipmentName && eq.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (eq.equipment_name && eq.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (eq.municipality && eq.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (eq.community && eq.community.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch;
      });
      
      // Debug logging
      console.log('Checking equipment link for project:', {
        projectTitle: safeProjectTitle(project),
        projectId: project.id,
        linkedEquipmentCount: projectEquipment.length,
        equipmentDetails: projectEquipment.map(eq => ({
          name: eq.equipment_name,
          project_id: eq.project_id,
          project_title: eq.project_title
        }))
      });
      
      groups.push({
        type: 'project-group',
        project: project,
        equipment: projectEquipment,
        projectIndex: projectIndex
      });
    });
    
    // REMOVED: No more standalone equipment section
    // All equipment should be linked to projects
    
    console.log('Combined groups created:', groups);
    return groups;
  };

  const combinedGroups = createCombinedGroups();
  
  // Debug logging for combined groups
  console.log('Combined groups summary:', {
    totalGroups: combinedGroups.length,
    projectGroups: combinedGroups.filter(g => g.type === 'project-group').length,
    totalEquipmentLinked: combinedGroups
      .filter(g => g.type === 'project-group')
      .reduce((sum, g) => sum + g.equipment.length, 0),
    equipmentDetails: combinedGroups.map(g => ({
      projectTitle: g.project ? safeProjectTitle(g.project) : 'No Project',
      equipmentCount: g.equipment.length,
      equipmentNames: g.equipment.map(eq => eq.equipment_name || eq.equipmentName)
    }))
  });

  // Calculate statistics
  const totalProjects = transformedProjects.length;
  const totalEquipment = transformedEquipment.length;
  const uniqueCommunities = new Set(transformedProjects.map(p => p.community)).size;
  const uniqueMunicipalities = new Set([
    ...transformedProjects.map(p => p.municipality),
    ...transformedEquipment.map(e => e.municipality)
  ]).size;
  const totalBudget = transformedProjects.reduce((sum, p) => sum + (parseFloat(p.amountFunded) || 0), 0);

  // Filter data
  const filteredProjects = transformedProjects.filter(p => {
    if (!p) return false;
    const matchesSearch = !searchTerm || 
      (p.project && p.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.project_title && p.project_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.municipality && p.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.community && p.community.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    
    // Province filtering - use database province if available, otherwise determine from municipality
    let itemProvince = p.province || getProvinceFromMunicipality(p.municipality);
    const matchesProvince = filterProvince === 'All' || itemProvince === filterProvince;
    
    return matchesSearch && matchesStatus && matchesProvince;
  });

  const filteredEquipment = transformedEquipment.filter(e => {
    if (!e) return false;
    const matchesSearch = !searchTerm || 
      (e.equipmentName && e.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.equipment_name && e.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.municipality && e.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.community && e.community.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Province filtering - use database province if available, otherwise determine from municipality
    let itemProvince = e.province || getProvinceFromMunicipality(e.municipality);
    const matchesProvince = filterProvince === 'All' || itemProvince === filterProvince;
    
    return matchesSearch && matchesProvince;
  });

  const fmt = (amount) => {
    if (!amount || amount === 0) return '₱0';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cardStyle = {
    background: darkMode 
      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
    boxShadow: darkMode 
      ? '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 20px 60px rgba(0, 74, 152, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
  };

  const getStatusColor = (status) => {
    if (status === "Ongoing") return darkMode 
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (status === "Liquidated") return darkMode 
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-amber-700 bg-amber-50 border-amber-200";
    return darkMode 
      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
      : "text-blue-700 bg-blue-50 border-blue-200";
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-4 mb-4 p-6 rounded-2xl" style={{
          background: darkMode ? 'rgba(0, 74, 152, 0.1)' : 'rgba(0, 74, 152, 0.05)',
          border: `2px solid ${darkMode ? 'rgba(0, 74, 152, 0.2)' : 'rgba(0, 74, 152, 0.1)'}`
        }}>
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)' }}>
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Data Entry Portal
            </h1>
            <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              Manage CEST 2.0 projects and equipment records
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Projects", value: totalProjects, icon: FileText, color: "#004A98" },
          { label: "Equipment Items", value: totalEquipment, icon: Package, color: "#10b981" },
          { label: "Municipalities", value: uniqueMunicipalities, icon: Building2, color: "#8b5cf6" },
          { label: "Communities", value: uniqueCommunities, icon: Users, color: "#f59e0b" },
          { label: "Total Budget", value: fmt(totalBudget), icon: TrendingUp, color: "#ef4444" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label}
              className="group rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={cardStyle}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:w-80">
          <div className="rounded-2xl p-4" style={cardStyle}>
            <div className="space-y-2">
              {[
                { id: 'combined', label: 'Projects & Equipment', icon: TrendingUp, count: totalProjects + totalEquipment, description: 'Unified view' },
                { id: 'overview', label: 'Overview', icon: TrendingUp, count: totalProjects + totalEquipment, description: 'All records' },
                { id: 'projects', label: 'Projects Only', icon: FileText, count: totalProjects, description: 'Project records' },
                { id: 'equipment', label: 'Equipment Only', icon: Package, count: totalEquipment, description: 'Equipment records' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                      isActive ? 'shadow-lg' : 'hover:scale-102'
                    }`}
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)'
                        : darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.5)',
                      color: isActive ? '#ffffff' : (darkMode ? '#f8fafc' : '#0f172a'),
                      border: `1px solid ${isActive ? '#004A98' : (darkMode ? '#334155' : '#e2e8f0')}`
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{tab.label}</p>
                      <p className={`text-xs ${isActive ? 'text-blue-100' : 'opacity-60'}`}>
                        {tab.description} • {tab.count} items
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          {!readOnly && (
          <div className="mt-4 rounded-2xl p-4" style={cardStyle}>
            <h3 className="text-lg font-bold mb-4" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Quick Actions
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff'
              }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add New Record</span>
            </button>
          </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="rounded-2xl p-6" style={cardStyle}>
            {activeView === 'combined' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Projects & Equipment
                    </h2>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Unified view showing projects with their linked equipment • Default view
                    </p>
                  </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Search projects and equipment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                      style={{
                        background: darkMode ? '#1e293b' : '#f8fafc',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      }}
                    />
                  </div>
                  <select
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                    style={{
                      background: darkMode ? '#1e293b' : '#f8fafc',
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    <option value="All">All Provinces</option>
                    {REGION_II_PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                    style={{
                      background: darkMode ? '#1e293b' : '#f8fafc',
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    <option value="All">All Status</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Liquidated">Liquidated</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>

                {/* Combined Groups */}
                <div className="space-y-6">
                  {combinedGroups.map((group, groupIndex) => (
                    <div key={`group-${groupIndex}`} className="space-y-3">
                      {/* Project Header (if exists) */}
                      {group.project && (
                        <div
                          onClick={() => handleViewDetails(group.project, group.projectIndex)}
                          className="p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-102 cursor-pointer"
                          style={{
                            background: darkMode ? '#1e293b' : '#ffffff',
                            borderColor: darkMode ? '#334155' : '#e2e8f0',
                            borderLeft: '4px solid #004A98'
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#004A98', color: '#ffffff' }}>
                                  {group.project.year || 'N/A'}
                                </span>
                                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#10b981', color: '#ffffff' }}>
                                  Project #{group.projectIndex + 1}
                                </span>
                              </div>
                              <h4 className="text-lg font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                {safeProjectTitle(group.project) || 'Untitled Project'}
                              </h4>
                              <div className="flex items-center gap-3 text-sm mb-3" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="font-semibold">{group.project.municipality || 'Unknown Location'}</span>
                                </div>
                                <span>•</span>
                                <span className="font-semibold">{group.project.community || 'N/A'}</span>
                                <span>•</span>
                                <span className="font-bold text-green-600">₱{(group.project.amountFunded || 0).toLocaleString()}</span>
                              </div>
                              
                              {/* Project Components */}
                              {group.project.components && group.project.components.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {group.project.components.slice(0, 3).map((c, i) => {
                                    const componentKey = typeof c === 'object' ? c.id || c.component?.id || c : c;
                                    const componentName = typeof c === 'object' ? c.name || c.component?.name || componentKey : componentKey;
                                    return (
                                      <HoverTooltip
                                        key={`${componentKey}-${i}`}
                                        content={COMPONENTS[componentKey] || componentName}
                                        position="auto"
                                        darkMode={darkMode}
                                        delay={150}
                                      >
                                        <span 
                                          className="text-xs font-medium px-2 py-1 rounded-lg cursor-help" 
                                          style={{ 
                                            background: `${COMP_COLORS[componentKey] || '#64748b'}20`,
                                            color: COMP_COLORS[componentKey] || '#64748b',
                                            border: `1px solid ${COMP_COLORS[componentKey] || '#64748b'}40`
                                          }}
                                        >
                                          {String(componentKey)?.toUpperCase() || 'N/A'}
                                        </span>
                                      </HoverTooltip>
                                    );
                                  })}
                                  {group.project.components.length > 3 && (
                                    <span className="text-xs px-2 py-1 rounded-lg" style={{ 
                                      background: darkMode ? '#374151' : '#f3f4f6',
                                      color: darkMode ? '#9ca3af' : '#6b7280'
                                    }}>
                                      +{group.project.components.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {!readOnly && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete({ item: group.project, type: 'project' }); }}
                              className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                              title="Move to Archive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Equipment List */}
                      {group.equipment.length > 0 && (
                        <div className="ml-6 space-y-2">
                          {group.equipment.map((item, equipIndex) => (
                            <div
                              key={`equipment-${item.id}-${equipIndex}`}
                              onClick={() => handleViewDetails(item, equipIndex)}
                              className="p-3 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-101 cursor-pointer"
                              style={{
                                background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                                borderColor: darkMode ? '#475569' : '#d1d5db',
                                borderLeft: '3px solid #10b981'
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#10b981', color: '#ffffff' }}>
                                      {item.year || 'N/A'}
                                    </span>
                                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#f59e0b', color: '#ffffff' }}>
                                      Equipment #{equipIndex + 1}
                                    </span>
                                  </div>
                                  <h5 className="text-sm font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                    {safeEquipmentName(item) || 'Untitled Equipment'}
                                  </h5>
                                  <div className="flex items-center gap-3 text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span className="font-semibold">{item.municipality || 'Unknown Location'}</span>
                                    </div>
                                    <span>•</span>
                                    <span className="font-semibold">{item.community || 'N/A'}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      <span className="font-semibold">{item.units || 0} units</span>
                                    </div>
                                  </div>
                                </div>
                                {!readOnly && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDelete({ item, type: 'equipment' }); }}
                                  className="p-1 rounded transition-all duration-200 hover:scale-110 flex-shrink-0"
                                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                  title="Move to Archive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* No Equipment Message */}
                      {group.project && group.equipment.length === 0 && (
                        <div className="ml-6 p-3 rounded-lg text-center" style={{
                          background: darkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.05)',
                          border: `1px dashed ${darkMode ? '#4b5563' : '#9ca3af'}`
                        }}>
                          <p className="text-xs" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            No equipment linked to this project yet
                          </p>
                          <p className="text-xs mt-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                            Add equipment with matching project title to link them
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty State */}
                  {combinedGroups.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                        background: darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.05)'
                      }}>
                        {searchTerm || filterStatus !== 'All' || filterProvince !== 'All' ? (
                          <Search className="w-8 h-8" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                        ) : (
                          <FileText className="w-8 h-8" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        {searchTerm || filterStatus !== 'All' || filterProvince !== 'All' ? 
                          'No results found' : 
                          'No projects or equipment yet'
                        }
                      </h3>
                      <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                        {searchTerm || filterStatus !== 'All' || filterProvince !== 'All' ? 
                          'Try adjusting your search or filter criteria' : 
                          'No records available to display'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'overview' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Database Overview
                    </h2>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Complete view of all records ({totalProjects + totalEquipment} total)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                    background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`
                  }}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold" style={{ color: '#10b981' }}>
                      Live Data
                    </span>
                  </div>
                </div>

                {totalProjects === 0 && totalEquipment === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)'
                    }}>
                      <FileText className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      No Data Available
                    </h3>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      There are no records to display at this time
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Search & Filter */}
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                        <input
                          type="text"
                          placeholder="Search records..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                          style={{
                            background: darkMode ? '#1e293b' : '#f8fafc',
                            color: darkMode ? '#f8fafc' : '#0f172a',
                            border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                          }}
                        />
                      </div>
                      <select
                        value={filterProvince}
                        onChange={(e) => setFilterProvince(e.target.value)}
                        className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                        style={{
                          background: darkMode ? '#1e293b' : '#f8fafc',
                          color: darkMode ? '#f8fafc' : '#0f172a',
                          border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                        }}
                      >
                        <option value="All">All Provinces</option>
                        {REGION_II_PROVINCES.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                        style={{
                          background: darkMode ? '#1e293b' : '#f8fafc',
                          color: darkMode ? '#f8fafc' : '#0f172a',
                          border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                        }}
                      >
                        <option value="All">All Status</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Liquidated">Liquidated</option>
                        <option value="Finished">Finished</option>
                      </select>
                    </div>

                    {/* Debug Info */}
                    <div className="p-4 rounded-xl" style={{ 
                      background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                      border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
                    }}>
                      <p className="text-sm font-medium" style={{ color: '#3b82f6' }}>
                        📊 Data Status: {totalProjects} projects, {totalEquipment} equipment items loaded
                      </p>
                      <p className="text-xs mt-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                        Filtered: {filteredProjects.length} projects, {filteredEquipment.length} equipment
                      </p>
                    </div>

                    {/* Projects Section */}
                    {filteredProjects.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          <FileText className="w-5 h-5" style={{ color: '#004A98' }} />
                          Projects ({filteredProjects.length})
                        </h3>
                        <div className="space-y-3">
                          {filteredProjects.slice(0, 10).map((project, index) => (
                            <div
                              key={`project-${project.id}-${index}`}
                              onClick={() => handleViewDetails(project, index)}
                              className="p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-102 cursor-pointer"
                              style={{
                                background: darkMode ? '#1e293b' : '#ffffff',
                                borderColor: darkMode ? '#334155' : '#e2e8f0'
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#004A98', color: '#ffffff' }}>
                                      {project.year || 'N/A'}
                                    </span>
                                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#10b981', color: '#ffffff' }}>
                                      Project #{index + 1}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                    {safeProjectTitle(project) || 'Untitled Project'}
                                  </h4>
                                  <div className="flex items-center gap-3 text-xs mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span className="font-semibold">{project.municipality || 'Unknown Location'}</span>
                                    </div>
                                    <span>•</span>
                                    <span className="font-semibold">{project.community || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(project.status || 'Unknown')}`}>
                                      {project.status || 'Unknown'}
                                    </span>
                                    {(project.components || []).slice(0, 3).map((c, compIndex) => {
                                      const componentKey = typeof c === 'object' ? c.id || c.component?.id || c : c;
                                      return (
                                        <span 
                                          key={`${project.id}-comp-${compIndex}`}
                                          className="text-xs font-medium px-2 py-1 rounded"
                                          style={{
                                            backgroundColor: `${COMP_COLORS[componentKey] || '#64748b'}20`,
                                            color: COMP_COLORS[componentKey] || '#64748b'
                                          }}
                                        >
                                          {String(componentKey)?.toUpperCase() || 'N/A'}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <p className="text-lg font-bold" style={{ color: '#10b981' }}>
                                    {fmt(project.amountFunded || 0)}
                                  </p>
                                  {!readOnly && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete({ item: project, type: 'project' }); }}
                                    className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                    title="Move to Archive"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Equipment Section */}
                    {filteredEquipment.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          <Package className="w-5 h-5" style={{ color: '#10b981' }} />
                          Equipment ({filteredEquipment.length})
                        </h3>
                        <div className="space-y-3">
                          {filteredEquipment.slice(0, 10).map((item, index) => (
                            <div
                              key={`equipment-${item.id}-${index}`}
                              onClick={() => handleViewDetails(item, index)}
                              className="p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-102 cursor-pointer"
                              style={{
                                background: darkMode ? '#1e293b' : '#ffffff',
                                borderColor: darkMode ? '#334155' : '#e2e8f0'
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#10b981', color: '#ffffff' }}>
                                      {item.year || 'N/A'}
                                    </span>
                                    <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#f59e0b', color: '#ffffff' }}>
                                      Equipment #{index + 1}
                                    </span>
                                  </div>
                                  
                                  {/* Project Name Label */}
                                  {(item.projectName || item.project?.project_title || item.project_title) && (
                                    <div className="mb-2">
                                      <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ 
                                        background: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)', 
                                        color: '#8b5cf6',
                                        border: '1px solid rgba(139, 92, 246, 0.3)'
                                      }}>
                                        📁 {safeProjectTitle(item) || 'Unknown Project'}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <h4 className="text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                    {item.equipment_name || item.equipmentName || 'Untitled Equipment'}
                                  </h4>
                                  <div className="flex items-center gap-3 text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span className="font-semibold">{item.municipality || 'Unknown Location'}</span>
                                    </div>
                                    <span>•</span>
                                    <span className="font-semibold">{item.community || 'N/A'}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      <span className="font-semibold">{item.units || 0} units</span>
                                    </div>
                                  </div>
                                </div>
                                {!readOnly && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmDelete({ item, type: 'equipment' }); }}
                                  className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                  title="Move to Archive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Results Message */}
                    {filteredProjects.length === 0 && filteredEquipment.length === 0 && (totalProjects > 0 || totalEquipment > 0) && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                          background: darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.05)'
                        }}>
                          <Search className="w-8 h-8" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          No results found
                        </h3>
                        <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeView === 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Projects ({filteredProjects.length})
                    </h2>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Manage all CEST 2.0 project records
                    </p>
                  </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                      style={{
                        background: darkMode ? '#1e293b' : '#f8fafc',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      }}
                    />
                  </div>
                  <select
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                    style={{
                      background: darkMode ? '#1e293b' : '#f8fafc',
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    <option value="All">All Provinces</option>
                    {REGION_II_PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                    style={{
                      background: darkMode ? '#1e293b' : '#f8fafc',
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    <option value="All">All Status</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Liquidated">Liquidated</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>

                {/* Projects List */}
                {filteredProjects.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProjects.map((project, index) => (
                      <div
                        key={`project-${project.id}-${index}`}
                        onClick={() => handleViewDetails(project, index)}
                        className="p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-102 cursor-pointer"
                        style={{
                          background: darkMode ? '#1e293b' : '#ffffff',
                          borderColor: darkMode ? '#334155' : '#e2e8f0'
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#004A98', color: '#ffffff' }}>
                                {project.year || 'N/A'}
                              </span>
                              <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#10b981', color: '#ffffff' }}>
                                Project #{index + 1}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                              {safeProjectTitle(project) || 'Untitled Project'}
                            </h4>
                            <div className="flex items-center gap-3 text-xs mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="font-semibold">{project.municipality || 'Unknown Location'}</span>
                              </div>
                              <span>•</span>
                              <span className="font-semibold">{project.community || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(project.status || 'Unknown')}`}>
                                {project.status || 'Unknown'}
                              </span>
                              {(project.components || []).slice(0, 3).map((c, compIndex) => {
                                const componentKey = typeof c === 'object' ? c.id || c.component?.id || c : c;
                                return (
                                  <span 
                                    key={`${project.id}-comp-${compIndex}`}
                                    className="text-xs font-medium px-2 py-1 rounded"
                                    style={{
                                      backgroundColor: `${COMP_COLORS[componentKey] || '#64748b'}20`,
                                      color: COMP_COLORS[componentKey] || '#64748b'
                                    }}
                                  >
                                    {String(componentKey)?.toUpperCase() || 'N/A'}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold" style={{ color: '#10b981' }}>
                              {fmt(project.amountFunded || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: darkMode ? '#64748b' : '#9ca3af' }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      No projects found
                    </h3>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      {searchTerm || filterStatus !== 'All' ? 'Try adjusting your search or filter' : 'No project records available'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Equipment Tab */}
            {activeView === 'equipment' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Equipment ({filteredEquipment.length})
                    </h2>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Manage all equipment inventory
                    </p>
                  </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                      style={{
                        background: darkMode ? '#1e293b' : '#f8fafc',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                      }}
                    />
                  </div>
                  <select
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                    style={{
                      background: darkMode ? '#1e293b' : '#f8fafc',
                      color: darkMode ? '#f8fafc' : '#0f172a',
                      border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    }}
                  >
                    <option value="All">All Provinces</option>
                    {REGION_II_PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>

                {/* Equipment List */}
                {filteredEquipment.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEquipment.map((item, index) => (
                      <div
                        key={`equipment-${item.id}-${index}`}
                        onClick={() => handleViewDetails(item, index)}
                        className="p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-102 cursor-pointer"
                        style={{
                          background: darkMode ? '#1e293b' : '#ffffff',
                          borderColor: darkMode ? '#334155' : '#e2e8f0'
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#10b981', color: '#ffffff' }}>
                                {item.year || 'N/A'}
                              </span>
                              <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#f59e0b', color: '#ffffff' }}>
                                Equipment #{index + 1}
                              </span>
                            </div>
                            
                            {/* Project Name Label */}
                            {(item.projectName || item.project?.project_title || item.project_title) && (
                              <div className="mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ 
                                  background: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)', 
                                  color: '#8b5cf6',
                                  border: '1px solid rgba(139, 92, 246, 0.3)'
                                }}>
                                  📁 {safeProjectTitle(item) || 'Unknown Project'}
                                </span>
                              </div>
                            )}
                            
                            <h4 className="text-sm font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                              {safeEquipmentName(item) || 'Untitled Equipment'}
                            </h4>
                            <div className="flex items-center gap-3 text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="font-semibold">{item.municipality || 'Unknown Location'}</span>
                              </div>
                              <span>•</span>
                              <span className="font-semibold">{item.community || 'N/A'}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                <span className="font-semibold">{item.units || 0} units</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4" style={{ color: darkMode ? '#64748b' : '#9ca3af' }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      No equipment found
                    </h3>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      {searchTerm ? 'Try adjusting your search' : 'No equipment records available'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)} zIndex={10001}>
          <ModalPanel maxWidth="max-w-sm">
          <div className="rounded-2xl p-6 shadow-2xl" style={{
            background: darkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <Trash2 className="w-6 h-6" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>Move to Archive?</h3>
                <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>This can be restored from the Archive page</p>
              </div>
            </div>
            <p className="text-sm mb-6 p-3 rounded-xl" style={{ background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#94a3b8' : '#64748b' }}>
              "{safeDisplayName(confirmDelete.item)}"
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{ background: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#94a3b8' : '#64748b' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === 'project') onDeleteProject(confirmDelete.item);
                  else onDeleteEquipment(confirmDelete.item);
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                Move to Archive
              </button>
            </div>
          </div>
          </ModalPanel>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <AddProjectEquipmentModal
          onClose={() => { setShowEditModal(false); setEditItem(null); }}
          onSaveProject={async (data) => {
            console.log('Edit modal - saving project with data:', data);
            console.log('Edit modal - editItem.id:', editItem.id);
            if (onUpdateProject) {
              await onUpdateProject(editItem.id, data);
              console.log('Edit modal - project update completed');
            }
            setShowEditModal(false); setEditItem(null);
          }}
          onSaveEquipment={async (data) => {
            console.log('Edit modal - saving equipment with data:', data);
            console.log('Edit modal - editItem.id:', editItem.id);
            if (onUpdateEquipment) {
              await onUpdateEquipment(editItem.id, data);
              console.log('Edit modal - equipment update completed');
            }
            setShowEditModal(false); setEditItem(null);
          }}
          darkMode={darkMode}
          initialData={editItem}
        />
      )}
      {showModal && (
        <AddProjectEquipmentModal
          onClose={() => setShowModal(false)}
          onSaveProject={onAddProject}
          onSaveEquipment={onAddEquipment}
          darkMode={darkMode}
        />
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
          <Modal onClose={() => setShowDetailModal(false)} zIndex={9999} className="bg-black/80 backdrop-blur-md">
            <ModalPanel maxWidth="max-w-4xl" className="rounded-3xl shadow-2xl overflow-y-auto">
            <div
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
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2DD4BF 50%, #10B981 100%)',
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
                          <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border-2 inline-block ${getStatusColor(selectedItem.status)}`}>
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
                          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
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

                {/* EQUIPMENT INFORMATION SECTION (for equipment items) */}
                {!isProject && (
                  <div className="space-y-6">
                    {/* Section Header */}
                    <div className="pb-3 border-b" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                      <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Equipment Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Total Units */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                          Total Units
                        </label>
                        <div className="px-4 py-3 rounded-lg" style={{ 
                          background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                        }}>
                          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                            {selectedItem.units || 0}
                          </p>
                        </div>
                      </div>

                      {/* Units Per Year */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                          Units Per Year
                        </label>
                        <div className="px-4 py-3 rounded-lg" style={{ 
                          background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                        }}>
                          <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>
                            {selectedItem.units_per_year || selectedItem.unitsPerYear || 'Not Specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CEST COMPONENTS SECTION */}
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
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                        Equipment Details <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: '#10b98120', color: '#10b981' }}>
                          {linkedEquipment.length} item{linkedEquipment.length !== 1 ? 's' : ''}
                        </span>
                      </p>
                      <div className="space-y-3">
                        {linkedEquipment.map((eq, index) => (
                          <div 
                            key={`equipment-${eq.id}-${index}`}
                            className="p-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                            style={{
                              background: darkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
                              borderColor: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                              borderLeft: '3px solid #10b981'
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#10b981', color: '#ffffff' }}>
                                    {eq.year || 'N/A'}
                                  </span>
                                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#f59e0b', color: '#ffffff' }}>
                                    Equipment #{index + 1}
                                  </span>
                                </div>
                                <h5 className="text-sm font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                                  {safeEquipmentName(eq) || 'Untitled Equipment'}
                                </h5>
                                <div className="flex items-center gap-3 text-xs mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
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
                                <p className="text-xs font-medium mb-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                                  Total Units
                                </p>
                                <p className="text-lg font-bold" style={{ color: '#10b981' }}>
                                  {eq.units || 0}
                                </p>
                                {eq.units_per_year && (
                                  <p className="text-xs mt-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
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
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                      No. of Beneficiaries <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: '#004A9820', color: '#004A98' }}>Total: {benefTotal}</span>
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {[['Male', benef.male], ['Female', benef.female], ['IPs', benef.ips], ['4Ps', benef.fourps], ['PWD', benef.pwd], ['Senior', benef.senior]].map(([label, val]) => (
                        <div key={label} className="text-center p-2 rounded-xl" style={{ background: darkMode ? '#1e293b' : '#f1f5f9' }}>
                          <p className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{val || 0}</p>
                          <p className="text-xs" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Community Types */}
                {isProject && communities.length > 0 && (
                  <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>Community Types</p>
                    <div className="flex flex-wrap gap-2">
                      {communities.map((c, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize"
                          style={{ background: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#94a3b8' : '#475569' }}>
                          🏘️ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachment */}
                {selectedItem.file_name && selectedItem.file_data && (
                  <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>Attachment</p>
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: darkMode ? '#1e293b' : '#f1f5f9' }}>
                      <FileText className="w-8 h-8 flex-shrink-0" style={{ color: '#ef4444' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{selectedItem.file_name}</p>
                        <p className="text-xs" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>PDF Document</p>
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

              {/* Footer with Edit button — inside modal */}
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
                {!readOnly && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setEditItem(selectedItem);
                    setShowEditModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #004A98, #0066CC)', boxShadow: '0 4px 12px rgba(0,74,152,0.35)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Details
                </button>
                )}
              </div>
            </div>
          </ModalPanel>
        </Modal>
        );
      })()}
    </div>
  );
};

export default DataEntryPage;