import { X } from 'lucide-react'
import './Components.css'

// ===== Card =====
export function Card({ children, className = '', hover = false, glow = false, glass = false, onClick, ...props }) {
  const classes = [
    'card',
    glass && 'card-glass',
    hover && 'card-hover',
    glow && 'card-glow',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}} {...props}>
      {children}
    </div>
  )
}

// ===== Badge =====
export function Badge({ children, variant = 'info', dot = false }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className={`badge-dot badge-dot-${variant === 'info' ? 'success' : variant}`} />}
      {children}
    </span>
  )
}

// ===== Modal =====
export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ===== Loader =====
export function Loader({ fullscreen = false, text = 'Memuat...' }) {
  return (
    <div className={`loader-container ${fullscreen ? 'loader-fullscreen' : ''}`}>
      <div className="loader-spinner" />
      <span>{text}</span>
    </div>
  )
}

// ===== Empty State =====
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state animate-fade-in">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={28} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action}
    </div>
  )
}
