import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const DEFAULT_Z = 10050

/**
 * Portal overlay — always centers in the viewport (not affected by sidebar scroll/transform).
 */
export const Modal = ({
  isOpen = true,
  onClose,
  children,
  zIndex = DEFAULT_Z,
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
      className={`cest-modal-overlay animate-backdrop-fade-in backdrop-blur-sm ${className || 'bg-black/60'}`}
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

/** Centered panel — animation uses scale only (no translate conflict). */
export const ModalPanel = ({
  children,
  className = '',
  maxWidth = 'max-w-lg',
  animate = true,
  onClick,
}) => (
  <div
    className={`cest-modal-panel w-full ${maxWidth} ${animate ? 'animate-modal-fade-in' : ''} ${className}`}
    onClick={(e) => {
      e.stopPropagation()
      onClick?.(e)
    }}
  >
    {children}
  </div>
)
