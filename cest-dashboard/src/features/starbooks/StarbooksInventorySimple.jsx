import { useState, useEffect, useMemo } from "react";
import { Package, MapPin, Search, Plus, Eye, Edit, Trash2, CheckCircle, AlertCircle, Clock, Download, RefreshCw, X, Mail, Phone, User, Calendar, Building } from "lucide-react";
import { supabase } from "../../shared/services/supabaseClient";
import { Modal, ModalPanel } from "../../components/ui/Modal";

export const StarbooksInventorySimple = ({ darkMode, readOnly = false }) => {
  const [units, setUnits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Show 20 items per page for better performance

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('starbooks_units')
        .select('*')
        .or('is_archived.is.null,is_archived.eq.false')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUnits(data || []);
    } catch (err) {
      console.error('Error loading units:', err);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      focal_person: selectedUnit.focal_person || '',
      email_address: selectedUnit.email_address || '',
      contact_number: selectedUnit.contact_number || '',
      status: selectedUnit.status || '',
      condition: selectedUnit.condition || '',
      institution_type: selectedUnit.institution_type || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('starbooks_units')
        .update(editForm)
        .eq('id', selectedUnit.id);
      
      if (error) throw error;
      
      // Update local state
      setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, ...editForm } : u));
      setSelectedUnit({ ...selectedUnit, ...editForm });
      setIsEditing(false);
      alert('Unit updated successfully!');
    } catch (err) {
      console.error('Error updating unit:', err);
      alert('Failed to update unit: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('starbooks_units')
        .delete()
        .eq('id', selectedUnit.id);
      
      if (error) throw error;
      
      // Update local state
      setUnits(units.filter(u => u.id !== selectedUnit.id));
      setSelectedUnit(null);
      setShowDeleteConfirm(false);
      alert('Unit deleted successfully!');
    } catch (err) {
      console.error('Error deleting unit:', err);
      alert('Failed to delete unit: ' + err.message);
    }
  };

  // Filter units
  const filteredUnits = units.filter(unit => {
    const matchesSearch = !searchQuery || 
      (unit.institution_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.municipality || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.province || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.unit_code || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (unit.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    const matchesYear = yearFilter === "all" || 
      String(unit.deployment_year) === yearFilter;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Get unique years for filter
  const availableYears = [...new Set(units.map(u => u.deployment_year).filter(Boolean))].sort((a, b) => b - a);

  // Pagination
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, yearFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: units.length,
    functional: units.filter(u => (u.status || '').toLowerCase() === 'functional').length,
    nonFunctional: units.filter(u => (u.status || '').toLowerCase().includes('non')).length,
    maintenance: units.filter(u => (u.status || '').toLowerCase().includes('maintenance')).length,
  }), [units]);

  // Status badge color
  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'functional') return { bg: '#3b82f6', text: '#ffffff' };
    if (s.includes('non')) return { bg: '#ef4444', text: '#ffffff' };
    if (s.includes('maintenance')) return { bg: '#f59e0b', text: '#ffffff' };
    if (s.includes('inactive')) return { bg: '#6b7280', text: '#ffffff' };
    return { bg: '#3b82f6', text: '#ffffff' };
  };

  // Memoized theme colors - prevents recalculation on every render
  const theme = useMemo(() => ({
    cardBg: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    borderColor: darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 0.8)',
    textPrimary: darkMode ? '#f8fafc' : '#0f172a',
    textSecondary: darkMode ? '#94a3b8' : '#475569',
    hoverBg: darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(241, 245, 249, 0.9)',
    inputBg: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.98)',
    sectionBg: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(241, 245, 249, 0.95)',
  }), [darkMode]);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6" style={{ transition: 'all 0.3s ease' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary, transition: 'color 0.3s ease' }}>
            STARBOOKS Inventory
          </h1>
          <p className="text-sm" style={{ color: theme.textSecondary, transition: 'color 0.3s ease' }}>
            Region 2 STARBOOKS Units Management
          </p>
        </div>
        {!readOnly && (
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Plus className="w-5 h-5" />
          Add Unit
        </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl transition-all hover:scale-105 duration-300" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <Package className="w-6 h-6" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.total}</div>
              <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Total Units</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl transition-all hover:scale-105 duration-300" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <CheckCircle className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.functional}</div>
              <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Functional</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl transition-all hover:scale-105 duration-300" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.nonFunctional}</div>
              <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Non-Functional</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl transition-all hover:scale-105 duration-300" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <Clock className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.maintenance}</div>
              <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Maintenance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-5 rounded-xl" style={{
        background: theme.cardBg,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
          : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
      }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by institution, location, or unit code..."
              className="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-all"
              style={{
                background: theme.inputBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: darkMode 
                  ? 'none' 
                  : '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-lg outline-none cursor-pointer"
            style={{
              background: theme.inputBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.borderColor}`,
              minWidth: '180px',
              boxShadow: darkMode 
                ? 'none' 
                : '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <option value="all">All Status</option>
            <option value="functional">Functional</option>
            <option value="non-functional">Non-Functional</option>
            <option value="under maintenance">Under Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-3 rounded-lg outline-none cursor-pointer"
            style={{
              background: theme.inputBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.borderColor}`,
              minWidth: '150px',
              boxShadow: darkMode 
                ? 'none' 
                : '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={loadUnits}
            className="px-4 py-3 rounded-lg transition-all hover:scale-105"
            style={{
              background: theme.inputBg,
              border: `1px solid ${theme.borderColor}`,
              boxShadow: darkMode 
                ? 'none' 
                : '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <RefreshCw className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </button>
        </div>
        <div className="mt-3 text-sm" style={{ color: theme.textSecondary }}>
          Showing <span className="font-bold" style={{ color: theme.textPrimary }}>{filteredUnits.length}</span> of <span className="font-bold" style={{ color: theme.textPrimary }}>{units.length}</span> units
        </div>
      </div>

      {/* Units List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p style={{ color: theme.textSecondary }}>Loading units...</p>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="text-center py-20 rounded-xl" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? 'none' 
            : '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <Package className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textSecondary }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>No units found</h3>
          <p style={{ color: theme.textSecondary }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedUnits.map((unit) => {
            const statusColors = getStatusColor(unit.status);
            return (
              <div
                key={unit.id}
                className="p-5 rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.borderColor}`,
                  boxShadow: darkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
                }}
                onClick={() => setSelectedUnit(unit)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold truncate" style={{ color: theme.textPrimary }}>
                        {unit.institution_name || unit.location || 'Unnamed Unit'}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                        style={{
                          background: statusColors.bg,
                          color: statusColors.text
                        }}
                      >
                        {unit.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: theme.textSecondary }}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{unit.municipality}, {unit.province}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4" />
                        <span className="font-mono">{unit.unit_code}</span>
                      </div>
                      {unit.deployment_year && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Deployed {unit.deployment_year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUnit(unit);
                    }}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: darkMode ? 'rgba(51, 65, 85, 0.95)' : 'rgba(226, 232, 240, 0.95)',
                      boxShadow: darkMode 
                        ? 'none' 
                        : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Eye className="w-5 h-5" style={{ color: '#3b82f6' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-5 rounded-xl" style={{
            background: theme.cardBg,
            border: `1px solid ${theme.borderColor}`,
            boxShadow: darkMode 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="text-sm" style={{ color: theme.textSecondary }}>
              Showing <span className="font-bold" style={{ color: theme.textPrimary }}>{startIndex + 1}</span> to <span className="font-bold" style={{ color: theme.textPrimary }}>{Math.min(endIndex, filteredUnits.length)}</span> of <span className="font-bold" style={{ color: theme.textPrimary }}>{filteredUnits.length}</span> units
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: currentPage === 1 ? theme.inputBg : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: currentPage === 1 ? theme.textSecondary : '#ffffff'
                }}
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{
                          background: page === currentPage 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                            : theme.inputBg,
                          color: page === currentPage ? '#ffffff' : theme.textPrimary
                        }}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} style={{ color: theme.textSecondary }}>...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: currentPage === totalPages ? theme.inputBg : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: currentPage === totalPages ? theme.textSecondary : '#ffffff'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
      )}

      {/* Enhanced Detail Modal */}
      {selectedUnit && (
        <Modal onClose={() => { setSelectedUnit(null); setIsEditing(false); }} zIndex={50}>
          <ModalPanel maxWidth="max-w-3xl" className="rounded-3xl overflow-y-auto">
          <div
            style={{
              background: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              boxShadow: darkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: `1px solid ${theme.borderColor}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 p-8 border-b" style={{ 
              background: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              WebkitborderColor: theme.borderColor,
              boxShadow: darkMode 
                ? 'none' 
                : '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                    <Package className="w-8 h-8" style={{ color: '#3b82f6' }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                      {selectedUnit.institution_name || selectedUnit.location || 'Unit Details'}
                    </h2>
                    <p className="text-sm font-mono flex items-center gap-2" style={{ color: theme.textSecondary }}>
                      <Package className="w-4 h-4" />
                      {selectedUnit.unit_code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!readOnly && !isEditing ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="p-2.5 rounded-xl transition-all hover:scale-110"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6'
                        }}
                        title="Edit Unit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2.5 rounded-xl transition-all hover:scale-110"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444'
                        }}
                        title="Delete Unit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : !readOnly ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: '#ffffff'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105"
                        style={{
                          background: darkMode ? 'rgba(51, 65, 85, 0.95)' : 'rgba(226, 232, 240, 0.95)',
                          color: theme.textSecondary,
                          boxShadow: darkMode 
                            ? 'none' 
                            : '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : null}
                  <button
                    onClick={() => {
                      setSelectedUnit(null);
                      setIsEditing(false);
                      setShowDeleteConfirm(false);
                    }}
                    className="p-2.5 rounded-xl transition-all hover:scale-110"
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444'
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span
                  className="px-4 py-2 rounded-full text-sm font-bold"
                  style={{
                    background: getStatusColor(selectedUnit.status).bg,
                    color: getStatusColor(selectedUnit.status).text
                  }}
                >
                  {selectedUnit.status || 'Unknown'}
                </span>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <MapPin className="w-5 h-5" style={{ color: '#3b82f6' }} />
                  Location Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ 
                    background: theme.sectionBg,
                    border: `1px solid ${theme.borderColor}`,
                    boxShadow: darkMode 
                      ? 'none' 
                      : '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}>
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: theme.textSecondary }}>Municipality</p>
                    <p className="font-semibold" style={{ color: theme.textPrimary }}>{selectedUnit.municipality || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ 
                    background: theme.sectionBg,
                    border: `1px solid ${theme.borderColor}`,
                    boxShadow: darkMode 
                      ? 'none' 
                      : '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}>
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: theme.textSecondary }}>Province</p>
                    <p className="font-semibold" style={{ color: theme.textPrimary }}>{selectedUnit.province || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <User className="w-5 h-5" style={{ color: '#3b82f6' }} />
                  Contact Information
                </h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: theme.textSecondary }}>
                        Focal Person
                      </label>
                      <input
                        type="text"
                        value={editForm.focal_person}
                        onChange={(e) => setEditForm({ ...editForm, focal_person: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg outline-none"
                        style={{
                          background: theme.inputBg,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.borderColor}`,
                          boxShadow: darkMode 
                            ? 'none' 
                            : '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        placeholder="Enter focal person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: theme.textSecondary }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editForm.email_address}
                        onChange={(e) => setEditForm({ ...editForm, email_address: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg outline-none"
                        style={{
                          background: theme.inputBg,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.borderColor}`,
                          boxShadow: darkMode 
                            ? 'none' 
                            : '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: theme.textSecondary }}>
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={editForm.contact_number}
                        onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg outline-none"
                        style={{
                          background: theme.inputBg,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.borderColor}`,
                          boxShadow: darkMode 
                            ? 'none' 
                            : '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ 
                      background: theme.sectionBg,
                      border: `1px solid ${theme.borderColor}`,
                      boxShadow: darkMode 
                        ? 'none' 
                        : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                        <User className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textSecondary }}>Focal Person</p>
                        <p className="font-semibold" style={{ color: theme.textPrimary }}>
                          {selectedUnit.focal_person || 'Not Specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ 
                      background: theme.sectionBg,
                      border: `1px solid ${theme.borderColor}`,
                      boxShadow: darkMode 
                        ? 'none' 
                        : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                        <Mail className="w-5 h-5" style={{ color: '#3b82f6' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textSecondary }}>Email Address</p>
                        <p className="font-semibold" style={{ color: theme.textPrimary }}>
                          {selectedUnit.email_address || 'Not Specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ 
                      background: theme.sectionBg,
                      border: `1px solid ${theme.borderColor}`,
                      boxShadow: darkMode 
                        ? 'none' 
                        : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                        <Phone className="w-5 h-5" style={{ color: '#3b82f6' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textSecondary }}>Contact Number</p>
                        <p className="font-semibold" style={{ color: theme.textPrimary }}>
                          {selectedUnit.contact_number || 'Not Specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Unit Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                  <Building className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  Unit Details
                </h3>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: theme.textSecondary }}>
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg outline-none cursor-pointer"
                        style={{
                          background: theme.inputBg,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.borderColor}`,
                          boxShadow: darkMode 
                            ? 'none' 
                            : '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <option value="Functional">Functional</option>
                        <option value="Non-Functional">Non-Functional</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: theme.textSecondary }}>
                        Condition
                      </label>
                      <select
                        value={editForm.condition}
                        onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg outline-none cursor-pointer"
                        style={{
                          background: theme.inputBg,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.borderColor}`,
                          boxShadow: darkMode 
                            ? 'none' 
                            : '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-2" style={{ color: theme.textSecondary }}>
                        Institution Type
                      </label>
                      <input
                        type="text"
                        value={editForm.institution_type}
                        onChange={(e) => setEditForm({ ...editForm, institution_type: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg outline-none"
                        style={{
                          background: theme.inputBg,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.borderColor}`,
                          boxShadow: darkMode 
                            ? 'none' 
                            : '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        placeholder="e.g., School - High School"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl" style={{ 
                      background: theme.sectionBg,
                      border: `1px solid ${theme.borderColor}`,
                      boxShadow: darkMode 
                        ? 'none' 
                        : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                      <p className="text-xs font-bold uppercase mb-1" style={{ color: theme.textSecondary }}>Condition</p>
                      <p className="font-semibold" style={{ color: theme.textPrimary }}>{selectedUnit.condition || 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ 
                      background: theme.sectionBg,
                      border: `1px solid ${theme.borderColor}`,
                      boxShadow: darkMode 
                        ? 'none' 
                        : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                      <p className="text-xs font-bold uppercase mb-1" style={{ color: theme.textSecondary }}>Deployment Year</p>
                      <p className="font-semibold" style={{ color: theme.textPrimary }}>{selectedUnit.deployment_year || 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ 
                      background: theme.sectionBg,
                      border: `1px solid ${theme.borderColor}`,
                      boxShadow: darkMode 
                        ? 'none' 
                        : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                      <p className="text-xs font-bold uppercase mb-1" style={{ color: theme.textSecondary }}>Institution Type</p>
                      <p className="font-semibold text-sm" style={{ color: theme.textPrimary }}>{selectedUnit.institution_type || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </ModalPanel>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)} zIndex={50}>
          <ModalPanel maxWidth="max-w-md">
          <div
            className="p-8 rounded-2xl"
            style={{
              background: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              boxShadow: darkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              border: `1px solid ${theme.borderColor}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                <AlertCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Delete Unit</h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>This action cannot be undone</p>
              </div>
            </div>
            
            <p className="mb-6" style={{ color: theme.textPrimary }}>
              Are you sure you want to delete <span className="font-bold">{selectedUnit?.institution_name || selectedUnit?.location}</span>?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                style={{
                  background: darkMode ? 'rgba(51, 65, 85, 0.95)' : 'rgba(226, 232, 240, 0.95)',
                  color: theme.textPrimary,
                  border: `1px solid ${theme.borderColor}`
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          </ModalPanel>
        </Modal>
      )}
    </div>
  );
};
