import { useEffect, useId, useRef } from 'react'
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

let openModalCount = 0
let savedBodyOverflow = null

/**
 * Portal modal — backdrop + flex-centered dialog.
 * Center layer uses pointer-events-none so backdrop clicks work beside the panel.
 */
export const Modal = ({
  isOpen = true,
  onClose,
  children,
  zIndex = DEFAULT_Z,
  overlayClassName = '',
  className,
  closeOnBackdrop = true,
  closeOnEscape = true,
  labelledBy,
  describedBy,
}) => {
  const panelRef = useRef(null)
  const fallbackTitleId = useId()
  const titleId = labelledBy || fallbackTitleId

  useEffect(() => {
    if (!isOpen) return undefined

    openModalCount += 1
    if (openModalCount === 1) {
      savedBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }

    const handleKeyDown = (event) => {
      if (!closeOnEscape || event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onClose?.()
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      openModalCount = Math.max(0, openModalCount - 1)
      if (openModalCount === 0) {
        document.body.style.overflow = savedBodyOverflow ?? ''
        savedBodyOverflow = null
      }
    }
  }, [isOpen, onClose, closeOnEscape])

  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    const focusable = panelRef.current.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus({ preventScroll: true })
  }, [isOpen])

  if (!isOpen) return null

  const resolvedOverlayClass = overlayClassName || className || 'bg-black/60 backdrop-blur-sm'

  const handleBackdropClick = () => {
    if (closeOnBackdrop) onClose?.()
  }

  return createPortal(
    <div
      className="cest-modal-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Backdrop — receives outside clicks */}
      <div
        aria-hidden="true"
        className={`cest-modal-backdrop animate-backdrop-fade-in ${resolvedOverlayClass}`}
        style={{
          position: 'absolute',
          inset: 0,
          margin: 0,
          padding: 0,
        }}
        onClick={handleBackdropClick}
      />

      {/* Centering layer — pointer-events-none so backdrop gets side clicks */}
      <div
        className="cest-modal-center"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          overflow: 'hidden',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={describedBy}
          className="cest-modal-dialog"
          style={{
            position: 'relative',
            width: 'auto',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: 'min(90dvh, 900px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            margin: 0,
            flexShrink: 0,
            pointerEvents: 'auto',
            boxSizing: 'border-box',
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

/** Width wrapper + opacity-only enter animation (never uses transform). */
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
      style={{
        width: resolvedMaxWidth,
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      <div className={animate ? 'cest-modal-content-in' : undefined}>
        {children}
      </div>
    </div>
  )
}
