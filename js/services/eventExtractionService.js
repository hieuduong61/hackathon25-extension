/**
 * Service for extracting events from web pages using Claude AI
 */

/**
 * Extract page content from the active tab
 * @returns {Promise<Object>} Page content data
 */
export async function extractPageContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { action: 'extractPageHTML' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

/**
 * Extract events from page content using Claude AI
 * @param {Object} pageContent - Page content data
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<Array>} Array of extracted events
 */
export async function extractEvents(pageContent, apiKey) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'extractEvents',
        data: {
          pageContent: pageContent,
          apiKey: apiKey
        }
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
