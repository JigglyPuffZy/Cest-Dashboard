import { useCallback, useEffect, useState } from "react";
import { offlineSyncQueue } from "../services/offlineSyncQueue";
import { processOfflineSyncQueue } from "../services/offlineSyncProcessor";
import { isNetworkError } from "./useOfflineStatus";

export function useOfflineSync({ enabled = false, onSynced, onSyncComplete }) {
  const [pendingItems, setPendingItems] = useState(() => offlineSyncQueue.getPending());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    return offlineSyncQueue.subscribe(setPendingItems);
  }, []);

  const syncNow = useCallback(async () => {
    if (!enabled || !navigator.onLine || isSyncing) {
      return { synced: 0, failed: 0, remaining: pendingItems.length };
    }

    setIsSyncing(true);
    try {
      const result = await processOfflineSyncQueue({
        onItemSynced: onSynced,
      });
      onSyncComplete?.(result);
      setPendingItems(offlineSyncQueue.getPending());
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [enabled, isSyncing, onSynced, onSyncComplete, pendingItems.length]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleOnline = () => {
      syncNow();
    };

    window.addEventListener("online", handleOnline);
    if (navigator.onLine && pendingItems.length > 0) {
      syncNow();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, [enabled, pendingItems.length, syncNow]);

  return {
    pendingItems,
    pendingCount: pendingItems.filter((item) => item.status !== "failed").length,
    failedCount: pendingItems.filter((item) => item.status === "failed").length,
    isSyncing,
    syncNow,
    enqueue: offlineSyncQueue.enqueue,
  };
}

export function shouldQueueMutation(isAdmin, error) {
  if (!isAdmin) return false;
  return !navigator.onLine || isNetworkError(error);
}
