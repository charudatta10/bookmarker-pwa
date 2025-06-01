/**
 * CategoryFormController - Handles category form interactions
 */
export class CategoryFormController {
  constructor(categoryRepository, modalManager, toastManager) {
    this.categoryRepository = categoryRepository;
    this.modalManager = modalManager;
    this.toastManager = toastManager;
    
    // Form elements
    this.categoryForm = document.getElementById('category-form');
    this.categoryNameInput = document.getElementById('category-name');
    this.categoryColorInput = document.getElementById('category-color');
    this.saveCategoryBtn = document.getElementById('save-category');
    
    // Current category being edited (if any)
    this.currentCategoryId = null;
    
    this.init();
  }
  
  /**
   * Initialize the controller
   */
  init() {
    // Add event listeners
    this.saveCategoryBtn.addEventListener('click', () => this.saveCategory());
    
    // Color input preview
    this.categoryColorInput.addEventListener('input', () => this.updateColorPreview());
  }
  
  /**
   * Update color preview
   */
  updateColorPreview() {
    const colorPreview = document.getElementById('color-preview');
    if (colorPreview) {
      colorPreview.style.backgroundColor = this.categoryColorInput.value;
    }
  }
  
  /**
   * Show add category modal
   */
  showAddCategoryModal() {
    // Reset form
    this.resetForm();
    
    // Set random color
    this.categoryColorInput.value = this.getRandomColor();
    this.updateColorPreview();
    
    // Show modal
    this.modalManager.open('category', {}, {
      onSave: (data) => this.saveCategory(),
      onClose: () => this.resetForm()
    });
  }
  
  /**
   * Show edit category modal
   * @param {Object} category - Category to edit
   */
  showEditCategoryModal(category) {
    // Reset form
    this.resetForm();
    
    // Set current category ID
    this.currentCategoryId = category.id;
    
    // Populate form
    this.categoryNameInput.value = category.name;
    this.categoryColorInput.value = category.color;
    this.updateColorPreview();
    
    // Show modal
    this.modalManager.open('category', {
      id: category.id,
      name: category.name,
      color: category.color
    }, {
      onSave: (data) => this.saveCategory(),
      onClose: () => this.resetForm()
    });
  }
  
  /**
   * Reset the form
   */
  resetForm() {
    this.categoryForm.reset();
    this.currentCategoryId = null;
  }
  
  /**
   * Save the current category
   */
  async saveCategory() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    // Get form data
    const categoryData = {
      name: this.categoryNameInput.value,
      color: this.categoryColorInput.value
    };
    
    try {
      if (this.currentCategoryId) {
        // Update existing category
        await this.categoryRepository.updateCategory(
          this.currentCategoryId, 
          categoryData
        );
        
        this.toastManager.show('Category updated successfully');
      } else {
        // Add new category
        await this.categoryRepository.addCategory(categoryData);
        
        this.toastManager.show('Category added successfully');
      }
      
      // Close modal
      this.modalManager.close();
      
      // Reset form
      this.resetForm();
      
      // Trigger category list refresh
      window.dispatchEvent(new CustomEvent('categories-changed'));
    } catch (error) {
      console.error('Failed to save category:', error);
      this.toastManager.show('Failed to save category. Please try again.');
    }
  }
  
  /**
   * Validate the form
   * @returns {boolean} Whether the form is valid
   */
  validateForm() {
    const name = this.categoryNameInput.value;
    
    if (!name) {
      this.toastManager.show('Please enter a category name');
      this.categoryNameInput.focus();
      return false;
    }
    
    return true;
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
