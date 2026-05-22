import type { ReactNode } from 'react'
import { CloseIcon } from './Icon'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/** A centered modal with a blurred backdrop. Click the backdrop to close. */
export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="kb-overlay" onClick={onClose}>
      <div className="kb-panel" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="min-w-0 break-words text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn shrink-0"
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
