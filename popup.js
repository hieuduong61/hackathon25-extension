// Popup script to handle user interactions

let currentEvents = [];
let editingEventIndex = null;

// DOM elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const noEventsState = document.getElementById('noEventsState');
const eventsContainer = document.getElementById('eventsContainer');
const eventsList = document.getElementById('eventsList');
const configState = document.getElementById('configState');
const mainActions = document.getElementById('mainActions');

// Buttons
const extractBtn = document.getElementById('extractBtn');
const settingsBtn = document.getElementById('settingsBtn');
const retryBtn = document.getElementById('retryBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');

// Input fields
const anthropicApiKeyInput = document.getElementById('anthropicApiKey');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const settings = await loadSettings();
  anthropicApiKeyInput.value = settings.anthropicApiKey || '';

  // Check if API key is configured
  if (!settings.anthropicApiKey) {
    showMessage('Please configure your Anthropic API key in settings.', 'info');
  }

  // Set up event listeners
  extractBtn.addEventListener('click', handleExtractEvents);
  settingsBtn.addEventListener('click', showSettings);
  retryBtn.addEventListener('click', handleExtractEvents);
  tryAgainBtn.addEventListener('click', handleExtractEvents);
  saveSettingsBtn.addEventListener('click', handleSaveSettings);
  cancelSettingsBtn.addEventListener('click', hideSettings);
});

/**
 * Load settings from Chrome storage
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['anthropicApiKey'], (result) => {
      resolve(result);
    });
  });
}

/**
 * Save settings to Chrome storage
 */
async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, resolve);
  });
}

/**
 * Show settings panel
 */
function showSettings() {
  hideAllStates();
  configState.classList.remove('hidden');
  mainActions.classList.add('hidden');
}

/**
 * Hide settings panel
 */
function hideSettings() {
  configState.classList.add('hidden');
  mainActions.classList.remove('hidden');
  showInitialState();
}

/**
 * Handle save settings
 */
async function handleSaveSettings() {
  const apiKey = anthropicApiKeyInput.value.trim();

  if (!apiKey) {
    showMessage('Please enter your Anthropic API key.', 'error');
    return;
  }

  // Basic validation
  if (!apiKey.startsWith('sk-ant-')) {
    showMessage('Invalid API key format. Anthropic API keys start with "sk-ant-"', 'error');
    return;
  }

  await saveSettings({ anthropicApiKey: apiKey });
  showMessage('Settings saved successfully!', 'success');

  setTimeout(() => {
    hideSettings();
  }, 1000);
}

/**
 * Handle extract events
 */
