/**
 * Chrome storage service for managing settings
 */

/**
 * Load settings from Chrome storage
 * @returns {Promise<Object>} Settings object
 */
export async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['anthropicApiKey'], (result) => {
      resolve(result);
    });
  });
}

/**
 * Save settings to Chrome storage
 * @param {Object} settings - Settings to save
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, resolve);
  });
}

/**
 * Get a specific setting value
 * @param {string} key - Setting key
 * @returns {Promise<any>} Setting value
 */
export async function getSetting(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key]);
    });
  });
}
