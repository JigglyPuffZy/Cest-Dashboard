import { useState } from "react";
import {
  UserCheck,
  UserX,
  Clock,
  Shield,
  ScrollText,
  Check,
  X,
  Unplug,
} from "lucide-react";
import { PageHeader, GlassCard, StatCard } from "../../components/ui/PageHeader";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useAccessRequests } from "../../shared/hooks/useAccessRequests";

const TABS = [
  { id: "pending", label: "Pending", icon: Clock },
  { id: "approved", label: "Approved", icon: UserCheck },
  { id: "declined", label: "Declined", icon: UserX },
  { id: "logs", label: "Access Logs", icon: ScrollText },
];

const LOG_TYPE_LABELS = {
  request_submitted: "Request submitted",
  request_approved: "Approved",
  request_declined: "Declined",
  access_revoked: "Disconnected",
  file_access: "File viewed",
  page_visit: "Page visit",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const styles = {
    pending: { bg: "#f59e0b18", color: "#d97706", label: "Pending" },
    approved: { bg: "#10b98118", color: "#059669", label: "Approved" },
    declined: { bg: "#ef444418", color: "#dc2626", label: "Declined" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function RequestCard({ request, darkMode, onApprove, onDecline, onDisconnect, showActions, showDisconnect }) {
  return (
    <GlassCard darkMode={darkMode} className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)",
            color: "#fff",
          }}
        >
          {request.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3
              className="font-semibold text-base"
              style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
            >
              {request.fullName}
            </h3>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            Requested {formatDate(request.requestedAt)}
            {request.reviewedAt && (
              <> · Reviewed {formatDate(request.reviewedAt)}</>
            )}
          </p>
        </div>
        {showDisconnect && request.status === "approved" && (
          <button
            type="button"
            onClick={() => onDisconnect(request.id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)" }}
          >
            <Unplug className="w-4 h-4" />
            Disconnect
          </button>
        )}
        {showActions && request.status === "pending" && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onApprove(request.id)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => onDecline(request.id)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                background: darkMode ? "#1e293b" : "#f1f5f9",
                color: "#dc2626",
                border: "1px solid #fecaca",
              }}
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function AccessLogsTable({ logs, darkMode }) {
  return (
    <GlassCard darkMode={darkMode} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${darkMode ? "#1e293b" : "#e2e8f0"}`,
                color: darkMode ? "#94a3b8" : "#64748b",
              }}
            >
              <th className="text-left font-semibold px-4 py-3">Time</th>
              <th className="text-left font-semibold px-4 py-3">User</th>
              <th className="text-left font-semibold px-4 py-3">Activity</th>
              <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                  No access logs yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: `1px solid ${darkMode ? "#1e293b" : "#f1f5f9"}` }}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-xs tabular-nums" style={{ color: darkMode ? "#cbd5e1" : "#475569" }}>
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
                    {log.userName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                      style={{ background: "#004A9818", color: "#004A98" }}
                    >
                      {LOG_TYPE_LABELS[log.type] || log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                    {log.message}
                    {log.actor && ` · by ${log.actor}`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

export function AdminRequestsPage({ darkMode, initialTab = "pending", adminName = "Administrator" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const { stats, pending, approved, declined, logs, approveRequest, declineRequest, disconnectGuest } = useAccessRequests({
    enabled: true,
    pollMs: 10000,
  });

  const handleApprove = async (id) => {
    try {
      await approveRequest(id, adminName);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to approve request.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await declineRequest(id, adminName);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to decline request.");
    }
  };

  const handleDisconnectClick = (request) => {
    setDisconnectTarget(request);
  };

  const handleConfirmDisconnect = async () => {
    if (!disconnectTarget) return;
    try {
      await disconnectGuest(disconnectTarget.id, adminName);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to disconnect guest.");
    }
  };

  const lists = { pending, approved, declined };
  const currentList = lists[activeTab] || [];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 w-full min-w-0">
      <PageHeader
        darkMode={darkMode}
        eyebrow="Administration"
        title="User Access"
        description="Review guest requests, approve or decline access, disconnect active guests, and view activity."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard darkMode={darkMode} label="Pending Requests" value={stats.pendingRequests} icon={Clock} color="#f59e0b" />
        <StatCard darkMode={darkMode} label="Approved Users" value={stats.approvedUsers} icon={UserCheck} color="#10b981" />
        <StatCard darkMode={darkMode} label="Total Visitors" value={stats.totalVisitors} icon={Shield} color="#004A98" />
        <StatCard darkMode={darkMode} label="Files Accessed Today" value={stats.filesAccessedToday} icon={ScrollText} color="#8b5cf6" />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tab.id === "logs" ? logs.length : (lists[tab.id]?.length ?? 0);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #004A98 0%, #0066CC 100%)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(0, 74, 152, 0.35)",
                    }
                  : {
                      background: darkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.9)",
                      color: darkMode ? "#cbd5e1" : "#475569",
                      border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                    }
              }
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id !== "logs" && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : darkMode ? "#0f172a" : "#e2e8f0",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "logs" ? (
        <AccessLogsTable logs={logs} darkMode={darkMode} />
      ) : (
        <div className="space-y-3">
          {currentList.length === 0 ? (
            <GlassCard darkMode={darkMode} className="p-10 text-center">
              <p className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                No {activeTab} requests at this time.
              </p>
            </GlassCard>
          ) : (
            currentList.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                darkMode={darkMode}
                showActions={activeTab === "pending"}
                showDisconnect={activeTab === "approved"}
                onApprove={() => handleApprove(request.id)}
                onDecline={() => handleDecline(request.id)}
                onDisconnect={() => handleDisconnectClick(request)}
              />
            ))
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={handleConfirmDisconnect}
        title="Disconnect Guest?"
        subtitle={disconnectTarget ? `Remove access for ${disconnectTarget.fullName}` : ""}
        description="They will lose dashboard access immediately. This action is for safety when a guest session should end."
        confirmText="Disconnect"
        cancelText="Cancel"
        variant="danger"
        darkMode={darkMode}
        icon={Unplug}
      />
    </div>
  );
}
