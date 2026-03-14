import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = '',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size && `btn-${size}`,
    fullWidth && 'btn-full',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
