import { WifiOff, CloudUpload, Loader2 } from 'lucide-react';

export function OfflineIndicator({ isOnline, pendingCount, isSyncing, darkMode, onSyncNow }) {
  if (isOnline && pendingCount === 0 && !isSyncing) return null;

  const offline = !isOnline;

  return (
    <div
      className="mx-auto mb-4 max-w-[1400px] flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
      style={{
        background: offline
          ? darkMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(254, 226, 226, 0.9)'
          : darkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(219, 234, 254, 0.95)',
        borderColor: offline ? '#f87171' : '#60a5fa',
        color: darkMode ? '#e2e8f0' : '#1e293b',
      }}
    >
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        ) : offline ? (
          <WifiOff className="h-4 w-4 text-red-500" />
        ) : (
          <CloudUpload className="h-4 w-4 text-blue-500" />
        )}
        <span>
          {isSyncing
            ? 'Syncing pending changes to server...'
            : offline
              ? 'You are offline. Viewing cached data. New edits will be saved as pending until you reconnect.'
              : `${pendingCount} pending change${pendingCount === 1 ? '' : 's'} waiting to sync.`}
        </span>
      </div>
      {isOnline && pendingCount > 0 && !isSyncing && onSyncNow && (
        <button
          type="button"
          onClick={onSyncNow}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: '#2563eb' }}
        >
          Sync now
        </button>
      )}
    </div>
  );
}
