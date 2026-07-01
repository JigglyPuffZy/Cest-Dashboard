import { AlertTriangle, X } from 'lucide-react'
import { Modal, ModalPanel } from './Modal'

const VARIANTS = {
  danger: {
    iconBg: 'rgba(220, 38, 38, 0.15)',
    iconColor: '#dc2626',
    confirmBg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    confirmShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
  },
  primary: {
    iconBg: 'rgba(0, 74, 152, 0.15)',
    iconColor: '#004A98',
    confirmBg: 'linear-gradient(135deg, #004A98 0%, #0066CC 100%)',
    confirmShadow: '0 4px 12px rgba(0, 74, 152, 0.35)',
  },
}


export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  subtitle = '',
  description = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  darkMode = false,
  icon: Icon = AlertTriangle,
  closeOnBackdrop = true,
}) => {
  const styles = VARIANTS[variant] || VARIANTS.danger
  const titleId = 'confirm-modal-title'
  const descId = description ? 'confirm-modal-description' : undefined

  const handleConfirm = () => {
    onConfirm?.()
    onClose?.()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descId}
      closeOnBackdrop={closeOnBackdrop}
    >
      <ModalPanel maxWidth="max-w-md">
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: darkMode ? '#0f172a' : '#ffffff',
            border: `1px solid ${darkMode ? '#1e293b' : '#e5e7eb'}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            className="p-6 border-b"
            style={{ borderColor: darkMode ? '#1e293b' : '#e5e7eb' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: styles.iconBg }}
              >
                <Icon className="w-6 h-6" style={{ color: styles.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  id={titleId}
                  className="text-lg font-bold"
                  style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg flex-shrink-0 transition-colors"
                style={{
                  background: darkMode ? '#1e293b' : '#f1f5f9',
                  color: darkMode ? '#94a3b8' : '#64748b',
                }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {description && (
            <div className="px-6 pt-6">
              {typeof description === 'string' ? (
                <p
                  id={descId}
                  className="text-sm"
                  style={{ color: darkMode ? '#cbd5e1' : '#475569' }}
                >
                  {description}
                </p>
              ) : (
                <div id={descId} className="text-sm" style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
                  {description}
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: darkMode ? '#1e293b' : '#f1f5f9',
                  color: darkMode ? '#f8fafc' : '#0f172a',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                }}
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: styles.confirmBg,
                  boxShadow: styles.confirmShadow,
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </ModalPanel>
    </Modal>
  )
}

export default ConfirmModal
