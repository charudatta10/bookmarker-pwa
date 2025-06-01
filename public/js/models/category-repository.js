/**
 * CategoryRepository - Handles category data operations using the DatabaseService
 */
export class CategoryRepository {
  constructor(databaseService) {
    this.db = databaseService;
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getAllCategories() {
    return this.db.getAllCategories();
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object|null>} Category object or null if not found
   */
  async getCategoryById(id) {
    return this.db.getCategoryById(id);
  }

  /**
   * Add a new category
   * @param {Object} category - Category data
   * @returns {Promise<Object>} Added category with ID
   */
  async addCategory(category) {
    // Ensure category has required fields
    if (!category.name) {
      throw new Error('Category name is required');
    }

    // Set default color if not provided
    if (!category.color) {
      category.color = this.getRandomColor();
    }

    return this.db.addCategory(category);
  }

  /**
   * Update an existing category
   * @param {number} id - Category ID
   * @param {Object} data - Updated category data
   * @returns {Promise<Object|null>} Updated category or null if not found
   */
  async updateCategory(id, data) {
    return this.db.updateCategory(id, data);
  }

  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCategory(id) {
    return this.db.deleteCategory(id);
  }

  /**
   * Get a random color for a category
   * @returns {string} Hex color code
   */
  getRandomColor() {
    const colors = [
      '#4285f4', // Blue
      '#34a853', // Green
      '#fbbc05', // Yellow
      '#ea4335', // Red
      '#673ab7', // Deep Purple
      '#3f51b5', // Indigo
      '#2196f3', // Blue
      '#009688', // Teal
      '#4caf50', // Green
      '#ff9800', // Orange
      '#ff5722', // Deep Orange
      '#795548', // Brown
      '#607d8b'  // Blue Grey
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
