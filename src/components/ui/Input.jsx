import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './Input.css'

export function Input({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon-left" />}
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={`input-field ${Icon ? 'has-icon-left' : ''} ${error ? 'input-error' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-icon-right"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  )
}

export function Select({ label, options = [], error, placeholder, className = '', ...props }) {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <select className={`select-field ${error ? 'input-error' : ''}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt =>
          typeof opt === 'string'
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.value} value={opt.value}>{opt.label}</option>
        )}
      </select>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <textarea
        className={`textarea-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  )
}
