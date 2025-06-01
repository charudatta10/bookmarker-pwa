/**
 * SQLite Worker - Web Worker for SQLite WASM operations
 * This worker handles all SQLite operations in a separate thread
 */

// SQLite WASM module
let sqlite;
// Database connection
let db;
// Database name
let dbName;
// Persistence type ('opfs' or 'kvvfs')
let persistenceType;

// Import the SQLite WASM module
importScripts('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js');

/**
 * Initialize the SQLite WASM module
 */
async function initializeSqlite() {
  try {
    // Try to use OPFS (Origin-Private FileSystem) first
    if (self.FileSystemHandle && self.FileSystemDirectoryHandle) {
      try {
        // Initialize SQLite with OPFS
        sqlite = await initSqliteWithOPFS();
        persistenceType = 'opfs';
      } catch (opfsError) {
        console.warn('OPFS initialization failed, falling back to kvvfs:', opfsError);
        // Fall back to kvvfs (localStorage)
        sqlite = await initSqliteWithKvvfs();
        persistenceType = 'kvvfs';
      }
    } else {
      // OPFS not supported, use kvvfs
      sqlite = await initSqliteWithKvvfs();
      persistenceType = 'kvvfs';
    }

    // Notify the main thread that initialization is complete
    self.postMessage({
      type: 'initialized',
      data: { persistenceType }
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: `Failed to initialize SQLite: ${error.message}`
    });
  }
}

/**
 * Initialize SQLite with OPFS
 * @returns {Promise<Object>} SQLite module
 */
async function initSqliteWithOPFS() {
  // This is a placeholder for the actual OPFS initialization
  // In a real implementation, we would use the official SQLite WASM with OPFS support
  // For now, we'll use sql.js as a placeholder
  return initSqlJs();
}

/**
 * Initialize SQLite with kvvfs (localStorage)
 * @returns {Promise<Object>} SQLite module
 */
async function initSqliteWithKvvfs() {
  // This is a placeholder for the actual kvvfs initialization
  // In a real implementation, we would use the official SQLite WASM with kvvfs support
  // For now, we'll use sql.js as a placeholder
  return initSqlJs();
}

/**
 * Initialize sql.js (placeholder for actual SQLite WASM)
 * @returns {Promise<Object>} SQL.js module
 */
async function initSqlJs() {
  return new Promise((resolve, reject) => {
    try {
      // Initialize SQL.js
      initSqlJs().then(SQL => {
        resolve(SQL);
      }).catch(error => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Initialize the database
 * @param {string} name - Database name
 */
async function initializeDatabase(name) {
  try {
    dbName = name;
    
    // Create or open the database
    if (persistenceType === 'opfs') {
      // For OPFS, we would open the file from the filesystem
      // This is a placeholder for the actual implementation
      db = new sqlite.Database();
    } else {
      // For kvvfs, we would use localStorage
      // This is a placeholder for the actual implementation
      const storedDb = localStorage.getItem(`sqlite-${dbName}`);
      if (storedDb) {
        const uint8Array = new Uint8Array(JSON.parse(storedDb));
        db = new sqlite.Database(uint8Array);
      } else {
        db = new sqlite.Database();
      }
    }

    // Create tables if they don't exist
    await createTables();

    // Notify the main thread that the database is initialized
    self.postMessage({
      type: 'dbInitialized'
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: `Failed to initialize database: ${error.message}`
    });
  }
}

/**
 * Create database tables
 */
async function createTables() {
  // Create bookmarks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      favicon TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_visited INTEGER,
      visit_count INTEGER DEFAULT 0
    )
  `);

  // Create categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      created_at INTEGER NOT NULL
    )
  `);

  // Create bookmark-category relationship table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmark_categories (
      bookmark_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (bookmark_id, category_id),
      FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Create search index
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS bookmark_fts USING fts5(
      title, 
      description, 
      url,
      content='bookmarks',
      content_rowid='id'
    )
  `);

  // Create triggers to maintain the FTS index
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS bookmarks_ai AFTER INSERT ON bookmarks BEGIN
      INSERT INTO bookmark_fts(rowid, title, description, url) 
      VALUES (new.id, new.title, new.description, new.url);
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS bookmarks_ad AFTER DELETE ON bookmarks BEGIN
      INSERT INTO bookmark_fts(bookmark_fts, rowid, title, description, url) 
      VALUES('delete', old.id, old.title, old.description, old.url);
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS bookmarks_au AFTER UPDATE ON bookmarks BEGIN
      INSERT INTO bookmark_fts(bookmark_fts, rowid, title, description, url) 
      VALUES('delete', old.id, old.title, old.description, old.url);
      INSERT INTO bookmark_fts(rowid, title, description, url) 
      VALUES (new.id, new.title, new.description, new.url);
    END;
  `);
}

/**
 * Execute a SQL query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @param {string} id - Message ID for response
 */
function executeQuery(sql, params, id) {
  try {
    // Execute the query
    const stmt = db.prepare(sql);
    
    // Bind parameters
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    
    // Get results
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    // Finalize statement
    stmt.free();
    
    // Send results back to main thread
    self.postMessage({
      type: 'queryResult',
      id,
      data: results
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: `Query execution failed: ${error.message}`
    });
  }
}

/**
 * Close the database connection
 */
function closeDatabase() {
  try {
    if (db) {
      // If using kvvfs, save the database to localStorage
      if (persistenceType === 'kvvfs') {
        const data = db.export();
        localStorage.setItem(`sqlite-${dbName}`, JSON.stringify(Array.from(data)));
      }
      
      // Close the database
      db.close();
      db = null;
    }
    
    self.postMessage({
      type: 'closed'
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: `Failed to close database: ${error.message}`
    });
  }
}

// Handle messages from the main thread
self.onmessage = function(event) {
  const { action, dbName, sql, params, id } = event.data;
  
  switch (action) {
    case 'initialize':
      initializeSqlite();
      break;
    case 'initializeDatabase':
      initializeDatabase(dbName);
      break;
    case 'execute':
      executeQuery(sql, params, id);
      break;
    case 'close':
      closeDatabase();
      break;
    default:
      self.postMessage({
        type: 'error',
        error: `Unknown action: ${action}`
      });
  }
};
