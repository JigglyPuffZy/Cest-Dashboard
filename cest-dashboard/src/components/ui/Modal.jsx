import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Portal overlay — centers children in the viewport regardless of scroll containers.
 */
export const Modal = ({
  isOpen = true,
  onClose,
  children,
  zIndex = 10000,
  className = '',
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose?.()
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm animate-backdrop-fade-in ${className || 'bg-black/60'}`}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>,
    document.body
  )
}

/** Centered panel — use inside Modal; animation uses scale only (no translate conflict). */
export const ModalPanel = ({
  children,
  className = '',
  maxWidth = 'max-w-lg',
  animate = true,
  onClick,
}) => (
  <div
    className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${animate ? 'animate-modal-fade-in' : ''} ${className}`}
    onClick={(e) => {
      e.stopPropagation()
      onClick?.(e)
    }}
  >
    {children}
  </div>
)
