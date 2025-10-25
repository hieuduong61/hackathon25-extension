/**
 * Event card component for displaying and editing events
 */

import { formatDateTime, escapeHtml, formatDateTimeForInput } from '../../utils/formatters.js';

/**
 * Create an event card element in view mode
 * @param {Object} event - Event data
 * @param {number} index - Event index
 * @param {Object} handlers - Event handlers {onEdit, onAddToCalendar}
 * @returns {HTMLElement} Event card element
 */
export function createEventCard(event, index, handlers) {
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

  // Attach event listeners
  const editBtn = card.querySelector('.edit-btn');
  const addBtn = card.querySelector('.add-to-calendar-btn');

  editBtn.addEventListener('click', () => handlers.onEdit(index));
  addBtn.addEventListener('click', () => handlers.onAddToCalendar(index, addBtn));

  return card;
}

/**
 * Create an event card element in edit mode
 * @param {Object} event - Event data
 * @param {number} index - Event index
 * @param {Object} handlers - Event handlers {onSave, onCancel}
 * @returns {HTMLElement} Event card element in edit mode
 */
export function createEditEventCard(event, index, handlers) {
  const card = document.createElement('div');
  card.className = 'event-card editing';
  card.dataset.index = index;

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
                 value="${formatDateTimeForInput(event.startDateTime)}">
        </span>
      </div>
      <div class="event-info-row">
        <span class="event-info-label">End:</span>
        <span class="event-info-value">
          <input type="datetime-local" id="edit-end-${index}"
                 value="${formatDateTimeForInput(event.endDateTime)}">
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

  // Attach event listeners
  const cancelBtn = card.querySelector('.cancel-edit-btn');
  const saveBtn = card.querySelector('.save-edit-btn');

  cancelBtn.addEventListener('click', () => handlers.onCancel(index));
  saveBtn.addEventListener('click', () => {
    const updatedEvent = getEventDataFromForm(index);
    handlers.onSave(index, updatedEvent);
  });

  return card;
}

/**
 * Extract event data from edit form
 * @param {number} index - Event index
 * @returns {Object} Updated event data
 */
function getEventDataFromForm(index) {
  return {
    title: document.getElementById(`edit-title-${index}`).value,
    startDateTime: document.getElementById(`edit-start-${index}`).value || null,
    endDateTime: document.getElementById(`edit-end-${index}`).value || null,
    location: document.getElementById(`edit-location-${index}`).value,
    description: document.getElementById(`edit-description-${index}`).value,
    allDay: document.getElementById(`edit-allday-${index}`).checked
  };
}
