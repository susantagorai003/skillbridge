import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Create a scroll-triggered animation for a section */
export const createScrollAnimation = (trigger, targets, fromVars, options = {}) => {
  return gsap.from(targets, {
    ...fromVars,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger,
      start: 'top 80%',
      toggleActions: 'play none none none',
      ...options,
    },
  })
}

/** Horizontal scroll section */
export const horizontalScroll = (container, panels) => {
  return gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      snap: 1 / (panels.length - 1),
      end: () => '+=' + container.offsetWidth,
    },
  })
}

/** Pin an element during scroll */
export const pinElement = (el, options = {}) => {
  return ScrollTrigger.create({
    trigger: el,
    pin: true,
    start: 'top top',
    end: options.end || '+=500',
    ...options,
  })
}

/** Refresh all ScrollTriggers (call after layout changes) */
export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh()
}

/** Kill all ScrollTriggers (cleanup) */
export const killAllScrollTriggers = () => {
  ScrollTrigger.getAll().forEach((t) => t.kill())
}
