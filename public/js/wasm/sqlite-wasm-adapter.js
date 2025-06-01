/**
 * SQLite WASM Adapter - Handles integration with SQLite WASM
 */
export class SqliteWasmAdapter {
  constructor() {
    this.sqlite = null;
    this.db = null;
    this.dbName = 'bookmarker.db';
    this.isInitialized = false;
    this.persistenceType = null; // 'opfs' or 'kvvfs'
    this.worker = null;
  }

  /**
   * Initialize the SQLite WASM adapter
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Load the SQLite WASM module
      await this.loadSqliteModule();
      
      // Initialize the database
      await this.initializeDatabase();
      
      this.isInitialized = true;
      console.log(`SQLite initialized successfully using ${this.persistenceType} storage`);
      return true;
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
      return false;
    }
  }

  /**
   * Load the SQLite WASM module
   * @returns {Promise<void>}
   */
  async loadSqliteModule() {
    return new Promise((resolve, reject) => {
      // Create a worker for SQLite operations
      this.worker = new Worker('/js/wasm/sqlite-worker.js');
      
      // Set up message handling
      this.worker.onmessage = (event) => {
        const { type, data, error } = event.data;
        
        if (type === 'initialized') {
          this.persistenceType = data.persistenceType;
          resolve();
        } else if (type === 'error') {
          reject(new Error(error));
        }
      };
      
      // Handle worker errors
      this.worker.onerror = (error) => {
        console.error('SQLite worker error:', error);
        reject(error);
      };
      
      // Initialize the worker
      this.worker.postMessage({ action: 'initialize' });
    });
  }

  /**
   * Initialize the database
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event) => {
        const { type, error } = event.data;
        
        if (type === 'dbInitialized') {
          resolve();
        } else if (type === 'error') {
          reject(new Error(error));
        }
      };
      
      this.worker.postMessage({ 
        action: 'initializeDatabase', 
        dbName: this.dbName 
      });
    });
  }

  /**
   * Execute a SQL query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async execute(sql, params = []) {
    if (!this.isInitialized) {
      throw new Error('SQLite is not initialized');
    }

    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString();
      
      const messageHandler = (event) => {
        const { type, id, data, error } = event.data;
        
        if (id === messageId) {
          this.worker.removeEventListener('message', messageHandler);
          
          if (type === 'queryResult') {
            resolve(data);
          } else if (type === 'error') {
            reject(new Error(error));
          }
        }
      };
      
      this.worker.addEventListener('message', messageHandler);
      
      this.worker.postMessage({
        action: 'execute',
        id: messageId,
        sql,
        params
      });
    });
  }

  /**
   * Execute a SQL query that returns a single value
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>} Query result
   */
  async getScalar(sql, params = []) {
    const result = await this.execute(sql, params);
    return result && result.length > 0 ? result[0][Object.keys(result[0])[0]] : null;
  }

  /**
   * Execute a SQL query that returns a single row
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async getRow(sql, params = []) {
    const result = await this.execute(sql, params);
    return result && result.length > 0 ? result[0] : null;
  }

  /**
   * Execute a SQL query that returns multiple rows
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async getRows(sql, params = []) {
    return this.execute(sql, params);
  }

  /**
   * Execute a SQL query that doesn't return results
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<void>}
   */
  async run(sql, params = []) {
    await this.execute(sql, params);
  }

  /**
   * Begin a transaction
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    await this.run('BEGIN TRANSACTION');
  }

  /**
   * Commit a transaction
   * @returns {Promise<void>}
   */
  async commitTransaction() {
    await this.run('COMMIT');
  }

  /**
   * Rollback a transaction
   * @returns {Promise<void>}
   */
  async rollbackTransaction() {
    await this.run('ROLLBACK');
  }

  /**
   * Execute a function within a transaction
   * @param {Function} callback - Function to execute within transaction
   * @returns {Promise<any>} Result of the callback
   */
  async withTransaction(callback) {
    await this.beginTransaction();
    try {
      const result = await callback();
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (!this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const messageHandler = (event) => {
        const { type, error } = event.data;
        
        this.worker.removeEventListener('message', messageHandler);
        
        if (type === 'closed') {
          this.isInitialized = false;
          resolve();
        } else if (type === 'error') {
          reject(new Error(error));
        }
      };
      
      this.worker.addEventListener('message', messageHandler);
      
      this.worker.postMessage({
        action: 'close'
      });
    });
  }

  /**
   * Get the persistence type
   * @returns {string} Persistence type ('opfs' or 'kvvfs')
   */
  getPersistenceType() {
    return this.persistenceType;
  }

  /**
   * Check if the database is initialized
   * @returns {boolean} Initialization status
   */
  isInitialized() {
    return this.isInitialized;
  }
}
