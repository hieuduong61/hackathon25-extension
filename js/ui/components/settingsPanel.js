/**
 * Settings panel component
 */

import { isValidAnthropicApiKey } from '../../utils/validators.js';
import { showMessage } from './statusMessage.js';
import { saveSettings } from '../../services/storageService.js';

/**
 * Initialize settings panel
 * @param {Object} elements - DOM elements
 * @param {Function} onSaved - Callback when settings are saved
 */
export function initializeSettingsPanel(elements, onSaved) {
  const {
    settingsBtn,
    saveSettingsBtn,
    cancelSettingsBtn,
    anthropicApiKeyInput,
    configState,
    mainActions
  } = elements;

  // Show settings
  settingsBtn.addEventListener('click', () => {
    showSettings(configState, mainActions);
  });

  // Hide settings
  cancelSettingsBtn.addEventListener('click', () => {
    hideSettings(configState, mainActions);
    if (onSaved) onSaved();
  });

  // Save settings
  saveSettingsBtn.addEventListener('click', async () => {
    const apiKey = anthropicApiKeyInput.value.trim();

    if (!apiKey) {
      showMessage('Please enter your Anthropic API key.', 'error');
      return;
    }

    if (!isValidAnthropicApiKey(apiKey)) {
      showMessage('Invalid API key format. Anthropic API keys start with "sk-ant-"', 'error');
      return;
    }

    await saveSettings({ anthropicApiKey: apiKey });
    showMessage('Settings saved successfully!', 'success');

    setTimeout(() => {
      hideSettings(configState, mainActions);
      if (onSaved) onSaved();
    }, 1000);
  });
}

/**
 * Show settings panel
 * @param {HTMLElement} configState - Config state element
 * @param {HTMLElement} mainActions - Main actions element
 */
function showSettings(configState, mainActions) {
  hideAllStates();
  configState.classList.remove('hidden');
  mainActions.classList.add('hidden');
}

/**
 * Hide settings panel
 * @param {HTMLElement} configState - Config state element
 * @param {HTMLElement} mainActions - Main actions element
 */
function hideSettings(configState, mainActions) {
  configState.classList.add('hidden');
  mainActions.classList.remove('hidden');
}

/**
 * Hide all state elements
 */
function hideAllStates() {
  const states = [
    'loadingState',
    'errorState',
    'noEventsState',
    'eventsContainer',
    'configState'
  ];

  states.forEach(stateId => {
    const element = document.getElementById(stateId);
    if (element) {
      element.classList.add('hidden');
    }
  });
}
