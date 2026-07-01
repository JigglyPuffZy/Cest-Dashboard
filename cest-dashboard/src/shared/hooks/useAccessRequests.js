import { useState, useEffect, useCallback } from "react";
import { accessRequestService } from "../services/accessRequestService";

const EMPTY_STATS = {
  pendingRequests: 0,
  approvedUsers: 0,
  declinedUsers: 0,
  totalVisitors: 0,
  filesAccessedToday: 0,
};

export function useAccessRequests({ enabled = true, pollMs = 15000 } = {}) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [requests, setRequests] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const [nextStats, nextRequests, nextLogs] = await Promise.all([
        accessRequestService.getStats(),
        accessRequestService.getRequests(),
        accessRequestService.getLogs(),
      ]);
      setStats(nextStats);
      setRequests(nextRequests);
      setLogs(nextLogs);
    } catch (err) {
      console.error("useAccessRequests refresh:", err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
    if (!enabled || !pollMs) return undefined;
    const timer = setInterval(refresh, pollMs);
    return () => clearInterval(timer);
  }, [refresh, enabled, pollMs]);

  const approveRequest = useCallback(
    async (id, reviewedBy) => {
      await accessRequestService.approveRequest(id, reviewedBy);
      await refresh();
    },
    [refresh]
  );

  const declineRequest = useCallback(
    async (id, reviewedBy) => {
      await accessRequestService.declineRequest(id, reviewedBy);
      await refresh();
    },
    [refresh]
  );

  const disconnectGuest = useCallback(
    async (id, reviewedBy) => {
      await accessRequestService.disconnectGuest(id, reviewedBy);
      await refresh();
    },
    [refresh]
  );

  return {
    stats,
    requests,
    logs,
    loading,
    refresh,
    approveRequest,
    declineRequest,
    disconnectGuest,
    pending: requests.filter((r) => r.status === "pending"),
    approved: requests.filter((r) => r.status === "approved"),
    declined: requests.filter((r) => r.status === "declined"),
  };
}
