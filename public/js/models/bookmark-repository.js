/**
 * BookmarkRepository - Handles bookmark data operations using the DatabaseService
 */
export class BookmarkRepository {
  constructor(databaseService) {
    this.db = databaseService;
  }

  /**
   * Get all bookmarks
   * @returns {Promise<Array>} Array of bookmarks
   */
  async getAllBookmarks() {
    return this.db.getAllBookmarks();
  }

  /**
   * Get bookmark by ID
   * @param {number} id - Bookmark ID
   * @returns {Promise<Object|null>} Bookmark object or null if not found
   */
  async getBookmarkById(id) {
    return this.db.getBookmarkById(id);
  }

  /**
   * Add a new bookmark
   * @param {Object} bookmark - Bookmark data
   * @param {Array} categoryIds - Array of category IDs
   * @returns {Promise<Object>} Added bookmark with ID
   */
  async addBookmark(bookmark, categoryIds = []) {
    // Ensure bookmark has required fields
    if (!bookmark.url) {
      throw new Error('Bookmark URL is required');
    }

    if (!bookmark.title) {
      // Try to fetch title from URL if not provided
      try {
        bookmark.title = await this.fetchPageTitle(bookmark.url) || 'Untitled';
      } catch (error) {
        console.warn('Failed to fetch page title:', error);
        bookmark.title = 'Untitled';
      }
    }

    // Generate favicon URL if not provided
    if (!bookmark.favicon) {
      bookmark.favicon = this.getFaviconUrl(bookmark.url);
    }

    return this.db.addBookmark(bookmark, categoryIds);
  }

  /**
   * Update an existing bookmark
   * @param {number} id - Bookmark ID
   * @param {Object} data - Updated bookmark data
   * @param {Array} categoryIds - Array of category IDs
   * @returns {Promise<Object|null>} Updated bookmark or null if not found
   */
  async updateBookmark(id, data, categoryIds = null) {
    return this.db.updateBookmark(id, data, categoryIds);
  }

  /**
   * Delete a bookmark
   * @param {number} id - Bookmark ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteBookmark(id) {
    return this.db.deleteBookmark(id);
  }

  /**
   * Get bookmarks by category
   * @param {string|number} categoryId - Category ID or special value ('all', 'uncategorized')
   * @returns {Promise<Array>} Array of bookmarks
   */
  async getBookmarksByCategory(categoryId) {
    if (categoryId === 'all') {
      return this.getAllBookmarks();
    } else if (categoryId === 'uncategorized') {
      return this.db.getUncategorizedBookmarks();
    } else {
      return this.db.getBookmarksByCategory(categoryId);
    }
  }

  /**
   * Search bookmarks
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching bookmarks
   */
  async searchBookmarks(query) {
    return this.db.searchBookmarks(query);
  }

  /**
   * Filter bookmarks by multiple criteria
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Array of filtered bookmarks
   */
  async filterBookmarks(filters = {}) {
    let bookmarks = [];

    // Get initial set of bookmarks based on category
    if (filters.categoryId) {
      bookmarks = await this.getBookmarksByCategory(filters.categoryId);
    } else {
      bookmarks = await this.getAllBookmarks();
    }

    // Apply text search if provided
    if (filters.query && filters.query.trim()) {
      const searchResults = await this.searchBookmarks(filters.query.trim());
      
      // Find intersection of bookmarks and searchResults
      const searchResultIds = new Set(searchResults.map(b => b.id));
      bookmarks = bookmarks.filter(b => searchResultIds.has(b.id));
    }

    // Apply date filters
    if (filters.dateFrom || filters.dateTo) {
      bookmarks = bookmarks.filter(bookmark => {
        const createdAt = bookmark.created_at;
        
        if (filters.dateFrom && createdAt < filters.dateFrom) {
          return false;
        }
        
        if (filters.dateTo && createdAt > filters.dateTo) {
          return false;
        }
        
        return true;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      bookmarks = this.sortBookmarks(bookmarks, filters.sortBy, filters.sortOrder);
    }

    return bookmarks;
  }

  /**
   * Sort bookmarks
   * @param {Array} bookmarks - Bookmarks to sort
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - Sort order ('asc' or 'desc')
   * @returns {Array} Sorted bookmarks
   */
  sortBookmarks(bookmarks, sortBy = 'updated_at', sortOrder = 'desc') {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    return [...bookmarks].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          return valueA.localeCompare(valueB) * multiplier;
        
        case 'url':
          valueA = a.url.toLowerCase();
          valueB = b.url.toLowerCase();
          return valueA.localeCompare(valueB) * multiplier;
        
        case 'created_at':
          return (a.created_at - b.created_at) * multiplier;
        
        case 'visit_count':
          return ((a.visit_count || 0) - (b.visit_count || 0)) * multiplier;
        
        case 'updated_at':
        default:
          return (a.updated_at - b.updated_at) * multiplier;
      }
    });
  }

  /**
   * Record a bookmark visit
   * @param {number} id - Bookmark ID
   * @returns {Promise<Object|null>} Updated bookmark or null if not found
   */
  async recordVisit(id) {
    const bookmark = await this.getBookmarkById(id);
    
    if (!bookmark) {
      return null;
    }
    
    const visitCount = (bookmark.visit_count || 0) + 1;
    
    return this.updateBookmark(id, {
      last_visited: Date.now(),
      visit_count: visitCount
    });
  }

  /**
   * Fetch page title from URL
   * @param {string} url - URL to fetch title from
   * @returns {Promise<string|null>} Page title or null if not found
   */
  async fetchPageTitle(url) {
    // This would typically use a server-side proxy or a browser extension
    // For now, we'll just return null as this requires CORS considerations
    return null;
  }

  /**
   * Get favicon URL for a website
   * @param {string} url - The website URL
   * @returns {string} - The favicon URL
   */
  getFaviconUrl(url) {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`;
    } catch (e) {
      return 'https://www.google.com/s2/favicons?domain=example.com';
    }
  }
}
