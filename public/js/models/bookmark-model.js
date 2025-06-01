/**
 * Bookmark Model - Handles bookmark data operations
 * This is a placeholder that will be replaced with actual WASM SQLite implementation
 */
export class BookmarkModel {
  constructor() {
    this.bookmarks = [];
    this.loadSampleData();
  }
  
  /**
   * Load sample data for UI testing
   * This will be replaced with actual database operations
   */
  loadSampleData() {
    this.bookmarks = [
      {
        id: '1',
        url: 'https://developer.mozilla.org',
        title: 'MDN Web Docs',
        description: 'Resources for developers, by developers',
        created_at: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        updated_at: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        categories: [{ id: '1', name: 'Development', color: '#4285f4' }]
      },
      {
        id: '2',
        url: 'https://github.com',
        title: 'GitHub',
        description: 'Where the world builds software',
        created_at: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
        updated_at: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
        categories: [
          { id: '1', name: 'Development', color: '#4285f4' },
          { id: '2', name: 'Tools', color: '#34a853' }
        ]
      },
      {
        id: '3',
        url: 'https://news.ycombinator.com',
        title: 'Hacker News',
        description: 'A social news website focusing on computer science and entrepreneurship',
        created_at: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        updated_at: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        categories: [{ id: '3', name: 'News', color: '#fbbc05' }]
      }
    ];
  }
  
  /**
   * Get all bookmarks
   * @returns {Promise<Array>} Array of bookmarks
   */
  async getAllBookmarks() {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([...this.bookmarks]);
      }, 100);
    });
  }
  
  /**
   * Get bookmark by ID
   * @param {string} id - Bookmark ID
   * @returns {Promise<Object|null>} Bookmark object or null if not found
   */
  async getBookmarkById(id) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const bookmark = this.bookmarks.find(b => b.id === id);
        resolve(bookmark || null);
      }, 50);
    });
  }
  
  /**
   * Add a new bookmark
   * @param {Object} bookmark - Bookmark data
   * @returns {Promise<Object>} Added bookmark with ID
   */
  async addBookmark(bookmark) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const newBookmark = {
          ...bookmark,
          id: Date.now().toString(),
          created_at: Date.now(),
          updated_at: Date.now()
        };
        
        this.bookmarks.push(newBookmark);
        resolve(newBookmark);
      }, 150);
    });
  }
  
  /**
   * Update an existing bookmark
   * @param {string} id - Bookmark ID
   * @param {Object} data - Updated bookmark data
   * @returns {Promise<Object|null>} Updated bookmark or null if not found
   */
  async updateBookmark(id, data) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.bookmarks.findIndex(b => b.id === id);
        
        if (index === -1) {
          resolve(null);
          return;
        }
        
        const updatedBookmark = {
          ...this.bookmarks[index],
          ...data,
          updated_at: Date.now()
        };
        
        this.bookmarks[index] = updatedBookmark;
        resolve(updatedBookmark);
      }, 150);
    });
  }
  
  /**
   * Delete a bookmark
   * @param {string} id - Bookmark ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteBookmark(id) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const initialLength = this.bookmarks.length;
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        
        resolve(this.bookmarks.length < initialLength);
      }, 100);
    });
  }
  
  /**
   * Get bookmarks by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of bookmarks
   */
  async getBookmarksByCategory(categoryId) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        if (categoryId === 'all') {
          resolve([...this.bookmarks]);
          return;
        }
        
        if (categoryId === 'uncategorized') {
          const uncategorized = this.bookmarks.filter(b => 
            !b.categories || b.categories.length === 0
          );
          resolve(uncategorized);
          return;
        }
        
        const filtered = this.bookmarks.filter(b => 
          b.categories && b.categories.some(c => c.id === categoryId)
        );
        
        resolve(filtered);
      }, 100);
    });
  }
  
  /**
   * Search bookmarks
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching bookmarks
   */
  async searchBookmarks(query) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        if (!query) {
          resolve([...this.bookmarks]);
          return;
        }
        
        const lowerQuery = query.toLowerCase();
        const results = this.bookmarks.filter(b => 
          b.title.toLowerCase().includes(lowerQuery) ||
          b.url.toLowerCase().includes(lowerQuery) ||
          (b.description && b.description.toLowerCase().includes(lowerQuery))
        );
        
        resolve(results);
      }, 150);
    });
  }
}
