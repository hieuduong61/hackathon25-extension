/**
 * Service for extracting events from web pages using Claude AI
 */

/**
 * Check if the URL is a valid web page (not a system page)
 * @param {string} url - URL to check
 * @returns {boolean} True if valid
 */
function isValidWebPage(url) {
  if (!url) return false;

  const invalidPrefixes = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'data:',
    'file://'
  ];

  return !invalidPrefixes.some(prefix => url.startsWith(prefix));
}

/**
 * Extract page content from the active tab
 * @returns {Promise<Object>} Page content data
 */
export async function extractPageContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Validate the tab URL
  if (!isValidWebPage(tab.url)) {
    throw new Error('Cannot extract events from this page. Please navigate to a regular web page (http:// or https://).');
  }

  // Try to inject the content script if needed
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (error) {
    // Content script might already be injected, which is fine
    console.log('Content script injection attempt:', error.message);
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { action: 'extractPageHTML' }, (response) => {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;

        // Provide user-friendly error messages
        if (errorMsg.includes('Receiving end does not exist')) {
          reject(new Error('Could not connect to the page. Please refresh the page and try again.'));
        } else {
          reject(new Error(errorMsg));
        }
      } else if (response && response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response?.error || 'Failed to extract page content'));
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
