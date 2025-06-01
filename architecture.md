# Bookmarker PWA - Architecture Design

## 1. Overview

This document outlines the architecture for the Bookmarker PWA, a modern web application for saving, organizing, and managing bookmarks. The application will be built as a Progressive Web App (PWA) with offline capabilities, using WebAssembly (WASM) for the backend and SQLite for local data storage.

## 2. Technology Stack

### Core Technologies
- **Frontend**: Pure HTML, CSS, and vanilla JavaScript (no frameworks)
- **Backend**: WebAssembly (WASM) module running SQLite
- **Storage**: Local SQLite database using Origin-Private FileSystem (OPFS)
- **PWA Features**: Service Worker, Web App Manifest, offline support

### External Dependencies (via CDN)
- **SQLite WASM**: Official SQLite WASM build from sqlite.org
- **Icons/UI**: Material Icons or similar icon set
- **Optional**: Minimal utility libraries if needed (e.g., for date formatting)

## 3. Architecture Components

### 3.1 Frontend Layer

The frontend will be built using a component-based architecture with vanilla JavaScript:

```
/frontend
  /components        # Reusable UI components
    - bookmark-card.js
    - category-list.js
    - search-bar.js
    - ...
  /views             # Main application views
    - home-view.js
    - bookmark-detail-view.js
    - category-view.js
    - settings-view.js
  /utils             # Utility functions
    - router.js      # Simple client-side router
    - dom-utils.js   # DOM manipulation helpers
    - validators.js  # Input validation
  /styles            # CSS styles
    - main.css       # Core styles
    - components.css # Component-specific styles
    - variables.css  # CSS variables for theming
  - app.js           # Main application entry point
```

### 3.2 WASM SQLite Backend

The backend will use the official SQLite WASM build from sqlite.org, integrated as follows:

```
/backend
  /wasm
    - sqlite-wasm-adapter.js  # Adapter for SQLite WASM integration
    - db-manager.js           # Database initialization and management
  /models
    - bookmark-model.js       # Bookmark data operations
    - category-model.js       # Category data operations
    - search-model.js         # Search functionality
  /services
    - import-export.js        # Import/export functionality
    - sync-service.js         # Background sync for offline changes
```

### 3.3 Service Worker

The service worker will handle caching and offline functionality:

```
/service-worker
  - sw.js                     # Main service worker file
  - cache-strategies.js       # Different caching strategies
  - offline-handler.js        # Offline request handling
```

## 4. SQLite WASM Integration

After evaluating available options, we will use the official SQLite WASM build from sqlite.org for the following reasons:

1. **Official Support**: Maintained by the SQLite team with regular updates
2. **Performance**: Optimized for browser environments
3. **Feature Completeness**: Full SQLite feature set
4. **Documentation**: Comprehensive documentation and examples
5. **Persistence Options**: Support for both OPFS and localStorage/sessionStorage

### 4.1 Integration Approach

We will use a Worker-based approach for the SQLite WASM integration:

1. **Dedicated Worker**: SQLite WASM will run in a dedicated Web Worker to avoid blocking the main UI thread
2. **OO API**: We'll use the OO API #1 (sqlite3.oo1) for a more JavaScript-friendly interface
3. **Message-based Communication**: The main thread will communicate with the worker via a message-based API

### 4.2 Persistence Strategy

For data persistence, we will implement a tiered approach:

1. **Primary Storage**: Origin-Private FileSystem (OPFS) via the OPFS sqlite3_vfs
   - Provides the best performance and storage capacity
   - Available in modern browsers (Chrome, Firefox 111+, Safari 16.4+)

2. **Fallback Storage**: localStorage via the kvvfs (Key-Value VFS)
   - For browsers without OPFS support
   - Limited storage capacity (typically 5MB)
   - Slower performance but ensures basic functionality

3. **Feature Detection**: The application will automatically detect available storage options and select the best one

## 5. Database Schema

The SQLite database will use the following schema:

