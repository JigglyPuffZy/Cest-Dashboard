import { useState, useEffect, useCallback, useMemo } from 'react';
import { accessRequestService } from '../services/accessRequestService';

const READ_KEY = 'cest_notification_read_ids';

function loadReadIds() {
  try {
    const raw = sessionStorage.getItem(READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReadIds(ids) {
  try {
    sessionStorage.setItem(READ_KEY, JSON.stringify(ids));
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
  pollMs = 15000,
}) {
  const [readIds, setReadIds] = useState(loadReadIds);
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
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback((ids) => {
    setReadIds((prev) => {
      const next = [...new Set([...prev, ...ids])];
      saveReadIds(next);
      return next;
    });
  }, []);

  const notifications = useMemo(() => {
    if (!enabled) return [];

    const items = [];

    if (isAdmin) {
      pendingGuests.forEach((req) => {
        items.push({
          id: `guest-request-${req.id}`,
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

    if (isGuestMode && guestAccessStatus === 'approved' && !readIds.includes('guest-access-approved')) {
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

    if (isGuestMode && guestAccessStatus === 'declined' && !readIds.includes('guest-access-declined')) {
      items.push({
        id: 'guest-access-declined',
        type: 'access_declined',
        category: 'access',
        title: 'Access not approved',
        message: 'Your guest request was declined. Contact DOST Region II or sign in as staff.',
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        priority: 'high',
      });
    }

    return items
      .map((n) => ({ ...n, read: readIds.includes(n.id) }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [enabled, isAdmin, isGuestMode, guestAccessStatus, pendingGuests, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    refreshGuestRequests,
  };
}
