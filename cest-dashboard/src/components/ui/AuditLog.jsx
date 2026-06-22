import { 
  Upload, 
  Trash2, 
  Edit, 
  Plus, 
  Archive, 
  RotateCcw, 
  User, 
  Clock,
  FileText,
  Database,
  X,
  Filter,
  Search,
  Check,
  CheckCheck
} from "lucide-react";
import { useState } from "react";
import { db } from "../../shared/services/supabaseClient";

const ACTION_ICONS = {
  upload: Upload,
  delete: Trash2,
  edit: Edit,
  create: Plus,
  archive: Archive,
  restore: RotateCcw,
  update: Edit,
};

const ACTION_COLORS = {
  upload: { bg: '#10b981', light: 'rgba(16, 185, 129, 0.1)', border: '#059669' },
  delete: { bg: '#ef4444', light: 'rgba(239, 68, 68, 0.1)', border: '#dc2626' },
  edit: { bg: '#f59e0b', light: 'rgba(245, 158, 11, 0.1)', border: '#d97706' },
  create: { bg: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)', border: '#2563eb' },
  archive: { bg: '#8b5cf6', light: 'rgba(139, 92, 246, 0.1)', border: '#7c3aed' },
  restore: { bg: '#06b6d4', light: 'rgba(6, 182, 212, 0.1)', border: '#0891b2' },
  update: { bg: '#f59e0b', light: 'rgba(245, 158, 11, 0.1)', border: '#d97706' },
};

export const AuditLog = ({ logs = [], onClose, darkMode, onLogsUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const markAsRead = async (logId) => {
    try {
      setIsUpdating(true);
      await db.markAuditLogAsRead(logId);
      if (onLogsUpdate) {
        onLogsUpdate();
      }
    } catch (error) {
      console.error('Error marking log as read:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsUpdating(true);
      await db.markAllAuditLogsAsRead();
      if (onLogsUpdate) {
        onLogsUpdate();
      }
    } catch (error) {
      console.error('Error marking all logs as read:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter logs based on search and action filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAction === "all" || log.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  // Get unique action types for filter
  const actionTypes = ["all", ...new Set(logs.map(log => log.action).filter(Boolean))];
  
  const unreadCount = filteredLogs.filter((log) => !log.is_read).length;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  return (
    <div 
      className="absolute top-20 right-6 w-[480px] max-h-[700px] rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50 flex flex-col"
      style={{
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        border: `2px solid ${darkMode ? '#1e293b' : '#e5e7eb'}`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div 
        className="p-5 border-b backdrop-blur-sm"
        style={{ 
          borderColor: darkMode ? '#1e293b' : '#e5e7eb',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(0, 74, 152, 0.1), rgba(59, 130, 246, 0.05))'
            : 'linear-gradient(135deg, rgba(0, 74, 152, 0.05), rgba(59, 130, 246, 0.02))'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl"
              style={{
                background: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${darkMode ? '#2563eb' : '#3b82f6'}`
              }}
            >
              <Database className="w-5 h-5" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                Activity Log
              </h3>
              <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isUpdating}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981'
                }}
                title="Mark all as read"
              >
                <CheckCheck className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                color: darkMode ? '#f8fafc' : '#0f172a'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
              border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
              color: darkMode ? '#f8fafc' : '#0f172a',
              '--tw-ring-color': '#3b82f6'
            }}
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: showFilters 
              ? (darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
              : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
            color: showFilters ? '#3b82f6' : (darkMode ? '#94a3b8' : '#64748b')
          }}
        >
          <Filter className="w-4 h-4" />
          Filter by Action
        </button>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actionTypes.map(action => (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize"
                style={{
                  background: filterAction === action
                    ? (darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)')
                    : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
                  color: filterAction === action 
                    ? '#3b82f6' 
                    : (darkMode ? '#94a3b8' : '#64748b'),
                  border: `1px solid ${filterAction === action ? '#3b82f6' : 'transparent'}`
                }}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logs List */}
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: darkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(148, 163, 184, 0.1)'
              }}
            >
              <FileText className="w-8 h-8" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
              {searchTerm || filterAction !== "all" ? "No matching activities" : "No activities yet"}
            </p>
          </div>
        ) : (
          <div className="p-3">
            {filteredLogs.map((log, index) => {
              const Icon = ACTION_ICONS[log.action] || FileText;
              const colors = ACTION_COLORS[log.action] || ACTION_COLORS.update;
              const isRead = log.is_read;

              return (
                <div
                  key={log.id}
                  className="mb-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer group relative"
                  style={{
                    backgroundColor: isRead 
                      ? (darkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.6)')
                      : (darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)'),
                    border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                    opacity: isRead ? 0.7 : 1
                  }}
                  onClick={() => !isRead && markAsRead(log.id)}
                >
                  {/* Unread indicator */}
                  {!isRead && (
                    <div 
                      className="absolute top-4 right-4 w-2 h-2 rounded-full"
                      style={{ background: '#3b82f6', boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)' }}
                    />
                  )}
                  
                  <div className="flex items-start gap-3">
                    {/* Action Icon */}
                    <div 
                      className="p-2.5 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: colors.light,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: colors.bg }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 
                          className="text-sm font-semibold capitalize"
                          style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                        >
                          {log.action}
                        </h4>
                        <span 
                          className="text-xs font-medium px-2 py-1 rounded-md flex-shrink-0"
                          style={{
                            background: colors.light,
                            color: colors.bg
                          }}
                        >
                          {log.entity_type || log.entityType}
                        </span>
                      </div>

                      <p 
                        className="text-sm mb-2 leading-relaxed"
                        style={{ color: darkMode ? '#cbd5e1' : '#475569' }}
                      >
                        {log.description}
                      </p>

                      {log.details && (
                        <div 
                          className="text-xs p-2 rounded-lg mb-2 font-mono"
                          style={{
                            background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.03)',
                            color: darkMode ? '#94a3b8' : '#64748b'
                          }}
                        >
                          {log.details}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{log.user || 'System'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTimestamp(log.created_at || log.timestamp)}</span>
                        </div>
                        {isRead && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Check className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                            <span style={{ color: '#10b981' }}>Read</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
