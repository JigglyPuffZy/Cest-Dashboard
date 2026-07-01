import { useState } from "react";
import { Plus, FileText, Package, TrendingUp, MapPin, Building2, Users, Calendar, X, Search, Filter, Eye, Trash2 } from "lucide-react";
import { COMP_COLORS, COMPONENTS } from "../../shared/constants";
import { AddProjectEquipmentModal } from "../../components/forms/AddProjectEquipmentModalFixed";
import { transformProjects, transformEquipmentList } from "../../shared/utils/dataTransform";
import { HoverTooltip } from "../../components/ui/Tooltip";
import { safeProjectTitle, safeEquipmentName, safeDisplayName } from "../../shared/utils/safeRender";
import { Modal, ModalPanel } from "../../components/ui/Modal";
import { DataEntryFilters, ProjectRecordCard, EquipmentRecordCard } from "../../components/data-entry/RecordCards";

export const DataEntryPage = ({ projects = [], equipment = [], onAddProject, onSaveProjectBundle, onAddEquipment, onDeleteProject, onDeleteEquipment, onUpdateProject, onUpdateEquipment, darkMode, isLoading = false, readOnly = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeView, setActiveView] = useState('combined');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterProvince, setFilterProvince] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState(null); 

  
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

  
  const getProvinceFromMunicipality = (municipality) => {
    
    const municipalityName = typeof municipality === 'string' ? municipality : municipality?.name;
    if (!municipalityName) return 'Cagayan';
    
    
    const provinceMapping = {
      
      'Abulug': 'Cagayan', 'Alcala': 'Cagayan', 'Allacapan': 'Cagayan', 'Amulung': 'Cagayan', 
      'Aparri': 'Cagayan', 'Baggao': 'Cagayan', 'Ballesteros': 'Cagayan', 'Buguey': 'Cagayan', 
      'Calayan': 'Cagayan', 'Camalaniugan': 'Cagayan', 'Claveria': 'Cagayan', 'Enrile': 'Cagayan', 
      'Gattaran': 'Cagayan', 'Gonzaga': 'Cagayan', 'Iguig': 'Cagayan', 'Lal-lo': 'Cagayan', 
      'Lasam': 'Cagayan', 'Pamplona': 'Cagayan', 'Peñablanca': 'Cagayan', 'Piat': 'Cagayan', 
      'Rizal': 'Cagayan', 'Sanchez-Mira': 'Cagayan', 'Santa Ana': 'Cagayan', 'Santa Praxedes': 'Cagayan', 
      'Santa Teresita': 'Cagayan', 'Santo Niño': 'Cagayan', 'Solana': 'Cagayan', 'Tuao': 'Cagayan', 
      'Tuguegarao City': 'Cagayan',
      
      
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
      
      
      
    };
    
    return provinceMapping[municipalityName] || 'Cagayan'; 
  };

  
  const createCombinedGroups = () => {
    const groups = [];
    
    
    const filteredProjectsForCombined = transformedProjects.filter(p => {
      if (!p) return false;
      const matchesSearch = !searchTerm || 
        (p.project && p.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.project_title && p.project_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.municipality && p.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.community && p.community.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      
      
      let itemProvince = p.province || getProvinceFromMunicipality(p.municipality);
      const matchesProvince = filterProvince === 'All' || itemProvince === filterProvince;
      
      return matchesSearch && matchesStatus && matchesProvince;
    });
    
    
    filteredProjectsForCombined.forEach((project, projectIndex) => {
      const projectEquipment = transformedEquipment.filter(eq => {
        
        const projectTitle = safeProjectTitle(project);
        const equipmentProjectTitle = safeProjectTitle(eq);
        
        const isLinkedToProject = (
          
          (eq.project_id && project.id && String(eq.project_id) === String(project.id)) ||
          
          (projectTitle && eq.project_title && projectTitle === eq.project_title) ||
          
          (projectTitle && equipmentProjectTitle && projectTitle === equipmentProjectTitle) ||
          
          (eq.projectName === projectTitle) ||
          (eq.project?.project_title === projectTitle)
        );
        
        if (!isLinkedToProject) return false;
        
        
        const matchesSearch = !searchTerm || 
          (eq.equipmentName && eq.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (eq.equipment_name && eq.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (eq.municipality && eq.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (eq.community && eq.community.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch;
      });
      
      groups.push({
        type: 'project-group',
        project: project,
        equipment: projectEquipment,
        projectIndex: projectIndex
      });
    });
    
    return groups;
  };

  const combinedGroups = createCombinedGroups();

  
  const totalProjects = transformedProjects.length;
  const totalEquipment = transformedEquipment.length;
  const uniqueCommunities = new Set(transformedProjects.map(p => p.community)).size;
  const uniqueMunicipalities = new Set([
    ...transformedProjects.map(p => p.municipality),
    ...transformedEquipment.map(e => e.municipality)
  ]).size;
  const totalBudget = transformedProjects.reduce((sum, p) => sum + (parseFloat(p.amountFunded) || 0), 0);

  
  const filteredProjects = transformedProjects.filter(p => {
    if (!p) return false;
    const matchesSearch = !searchTerm || 
      (p.project && p.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.project_title && p.project_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.municipality && p.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.community && p.community.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    
    
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
    <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 w-full min-w-0">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 sm:mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 rounded-xl shrink-0" style={{ background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)' }}>
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Data Entry
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              Manage CEST 2.0 projects and equipment
            </p>
          </div>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 sm:hover:scale-[1.02] shrink-0"
            style={{
              background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 74, 152, 0.35)',
            }}
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        )}
      </div>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: "Total Projects", value: totalProjects, icon: FileText, color: "#004A98" },
          { label: "Equipment Items", value: totalEquipment, icon: Package, color: "#10b981" },
          { label: "Municipalities", value: uniqueMunicipalities, icon: Building2, color: "#8b5cf6" },
          { label: "Communities", value: uniqueCommunities, icon: Users, color: "#f59e0b" },
          { label: "Total Budget", value: fmt(totalBudget), icon: TrendingUp, color: "#ef4444", wide: true }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label}
              className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-200 sm:hover:shadow-lg ${stat.wide ? 'col-span-2 lg:col-span-1' : ''}`}
              style={cardStyle}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div 
                  className="p-2 sm:p-3 rounded-lg shrink-0"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-[11px] sm:text-sm font-medium mb-0.5 sm:mb-1 leading-tight" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                {stat.label}
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {}
        <div className="lg:w-72 shrink-0">
          <div className="rounded-xl p-2 sm:p-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-thin" style={cardStyle}>
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
                    className={`flex-shrink-0 lg:flex-shrink lg:w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                      isActive ? 'shadow-md' : 'opacity-90 hover:opacity-100'
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

        {}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={cardStyle}>
            {activeView === 'combined' && (
              <div>
                <div className="mb-4 sm:mb-5">
                  <h2 className="text-lg sm:text-xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    Projects & Equipment
                  </h2>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {combinedGroups.length} group{combinedGroups.length !== 1 ? 's' : ''} · projects with linked equipment
                  </p>
                </div>

                <DataEntryFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterProvince={filterProvince}
                  setFilterProvince={setFilterProvince}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  darkMode={darkMode}
                  placeholder="Search projects and equipment..."
                />

                <div className="space-y-4">
                  {combinedGroups.map((group, groupIndex) => (
                    <div key={`group-${groupIndex}`} className="space-y-2">
                      {group.project && (
                        <ProjectRecordCard
                          project={group.project}
                          index={group.projectIndex}
                          darkMode={darkMode}
                          readOnly={readOnly}
                          onView={() => handleViewDetails(group.project, group.projectIndex)}
                          onDelete={readOnly ? null : () => setConfirmDelete({ item: group.project, type: 'project' })}
                          fmt={fmt}
                          getStatusColor={getStatusColor}
                        />
                      )}

                      {group.equipment.length > 0 && (
                        <div className="space-y-2">
                          {group.equipment.map((item, equipIndex) => (
                            <EquipmentRecordCard
                              key={`equipment-${item.id}-${equipIndex}`}
                              item={item}
                              index={equipIndex}
                              darkMode={darkMode}
                              readOnly={readOnly}
                              nested
                              onView={() => handleViewDetails(item, equipIndex)}
                              onDelete={readOnly ? null : () => setConfirmDelete({ item, type: 'equipment' })}
                            />
                          ))}
                        </div>
                      )}

                      {group.project && group.equipment.length === 0 && (
                        <div className="sm:ml-4 p-3 rounded-lg text-center text-xs" style={{
                          background: darkMode ? 'rgba(107, 114, 128, 0.08)' : 'rgba(107, 114, 128, 0.04)',
                          border: `1px dashed ${darkMode ? '#475569' : '#cbd5e1'}`,
                          color: darkMode ? '#94a3b8' : '#64748b',
                        }}>
                          No equipment linked to this project
                        </div>
                      )}
                    </div>
                  ))}

                  {}
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-5">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Database Overview
                    </h2>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      {filteredProjects.length} projects · {filteredEquipment.length} equipment · {totalProjects + totalEquipment} total records
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0 self-start" style={{
                    background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`
                  }}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                      Live Data
                    </span>
                  </div>
                </div>

                {totalProjects === 0 && totalEquipment === 0 ? (
                  <div className="text-center py-16 sm:py-20">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)'
                    }}>
                      <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      No Data Available
                    </h3>
                    <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      There are no records to display at this time
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <DataEntryFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      filterProvince={filterProvince}
                      setFilterProvince={setFilterProvince}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      darkMode={darkMode}
                      placeholder="Search records..."
                    />

                    {filteredProjects.length > 0 && (
                      <div>
                        <h3 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#004A98' }} />
                          Projects ({filteredProjects.length})
                        </h3>
                        <div className="space-y-3">
                          {filteredProjects.map((project, index) => (
                            <ProjectRecordCard
                              key={`project-${project.id}-${index}`}
                              project={project}
                              index={index}
                              darkMode={darkMode}
                              readOnly={readOnly}
                              onView={() => handleViewDetails(project, index)}
                              onDelete={readOnly ? null : () => setConfirmDelete({ item: project, type: 'project' })}
                              fmt={fmt}
                              getStatusColor={getStatusColor}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredEquipment.length > 0 && (
                      <div>
                        <h3 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          <Package className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#10b981' }} />
                          Equipment ({filteredEquipment.length})
                        </h3>
                        <div className="space-y-3">
                          {filteredEquipment.map((item, index) => (
                            <EquipmentRecordCard
                              key={`equipment-${item.id}-${index}`}
                              item={item}
                              index={index}
                              darkMode={darkMode}
                              readOnly={readOnly}
                              onView={() => handleViewDetails(item, index)}
                              onDelete={readOnly ? null : () => setConfirmDelete({ item, type: 'equipment' })}
                            />
                          ))}
                        </div>
                      </div>
                    )}

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

            {}
            {activeView === 'projects' && (
              <div>
                <div className="mb-4 sm:mb-5">
                  <h2 className="text-lg sm:text-xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    Projects ({filteredProjects.length})
                  </h2>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Manage all CEST 2.0 project records
                  </p>
                </div>

                <DataEntryFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterProvince={filterProvince}
                  setFilterProvince={setFilterProvince}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  darkMode={darkMode}
                  placeholder="Search projects..."
                />

                {filteredProjects.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProjects.map((project, index) => (
                      <ProjectRecordCard
                        key={`project-${project.id}-${index}`}
                        project={project}
                        index={index}
                        darkMode={darkMode}
                        readOnly={readOnly}
                        onView={() => handleViewDetails(project, index)}
                        onDelete={readOnly ? null : () => setConfirmDelete({ item: project, type: 'project' })}
                        fmt={fmt}
                        getStatusColor={getStatusColor}
                      />
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

            {}
            {activeView === 'equipment' && (
              <div>
                <div className="mb-4 sm:mb-5">
                  <h2 className="text-lg sm:text-xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                    Equipment ({filteredEquipment.length})
                  </h2>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Manage all equipment inventory
                  </p>
                </div>

                <DataEntryFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterProvince={filterProvince}
                  setFilterProvince={setFilterProvince}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  darkMode={darkMode}
                  placeholder="Search equipment..."
                  showStatus={false}
                />

                {filteredEquipment.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEquipment.map((item, index) => (
                      <EquipmentRecordCard
                        key={`equipment-${item.id}-${index}`}
                        item={item}
                        index={index}
                        darkMode={darkMode}
                        readOnly={readOnly}
                        onView={() => handleViewDetails(item, index)}
                        onDelete={readOnly ? null : () => setConfirmDelete({ item, type: 'equipment' })}
                      />
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

      {}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
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

      {}
      {showEditModal && editItem && (
        <AddProjectEquipmentModal
          onClose={() => { setShowEditModal(false); setEditItem(null); }}
          onSaveProject={async (data) => {
            if (onUpdateProject) {
              await onUpdateProject(editItem.id, data);
            }
            setShowEditModal(false); setEditItem(null);
          }}
          onSaveEquipment={async (data) => {
            if (onUpdateEquipment) {
              await onUpdateEquipment(editItem.id, data);
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
          onSaveProjectBundle={onSaveProjectBundle}
          onSaveEquipment={onAddEquipment}
          darkMode={darkMode}
        />
      )}

      {}
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
          <Modal onClose={() => setShowDetailModal(false)} className="bg-black/80 backdrop-blur-md">
            <ModalPanel maxWidth="max-w-4xl" className="rounded-3xl shadow-2xl">
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
              {}
              <div className="relative p-8 rounded-t-3xl overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2DD4BF 50%, #10B981 100%)',
                  boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
                }}>
                {}
                <div className="absolute inset-0 opacity-10"
                  style={{ 
                    backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px)',
                    backgroundSize: '30px 30px',
                    animation: 'float 20s ease-in-out infinite'
                  }} />
                
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-5 flex-1">
                    {}
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

                {}
                {isProject && (
                  <div className="space-y-6">
                    {}
                    <div className="pb-3 border-b" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                      <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Project Information
                      </h3>
                    </div>

                    {}
                    <div className="space-y-4">
                      {}
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

                      {}
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

                      {}
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

                      {}
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

                      {}
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

                {}
                {isProject && (
                  <div className="space-y-6">
                    {}
                    <div className="pb-3 border-b" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                      <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Project Status & Partners
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {}
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

                      {}
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

                {}
                {isProject && (
                  <div className="space-y-6">
                    {}
                    <div className="pb-3 border-b" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                      <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Budget Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {}
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

                      {}
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

                {}
                {!isProject && (
                  <div className="space-y-6">
                    {}
                    <div className="pb-3 border-b" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                      <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Equipment Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {}
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

                      {}
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

                {}
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
                              {}
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

                {}
                {isProject && (() => {
                  
                  const projectTitle = safeProjectTitle(selectedItem);
                  const linkedEquipment = transformedEquipment.filter(eq => {
                    const isLinkedToProject = (
                      
                      (eq.project_id && selectedItem.id && String(eq.project_id) === String(selectedItem.id)) ||
                      
                      (projectTitle && eq.project_title && projectTitle === eq.project_title) ||
                      
                      (projectTitle && safeProjectTitle(eq) && projectTitle === safeProjectTitle(eq)) ||
                      
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
                                {}
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

                {}
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

                {}
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

                {}
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

              {}
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
