import { useState, useEffect, useMemo } from "react";
import { Archive, RotateCcw, Trash2, Calendar, MapPin, Package, AlertCircle, CheckCircle, RefreshCw, Eye, Users, X } from "lucide-react";
import { db } from "../../shared/services/supabaseClient";
import { ConfirmDeleteModal } from "../../components/ui/ConfirmDeleteModal";
import { Modal, ModalPanel } from "../../components/ui/Modal";
import { FilterBar } from "../../components/ui/FilterBar";
import { PaginationBar } from "../../components/ui/PaginationBar";

export const StarbooksArchivePage = ({ darkMode, readOnly = false }) => {
  const [archivedUnits, setArchivedUnits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'restore' | 'delete', unit }
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show 10 items per page

  useEffect(() => {
    loadArchivedUnits();
    loadStats();
  }, []);

  const loadArchivedUnits = async () => {
    try {
      setLoading(true);
      const data = await db.getArchivedStarbooksUnits();
      setArchivedUnits(data);
    } catch (error) {
      console.error('Error loading archived units:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await db.getStarbooksArchiveStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRestore = async (unit) => {
    try {
      await db.restoreStarbooksUnit(unit.id);
      setArchivedUnits(prev => prev.filter(u => u.id !== unit.id));
      await loadStats();
      setConfirmAction(null);
    } catch (error) {
      console.error('Error restoring unit:', error);
      alert('Failed to restore unit: ' + error.message);
    }
  };

  const handlePermanentDelete = async (unit) => {
    try {
      await db.permanentlyDeleteStarbooksUnit(unit.id);
      setArchivedUnits(prev => prev.filter(u => u.id !== unit.id));
      await loadStats();
      setConfirmAction(null);
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Failed to delete unit: ' + error.message);
    }
  };

  const filteredUnits = archivedUnits.filter(unit => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (unit.location || '').toLowerCase().includes(searchLower) ||
      (unit.municipality || '').toLowerCase().includes(searchLower) ||
      (unit.unit_code || '').toLowerCase().includes(searchLower) ||
      (unit.serial_number || '').toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6" style={{ transition: 'all 0.3s ease' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary, transition: 'color 0.3s ease' }}>
            STARBOOKS Archive
          </h1>
          <p className="text-sm" style={{ color: theme.textSecondary, transition: 'color 0.3s ease' }}>
            Review, restore, or permanently delete archived STARBOOKS units
          </p>
        </div>
        <button
          onClick={() => { loadArchivedUnits(); loadStats(); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl transition-all hover:scale-105 duration-300" style={{
            background: theme.cardBg,
            border: `1px solid ${theme.borderColor}`,
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
              : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <Package className="w-6 h-6" style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.total_units || 0}</div>
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
                <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.active_units || 0}</div>
                <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Active Units</div>
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
                <Archive className="w-6 h-6" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.archived_units || 0}</div>
                <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Archived Units</div>
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
              <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                <Calendar className="w-6 h-6" style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.archived_this_month || 0}</div>
                <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>This Month</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <FilterBar
        darkMode={darkMode}
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search archived units by location, municipality, or serial number..."
        onRefresh={loadArchivedUnits}
        refreshLabel="Refresh"
        resultText={
          <>
            Showing <span className="font-semibold" style={{ color: theme.textPrimary }}>{filteredUnits.length}</span> of{" "}
            <span className="font-semibold" style={{ color: theme.textPrimary }}>{archivedUnits.length}</span> archived units
          </>
        }
      />

      {/* Archived Units List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p style={{ color: theme.textSecondary }}>Loading archived units...</p>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="text-center py-20 rounded-xl" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? 'none' 
            : '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <Archive className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textSecondary }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
            {searchQuery ? 'No matching archived units' : 'No archived units'}
          </h3>
          <p style={{ color: theme.textSecondary }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'Archived STARBOOKS units will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedUnits.map((unit) => (
              <div
                key={unit.id}
                className="rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.borderColor}`,
                  boxShadow: darkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
                }}
              >
                {/* Archive Banner */}
                <div className="h-1" style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' }} />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Unit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                          <Archive className="w-5 h-5" style={{ color: '#f59e0b' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold truncate" style={{ color: theme.textPrimary }}>
                            {unit.location}
                          </h3>
                          <p className="text-sm font-mono" style={{ color: theme.textSecondary }}>
                            {unit.unit_code || unit.serial_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm mb-3" style={{ color: theme.textSecondary }}>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{unit.municipality}, {unit.province || 'Cagayan'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Archived: {formatDate(unit.archived_at)}</span>
                        </div>
                      </div>

                      {unit.archive_reason && (
                        <div className="p-3 rounded-lg" style={{ 
                          background: theme.sectionBg,
                          border: `1px solid ${theme.borderColor}`
                        }}>
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                            <div className="flex-1">
                              <p className="text-xs font-bold uppercase mb-1" style={{ color: '#f59e0b' }}>
                                Archive Reason
                              </p>
                              <p className="text-sm" style={{ color: theme.textSecondary }}>
                                {unit.archive_reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedUnit(unit);
                          setShowDetailModal(true);
                        }}
                        className="px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2 text-sm font-semibold"
                        style={{
                          background: theme.inputBg,
                          color: '#3b82f6',
                          border: `1px solid ${theme.borderColor}`
                        }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {!readOnly && (
                      <>
                      <button
                        onClick={() => setConfirmAction({ type: 'restore', unit })}
                        className="px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2 text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: '#ffffff'
                        }}
                        title="Restore Unit"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'delete', unit })}
                        className="px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2 text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: '#ffffff'
                        }}
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PaginationBar
            darkMode={darkMode}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            rangeStart={startIndex + 1}
            rangeEnd={Math.min(endIndex, filteredUnits.length)}
            totalCount={filteredUnits.length}
            itemLabel="units"
          />
        </>
      )}

      {/* Confirmation Modals */}
      {confirmAction?.type === 'restore' && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => handleRestore(confirmAction.unit)}
          title="Restore STARBOOKS Unit?"
          message="This will restore the unit back to active status and make it visible in the main inventory."
          itemName={confirmAction.unit.location}
          confirmText="Restore Unit"
          confirmButtonStyle={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #059669 100%)',
            color: '#ffffff'
          }}
          darkMode={darkMode}
        />
      )}

      {confirmAction?.type === 'delete' && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => handlePermanentDelete(confirmAction.unit)}
          title="Permanently Delete STARBOOKS Unit?"
          message="⚠️ This action cannot be undone! The unit will be permanently removed from the database."
          itemName={confirmAction.unit.location}
          confirmText="Permanently Delete"
          darkMode={darkMode}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUnit && (
        <Modal onClose={() => { setShowDetailModal(false); setSelectedUnit(null); }} className="bg-black/80 backdrop-blur-sm">
          <ModalPanel maxWidth="max-w-3xl" className="rounded-3xl overflow-hidden">
          <div 
            style={{
              ...cardStyle,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Modal Header with Gradient */}
            <div 
              className="relative p-8 border-b overflow-hidden"
              style={{ 
                borderColor: darkMode ? '#334155' : '#e2e8f0',
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%)'
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <Archive className="w-full h-full" style={{ color: '#f59e0b' }} />
              </div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div 
                    className="p-4 rounded-2xl flex-shrink-0"
                    style={{ 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    <Archive className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      {selectedUnit.location}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span 
                        className="px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ 
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        📦 {selectedUnit.unit_code || selectedUnit.serial_number || 'N/A'}
                      </span>
                      <span 
                        className="px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ 
                          background: darkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                          color: darkMode ? '#94a3b8' : '#64748b'
                        }}
                      >
                        {selectedUnit.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl hover:bg-red-500/10 transition-all duration-300 hover:scale-110 flex-shrink-0"
                >
                  <X className="w-6 h-6" style={{ color: '#ef4444' }} />
                </button>
              </div>
            </div>

            {/* Modal Content with Enhanced Layout */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Information Card */}
                <div 
                  className="p-5 rounded-2xl"
                  style={{ 
                    background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    border: `2px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ background: 'rgba(59, 130, 246, 0.2)' }}
                    >
                      <MapPin className="w-5 h-5" style={{ color: '#3b82f6' }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Location Details
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                        Location Name
                      </p>
                      <p className="text-sm font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        {selectedUnit.location || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                        Municipality
                      </p>
                      <p className="text-sm font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        {selectedUnit.municipality || 'N/A'}, {selectedUnit.province || 'Cagayan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Archive Information Card */}
                <div 
                  className="p-5 rounded-2xl"
                  style={{ 
                    background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                    border: `2px solid ${darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)'}`
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ background: 'rgba(245, 158, 11, 0.2)' }}
                    >
                      <Calendar className="w-5 h-5" style={{ color: '#f59e0b' }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      Archive Info
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                        Archived Date
                      </p>
                      <p className="text-sm font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        {formatDate(selectedUnit.archived_at)}
                      </p>
                    </div>
                    {selectedUnit.archived_by && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                          Archived By
                        </p>
                        <p className="text-sm font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                          {selectedUnit.archived_by}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Installation Date Card */}
                {selectedUnit.installation_date && (
                  <div 
                    className="p-5 rounded-2xl"
                    style={{ 
                      background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                      border: `2px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(59, 130, 246, 0.2)' }}
                      >
                        <CheckCircle className="w-5 h-5" style={{ color: '#3b82f6' }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Installation
                      </h3>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                        Installed On
                      </p>
                      <p className="text-sm font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        {new Date(selectedUnit.installation_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Usage Statistics Card */}
                {(selectedUnit.total_users > 0 || selectedUnit.total_sessions > 0) && (
                  <div 
                    className="p-5 rounded-2xl"
                    style={{ 
                      background: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                      border: `2px solid ${darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                      >
                        <Users className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Usage Stats
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {selectedUnit.total_users > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                            Total Users
                          </p>
                          <p className="text-2xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                            {selectedUnit.total_users.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {selectedUnit.total_sessions > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                            Total Sessions
                          </p>
                          <p className="text-2xl font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                            {selectedUnit.total_sessions.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Archive Reason - Full Width */}
              {selectedUnit.archive_reason && (
                <div 
                  className="mt-6 p-5 rounded-2xl"
                  style={{ 
                    background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    border: `2px solid ${darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'}`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Archive Reason
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
                        {selectedUnit.archive_reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information - Full Width */}
              {selectedUnit.notes && (
                <div 
                  className="mt-6 p-5 rounded-2xl"
                  style={{ 
                    background: darkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(148, 163, 184, 0.05)',
                    border: `2px solid ${darkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.15)'}`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ background: darkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.2)' }}
                    >
                      <Package className="w-5 h-5" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        Additional Information
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
                        {selectedUnit.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div 
              className="p-6 border-t"
              style={{ 
                borderColor: darkMode ? '#334155' : '#e2e8f0',
                background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)'
              }}
            >
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                  style={{
                    background: darkMode ? '#1e293b' : '#f1f5f9',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`
                  }}
                >
                  Close
                </button>
                {!readOnly && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setConfirmAction({ type: 'restore', unit: selectedUnit });
                  }}
                  className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #059669 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Restore Unit
                </button>
                )}
              </div>
            </div>
          </div>
          </ModalPanel>
        </Modal>
      )}
    </div>
  );
};
