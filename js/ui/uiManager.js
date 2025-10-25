/**
 * UI Manager for handling view states and transitions
 */

import { createEventCard, createEditEventCard } from './components/eventCard.js';

export class UIManager {
  constructor(elements) {
    this.elements = elements;
  }

  /**
   * Show loading state
   * @param {string} message - Loading message
   */
  showLoading(message) {
    this.hideAllStates();
    this.elements.loadingState.classList.remove('hidden');
    this.elements.loadingState.querySelector('p').textContent = message;
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  showError(message) {
    this.hideAllStates();
    this.elements.errorState.classList.remove('hidden');
    this.elements.errorState.querySelector('.error-message').textContent = message;
  }

  /**
   * Show no events state
   */
  showNoEvents() {
    this.hideAllStates();
    this.elements.noEventsState.classList.remove('hidden');
  }

  /**
   * Show initial state
   */
  showInitialState() {
    this.hideAllStates();
    this.elements.mainActions.classList.remove('hidden');
  }

  /**
   * Display events in the UI
   * @param {Array} events - Array of events
   * @param {Object} handlers - Event handlers
   */
  displayEvents(events, handlers) {
    this.hideAllStates();
    this.elements.eventsContainer.classList.remove('hidden');
    this.elements.eventsList.innerHTML = '';

    events.forEach((event, index) => {
      const eventCard = createEventCard(event, index, {
        onEdit: handlers.onEdit,
        onAddToCalendar: handlers.onAddToCalendar
      });
      this.elements.eventsList.appendChild(eventCard);
    });
  }

  /**
   * Show event in edit mode
   * @param {Object} event - Event data
   * @param {number} index - Event index
   * @param {Object} handlers - Event handlers {onSave, onCancel}
   */
  showEventEditMode(event, index, handlers) {
    const existingCard = document.querySelector(`.event-card[data-index="${index}"]`);
    if (existingCard) {
      const editCard = createEditEventCard(event, index, handlers);
      existingCard.replaceWith(editCard);
    }
  }

  /**
   * Show event in view mode
   * @param {Object} event - Event data
   * @param {number} index - Event index
   * @param {Object} handlers - Event handlers
   */
  showEventViewMode(event, index, handlers) {
    const existingCard = document.querySelector(`.event-card[data-index="${index}"]`);
    if (existingCard) {
      const viewCard = createEventCard(event, index, handlers);
      existingCard.replaceWith(viewCard);
    }
  }

  /**
   * Update add to calendar button state
   * @param {number} index - Event index
   * @param {string} state - Button state: 'loading', 'success', 'error'
   */
  updateAddToCalendarButton(index, state) {
    const btn = document.querySelector(`.add-to-calendar-btn[data-index="${index}"]`);
    if (!btn) return;

    switch (state) {
      case 'loading':
        btn.disabled = true;
        btn.textContent = 'Adding...';
        break;
      case 'success':
        btn.textContent = 'Added!';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        break;
      case 'error':
        btn.disabled = false;
        btn.textContent = 'Add to Calendar';
        break;
    }
  }

  /**
   * Hide all state elements
   */
  hideAllStates() {
    const states = [
      this.elements.loadingState,
      this.elements.errorState,
      this.elements.noEventsState,
      this.elements.eventsContainer,
      this.elements.configState
    ];

    states.forEach(element => {
      if (element) {
        element.classList.add('hidden');
      }
    });
  }
}
