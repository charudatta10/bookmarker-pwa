/**
 * Category Model - Handles category data operations
 * This is a placeholder that will be replaced with actual WASM SQLite implementation
 */
export class CategoryModel {
  constructor() {
    this.categories = [];
    this.loadSampleData();
  }
  
  /**
   * Load sample data for UI testing
   * This will be replaced with actual database operations
   */
  loadSampleData() {
    this.categories = [
      {
        id: '1',
        name: 'Development',
        color: '#4285f4',
        count: 2
      },
      {
        id: '2',
        name: 'Tools',
        color: '#34a853',
        count: 1
      },
      {
        id: '3',
        name: 'News',
        color: '#fbbc05',
        count: 1
      }
    ];
  }
  
  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getAllCategories() {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([...this.categories]);
      }, 100);
    });
  }
  
  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object|null>} Category object or null if not found
   */
  async getCategoryById(id) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const category = this.categories.find(c => c.id === id);
        resolve(category || null);
      }, 50);
    });
  }
  
  /**
   * Add a new category
   * @param {Object} category - Category data
   * @returns {Promise<Object>} Added category with ID
   */
  async addCategory(category) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const newCategory = {
          ...category,
          id: Date.now().toString(),
          count: 0
        };
        
        this.categories.push(newCategory);
        resolve(newCategory);
      }, 150);
    });
  }
  
  /**
   * Update an existing category
   * @param {string} id - Category ID
   * @param {Object} data - Updated category data
   * @returns {Promise<Object|null>} Updated category or null if not found
   */
  async updateCategory(id, data) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.categories.findIndex(c => c.id === id);
        
        if (index === -1) {
          resolve(null);
          return;
        }
        
        const updatedCategory = {
          ...this.categories[index],
          ...data
        };
        
        this.categories[index] = updatedCategory;
        resolve(updatedCategory);
      }, 150);
    });
  }
  
  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCategory(id) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const initialLength = this.categories.length;
        this.categories = this.categories.filter(c => c.id !== id);
        
        resolve(this.categories.length < initialLength);
      }, 100);
    });
  }
  
  /**
   * Update category count
   * @param {string} id - Category ID
   * @param {number} count - New count
   * @returns {Promise<Object|null>} Updated category or null if not found
   */
  async updateCategoryCount(id, count) {
    return this.updateCategory(id, { count });
  }
}
