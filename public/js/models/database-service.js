/**
 * Database Service - Provides a clean API for database operations
 * This service uses the SQLite WASM adapter to interact with the database
 */
export class DatabaseService {
  constructor() {
    this.adapter = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the database service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Import the SQLite WASM adapter
      const { SqliteWasmAdapter } = await import('./wasm/sqlite-wasm-adapter.js');
      
      // Create and initialize the adapter
      this.adapter = new SqliteWasmAdapter();
      const success = await this.adapter.initialize();
      
      if (success) {
        this.isInitialized = true;
        console.log('Database service initialized successfully');
        return true;
      } else {
        console.error('Failed to initialize database service');
        return false;
      }
    } catch (error) {
      console.error('Error initializing database service:', error);
      return false;
    }
  }

  /**
   * Get all bookmarks
   * @returns {Promise<Array>} Array of bookmarks
   */
  async getAllBookmarks() {
    this.ensureInitialized();
    
    const sql = `
      SELECT 
        b.*,
        GROUP_CONCAT(c.id || ':' || c.name || ':' || c.color, '|') as categories_data
      FROM 
        bookmarks b
      LEFT JOIN 
        bookmark_categories bc ON b.id = bc.bookmark_id
      LEFT JOIN 
        categories c ON bc.category_id = c.id
      GROUP BY 
        b.id
      ORDER BY 
        b.updated_at DESC
    `;
    
    const rows = await this.adapter.getRows(sql);
    return this.processBookmarkRows(rows);
  }

  /**
   * Get bookmark by ID
   * @param {number} id - Bookmark ID
   * @returns {Promise<Object|null>} Bookmark object or null if not found
   */
  async getBookmarkById(id) {
    this.ensureInitialized();
    
    const sql = `
      SELECT 
        b.*,
        GROUP_CONCAT(c.id || ':' || c.name || ':' || c.color, '|') as categories_data
      FROM 
        bookmarks b
      LEFT JOIN 
        bookmark_categories bc ON b.id = bc.bookmark_id
      LEFT JOIN 
        categories c ON bc.category_id = c.id
      WHERE 
        b.id = ?
      GROUP BY 
        b.id
    `;
    
    const rows = await this.adapter.getRows(sql, [id]);
    const bookmarks = this.processBookmarkRows(rows);
    return bookmarks.length > 0 ? bookmarks[0] : null;
  }

  /**
   * Add a new bookmark
   * @param {Object} bookmark - Bookmark data
   * @param {Array} categoryIds - Array of category IDs
   * @returns {Promise<Object>} Added bookmark with ID
   */
  async addBookmark(bookmark, categoryIds = []) {
    this.ensureInitialized();
    
    return this.adapter.withTransaction(async () => {
      const now = Date.now();
      
      // Insert bookmark
      const sql = `
        INSERT INTO bookmarks (url, title, description, favicon, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await this.adapter.run(sql, [
        bookmark.url,
        bookmark.title,
        bookmark.description || null,
        bookmark.favicon || null,
        now,
        now
      ]);
      
      // Get the inserted ID
      const id = await this.adapter.getScalar('SELECT last_insert_rowid()');
      
      // Add categories
      if (categoryIds && categoryIds.length > 0) {
        const values = categoryIds.map(categoryId => `(${id}, ${categoryId})`).join(',');
        await this.adapter.run(`
          INSERT INTO bookmark_categories (bookmark_id, category_id)
          VALUES ${values}
        `);
      }
      
      // Return the added bookmark
      return this.getBookmarkById(id);
    });
  }

  /**
   * Update an existing bookmark
   * @param {number} id - Bookmark ID
   * @param {Object} data - Updated bookmark data
   * @param {Array} categoryIds - Array of category IDs
   * @returns {Promise<Object|null>} Updated bookmark or null if not found
   */
  async updateBookmark(id, data, categoryIds = null) {
    this.ensureInitialized();
    
    return this.adapter.withTransaction(async () => {
      // Check if bookmark exists
      const exists = await this.adapter.getScalar('SELECT 1 FROM bookmarks WHERE id = ?', [id]);
      
      if (!exists) {
        return null;
      }
      
      // Update bookmark
      const updateFields = [];
      const updateParams = [];
      
      if (data.url !== undefined) {
        updateFields.push('url = ?');
        updateParams.push(data.url);
      }
      
      if (data.title !== undefined) {
        updateFields.push('title = ?');
        updateParams.push(data.title);
      }
      
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateParams.push(data.description);
      }
      
      if (data.favicon !== undefined) {
        updateFields.push('favicon = ?');
        updateParams.push(data.favicon);
      }
      
      updateFields.push('updated_at = ?');
      updateParams.push(Date.now());
      
      // Add ID to params
      updateParams.push(id);
      
      if (updateFields.length > 0) {
        await this.adapter.run(`
          UPDATE bookmarks
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `, updateParams);
      }
      
      // Update categories if provided
      if (categoryIds !== null) {
        // Remove existing categories
        await this.adapter.run('DELETE FROM bookmark_categories WHERE bookmark_id = ?', [id]);
        
        // Add new categories
        if (categoryIds && categoryIds.length > 0) {
          const values = categoryIds.map(categoryId => `(${id}, ${categoryId})`).join(',');
          await this.adapter.run(`
            INSERT INTO bookmark_categories (bookmark_id, category_id)
            VALUES ${values}
          `);
        }
      }
      
      // Return the updated bookmark
      return this.getBookmarkById(id);
    });
  }

  /**
   * Delete a bookmark
   * @param {number} id - Bookmark ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteBookmark(id) {
    this.ensureInitialized();
    
    // Delete bookmark (cascade will delete bookmark_categories entries)
    await this.adapter.run('DELETE FROM bookmarks WHERE id = ?', [id]);
    
    // Check if it was deleted
    const exists = await this.adapter.getScalar('SELECT 1 FROM bookmarks WHERE id = ?', [id]);
    return !exists;
  }

  /**
   * Get bookmarks by category
   * @param {number} categoryId - Category ID
   * @returns {Promise<Array>} Array of bookmarks
   */
  async getBookmarksByCategory(categoryId) {
    this.ensureInitialized();
    
    const sql = `
      SELECT 
        b.*,
        GROUP_CONCAT(c.id || ':' || c.name || ':' || c.color, '|') as categories_data
      FROM 
        bookmarks b
      JOIN 
        bookmark_categories bc ON b.id = bc.bookmark_id
      LEFT JOIN 
        bookmark_categories bc2 ON b.id = bc2.bookmark_id
      LEFT JOIN 
        categories c ON bc2.category_id = c.id
      WHERE 
        bc.category_id = ?
      GROUP BY 
        b.id
      ORDER BY 
        b.updated_at DESC
    `;
    
    const rows = await this.adapter.getRows(sql, [categoryId]);
    return this.processBookmarkRows(rows);
  }

  /**
   * Get uncategorized bookmarks
   * @returns {Promise<Array>} Array of bookmarks
   */
  async getUncategorizedBookmarks() {
    this.ensureInitialized();
    
    const sql = `
      SELECT 
        b.*,
        NULL as categories_data
      FROM 
        bookmarks b
      LEFT JOIN 
        bookmark_categories bc ON b.id = bc.bookmark_id
      WHERE 
        bc.bookmark_id IS NULL
      ORDER BY 
        b.updated_at DESC
    `;
    
    const rows = await this.adapter.getRows(sql);
    return this.processBookmarkRows(rows);
  }

  /**
   * Search bookmarks
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching bookmarks
   */
  async searchBookmarks(query) {
    this.ensureInitialized();
    
    if (!query) {
      return this.getAllBookmarks();
    }
    
    const sql = `
      SELECT 
        b.*,
        GROUP_CONCAT(c.id || ':' || c.name || ':' || c.color, '|') as categories_data
      FROM 
        bookmarks b
      JOIN 
        bookmark_fts f ON b.id = f.rowid
      LEFT JOIN 
        bookmark_categories bc ON b.id = bc.bookmark_id
      LEFT JOIN 
        categories c ON bc.category_id = c.id
      WHERE 
        bookmark_fts MATCH ?
      GROUP BY 
        b.id
      ORDER BY 
        rank
    `;
    
    const rows = await this.adapter.getRows(sql, [query + '*']);
    return this.processBookmarkRows(rows);
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getAllCategories() {
    this.ensureInitialized();
    
    const sql = `
      SELECT 
        c.*,
        COUNT(bc.bookmark_id) as count
      FROM 
        categories c
      LEFT JOIN 
        bookmark_categories bc ON c.id = bc.category_id
      GROUP BY 
        c.id
      ORDER BY 
        c.name
    `;
    
    return this.adapter.getRows(sql);
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object|null>} Category object or null if not found
   */
  async getCategoryById(id) {
    this.ensureInitialized();
    
    const sql = `
      SELECT 
        c.*,
        COUNT(bc.bookmark_id) as count
      FROM 
        categories c
      LEFT JOIN 
        bookmark_categories bc ON c.id = bc.category_id
      WHERE 
        c.id = ?
      GROUP BY 
        c.id
    `;
    
    return this.adapter.getRow(sql, [id]);
  }

  /**
   * Add a new category
   * @param {Object} category - Category data
   * @returns {Promise<Object>} Added category with ID
   */
  async addCategory(category) {
    this.ensureInitialized();
    
    const now = Date.now();
    
    // Insert category
    const sql = `
      INSERT INTO categories (name, color, created_at)
      VALUES (?, ?, ?)
    `;
    
    await this.adapter.run(sql, [
      category.name,
      category.color || '#4285f4',
      now
    ]);
    
    // Get the inserted ID
    const id = await this.adapter.getScalar('SELECT last_insert_rowid()');
    
    // Return the added category
    return this.getCategoryById(id);
  }

  /**
   * Update an existing category
   * @param {number} id - Category ID
   * @param {Object} data - Updated category data
   * @returns {Promise<Object|null>} Updated category or null if not found
   */
  async updateCategory(id, data) {
    this.ensureInitialized();
    
    // Check if category exists
    const exists = await this.adapter.getScalar('SELECT 1 FROM categories WHERE id = ?', [id]);
    
    if (!exists) {
      return null;
    }
    
    // Update category
    const updateFields = [];
    const updateParams = [];
    
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      updateParams.push(data.name);
    }
    
    if (data.color !== undefined) {
      updateFields.push('color = ?');
      updateParams.push(data.color);
    }
    
    // Add ID to params
    updateParams.push(id);
    
    if (updateFields.length > 0) {
      await this.adapter.run(`
        UPDATE categories
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateParams);
    }
    
    // Return the updated category
    return this.getCategoryById(id);
  }

  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCategory(id) {
    this.ensureInitialized();
    
    // Delete category (cascade will delete bookmark_categories entries)
    await this.adapter.run('DELETE FROM categories WHERE id = ?', [id]);
    
    // Check if it was deleted
    const exists = await this.adapter.getScalar('SELECT 1 FROM categories WHERE id = ?', [id]);
    return !exists;
  }

  /**
   * Process bookmark rows to include parsed categories
   * @param {Array} rows - Database rows
   * @returns {Array} Processed bookmarks
   */
  processBookmarkRows(rows) {
    return rows.map(row => {
      const bookmark = { ...row };
      
      // Parse categories
      bookmark.categories = [];
      
      if (row.categories_data) {
        const categoriesData = row.categories_data.split('|');
        
        bookmark.categories = categoriesData
          .filter(Boolean)
          .map(categoryData => {
            const [id, name, color] = categoryData.split(':');
            return { id: parseInt(id), name, color };
          });
      }
      
      // Remove categories_data from result
      delete bookmark.categories_data;
      
      return bookmark;
    });
  }

  /**
   * Ensure the database service is initialized
   * @throws {Error} If not initialized
   */
  ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Database service is not initialized');
    }
  }

  /**
   * Get the persistence type
   * @returns {string} Persistence type ('opfs' or 'kvvfs')
   */
  getPersistenceType() {
    return this.adapter ? this.adapter.getPersistenceType() : null;
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.adapter) {
      await this.adapter.close();
      this.isInitialized = false;
    }
  }
}