```sql
-- Bookmarks table
CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  favicon TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_visited INTEGER,
  visit_count INTEGER DEFAULT 0
);

-- Categories/Labels table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at INTEGER NOT NULL
);

-- Bookmark-Category relationship (many-to-many)
CREATE TABLE bookmark_categories (
  bookmark_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (bookmark_id, category_id),
  FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Search index for efficient text search
CREATE VIRTUAL TABLE bookmark_fts USING fts5(
  title, 
  description, 
  url,
  content='bookmarks',
  content_rowid='id'
);

-- Triggers to maintain the FTS index
CREATE TRIGGER bookmarks_ai AFTER INSERT ON bookmarks BEGIN
  INSERT INTO bookmark_fts(rowid, title, description, url) 
  VALUES (new.id, new.title, new.description, new.url);
END;

CREATE TRIGGER bookmarks_ad AFTER DELETE ON bookmarks BEGIN
  INSERT INTO bookmark_fts(bookmark_fts, rowid, title, description, url) 
  VALUES('delete', old.id, old.title, old.description, old.url);
END;

CREATE TRIGGER bookmarks_au AFTER UPDATE ON bookmarks BEGIN
  INSERT INTO bookmark_fts(bookmark_fts, rowid, title, description, url) 
  VALUES('delete', old.id, old.title, old.description, old.url);
  INSERT INTO bookmark_fts(rowid, title, description, url) 
  VALUES (new.id, new.title, new.description, new.url);
END;
```

## 6. PWA Implementation

### 6.1 Service Worker Strategy

The service worker will implement the following strategies:

1. **Cache-First Strategy**: For static assets (HTML, CSS, JS, images)
   - Cache all static assets during installation
   - Serve from cache first, then network
   - Update cache in the background

2. **Stale-While-Revalidate**: For dynamic content and API calls
   - Serve from cache immediately if available
   - Update cache in the background

3. **Network-First Strategy**: For critical updates
   - Try network first
   - Fall back to cache if network fails

### 6.2 Offline Support

Offline support will be implemented through:

1. **Precaching**: Essential application assets cached during service worker installation
2. **Runtime Caching**: Dynamic content cached as it's accessed
3. **IndexedDB Backup**: Backup of critical data in IndexedDB for redundancy
4. **Background Sync**: Queue operations when offline for later execution
5. **Offline UI**: Clear indication of offline status and available functionality

### 6.3 Web App Manifest

The manifest.json will include:

```json
{
  "name": "Bookmarker",
  "short_name": "Bookmarker",
  "description": "A modern PWA for organizing and managing bookmarks",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4285f4",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "share_target": {
    "action": "/share-target/",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

## 7. Bookmark Sharing and Link Sending

To enable sending links from any web page to the app:

1. **Web Share Target API**: Implement the Web Share Target API to receive shared links
2. **URL Scheme Handling**: Register custom URL scheme for direct linking
3. **Bookmarklet**: Provide a bookmarklet for browsers without Share API support

## 8. Data Flow

The data flow in the application will follow this pattern:

1. **User Interaction**: User interacts with the UI
2. **View Layer**: View components capture events and dispatch actions
3. **Service Layer**: Services process actions and communicate with the WASM worker
4. **WASM Worker**: Executes SQLite operations and returns results
5. **Model Layer**: Updates data models based on results
6. **View Update**: UI is updated to reflect the new state

## 9. Security Considerations

1. **Content Security Policy**: Implement strict CSP headers
2. **Input Validation**: Validate all user inputs before processing
3. **Local Storage Only**: All data remains on the user's device
4. **HTTPS Requirement**: Ensure the application is served over HTTPS
5. **Permission Handling**: Request only necessary permissions

## 10. Performance Optimization

1. **Code Splitting**: Load only necessary code for each view
2. **Lazy Loading**: Defer loading of non-critical resources
3. **Asset Optimization**: Minify and compress all assets
4. **Efficient DOM Operations**: Minimize DOM manipulations
5. **IndexedDB Caching**: Cache frequently accessed data in memory
6. **Web Worker Offloading**: Move intensive operations to Web Workers

## 11. Accessibility

1. **ARIA Attributes**: Proper ARIA roles and attributes
2. **Keyboard Navigation**: Full keyboard support
3. **Screen Reader Support**: Ensure compatibility with screen readers
4. **Color Contrast**: Meet WCAG AA standards for contrast
5. **Responsive Design**: Adapt to all screen sizes and orientations

## 12. Implementation Plan

1. **Project Setup**: Initialize project structure and core files
2. **Frontend Scaffolding**: Create basic UI components and views
3. **WASM Integration**: Set up SQLite WASM in a Web Worker
4. **Database Implementation**: Create and initialize the SQLite database
5. **Core Functionality**: Implement basic bookmark management
6. **PWA Features**: Add service worker and manifest
7. **Advanced Features**: Implement search, filtering, and organization
8. **Testing & Optimization**: Test across browsers and optimize performance
9. **Documentation**: Complete user and technical documentation
