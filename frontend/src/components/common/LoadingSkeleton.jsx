export default function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-warm-border rounded"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl border border-warm-border p-6">
      <div className="h-4 bg-warm-border rounded w-3/4 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-warm-border rounded w-full" />
        <div className="h-3 bg-warm-border rounded w-5/6" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 bg-warm-border rounded-full w-16" />
        <div className="h-6 bg-warm-border rounded-full w-20" />
      </div>
    </div>
  )
}
