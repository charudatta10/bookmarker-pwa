/**
 * CategoryComponent - Reusable category component
 */
export class CategoryComponent {
  /**
   * Create a category component
   * @param {Object} category - The category data
   * @param {Object} options - Component options
   */
  constructor(category, options = {}) {
    this.category = category;
    this.options = {
      onClick: null,
      onEdit: null,
      onDelete: null,
      isActive: false,
      ...options
    };
    this.element = null;
  }
  
  /**
   * Render the category component
   * @returns {HTMLElement} The rendered category element
   */
  render() {
    const element = document.createElement('li');
    element.className = 'category-item';
    if (this.options.isActive) {
      element.classList.add('active');
    }
    element.dataset.category = this.category.id;
    
    element.innerHTML = `
      <span class="material-icons" style="color: ${this.category.color || 'var(--primary-color)'}">label</span>
      <span class="category-name">${this.category.name}</span>
      <span class="bookmark-count">${this.category.count || 0}</span>
    `;
    
    // Add event listeners
    this.attachEventListeners(element);
    
    this.element = element;
    return element;
  }
  
  /**
   * Attach event listeners to the category element
   * @param {HTMLElement} element - The category element
   */
  attachEventListeners(element) {
    // Click event
    element.addEventListener('click', () => {
      if (this.options.onClick) {
        this.options.onClick(this.category);
      }
    });
    
    // Right-click for context menu (edit/delete)
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      
      // Show context menu
      if (this.options.onContextMenu) {
        this.options.onContextMenu(e, this.category);
      }
    });
  }
  
  /**
   * Update the category data and re-render
   * @param {Object} newData - New category data
   */
  update(newData) {
    this.category = { ...this.category, ...newData };
    
    if (this.element) {
      // Update specific parts instead of re-rendering the whole component
      this.element.querySelector('.material-icons').style.color = 
        this.category.color || 'var(--primary-color)';
      this.element.querySelector('.category-name').textContent = this.category.name;
      this.element.querySelector('.bookmark-count').textContent = this.category.count || 0;
    }
  }
  
  /**
   * Set active state
   * @param {boolean} isActive - Whether the category is active
   */
  setActive(isActive) {
    this.options.isActive = isActive;
    
    if (this.element) {
      this.element.classList.toggle('active', isActive);
    }
  }
}
