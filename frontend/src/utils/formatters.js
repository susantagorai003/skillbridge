/**
 * Format a number with commas.
 */
export const formatNumber = (num) => {
  if (num == null) return '0'
  return Number(num).toLocaleString('en-IN')
}

/**
 * Format currency (INR).
 */
export const formatCurrency = (amount, type = 'annual') => {
  if (amount == null) return 'Not disclosed'
  const num = Number(amount)
  if (type === 'annual') {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L/yr`
    return `₹${formatNumber(num)}/yr`
  }
  return `₹${formatNumber(num)}/mo`
}

/**
 * Format a date string.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Time ago helper.
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return formatDate(dateStr)
}

/**
 * Truncate text.
 */
export const truncate = (str, len = 100) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

/**
 * Get initials from name.
 */
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Capitalize first letter.
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Calculate days remaining.
 */
export const daysRemaining = (deadline) => {
  if (!deadline) return null
  const now = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}
