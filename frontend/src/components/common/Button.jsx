import { cn } from '../../utils/helpers'

const variants = {
  primary: 'bg-teal hover:bg-teal-dark text-midnight font-bold shadow-md hover:shadow-teal/20',
  secondary: 'bg-midnight hover:bg-midnight-light text-white font-bold shadow-md',
  coral: 'bg-coral hover:bg-coral-dark text-white font-bold shadow-md hover:shadow-coral/25',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold',
  ghost: 'text-slate-700 hover:bg-slate-100 font-semibold',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-bold',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

const variantStyles = {
  primary: { backgroundColor: '#00BFA6', color: '#14213D' },
  secondary: { backgroundColor: '#14213D', color: '#FFFFFF' },
  coral: { backgroundColor: '#FF6B5E', color: '#FFFFFF' },
  outline: { backgroundColor: '#FFFFFF', color: '#334155', borderColor: '#CBD5E1' },
  ghost: { color: '#334155' },
  danger: { backgroundColor: '#DC2626', color: '#FFFFFF' },
}

export default function Button({
  children, variant = 'primary', size = 'md', className = '',
  loading = false, disabled = false, icon: Icon, style = {}, ...props
}) {
  const mergedStyle = {
    ...(variantStyles[variant] || variantStyles.primary),
    ...style,
  }

  return (
    <button
      disabled={disabled || loading}
      style={mergedStyle}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold font-heading transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  )
}
