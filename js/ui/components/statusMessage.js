/**
 * Status message component for displaying temporary notifications
 */

/**
 * Show a temporary status message
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'info', 'success', 'error'
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export function showMessage(message, type = 'info', duration = 5000) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.status-message');
  existingMessages.forEach(msg => msg.remove());

  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `status-message status-${type}`;
  messageEl.textContent = message;

  // Insert at the top of container
  const container = document.querySelector('.container');
  container.insertBefore(messageEl, container.firstChild);

  // Auto-remove after duration
  setTimeout(() => {
    messageEl.remove();
  }, duration);
}
