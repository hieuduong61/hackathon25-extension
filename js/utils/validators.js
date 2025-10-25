/**
 * Validation utility functions
 */

/**
 * Validate Anthropic API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid
 */
export function isValidAnthropicApiKey(apiKey) {
  return apiKey && apiKey.trim().startsWith('sk-ant-');
}

/**
 * Validate event data
 * @param {Object} event - Event object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateEvent(event) {
  const errors = [];

  if (!event.title || event.title.trim() === '') {
    errors.push('Event title is required');
  }

  if (!event.startDateTime && !event.allDay) {
    errors.push('Start date/time is required for non-all-day events');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
