export default function ProgressBar({ value = 0, max = 100, label, color = 'terracotta', size = 'md' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
  const colors = {
    terracotta: 'bg-terracotta',
    sage: 'bg-sage',
    forest: 'bg-forest',
  }

  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-sage-dark mb-1.5">
          <span>{label}</span>
          <span className="font-semibold text-charcoal">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full bg-ivory rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
