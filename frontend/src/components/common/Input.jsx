import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={17} />
          </div>
        )}
        <input
          ref={ref}
          style={{
            paddingLeft: Icon ? '2.75rem' : '1rem',
            border: '1.5px solid #CBD5E1',
            borderRadius: '0.75rem',
            backgroundColor: '#FFFFFF',
            ...props.style
          }}
          className={cn(
            'w-full py-2.5 pr-4 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20',
            'transition-all duration-200 shadow-sm',
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : '',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
