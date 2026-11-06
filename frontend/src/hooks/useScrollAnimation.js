import { useEffect, useRef } from 'react'

/**
 * useScrollAnimation
 * Safe animation hook that guarantees elements remain 100% visible.
 * Never sets or leaves elements stuck at opacity: 0.
 */
export default function useScrollAnimation() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Ensure all target elements are 100% visible
    const children = el.querySelectorAll('[data-animate]')
    const targets = children.length > 0 ? Array.from(children) : [el]
    targets.forEach((target) => {
      target.style.opacity = '1'
      target.style.visibility = 'visible'
    })
  }, [])

  return ref
}
