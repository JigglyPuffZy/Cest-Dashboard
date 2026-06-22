import { Eye } from 'lucide-react'

export const ViewModeBanner = ({ darkMode, onSignIn }) => (
  <div
    className="mx-8 mt-4 mb-0 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
    style={{
      background: darkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)',
      border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.25)'}`,
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)' }}
      >
        <Eye className="h-4 w-4" style={{ color: '#3b82f6' }} />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
          Guest View Mode
        </p>
        <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
          Read-only access — you cannot add, edit, or delete records
        </p>
      </div>
    </div>
    {onSignIn && (
      <button
        onClick={onSignIn}
        className="rounded-lg px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #004A98, #0066CC)' }}
      >
        Sign In to Edit
      </button>
    )}
  </div>
)
