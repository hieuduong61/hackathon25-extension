/**
 * Application state management
 */

class AppState {
  constructor() {
    this.currentEvents = [];
    this.editingEventIndex = null;
    this.settings = {};
  }

  /**
   * Set the current events
   * @param {Array} events - Array of event objects
   */
  setEvents(events) {
    this.currentEvents = events;
  }

  /**
   * Get all current events
   * @returns {Array} Array of events
   */
  getEvents() {
    return this.currentEvents;
  }

  /**
   * Get a specific event by index
   * @param {number} index - Event index
   * @returns {Object|null} Event object or null
   */
  getEvent(index) {
    return this.currentEvents[index] || null;
  }

  /**
   * Update a specific event
   * @param {number} index - Event index
   * @param {Object} eventData - Updated event data
   */
  updateEvent(index, eventData) {
    if (index >= 0 && index < this.currentEvents.length) {
      this.currentEvents[index] = eventData;
    }
  }

  /**
   * Set the editing event index
   * @param {number|null} index - Index of event being edited
   */
  setEditingIndex(index) {
    this.editingEventIndex = index;
  }

  /**
   * Get the editing event index
   * @returns {number|null} Index or null
   */
  getEditingIndex() {
    return this.editingEventIndex;
  }

  /**
   * Set application settings
   * @param {Object} settings - Settings object
   */
  setSettings(settings) {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get application settings
   * @returns {Object} Settings object
   */
  getSettings() {
    return this.settings;
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.currentEvents = [];
    this.editingEventIndex = null;
  }
}

// Create singleton instance
export const appState = new AppState();
