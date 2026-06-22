import { useState } from "react";
import { Calendar, CheckCircle, Clock, AlertCircle, TrendingUp, Filter, FileText, Package, MapPin, X, Eye } from "lucide-react";
import { fmt, getStatusColor } from "../../shared/utils/helpers";
import { COMPONENTS, COMP_COLORS } from "../../shared/constants";
import { transformProjects, transformEquipmentList } from "../../shared/utils/dataTransform";
import { HoverTooltip } from "../../components/ui/Tooltip";
import { safeString, safeProjectTitle, safeEquipmentName, safeDisplayName } from "../../shared/utils/safeRender";

export const MonitoringPage = ({ projects, equipment = [], darkMode }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [componentFilter, setComponentFilter] = useState("All");
  const [provinceFilter, setProvinceFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Transform projects data to handle Supabase structure
  const transformedProjects = transformProjects(projects);
  const transformedEquipment = transformEquipmentList(equipment || []);

  // Filter projects
  const filteredProjects = transformedProjects.filter((p) => {
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchComponent = componentFilter === "All" || p.components?.includes(componentFilter);
    const provinceName = typeof p.province === 'object' ? p.province?.name : p.province;
    const matchProvince = provinceFilter === "All" || provinceName === provinceFilter;
    const matchSearch = !searchTerm || 
      p.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.municipality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.community?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchComponent && matchProvince && matchSearch;
  });

  // Calculate statistics
  const stats = {
    total: transformedProjects.length,
    ongoing: transformedProjects.filter(p => p.status === "Ongoing").length,
    liquidated: transformedProjects.filter(p => p.status === "Liquidated").length,
    finished: transformedProjects.filter(p => p.status === "Finished").length,
  };

  const cardStyle = {
    background: darkMode ? '#0f172a' : '#ffffff',
    border: `1px solid ${darkMode ? '#1e293b' : '#e5e7eb'}`,
    boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
  };

  const getStatusColor = (status) => {
    if (status === "Ongoing") return { bg: darkMode ? "rgba(16, 185, 129, 0.1)" : "#f0fdf4", text: "#10b981", border: darkMode ? "rgba(16, 185, 129, 0.2)" : "#86efac" };
    if (status === "Liquidated") return { bg: darkMode ? "rgba(245, 158, 11, 0.1)" : "#fef3c7", text: "#f59e0b", border: darkMode ? "rgba(245, 158, 11, 0.2)" : "#fcd34d" };
    return { bg: darkMode ? "rgba(59, 130, 246, 0.1)" : "#dbeafe", text: "#3b82f6", border: darkMode ? "rgba(59, 130, 246, 0.2)" : "#93c5fd" };
  };

  const handleViewDetails = (item, index) => {
    const itemWithDisplayId = {
      ...item,
      displayId: `Project #${index + 1}`
    };
    setSelectedItem(itemWithDisplayId);
    setShowDetailModal(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
          Project Monitoring
        </h1>
        <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
          Track and monitor all CEST 2.0 projects across Region II
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: stats.total, icon: TrendingUp, color: "#004A98" },
          { label: "Ongoing", value: stats.ongoing, icon: Clock, color: "#10b981" },
          { label: "Liquidated", value: stats.liquidated, icon: AlertCircle, color: "#f59e0b" },
          { label: "Finished", value: stats.finished, icon: CheckCircle, color: "#3b82f6" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl p-5" style={cardStyle}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: `${stat.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                {stat.label}
              </p>
              <p className="text-2xl font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" style={{ color: '#004A98' }} />
          <h3 className="text-lg font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
            Filters
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="px-4 py-2.5 rounded-lg text-sm font-medium outline-none transition-all duration-200"
            style={{
              background: darkMode ? '#1e293b' : '#f8fafc',
              color: darkMode ? '#f8fafc' : '#0f172a',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            }}
            onFocus={(e) => (e.target.style.borderColor = '#004A98')}
            onBlur={(e) => (e.target.style.borderColor = darkMode ? '#334155' : '#e2e8f0')}
          />

          {/* Province Filter */}
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200"
            style={{
              background: darkMode ? '#1e293b' : '#f8fafc',
              color: darkMode ? '#f8fafc' : '#0f172a',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            }}
          >
            <option value="All">All Provinces</option>
            <option value="Batanes">Batanes</option>
            <option value="Cagayan">Cagayan</option>
            <option value="Isabela">Isabela</option>
            <option value="Nueva Vizcaya">Nueva Vizcaya</option>
            <option value="Quirino">Quirino</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200"
            style={{
              background: darkMode ? '#1e293b' : '#f8fafc',
              color: darkMode ? '#f8fafc' : '#0f172a',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            }}
          >
            <option value="All">All Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Liquidated">Liquidated</option>
            <option value="Finished">Finished</option>
          </select>

          {/* Component Filter */}
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200"
            style={{
              background: darkMode ? '#1e293b' : '#f8fafc',
              color: darkMode ? '#f8fafc' : '#0f172a',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            }}
          >
            <option value="All">All Components</option>
            <option value="sel">SEL - Sustainable Enterprise & Livelihoods</option>
            <option value="hn">HN - Health & Nutrition</option>
            <option value="hrd">HRD - Human Resource Development</option>
            <option value="drrm">DRRM - DRRM & CCA</option>
            <option value="bgcet">BGCET - Bio-Circular-Green Economy</option>
            <option value="dg">DG - Digital Governance</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
            Showing {filteredProjects.length} of {transformedProjects.length} projects
          </p>
          {(statusFilter !== "All" || componentFilter !== "All" || provinceFilter !== "All" || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter("All");
                setComponentFilter("All");
                setProvinceFilter("All");
                setSearchTerm("");
              }}
              className="text-sm font-medium px-3 py-1 rounded-lg transition-colors"
              style={{
                color: '#004A98',
                background: darkMode ? 'rgba(0, 74, 152, 0.1)' : 'rgba(0, 74, 152, 0.08)'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={cardStyle}>
            <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
              No projects found matching your filters.
            </p>
          </div>
        ) : (
          filteredProjects.map((project, index) => {
            const statusColors = getStatusColor(project.status);
            return (
              <div 
                key={project.id} 
                onClick={() => handleViewDetails(project, index)}
                className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01] cursor-pointer hover:shadow-lg" 
                style={cardStyle}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: '#004A98', color: '#ffffff' }}>
                        {project.year}
                      </span>
                      <span className="text-sm font-medium" style={{ color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                        {typeof project.municipality === 'object' ? project.municipality?.name || 'Unknown' : project.municipality || 'Unknown'}
                      </span>
                      <span style={{ color: darkMode ? '#6b7280' : '#cbd5e1' }}>•</span>
                      <span className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        {project.community}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-base font-semibold mb-3" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      {project.project}
                    </h3>

                    {/* Status and Components */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded border"
                        style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          borderColor: statusColors.border
                        }}
                      >
                        {project.status}
                      </span>
                      {project.components?.map((c) => (
                        <span 
                          key={c} 
                          className="text-xs font-medium px-2 py-1 rounded" 
                          style={{ 
                            backgroundColor: `${COMP_COLORS[c]}20`, 
                            color: COMP_COLORS[c] 
                          }}
                        >
                          {c.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="text-right">
                    <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                      Budget
                    </p>
                    <p className="text-2xl font-semibold" style={{ color: project.amountFunded > 0 ? '#10b981' : (darkMode ? '#94a3b8' : '#6b7280') }}>
                      {project.amountFunded > 0 ? fmt(project.amountFunded) : 'Not Specified'}
                    </p>
                    {project.amountPerYear > 0 && (
                      <p className="text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
                        {fmt(project.amountPerYear)}/year
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowDetailModal(false)}>
            <div
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
              style={{
                background: darkMode ? 'linear-gradient(145deg, #1e293b, #0f172a)' : 'linear-gradient(145deg, #ffffff, #f8fafc)',
                border: `1px solid ${darkMode ? 'rgba(148,163,184,0.15)' : 'rgba(0,74,152,0.1)'}`,
                boxShadow: darkMode ? '0 40px 80px rgba(0,0,0,0.6)' : '0 40px 80px rgba(0,74,152,0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header Banner */}
              <div className="relative p-6 rounded-t-3xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #004A98 0%, #0066CC 50%, #10b981 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                      {isProject ? <FileText className="w-7 h-7 text-white" /> : <Package className="w-7 h-7 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
                          {selectedItem.displayId}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                          {selectedItem.year || 'N/A'}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
                      <p className="text-sm text-blue-100 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {municipality || 'Unknown'}{province ? `, ${province}` : ''}
                        {selectedItem.community ? ` • ${selectedItem.community}` : ''}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowDetailModal(false)}
                    className="p-2 rounded-xl transition-all duration-200 flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">

                {/* Status + Stakeholders row */}
                {isProject && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Status</p>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Stakeholders</p>
                      <p className="text-sm font-bold" style={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}>
                        {typeof selectedItem.stakeholders === 'object'
                          ? Object.entries(selectedItem.stakeholders || {})
                              .filter(([k, v]) => k !== 'othersLabel' && v && v !== 0)
                              .map(([k]) => k.toUpperCase()).join(', ') || '—'
                          : selectedItem.stakeholders || '—'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Budget */}
                {isProject && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#10b981' }}>Amount Funded</p>
                      <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{fmt(selectedItem.amountFunded || selectedItem.amount_funded || 0)}</p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,74,152,0.1), rgba(0,74,152,0.05))', border: '1px solid rgba(0,74,152,0.2)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#004A98' }}>Amount Per Year</p>
                      <p className="text-2xl font-bold" style={{ color: '#004A98' }}>{fmt(selectedItem.amountPerYear || selectedItem.amount_per_year || 0)}</p>
                    </div>
                  </div>
                )}

                {/* Components */}
                {isProject && components.length > 0 && (
                  <div className="p-4 rounded-2xl" style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,74,152,0.04)', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>CEST Components</p>
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
                                <p className="text-lg font-bold" style={{ color: '#10b981' }}>
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
    </div>
  );
};
