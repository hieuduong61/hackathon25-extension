# Event to Google Calendar - Chrome Extension

A smart Chrome extension that uses Claude AI to automatically extract event information from any web page and add it to your Google Calendar with just a few clicks.

## Features

- **AI-Powered Event Extraction**: Uses Claude AI (Anthropic) to intelligently extract event information from emails, Google Forms, event pages, and any website
- **Smart Detection**: Automatically identifies event titles, dates, times, locations, and descriptions
- **Easy Editing**: Review and edit event details before adding to your calendar
- **One-Click Add**: Seamlessly add events to your Google Calendar with a single click
- **Multiple Events**: Extract and add multiple events from a single page
- **Secure**: Your API keys are stored locally in your browser

## How It Works

1. **Navigate** to any webpage containing event information (email, event page, Google Form, etc.)
2. **Click** the extension icon to open the popup
3. **Extract** event information using Claude AI
4. **Review** and edit the extracted event details if needed
5. **Add** the event to your Google Calendar with one click

## Prerequisites

Before using this extension, you'll need:

1. **Anthropic API Key**: Sign up at [Anthropic Console](https://console.anthropic.com/) to get your API key
2. **Google Account**: A Google account with access to Google Calendar
3. **Google Cloud Project**: Set up OAuth 2.0 credentials (see setup instructions below)

## Installation

### 1. Clone or Download the Extension

```bash
git clone https://github.com/hieuduong61/hackathon25-extension.git
cd hackathon25-extension
```

### 2. Create Extension Icons

The extension requires icons in PNG format. See [icons/README.md](icons/README.md) for instructions on generating icons from the provided SVG file.

Quick option using an online converter:
- Visit https://cloudconvert.com/svg-to-png
- Upload `icons/icon.svg`
- Convert to sizes: 16x16, 32x32, 48x48, 128x128
- Save as icon16.png, icon32.png, icon48.png, icon128.png in the `icons/` folder

### 3. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Chrome Extension" as the application type
   - Add your extension ID (you'll get this after loading the extension)
   - Click "Create"
5. Copy the Client ID

### 4. Update manifest.json

Open `manifest.json` and replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google OAuth Client ID:

```json
"oauth2": {
  "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/calendar.events"
  ]
}
```

### 5. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked"
4. Select the `hackathon25-extension` directory
5. The extension should now appear in your extensions list
6. Copy the Extension ID shown under the extension name

### 6. Update Google Cloud OAuth Settings

1. Go back to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add the extension ID to the authorized JavaScript origins if required

### 7. Configure the Extension

1. Click the extension icon in Chrome
2. Click the settings (⚙️) button
3. Enter your Anthropic API key (starts with `sk-ant-`)
4. Click "Save"

## Usage

### Basic Usage

1. Navigate to any webpage with event information
2. Click the extension icon
3. Click "Extract Events"
4. Wait for Claude AI to analyze the page
5. Review the extracted events
6. Edit any details if needed (click "Edit" on any event)
7. Click "Add to Calendar" to add the event to Google Calendar

### Supported Pages

The extension works on various types of pages:

- **Email invitations** (Gmail, Outlook Web, etc.)
- **Event pages** (Eventbrite, Meetup, etc.)
- **Google Forms** with event information
- **Conference websites**
- **Social media event posts**
- **Any webpage** containing event details

### Editing Events

Before adding an event to your calendar, you can edit:
- Event title
- Start date and time
- End date and time
- Location
- Description
- All-day event toggle

## Troubleshooting

### "Could not establish connection" or "Receiving end does not exist"
- **Refresh the page** (F5 or Ctrl+R) - This is the most common fix
- Make sure you're on a regular web page (http:// or https://)
- The extension doesn't work on chrome://, edge://, about:, or file:// pages
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions

### "Please configure your Anthropic API key"
- Click the settings button (⚙️) and enter your API key
- Make sure the API key starts with `sk-ant-`

### "Claude API error"
- Verify your API key is correct
- Check that you have credits/quota available in your Anthropic account
- Check your internet connection

### "Google Calendar API error"
- Make sure you've granted calendar permissions when prompted
- Verify your OAuth client ID is correctly configured
- Try revoking access and re-authorizing: Visit [Google Account Permissions](https://myaccount.google.com/permissions) and remove the extension, then try again

### Extension not showing up
- Ensure Developer Mode is enabled in chrome://extensions/
- Check for any errors in the extension details page
- Try reloading the extension

### No events found
- The page might not contain clear event information
- Try a different page with more structured event data
- Check the browser console for errors (F12 > Console)

For more detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Privacy & Security

- Your Anthropic API key is stored locally in Chrome's secure storage
- Page content is only sent to Claude AI when you click "Extract Events"
- Google Calendar access is handled through official Google OAuth
- No data is sent to any third-party servers except Anthropic and Google

## Development

### Project Structure

```
hackathon25-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── content.js            # Content script for page extraction
├── background.js         # Background service worker for API calls
├── js/                   # Modular JavaScript architecture
│   ├── main.js          # Application entry point
│   ├── state/           # State management
│   │   └── appState.js
│   ├── services/        # API and storage services
│   │   ├── storageService.js
│   │   ├── eventExtractionService.js
│   │   └── calendarService.js
│   ├── ui/              # UI components and managers
│   │   ├── uiManager.js
│   │   └── components/
│   │       ├── eventCard.js
│   │       ├── settingsPanel.js
│   │       └── statusMessage.js
│   ├── handlers/        # Event handlers
│   │   └── eventHandlers.js
│   └── utils/           # Utility functions
│       ├── formatters.js
│       └── validators.js
├── icons/               # Extension icons
│   ├── icon.svg         # Source SVG icon
│   ├── icon16.png       # 16x16 icon
│   ├── icon32.png       # 32x32 icon
│   ├── icon48.png       # 48x48 icon
│   └── icon128.png      # 128x128 icon
├── ARCHITECTURE.md      # Detailed architecture documentation
└── README.md            # This file
```

### Key Files

- **manifest.json**: Chrome extension manifest (v3)
- **content.js**: Extracts HTML and visible text from the current page
- **background.js**: Handles API calls to Claude AI and Google Calendar
- **js/main.js**: Application entry point that wires up all modules
- **js/**: Modular JavaScript architecture (see [ARCHITECTURE.md](ARCHITECTURE.md))
- **popup.html/css**: User interface for the extension popup

### Architecture

The extension uses a modular architecture with separation of concerns:

- **State Management**: Centralized state using singleton pattern
- **Services Layer**: Abstracts external APIs (Chrome, Claude AI, Google Calendar)
- **UI Components**: Reusable components for rendering
- **Event Handlers**: Orchestrates user interactions
- **Utilities**: Pure functions for common tasks

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md) and [js/README.md](js/README.md).

### API Integration

#### Claude AI (Anthropic)
- Model: `claude-3-5-sonnet-20241022`
- Endpoint: `https://api.anthropic.com/v1/messages`
- Used for: Extracting event information from page content

#### Google Calendar API
- API: Calendar API v3
- Endpoint: `https://www.googleapis.com/calendar/v3/calendars/primary/events`
- Used for: Adding events to the user's primary calendar

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

## Acknowledgments

- Built with [Claude AI](https://www.anthropic.com/) by Anthropic
- Uses [Google Calendar API](https://developers.google.com/calendar)
- Icons designed with calendar and event themes

---

**Note**: This extension requires active API keys for Anthropic and access to Google Calendar. API usage may incur costs based on your Anthropic pricing plan.
