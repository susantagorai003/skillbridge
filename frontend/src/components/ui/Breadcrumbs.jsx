import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-6">
      <Link to="/" className="text-sage-dark hover:text-terracotta transition-colors"><Home size={14} /></Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-warm-border" />
          {item.href ? (
            <Link to={item.href} className="text-sage-dark hover:text-terracotta transition-colors">{item.label}</Link>
          ) : (
            <span className="text-charcoal font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
