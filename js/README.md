# JavaScript Architecture

This directory contains the refactored JavaScript code for the popup, organized into modular components following best practices for separation of concerns.

## Directory Structure

```
js/
├── main.js                      # Application entry point
├── state/
│   └── appState.js             # Application state management
├── services/
│   ├── storageService.js       # Chrome storage API wrapper
│   ├── eventExtractionService.js # Event extraction from pages
│   └── calendarService.js      # Google Calendar API integration
├── ui/
│   ├── uiManager.js            # UI state and view management
│   └── components/
│       ├── eventCard.js        # Event card component (view/edit)
│       ├── settingsPanel.js    # Settings panel component
│       └── statusMessage.js    # Status message notifications
├── handlers/
│   └── eventHandlers.js        # User interaction event handlers
└── utils/
    ├── formatters.js           # Formatting utilities
    └── validators.js           # Validation utilities
```

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

### 1. **State Management** (`state/`)

Centralized application state management using a singleton pattern.

- `appState.js`: Manages the global application state including current events, editing state, and settings

**Key Features:**
- Single source of truth for application data
- Provides getters and setters for state access
- Prevents direct state mutation

### 2. **Services Layer** (`services/`)

Handles all external API communications and data persistence.

- `storageService.js`: Wraps Chrome storage API for settings persistence
- `eventExtractionService.js`: Communicates with background script for AI event extraction
- `calendarService.js`: Handles Google Calendar API integration

**Key Features:**
- Abstracts API complexity from UI logic
- Returns Promises for async operations
- Provides clean error handling

### 3. **UI Layer** (`ui/`)

Manages all user interface concerns including rendering and view state.

- `uiManager.js`: Orchestrates UI state transitions (loading, error, success states)
- `components/`: Reusable UI components

**Components:**
- `eventCard.js`: Event display and editing components
- `settingsPanel.js`: Settings configuration panel
- `statusMessage.js`: Temporary notification messages

**Key Features:**
- Declarative UI updates
- Reusable components
- Separation of presentation from logic

### 4. **Event Handlers** (`handlers/`)

Coordinates user interactions and orchestrates actions across services and UI.

- `eventHandlers.js`: Handles all user interaction events

**Key Features:**
- Connects UI events to business logic
- Orchestrates multiple services
- Updates state and UI based on results

### 5. **Utilities** (`utils/`)

Pure functions for common tasks like formatting and validation.

- `formatters.js`: Date/time formatting, HTML escaping
- `validators.js`: Input validation functions

**Key Features:**
- Pure functions (no side effects)
- Easily testable
- Reusable across the application

### 6. **Main Entry Point** (`main.js`)

Application initialization and dependency wiring.

**Responsibilities:**
- DOM element collection
- Service and component initialization
- Event listener setup
- Initial state loading

## Data Flow

```
User Interaction
    ↓
Event Handlers
    ↓
Services (API calls)
    ↓
State Management (update state)
    ↓
UI Manager (render updates)
    ↓
DOM Updates
```

## Module System

The application uses **ES6 modules** with import/export syntax:

- All modules use `export` to expose functionality
- `main.js` is loaded as `type="module"` in HTML
- Enables tree-shaking and better dependency management

## Best Practices Implemented

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Single Responsibility Principle**: Functions and classes do one thing well
3. **Dependency Injection**: Dependencies are passed to modules rather than created internally
4. **Pure Functions**: Utility functions have no side effects
5. **Error Handling**: Consistent error handling with try/catch and Promise rejection
6. **Code Reusability**: Shared utilities and components
7. **Maintainability**: Clear structure makes code easy to understand and modify

## Adding New Features

### Adding a New Service

1. Create a new file in `services/`
2. Export async functions that return Promises
3. Handle errors appropriately
4. Import and use in event handlers

Example:
```javascript
// services/myService.js
export async function doSomething(data) {
  // Implementation
}

// handlers/eventHandlers.js
import { doSomething } from '../services/myService.js';
```

### Adding a New UI Component

1. Create a new file in `ui/components/`
2. Export function(s) that create/manage DOM elements
3. Accept data and event handlers as parameters
4. Import and use in `uiManager.js` or handlers

Example:
```javascript
// ui/components/myComponent.js
export function createMyComponent(data, handlers) {
  const element = document.createElement('div');
  // Build component
  return element;
}
```

### Adding New Event Handlers

1. Add handler function to `handlers/eventHandlers.js`
2. Import required services and utilities
3. Update state as needed
4. Update UI through uiManager
5. Wire up in `main.js`

## Testing Considerations

The modular architecture makes testing easier:

- **Services**: Mock Chrome APIs and test async behavior
- **Utilities**: Test pure functions with various inputs
- **Components**: Test DOM generation and event attachment
- **Handlers**: Mock services and test orchestration logic
- **State**: Test state mutations and getters

## Migration from Monolithic popup.js

The original `popup.js` has been refactored into this modular structure:

- Global variables → `state/appState.js`
- Storage functions → `services/storageService.js`
- API calls → `services/` (split by concern)
- UI rendering → `ui/uiManager.js` and `ui/components/`
- Event handlers → `handlers/eventHandlers.js`
- Utilities → `utils/`

The old `popup.js` file can be removed or kept as reference.

## Performance Considerations

- **ES6 Modules**: Only load what's needed (tree-shaking)
- **Lazy Loading**: Components created only when needed
- **Event Delegation**: Where appropriate for dynamic content
- **Minimal DOM Manipulation**: Batch updates when possible

## Browser Compatibility

- Requires Chrome with ES6 module support (Chrome 61+)
- Uses modern JavaScript features (async/await, classes, arrow functions)
- Chrome Extension Manifest V3 compatible
