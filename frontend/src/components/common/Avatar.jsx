import { getInitials } from '../../utils/formatters'
import { cn } from '../../utils/helpers'

export default function Avatar({ name, src, size = 'md', className = '' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
  }

  return (
    <div className={cn(
      'rounded-full bg-forest text-white flex items-center justify-center font-heading font-semibold',
      sizes[size], className,
    )}>
      {getInitials(name)}
    </div>
  )
}
