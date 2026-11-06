import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { dropdownMenu } from '../../animations/variants'

export default function DropdownMenu({ trigger, items = [], align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1">
        {trigger}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownMenu}
            initial="hidden" animate="visible" exit="exit"
            className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} min-w-[180px] bg-white rounded-xl border border-warm-border shadow-lg py-1 z-50`}
          >
            {items.map((item, i) =>
              item.divider ? (
                <div key={i} className="my-1 border-t border-warm-border" />
              ) : (
                <button
                  key={i}
                  onClick={() => { item.onClick?.(); setOpen(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-charcoal hover:bg-ivory transition-colors flex items-center gap-2"
                >
                  {item.icon && <item.icon size={14} className="text-sage-dark" />}
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
