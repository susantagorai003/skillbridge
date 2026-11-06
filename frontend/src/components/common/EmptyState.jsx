import { Inbox } from 'lucide-react'
import Button from './Button'

export default function EmptyState({ icon: Icon = Inbox, title = 'No data', message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-ivory rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-sage-dark" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-charcoal mb-1">{title}</h3>
      {message && <p className="text-sm text-sage-dark max-w-sm">{message}</p>}
      {action && (
        <Button onClick={onAction} className="mt-4" size="sm">{action}</Button>
      )}
    </div>
  )
}
