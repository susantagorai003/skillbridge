import { cn } from '../../utils/helpers'

export default function StatCard({ icon: Icon, label, value, trend, className = '' }) {
  return (
    <div className={cn('bg-white rounded-xl border border-warm-border p-5 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-ivory flex items-center justify-center">
          {Icon && <Icon size={20} className="text-terracotta" />}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend > 0 ? 'bg-sage/20 text-forest' : 'bg-red-50 text-red-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-heading font-bold text-charcoal">{value}</p>
      <p className="text-xs text-sage-dark mt-1">{label}</p>
    </div>
  )
}
