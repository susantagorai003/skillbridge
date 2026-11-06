import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-charcoal mb-1">Error</h3>
      <p className="text-sm text-sage-dark max-w-sm mb-4">{message}</p>
      {onRetry && <Button onClick={onRetry} size="sm" variant="outline">Try Again</Button>}
    </div>
  )
}
