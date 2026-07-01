import { useState, useEffect, useCallback, useMemo } from 'react';
import { accessRequestService } from '../services/accessRequestService';

const READ_KEY = 'cest_notification_read_ids';
const CLEARED_KEY = 'cest_notification_cleared_ids';

function loadIds(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIds(key, ids) {
  try {
    sessionStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function useNotifications({
  enabled = true,
  isAdmin = false,
  isGuestMode = false,
  guestAccessStatus = null,
  guestDisconnected = false,
  pollMs = 15000,
}) {
  const [readIds, setReadIds] = useState(() => loadIds(READ_KEY));
  const [clearedIds, setClearedIds] = useState(() => loadIds(CLEARED_KEY));
  const [pendingGuests, setPendingGuests] = useState([]);

  const refreshGuestRequests = useCallback(async () => {
    if (!enabled || !isAdmin) return;
    try {
      const requests = await accessRequestService.getRequests();
      setPendingGuests((requests || []).filter((r) => r.status === 'pending'));
    } catch (err) {
      console.warn('Notification guest fetch failed:', err);
    }
  }, [enabled, isAdmin]);

  useEffect(() => {
    refreshGuestRequests();
    if (!enabled || !isAdmin || !pollMs) return undefined;
    const timer = setInterval(refreshGuestRequests, pollMs);
    return () => clearInterval(timer);
  }, [refreshGuestRequests, enabled, isAdmin, pollMs]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveIds(READ_KEY, next);
      return next;
    });
  }, []);

  const markAllRead = useCallback((ids) => {
    setReadIds((prev) => {
      const next = [...new Set([...prev, ...ids])];
      saveIds(READ_KEY, next);
      return next;
    });
  }, []);

  const clearNotifications = useCallback((ids) => {
    if (!ids?.length) return;
    setClearedIds((prev) => {
      const next = [...new Set([...prev, ...ids])];
      saveIds(CLEARED_KEY, next);
      return next;
    });
  }, []);

  const notifications = useMemo(() => {
    if (!enabled) return [];

    const items = [];

    if (isAdmin) {
      pendingGuests.forEach((req) => {
        const id = `guest-request-${req.id}`;
        if (clearedIds.includes(id)) return;
        items.push({
          id,
          type: 'guest_request',
          category: 'access',
          title: 'Guest access request',
          message: `${req.fullName || 'A guest'} is waiting for your approval`,
          timestamp: req.requestedAt,
          timeAgo: formatTimeAgo(req.requestedAt),
          priority: 'high',
          actionLabel: 'Review request',
          actionTarget: 'admin',
        });
      });
    }

    if (isGuestMode && guestAccessStatus === 'approved' && !clearedIds.includes('guest-access-approved')) {
      items.push({
        id: 'guest-access-approved',
        type: 'access_approved',
        category: 'access',
        title: 'Access approved',
        message: 'You can now browse all project records in view-only mode.',
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        priority: 'high',
      });
    }

    if (isGuestMode && guestAccessStatus === 'declined') {
      const declinedId = guestDisconnected ? 'guest-access-disconnected' : 'guest-access-declined';
      if (!clearedIds.includes(declinedId)) {
        items.push({
          id: declinedId,
          type: 'access_declined',
          category: 'access',
          title: guestDisconnected ? 'Session ended' : 'Access not approved',
          message: guestDisconnected
            ? 'An administrator ended your guest session for safety.'
            : 'Your guest request was declined. Contact DOST Region II or sign in as staff.',
          timestamp: new Date().toISOString(),
          timeAgo: 'Just now',
          priority: 'high',
        });
      }
    }

    return items
      .map((n) => ({ ...n, read: readIds.includes(n.id) }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [enabled, isAdmin, isGuestMode, guestAccessStatus, guestDisconnected, pendingGuests, readIds, clearedIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  return {
    notifications,
    unreadCount,
    readCount,
    markRead,
    markAllRead,
    clearNotifications,
    refreshGuestRequests,
  };
};
