import { cn } from '../../utils/helpers'

export default function Card({ children, className = '', hover = false, padding = 'p-6', ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-warm-border',
        padding,
        hover && 'hover:shadow-lg hover:border-sage/50 transition-all duration-300',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={cn('font-heading font-bold text-lg text-charcoal', className)}>{children}</h3>
}

export function CardDescription({ children, className = '' }) {
  return <p className={cn('text-sm text-sage-dark mt-1', className)}>{children}</p>
}
