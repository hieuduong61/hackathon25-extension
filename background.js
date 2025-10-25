// Background service worker for handling API calls

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractEvents') {
    handleExtractEvents(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }

  if (request.action === 'addToCalendar') {
    handleAddToCalendar(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'getAuthToken') {
    getGoogleAuthToken()
      .then(token => sendResponse({ success: true, token: token }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Extract events from page content using Claude AI
 */
async function handleExtractEvents(data) {
  const { pageContent, apiKey } = data;

  if (!apiKey) {
    throw new Error('Anthropic API key is required. Please configure it in settings.');
  }

  // Call Claude AI API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: buildEventExtractionPrompt(pageContent)
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const content = result.content[0].text;

  // Parse the JSON response from Claude
  try {
    const events = parseClaudeResponse(content);
    return events;
  } catch (error) {
    console.error('Failed to parse Claude response:', content);
    throw new Error('Failed to parse event information from AI response');
  }
}

/**
 * Build the prompt for Claude to extract event information
 */
function buildEventExtractionPrompt(pageContent) {
  return `You are an AI assistant that extracts event information from web pages.
Analyze the following web page content and extract all event information you can find.

For each event, extract:
- title: The event name/title
- description: A brief description of the event
- location: Where the event takes place (physical address or virtual link)
- startDateTime: Start date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
- endDateTime: End date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
- allDay: Boolean indicating if it's an all-day event

If you cannot determine exact dates/times, make reasonable inferences or leave them as null.

Page Title: ${pageContent.title}
Page URL: ${pageContent.url}

${pageContent.metaInfo.eventSchema.length > 0 ? `
Event Schema Data:
${JSON.stringify(pageContent.metaInfo.eventSchema, null, 2)}
` : ''}

Visible Text Content:
${pageContent.visibleText.substring(0, 15000)}

Respond with a JSON array of events. Each event should have this structure:
{
  "title": "string",
  "description": "string",
  "location": "string",
  "startDateTime": "ISO 8601 string or null",
  "endDateTime": "ISO 8601 string or null",
  "allDay": boolean
}

If no events are found, return an empty array: []

IMPORTANT: Respond with ONLY the JSON array, no additional text or explanation.`;
}

/**
 * Parse Claude's response to extract events
 */
function parseClaudeResponse(content) {
  // Try to extract JSON from the response
  // Claude might wrap it in markdown code blocks
  let jsonText = content.trim();

  // Remove markdown code blocks if present
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  // Parse the JSON
  const events = JSON.parse(jsonText);

  if (!Array.isArray(events)) {
    throw new Error('Expected an array of events');
  }

  // Validate and normalize each event
  return events.map(event => ({
    title: event.title || 'Untitled Event',
    description: event.description || '',
    location: event.location || '',
    startDateTime: event.startDateTime || null,
    endDateTime: event.endDateTime || null,
    allDay: event.allDay || false
  }));
}

/**
 * Get Google OAuth token
 */
async function getGoogleAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Add event to Google Calendar
 */
async function handleAddToCalendar(eventData) {
  // Get OAuth token
  const token = await getGoogleAuthToken();

  // Convert our event format to Google Calendar format
  const calendarEvent = {
    summary: eventData.title,
    description: eventData.description,
    location: eventData.location,
  };

  // Handle date/time
  if (eventData.allDay) {
    // For all-day events, use date format
    const startDate = eventData.startDateTime ? eventData.startDateTime.split('T')[0] : null;
    const endDate = eventData.endDateTime ? eventData.endDateTime.split('T')[0] : null;

    if (startDate) {
      calendarEvent.start = { date: startDate };
      calendarEvent.end = { date: endDate || startDate };
    }
  } else {
    // For timed events, use dateTime format
    if (eventData.startDateTime) {
      calendarEvent.start = {
        dateTime: eventData.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      calendarEvent.end = {
        dateTime: eventData.endDateTime || eventData.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }
  }

  // Add to primary calendar
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(calendarEvent)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Google Calendar API error: ${errorData.error?.message || response.statusText}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    htmlLink: result.htmlLink,
    summary: result.summary
  };
}

// Log when service worker is activated
console.log('Event Extractor background service worker activated');
