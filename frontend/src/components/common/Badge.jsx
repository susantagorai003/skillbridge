import { cn } from '../../utils/helpers'

const colorMap = {
  default: 'bg-ivory text-charcoal',
  success: 'bg-sage/20 text-forest',
  warning: 'bg-terracotta-light/20 text-terracotta-dark',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sage-light/30 text-olive',
}

export default function Badge({ children, color = 'default', className = '' }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorMap[color],
      className,
    )}>
      {children}
    </span>
  )
}
