/**
 * Debounce a function call.
 */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Class name merger (like clsx).
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Generate a random ID.
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 12)
}

/**
 * Check if an object is empty.
 */
export const isEmpty = (obj) => {
  if (!obj) return true
  if (Array.isArray(obj)) return obj.length === 0
  return Object.keys(obj).length === 0
}

/**
 * Get the match score colour class.
 */
export const getMatchColor = (score) => {
  if (score >= 85) return 'text-forest'
  if (score >= 70) return 'text-sage-dark'
  if (score >= 50) return 'text-terracotta'
  return 'text-red-500'
}

/**
 * Get proficiency bar width.
 */
export const getProficiencyWidth = (level) => {
  return `${(level / 4) * 100}%`
}

/**
 * Sleep utility (for testing).
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
