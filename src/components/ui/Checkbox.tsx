import React from 'react'
import { FaCheck } from 'react-icons/fa6'
import { clsx } from 'clsx'

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  className = '',
  size = 'md',
  variant = 'primary',
}) => {
  const baseClasses =
    'inline-flex items-center cursor-pointer transition-all duration-200'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  const checkboxSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const variantClasses = {
    primary: checked
      ? 'bg-green-600 border-green-600'
      : 'bg-white border-gray-300',
    secondary: checked
      ? 'bg-red-600 border-red-600'
      : 'bg-white border-gray-300',
    success: checked
      ? 'bg-green-600 border-green-600'
      : 'bg-white border-gray-300',
    danger: checked
      ? 'bg-red-600 border-red-600'
      : 'bg-white border-gray-300',
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5',
  }

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <div
      className={clsx(baseClasses, disabledClasses, className)}
      onClick={handleClick}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {}}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={clsx(
            checkboxSizeClasses[size],
            variantClasses[variant],
            'border-2 rounded-md flex items-center justify-center transition-all duration-200',
            'hover:shadow-md focus:outline-none focus:ring-1 focus:ring-offset-1',
            checked
              ? 'focus:ring-green-500 border-green-500/80'
              : 'focus:ring-gray-500 border-gray-400/80',
            disabled && 'opacity-50'
          )}
        >
          {checked && (
            <FaCheck
              className={clsx(iconSizeClasses[size], 'text-white')}
            />
          )}
        </div>
      </div>
      {label && (
        <label className="ml-3 text-gray-700 select-none">{label}</label>
      )}
    </div>
  )
}

export default Checkbox

