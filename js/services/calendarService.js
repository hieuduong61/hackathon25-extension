/**
 * Service for interacting with Google Calendar API
 */

/**
 * Add an event to Google Calendar
 * @param {Object} event - Event data to add
 * @returns {Promise<Object>} Result from Google Calendar API
 */
export async function addEventToCalendar(event) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'addToCalendar',
        data: event
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      }
    );
  });
}