async function handleExtractEvents() {
  try {
    // Load API key
    const settings = await loadSettings();
    if (!settings.anthropicApiKey) {
      showMessage('Please configure your Anthropic API key in settings first.', 'error');
      showSettings();
      return;
    }

    // Show loading state
    showLoading('Analyzing page for events...');

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Extract page HTML from content script
    const pageContent = await new Promise((resolve, reject) => {
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

    // Send to background script to process with Claude AI
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: 'extractEvents',
          data: {
            pageContent: pageContent,
            apiKey: settings.anthropicApiKey
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

    // Display events
    currentEvents = result;
    if (currentEvents.length === 0) {
      showNoEvents();
    } else {
      displayEvents(currentEvents);
    }
  } catch (error) {
    console.error('Error extracting events:', error);
    showError(error.message);
  }
}

/**
 * Display events in the UI
 */
function displayEvents(events) {
  hideAllStates();
  eventsContainer.classList.remove('hidden');

  eventsList.innerHTML = '';

  events.forEach((event, index) => {
    const eventCard = createEventCard(event, index);
    eventsList.appendChild(eventCard);
  });
}

/**
 * Create an event card element
 */
function createEventCard(event, index) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.dataset.index = index;

  card.innerHTML = `
    <div class="event-header">
      <div class="event-title">${escapeHtml(event.title)}</div>
      <div class="event-actions">
        <button class="btn btn-small btn-secondary edit-btn" data-index="${index}">Edit</button>
      </div>
    </div>
    <div class="event-info">
      ${event.startDateTime ? `
        <div class="event-info-row">
          <span class="event-info-label">Start:</span>
          <span class="event-info-value">${formatDateTime(event.startDateTime)}</span>
        </div>
      ` : ''}
      ${event.endDateTime ? `
        <div class="event-info-row">
          <span class="event-info-label">End:</span>
          <span class="event-info-value">${formatDateTime(event.endDateTime)}</span>
        </div>
      ` : ''}
      ${event.location ? `
        <div class="event-info-row">
          <span class="event-info-label">Location:</span>
          <span class="event-info-value">${escapeHtml(event.location)}</span>
        </div>
      ` : ''}
      ${event.description ? `
        <div class="event-info-row">
          <span class="event-info-label">Description:</span>
          <span class="event-info-value">${escapeHtml(event.description)}</span>
        </div>
      ` : ''}
    </div>
    <div class="event-footer">
      <button class="btn btn-primary btn-small add-to-calendar-btn" data-index="${index}">Add to Calendar</button>
    </div>
  `;

  // Add event listeners
  const editBtn = card.querySelector('.edit-btn');
  const addBtn = card.querySelector('.add-to-calendar-btn');

  editBtn.addEventListener('click', () => handleEditEvent(index));
  addBtn.addEventListener('click', () => handleAddToCalendar(index));

  return card;
}

/**
 * Handle edit event
 */
function handleEditEvent(index) {
  const card = document.querySelector(`.event-card[data-index="${index}"]`);
  const event = currentEvents[index];

  card.classList.add('editing');
  card.innerHTML = `
    <div class="event-header">
      <div class="event-title">
        <input type="text" id="edit-title-${index}" value="${escapeHtml(event.title)}">
      </div>
    </div>
    <div class="event-info">
      <div class="event-info-row">
        <span class="event-info-label">Start:</span>
        <span class="event-info-value">
          <input type="datetime-local" id="edit-start-${index}"
                 value="${event.startDateTime ? event.startDateTime.substring(0, 16) : ''}">
        </span>
      </div>
      <div class="event-info-row">
        <span class="event-info-label">End:</span>
        <span class="event-info-value">
          <input type="datetime-local" id="edit-end-${index}"
                 value="${event.endDateTime ? event.endDateTime.substring(0, 16) : ''}">
        </span>
      </div>
      <div class="event-info-row">
        <span class="event-info-label">Location:</span>
        <span class="event-info-value">
          <input type="text" id="edit-location-${index}" value="${escapeHtml(event.location)}">
        </span>
      </div>
      <div class="event-info-row">
        <span class="event-info-label">Description:</span>
        <span class="event-info-value">
          <textarea id="edit-description-${index}">${escapeHtml(event.description)}</textarea>
        </span>
      </div>
      <div class="event-info-row">
        <span class="event-info-label">All Day:</span>
        <span class="event-info-value">
          <input type="checkbox" id="edit-allday-${index}" ${event.allDay ? 'checked' : ''}>
        </span>
      </div>
    </div>
    <div class="event-footer">
      <button class="btn btn-secondary btn-small cancel-edit-btn" data-index="${index}">Cancel</button>
      <button class="btn btn-success btn-small save-edit-btn" data-index="${index}">Save</button>
    </div>
  `;

  const cancelBtn = card.querySelector('.cancel-edit-btn');
  const saveBtn = card.querySelector('.save-edit-btn');

  cancelBtn.addEventListener('click', () => {
    card.replaceWith(createEventCard(event, index));
  });

  saveBtn.addEventListener('click', () => {
    const updatedEvent = {
      title: document.getElementById(`edit-title-${index}`).value,
      startDateTime: document.getElementById(`edit-start-${index}`).value || null,
      endDateTime: document.getElementById(`edit-end-${index}`).value || null,
      location: document.getElementById(`edit-location-${index}`).value,
      description: document.getElementById(`edit-description-${index}`).value,
      allDay: document.getElementById(`edit-allday-${index}`).checked
    };

    // Update the event
    currentEvents[index] = updatedEvent;

    // Redisplay
    card.replaceWith(createEventCard(updatedEvent, index));
  });
}

/**
 * Handle add to calendar
 */
async function handleAddToCalendar(index) {
  const event = currentEvents[index];
  const addBtn = document.querySelector(`.add-to-calendar-btn[data-index="${index}"]`);

  try {
    addBtn.disabled = true;
    addBtn.textContent = 'Adding...';

    // Send to background script to add to Google Calendar
    const result = await new Promise((resolve, reject) => {
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

    addBtn.textContent = 'Added!';
    addBtn.classList.remove('btn-primary');
    addBtn.classList.add('btn-success');

    showMessage(`Event "${event.title}" added to your calendar!`, 'success');

    // Open the event in Google Calendar
    if (result.htmlLink) {
      setTimeout(() => {
        chrome.tabs.create({ url: result.htmlLink });
      }, 500);
    }
  } catch (error) {
    console.error('Error adding to calendar:', error);
    addBtn.disabled = false;
    addBtn.textContent = 'Add to Calendar';
    showMessage(`Error: ${error.message}`, 'error');
  }
}

/**
 * Show loading state
 */
function showLoading(message) {
  hideAllStates();
  loadingState.classList.remove('hidden');
  loadingState.querySelector('p').textContent = message;
}

/**
 * Show error state
 */
function showError(message) {
  hideAllStates();
  errorState.classList.remove('hidden');
  errorState.querySelector('.error-message').textContent = message;
}

/**
 * Show no events state
 */
function showNoEvents() {
  hideAllStates();
  noEventsState.classList.remove('hidden');
}

/**
 * Show initial state
 */
function showInitialState() {
  hideAllStates();
  mainActions.classList.remove('hidden');
}

/**
 * Hide all states
 */
function hideAllStates() {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  noEventsState.classList.add('hidden');
  eventsContainer.classList.add('hidden');
  configState.classList.add('hidden');
}

/**
 * Show a temporary message
 */
function showMessage(message, type = 'info') {
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

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageEl.remove();
  }, 5000);
}

/**
 * Format date/time for display
 */
function formatDateTime(isoString) {
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
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
