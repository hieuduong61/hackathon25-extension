# Extension Architecture

## Overview

This Chrome extension follows a modular architecture with clear separation between UI, business logic, services, and utilities.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         popup.html                               │
│                     (User Interface)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ loads (type="module")
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        js/main.js                                │
│                   (Entry Point & Wiring)                         │
│  - Initializes all components                                    │
│  - Sets up event listeners                                       │
│  - Loads initial state                                           │
└──┬──────────┬──────────┬──────────┬──────────┬──────────────────┘
   │          │          │          │          │
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌─────────────┐
│State │ │  UI  │ │Event │ │Svc's │ │  Utilities  │
└──────┘ └──────┘ └──────┘ └──────┘ └─────────────┘
```

## Detailed Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      ui/uiManager.js                          │  │
│  │  - Manages view states (loading, error, success)             │  │
│  │  - Orchestrates UI updates                                   │  │
│  │  - Delegates to components                                   │  │
│  └────────────┬─────────────────────────────────────────────────┘  │
│               │                                                     │
│               │ uses                                                │
│               ▼                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   ui/components/                              │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  - eventCard.js      (event display/edit)                    │  │
│  │  - settingsPanel.js  (settings UI)                           │  │
│  │  - statusMessage.js  (notifications)                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  handlers/eventHandlers.js                    │  │
│  │  - Handles user interactions                                 │  │
│  │  - Orchestrates services                                     │  │
│  │  - Updates state                                             │  │
│  │  - Triggers UI updates                                       │  │
│  └───────┬──────────────────────────────────────────────────────┘  │
│          │                                                          │
│          │ coordinates                                              │
│          │                                                          │
│          ├──────────────┬──────────────┬──────────────┐            │
│          ▼              ▼              ▼              ▼            │
│      ┌────────┐    ┌────────┐    ┌────────┐    ┌─────────┐        │
│      │ State  │    │Services│    │   UI   │    │ Utils   │        │
│      └────────┘    └────────┘    └────────┘    └─────────┘        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           SERVICES LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              services/eventExtractionService.js               │  │
│  │  - Extracts page content                                     │  │
│  │  - Calls Claude AI via background script                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                services/calendarService.js                    │  │
│  │  - Adds events to Google Calendar                            │  │
│  │  - Communicates via background script                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 services/storageService.js                    │  │
│  │  - Loads/saves settings                                      │  │
│  │  - Wraps Chrome Storage API                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    state/appState.js                          │  │
│  │  - Singleton state manager                                   │  │
│  │  - Manages events, editing state, settings                   │  │
│  │  - Provides getters/setters                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                            UTILITIES                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────┐  ┌─────────────────────────────┐  │
│  │   utils/formatters.js      │  │   utils/validators.js       │  │
│  │  - formatDateTime()        │  │  - isValidAnthropicApiKey() │  │
│  │  - escapeHtml()            │  │  - validateEvent()          │  │
│  │  - formatDateTimeForInput()│  │                             │  │
│  └────────────────────────────┘  └─────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Extracting Events

```
1. User clicks "Extract Events" button
   │
   ▼
2. eventHandlers.handleExtractEvents()
   │
   ├─▶ loadSettings() from storageService
   │   └─▶ Chrome Storage API
   │
   ├─▶ uiManager.showLoading()
   │   └─▶ Updates DOM
   │
   ├─▶ extractPageContent() from eventExtractionService
   │   └─▶ Chrome Tabs API → content.js
   │
   ├─▶ extractEvents() from eventExtractionService
   │   └─▶ background.js → Claude AI API
   │
   ├─▶ appState.setEvents(events)
   │   └─▶ Updates state
   │
   └─▶ uiManager.displayEvents()
       │
       └─▶ eventCard.createEventCard() for each event
           └─▶ Updates DOM
```

## Communication Between Layers

### Extension Communication

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   popup.js   │◀───────▶│ background.js│◀───────▶│  content.js  │
│  (UI Logic)  │ runtime │  (Service    │   tabs  │  (Page       │
│              │ messages│   Worker)    │ messages│   Extractor) │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                │
                         ┌──────┴──────┐
                         ▼              ▼
                    ┌─────────┐   ┌─────────┐
                    │Claude AI│   │ Google  │
                    │   API   │   │Calendar │
                    └─────────┘   └─────────┘
```

### Internal Module Communication

- **Handlers** orchestrate everything
- **Services** called by handlers for external operations
- **State** updated by handlers, read by all
- **UI Manager** called by handlers for view updates
- **Components** used by UI Manager to render
- **Utils** used by anyone for common operations

## Key Design Patterns

1. **Module Pattern**: ES6 modules for encapsulation
2. **Singleton Pattern**: appState is a single instance
3. **Service Layer Pattern**: Abstracts external APIs
4. **Observer Pattern**: State changes trigger UI updates
5. **Factory Pattern**: Component creation functions
6. **Dependency Injection**: Dependencies passed as parameters

## Benefits of This Architecture

1. **Maintainability**: Clear structure, easy to find code
2. **Testability**: Pure functions and mocked dependencies
3. **Scalability**: Easy to add new features/components
4. **Reusability**: Components and utilities are reusable
5. **Separation of Concerns**: Each module has one job
6. **Type Safety**: Clear interfaces between modules
7. **Debugging**: Easy to trace data flow

## File Dependency Graph

```
main.js
├── state/appState.js
├── services/
│   ├── storageService.js
│   ├── eventExtractionService.js
│   └── calendarService.js
├── ui/
│   ├── uiManager.js
│   │   └── components/
│   │       ├── eventCard.js
│   │       │   └── utils/formatters.js
│   │       ├── settingsPanel.js
│   │       │   ├── utils/validators.js
│   │       │   ├── components/statusMessage.js
│   │       │   └── services/storageService.js
│   │       └── statusMessage.js
│   └── components/...
├── handlers/
│   └── eventHandlers.js
│       ├── state/appState.js
│       ├── services/storageService.js
│       ├── services/eventExtractionService.js
│       ├── services/calendarService.js
│       └── ui/components/statusMessage.js
└── utils/
    ├── formatters.js
    └── validators.js
```
