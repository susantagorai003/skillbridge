import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Fade-in from below */
export const fadeInUp = (el, options = {}) => {
  return gsap.from(el, {
    y: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
    ...options,
  })
}

/** Fade-in from left */
export const fadeInLeft = (el, options = {}) => {
  return gsap.from(el, {
    x: -50, opacity: 0, duration: 0.8, ease: 'power3.out',
    ...options,
  })
}

/** Fade-in from right */
export const fadeInRight = (el, options = {}) => {
  return gsap.from(el, {
    x: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
    ...options,
  })
}

/** Stagger children animation */
export const staggerChildren = (parent, childSelector = '[data-animate]', options = {}) => {
  const children = parent.querySelectorAll(childSelector)
  if (!children.length) return null
  return gsap.from(children, {
    y: 30, opacity: 0, duration: 0.6, stagger: 0.12,
    ease: 'power2.out',
    ...options,
  })
}

/** Text reveal (character by character) */
export const textReveal = (el, options = {}) => {
  const text = el.textContent
  el.innerHTML = text.split('').map(
    (c) => `<span style="display:inline-block;opacity:0">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('')
  return gsap.to(el.querySelectorAll('span'), {
    opacity: 1, y: 0, duration: 0.03, stagger: 0.025,
    ease: 'power1.out', ...options,
  })
}

/** Animated counter */
export const counterAnimation = (el, target, options = {}) => {
  const obj = { value: 0 }
  return gsap.to(obj, {
    value: target,
    duration: options.duration || 2,
    ease: 'power1.out',
    onUpdate: () => {
      el.textContent = Math.round(obj.value).toLocaleString('en-IN')
    },
    scrollTrigger: options.scrollTrigger || {
      trigger: el,
      start: 'top 85%',
    },
    ...options,
  })
}

/** Parallax scroll effect */
export const parallax = (el, options = {}) => {
  return gsap.to(el, {
    y: options.distance || -50,
    ease: 'none',
    scrollTrigger: {
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      ...options.scrollTrigger,
    },
  })
}
