import { Clock } from 'lucide-react';

export function SyncStatusBadge({ syncStatus, darkMode, className = '' }) {
  if (syncStatus !== 'pending') return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}
      style={{
        background: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(254, 243, 199, 0.95)',
        color: darkMode ? '#fbbf24' : '#b45309',
        border: `1px solid ${darkMode ? '#d97706' : '#f59e0b'}`,
      }}
      title="Saved offline — will sync when online"
    >
      <Clock className="h-3 w-3" />
      Pending sync
    </span>
  );
}
