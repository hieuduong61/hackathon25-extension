/**
 * Main entry point for the popup
 */

import { appState } from './state/appState.js';
import { loadSettings } from './services/storageService.js';
import { UIManager } from './ui/uiManager.js';
import { createEventHandlers } from './handlers/eventHandlers.js';
import { initializeSettingsPanel } from './ui/components/settingsPanel.js';
import { showMessage } from './ui/components/statusMessage.js';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Get all DOM elements
  const elements = {
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    noEventsState: document.getElementById('noEventsState'),
    eventsContainer: document.getElementById('eventsContainer'),
    eventsList: document.getElementById('eventsList'),
    configState: document.getElementById('configState'),
    mainActions: document.getElementById('mainActions'),
    extractBtn: document.getElementById('extractBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    retryBtn: document.getElementById('retryBtn'),
    tryAgainBtn: document.getElementById('tryAgainBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    cancelSettingsBtn: document.getElementById('cancelSettingsBtn'),
    anthropicApiKeyInput: document.getElementById('anthropicApiKey')
  };

  // Create UI manager
  const uiManager = new UIManager(elements);

  // Create event handlers
  const handlers = createEventHandlers(uiManager);

  // Initialize settings panel
  initializeSettingsPanel(elements, () => {
    uiManager.showInitialState();
  });

  // Load saved settings
  const settings = await loadSettings();
  appState.setSettings(settings);
  elements.anthropicApiKeyInput.value = settings.anthropicApiKey || '';

  // Check if API key is configured
  if (!settings.anthropicApiKey) {
    showMessage('Please configure your Anthropic API key in settings.', 'info');
  }

  // Set up button event listeners
  elements.extractBtn.addEventListener('click', handlers.handleExtractEvents);
  elements.retryBtn.addEventListener('click', handlers.handleExtractEvents);
  elements.tryAgainBtn.addEventListener('click', handlers.handleExtractEvents);
});
