import {
  Bell,
  X,
  UserPlus,
  ShieldCheck,
  ShieldX,
  CheckCheck,
  Clock,
  Activity,
  Search,
  Filter,
  Upload,
  Trash2,
  Edit,
  Plus,
  Archive,
  RotateCcw,
  User,
  FileText,
  Check,
  Eraser,
} from 'lucide-react';
import { useState } from 'react';

const TYPE_STYLES = {
  guest_request: { icon: UserPlus, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  access_approved: { icon: ShieldCheck, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  access_declined: { icon: ShieldX, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
};

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

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function ActivityLogTab({
  logs,
  darkMode,
  onMarkRead,
  onMarkAllRead,
  onClearRead,
  readCount = 0,
  isUpdating,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const actionTypes = ['all', ...new Set(logs.map((log) => log.action).filter(Boolean))];
  const unreadCount = filteredLogs.filter((log) => !log.is_read).length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-3 pb-2 shrink-0 space-y-2">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            style={{
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
              border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
              color: darkMode ? '#f8fafc' : '#0f172a',
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: showFilters
                ? darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
                : darkMode ? '#1e293b' : '#f1f5f9',
              color: showFilters ? '#3b82f6' : darkMode ? '#94a3b8' : '#64748b',
            }}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={isUpdating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
              style={{ color: '#10b981' }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          {readCount > 0 && (
            <button
              type="button"
              onClick={onClearRead}
              disabled={isUpdating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
              style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
            >
              <Eraser className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-1.5">
            {actionTypes.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => setFilterAction(action)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize"
                style={{
                  background: filterAction === action ? '#004A98' : darkMode ? '#1e293b' : '#f1f5f9',
                  color: filterAction === action ? '#fff' : darkMode ? '#94a3b8' : '#64748b',
                }}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
        {filteredLogs.length === 0 ? (
          <div className="py-10 text-center">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} />
            <p className="text-sm" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
              {searchTerm || filterAction !== 'all' ? 'No matching activity' : 'No activity yet'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const Icon = ACTION_ICONS[log.action] || FileText;
            const colors = ACTION_COLORS[log.action] || ACTION_COLORS.update;
            const isRead = log.is_read;
            return (
              <div
                key={log.id}
                className="mb-2 p-3 rounded-xl cursor-pointer relative"
                style={{
                  background: isRead
                    ? darkMode ? 'rgba(15, 23, 42, 0.35)' : '#f8fafc'
                    : darkMode ? 'rgba(30, 41, 59, 0.6)' : '#fff',
                  border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                  opacity: isRead ? 0.75 : 1,
                }}
                onClick={() => !isRead && onMarkRead?.(log.id)}
              >
                {!isRead && (
                  <span
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ background: '#3b82f6' }}
                  />
                )}
                <div className="flex gap-2.5">
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ background: colors.light, border: `1px solid ${colors.border}` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: colors.bg }} />
                  </div>
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-xs font-bold capitalize" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
                        {log.action || 'update'}
                      </p>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: colors.light, color: colors.bg }}
                      >
                        {log.entity_type || log.entityType || 'Record'}
                      </span>
                    </div>
                    <p className="text-xs mb-1.5 leading-relaxed" style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
                      {log.description || 'Record updated'}
                    </p>
                    {log.details && (
                      <p
                        className="text-[10px] p-1.5 rounded mb-1.5 font-mono truncate"
                        style={{
                          background: darkMode ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.04)',
                          color: darkMode ? '#94a3b8' : '#64748b',
                        }}
                      >
                        {log.details}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px]" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user || 'System'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(log.created_at || log.timestamp)}
                      </span>
                      {isRead && (
                        <span className="flex items-center gap-1 ml-auto" style={{ color: '#10b981' }}>
                          <Check className="w-3 h-3" />
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function NotificationPanel({
  notifications = [],
  auditLogs = [],
  darkMode,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClearReadAlerts,
  onClearReadActivity,
  onAuditMarkRead,
  onAuditMarkAllRead,
  onAction,
  isAdmin = false,
  isUpdatingAudit = false,
  alertsUnread = 0,
  alertsRead = 0,
  activityUnread = 0,
  activityRead = 0,
}) {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alertFilter, setAlertFilter] = useState('all');

  const totalUnread = alertsUnread + (isAdmin ? activityUnread : 0);

  const filteredAlerts = notifications.filter((n) => {
    if (alertFilter === 'unread') return !n.read;
    if (alertFilter === 'access') return n.category === 'access';
    return true;
  });

  return (
    <div
      className="absolute top-20 right-6 w-[460px] max-h-[700px] rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50 flex flex-col"
      style={{
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="px-5 py-4 border-b flex items-center justify-between shrink-0"
        style={{
          borderColor: darkMode ? '#1e293b' : '#e2e8f0',
          background: darkMode
            ? 'linear-gradient(135deg, rgba(0,74,152,0.25) 0%, rgba(15,23,42,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(0,74,152,0.08) 0%, #ffffff 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)' }}
          >
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Notifications
            </h3>
            <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {activeTab === 'alerts' && alertsUnread > 0 && (
            <button
              type="button"
              onClick={() => onMarkAllRead?.(notifications.map((n) => n.id))}
              className="p-2 rounded-lg"
              style={{ color: darkMode ? '#93c5fd' : '#2563eb' }}
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          {activeTab === 'alerts' && alertsRead > 0 && (
            <button
              type="button"
              onClick={() => onClearReadAlerts?.()}
              className="p-2 rounded-lg"
              style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
              title="Clear read alerts"
            >
              <Eraser className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onClose} className="p-2 rounded-lg" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="px-4 py-2 flex gap-1.5 border-b shrink-0"
        style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
          style={{
            background: activeTab === 'alerts' ? '#004A98' : darkMode ? '#1e293b' : '#f1f5f9',
            color: activeTab === 'alerts' ? '#fff' : darkMode ? '#94a3b8' : '#64748b',
          }}
        >
          Alerts
          {alertsUnread > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500 text-white">{alertsUnread}</span>
          )}
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
            style={{
              background: activeTab === 'activity' ? '#004A98' : darkMode ? '#1e293b' : '#f1f5f9',
              color: activeTab === 'activity' ? '#fff' : darkMode ? '#94a3b8' : '#64748b',
            }}
          >
            <Activity className="w-3 h-3" />
            Activity Log
            {activityUnread > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-blue-500 text-white">{activityUnread}</span>
            )}
          </button>
        )}
      </div>

      {activeTab === 'alerts' ? (
        <>
          <div
            className="px-4 py-2 flex gap-1.5 border-b shrink-0"
            style={{ borderColor: darkMode ? '#1e293b' : '#e2e8f0' }}
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'access', label: 'Access' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAlertFilter(tab.id)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                style={{
                  background: alertFilter === tab.id ? (darkMode ? '#334155' : '#e2e8f0') : 'transparent',
                  color: darkMode ? '#94a3b8' : '#64748b',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} />
                <p className="text-sm" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>No alerts</p>
              </div>
            ) : (
              filteredAlerts.map((n) => {
                const style = TYPE_STYLES[n.type] || TYPE_STYLES.guest_request;
                const Icon = style.icon;
                return (
                  <div
                    key={n.id}
                    className="mb-2 p-3.5 rounded-xl cursor-pointer"
                    style={{
                      background: n.read
                        ? darkMode ? 'rgba(15, 23, 42, 0.35)' : '#f8fafc'
                        : darkMode ? 'rgba(30, 41, 59, 0.6)' : '#fff',
                      border: `1px solid ${n.read ? (darkMode ? '#1e293b' : '#e2e8f0') : style.color + '40'}`,
                      opacity: n.read ? 0.75 : 1,
                    }}
                    onClick={() => {
                      if (!n.read) onMarkRead?.(n.id);
                      if (n.actionTarget && onAction) onAction(n);
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: style.bg }}>
                        <Icon className="w-4 h-4" style={{ color: style.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className="text-sm font-semibold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: '#3b82f6' }} />}
                        </div>
                        <p className="text-xs mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{n.message}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] flex items-center gap-1" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
                            <Clock className="w-3 h-3" />
                            {n.timeAgo}
                          </span>
                          <div className="flex items-center gap-2">
                            {n.read && (
                              <span className="text-[10px] flex items-center gap-1" style={{ color: '#10b981' }}>
                                <Check className="w-3 h-3" />
                                Read
                              </span>
                            )}
                            {n.actionLabel && (
                              <span className="text-[10px] font-bold" style={{ color: '#004A98' }}>{n.actionLabel} →</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <ActivityLogTab
          logs={auditLogs}
          darkMode={darkMode}
          onMarkRead={onAuditMarkRead}
          onMarkAllRead={onAuditMarkAllRead}
          onClearRead={onClearReadActivity}
          readCount={activityRead}
          isUpdating={isUpdatingAudit}
        />
      )}

      <div
        className="px-4 py-3 border-t text-[10px] leading-relaxed shrink-0"
        style={{
          borderColor: darkMode ? '#1e293b' : '#e2e8f0',
          color: darkMode ? '#64748b' : '#94a3b8',
          background: darkMode ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
        }}
      >
        {isAdmin
          ? 'Alerts for guest access · Activity Log tracks all record changes.'
          : 'Updates about your guest access status appear under Alerts.'}
      </div>
    </div>
  );
}
