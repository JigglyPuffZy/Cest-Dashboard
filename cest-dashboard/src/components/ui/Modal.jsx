import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const DEFAULT_Z = 10050

const MAX_WIDTH_MAP = {
  'max-w-sm': '24rem',
  'max-w-md': '28rem',
  'max-w-lg': '32rem',
  'max-w-xl': '36rem',
  'max-w-2xl': '42rem',
  'max-w-3xl': '48rem',
  'max-w-4xl': '56rem',
  'max-w-5xl': '64rem',
  'max-w-[400px]': '400px',
  'max-w-[720px]': '720px',
}

const overlayStyle = (zIndex) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  zIndex,
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
})

const panelStyle = (zIndex) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: zIndex + 1,
  maxWidth: 'calc(100vw - 2rem)',
  maxHeight: 'min(90vh, 900px)',
  overflowY: 'auto',
  margin: 0,
  boxSizing: 'border-box',
})

/**
 * Portal modal — panel is centered with fixed + translate (immune to flex/CSS load issues).
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

  const handleBackdropClick = () => {
    if (closeOnBackdrop) onClose?.()
  }

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className={`animate-backdrop-fade-in backdrop-blur-sm ${className || 'bg-black/60'}`}
        style={overlayStyle(zIndex)}
        onClick={handleBackdropClick}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={panelStyle(zIndex)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  )
}

/** Optional wrapper for max-width + enter animation (animation on inner div only). */
export const ModalPanel = ({
  children,
  className = '',
  maxWidth = 'max-w-lg',
  animate = true,
}) => {
  const resolvedMaxWidth = MAX_WIDTH_MAP[maxWidth] || '32rem'

  return (
    <div
      className={className}
      style={{ width: '100%', maxWidth: resolvedMaxWidth }}
    >
      <div
        className={animate ? 'animate-modal-fade-in' : undefined}
        style={{ transformOrigin: 'center center' }}
      >
        {children}
      </div>
    </div>
  )
}
