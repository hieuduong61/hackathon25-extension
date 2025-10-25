/**
 * Event handlers for user interactions
 */

import { appState } from '../state/appState.js';
import { loadSettings } from '../services/storageService.js';
import { extractPageContent, extractEvents } from '../services/eventExtractionService.js';
import { addEventToCalendar } from '../services/calendarService.js';
import { showMessage } from '../ui/components/statusMessage.js';

/**
 * Create event handlers
 * @param {Object} uiManager - UI manager instance
 * @returns {Object} Event handler functions
 */
export function createEventHandlers(uiManager) {
  /**
   * Handle extract events button click
   */
  async function handleExtractEvents() {
    try {
      const settings = await loadSettings();

      if (!settings.anthropicApiKey) {
        showMessage('Please configure your Anthropic API key in settings first.', 'error');
        return;
      }

      uiManager.showLoading('Analyzing page for events...');

      // Extract page content
      const pageContent = await extractPageContent();

      // Extract events using Claude AI
      const events = await extractEvents(pageContent, settings.anthropicApiKey);

      // Update state
      appState.setEvents(events);

      // Display results
      if (events.length === 0) {
        uiManager.showNoEvents();
      } else {
        uiManager.displayEvents(events, {
          onEdit: handleEditEvent,
          onAddToCalendar: handleAddToCalendar
        });
      }
    } catch (error) {
      console.error('Error extracting events:', error);
      uiManager.showError(error.message);
    }
  }

  /**
   * Handle edit event
   * @param {number} index - Event index
   */
  function handleEditEvent(index) {
    const event = appState.getEvent(index);
    if (!event) return;

    appState.setEditingIndex(index);

    uiManager.showEventEditMode(event, index, {
      onSave: handleSaveEdit,
      onCancel: handleCancelEdit
    });
  }

  /**
   * Handle save edit
   * @param {number} index - Event index
   * @param {Object} updatedEvent - Updated event data
   */
  function handleSaveEdit(index, updatedEvent) {
    // Update state
    appState.updateEvent(index, updatedEvent);
    appState.setEditingIndex(null);

    // Update UI
    uiManager.showEventViewMode(updatedEvent, index, {
      onEdit: handleEditEvent,
      onAddToCalendar: handleAddToCalendar
    });
  }

  /**
   * Handle cancel edit
   * @param {number} index - Event index
   */
  function handleCancelEdit(index) {
    const event = appState.getEvent(index);
    appState.setEditingIndex(null);

    // Restore view mode
    uiManager.showEventViewMode(event, index, {
      onEdit: handleEditEvent,
      onAddToCalendar: handleAddToCalendar
    });
  }

  /**
   * Handle add to calendar
   * @param {number} index - Event index
   * @param {HTMLElement} button - Add button element
   */
  async function handleAddToCalendar(index, button) {
    const event = appState.getEvent(index);
    if (!event) return;

    try {
      uiManager.updateAddToCalendarButton(index, 'loading');

      // Add to Google Calendar
      const result = await addEventToCalendar(event);

      uiManager.updateAddToCalendarButton(index, 'success');
      showMessage(`Event "${event.title}" added to your calendar!`, 'success');

      // Open the event in Google Calendar
      if (result.htmlLink) {
        setTimeout(() => {
          chrome.tabs.create({ url: result.htmlLink });
        }, 500);
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      uiManager.updateAddToCalendarButton(index, 'error');
      showMessage(`Error: ${error.message}`, 'error');
    }
  }

  return {
    handleExtractEvents,
    handleEditEvent,
    handleSaveEdit,
    handleCancelEdit,
    handleAddToCalendar
  };
}
