/**
 * Formatting utility functions
 */

/**
 * Format date/time for display
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date string
 */
export function formatDateTime(isoString) {
  if (!isoString) return 'Not specified';

  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format date for datetime-local input
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date for input field (YYYY-MM-DDTHH:mm)
 */
export function formatDateTimeForInput(isoString) {
  if (!isoString) return '';
  return isoString.substring(0, 16);
}
