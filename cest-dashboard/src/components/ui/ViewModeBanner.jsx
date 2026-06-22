import { Eye, Lock, LogIn, ShieldCheck, Sparkles } from 'lucide-react'

export const ViewModeBanner = ({ darkMode, onSignIn }) => (
  <div className="mb-6 animate-fade-in">
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(15, 23, 42, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(239, 246, 255, 0.95) 50%, rgba(255, 255, 255, 0.98) 100%)',
        border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.22)'}`,
        boxShadow: darkMode
          ? '0 20px 50px -20px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
          : '0 20px 50px -20px rgba(0, 74, 152, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 right-0 h-32 w-32 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
      />

      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #004A98 0%, #0066CC 50%, #3b82f6 100%)',
              boxShadow: '0 8px 24px rgba(0, 102, 204, 0.45)',
            }}
          >
            <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2.2} />
            <div
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2"
              style={{
                background: darkMode ? '#0f172a' : '#ffffff',
                borderColor: darkMode ? '#334155' : '#e2e8f0',
              }}
            >
              <Eye className="h-3 w-3" style={{ color: '#3b82f6' }} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)',
                  color: darkMode ? '#93c5fd' : '#2563eb',
                  border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.25)'}`,
                }}
              >
                <Sparkles className="h-3 w-3" />
                Guest Access
              </span>
            </div>
            <h3
              className="text-base font-bold sm:text-lg"
              style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
            >
              You&apos;re browsing in View Mode
            </h3>
            <p
              className="mt-1 max-w-xl text-xs leading-relaxed sm:text-sm"
              style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
            >
              Explore dashboards, charts, and project data freely. Sign in when you need to add, edit, or archive records.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { icon: Eye, label: 'Browse data' },
                { icon: Lock, label: 'No edits' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 74, 152, 0.06)',
                    color: darkMode ? '#cbd5e1' : '#475569',
                    border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 74, 152, 0.1)'}`,
                  }}
                >
                  <Icon className="h-3 w-3 opacity-70" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {onSignIn && (
          <button
            onClick={onSignIn}
            className="group flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] sm:w-auto"
            style={{
              background: 'linear-gradient(135deg, #004A98 0%, #0066CC 55%, #3b82f6 100%)',
              boxShadow: '0 10px 28px rgba(0, 102, 204, 0.4)',
            }}
          >
            <LogIn className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Sign In to Edit
          </button>
        )}
      </div>
    </div>
  </div>
)
