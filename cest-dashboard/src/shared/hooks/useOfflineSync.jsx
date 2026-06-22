import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { offlineStore } from '../services/offlineStore';
import {
  enqueueOrMergeMutation,
  isBrowserOnline,
  mergeQueueWithData,
  processSyncQueue,
} from '../services/offlineSyncService';

const OfflineContext = createContext(null);

export function OfflineProvider({ children, onSyncComplete }) {
  const [isOnline, setIsOnline] = useState(isBrowserOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const refreshPendingCount = useCallback(async () => {
    const queue = await offlineStore.getQueue();
    const count = queue.filter((q) => q.status === 'pending' || q.status === 'failed').length;
    setPendingCount(count);
    return queue;
  }, []);

  const syncNow = useCallback(async () => {
    if (!isBrowserOnline() || isSyncing) return null;
    setIsSyncing(true);
    try {
      const result = await processSyncQueue();
      setLastSyncResult(result);
      await refreshPendingCount();
      if (result.synced > 0 && onSyncComplete) {
        await onSyncComplete();
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, onSyncComplete, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [syncNow]);

  const queueChange = useCallback(
    async (mutation) => {
      const item = await enqueueOrMergeMutation(mutation);
      await refreshPendingCount();
      return item;
    },
    [refreshPendingCount]
  );

  const applyPendingOverlay = useCallback(async (data) => {
    const queue = await offlineStore.getQueue();
    return mergeQueueWithData(data, queue);
  }, []);

  const value = useMemo(
    () => ({
      isOnline,
      pendingCount,
      isSyncing,
      lastSyncResult,
      syncNow,
      queueChange,
      applyPendingOverlay,
      refreshPendingCount,
    }),
    [isOnline, pendingCount, isSyncing, lastSyncResult, syncNow, queueChange, applyPendingOverlay, refreshPendingCount]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return ctx;
}
