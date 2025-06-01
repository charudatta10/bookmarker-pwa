/**
 * BookmarkComponent - Reusable bookmark card component
 */
export class BookmarkComponent {
  /**
   * Create a bookmark component
   * @param {Object} bookmark - The bookmark data
   * @param {Object} options - Component options
   */
  constructor(bookmark, options = {}) {
    this.bookmark = bookmark;
    this.options = {
      onClick: null,
      onEdit: null,
      onDelete: null,
      ...options
    };
    this.element = null;
  }
  
  /**
   * Render the bookmark component
   * @returns {HTMLElement} The rendered bookmark element
   */
  render() {
    const element = document.createElement('div');
    element.className = 'bookmark-card';
    element.innerHTML = `
      <div class="bookmark-card-header">
        <img src="${this.getFaviconUrl(this.bookmark.url)}" alt="" class="bookmark-favicon">
        <h3 class="bookmark-title">${this.bookmark.title}</h3>
      </div>
      <div class="bookmark-content">
        <div class="bookmark-url">${this.bookmark.url}</div>
        <div class="bookmark-description">${this.bookmark.description || 'No description'}</div>
      </div>
      <div class="bookmark-footer">
        <div class="bookmark-categories">
          ${this.renderCategories()}
        </div>
        <div class="bookmark-actions">
          <button class="icon-button edit-bookmark" aria-label="Edit">
            <span class="material-icons">edit</span>
          </button>
          <button class="icon-button delete-bookmark" aria-label="Delete">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.attachEventListeners(element);
    
    this.element = element;
    return element;
  }
  
  /**
   * Attach event listeners to the bookmark element
   * @param {HTMLElement} element - The bookmark element
   */
  attachEventListeners(element) {
    // Click event to open the bookmark
    element.addEventListener('click', (e) => {
      // Don't open if clicking on action buttons
      if (!e.target.closest('.bookmark-actions')) {
        if (this.options.onClick) {
          this.options.onClick(this.bookmark);
        } else {
          window.open(this.bookmark.url, '_blank');
        }
      }
    });
    
    // Edit button
    const editBtn = element.querySelector('.edit-bookmark');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.options.onEdit) {
        this.options.onEdit(this.bookmark);
      }
    });
    
    // Delete button
    const deleteBtn = element.querySelector('.delete-bookmark');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.options.onDelete) {
        this.options.onDelete(this.bookmark);
      }
    });
  }
  
  /**
   * Render the categories for this bookmark
   * @returns {string} HTML for the categories
   */
  renderCategories() {
    if (!this.bookmark.categories || this.bookmark.categories.length === 0) {
      return '<span class="bookmark-category">Uncategorized</span>';
    }
    
    return this.bookmark.categories.map(cat => `
      <span class="bookmark-category" style="background-color: ${cat.color}20; color: ${cat.color}">
        ${cat.name}
      </span>
    `).join('');
  }
  
  /**
   * Update the bookmark data and re-render
   * @param {Object} newData - New bookmark data
   */
  update(newData) {
    this.bookmark = { ...this.bookmark, ...newData };
    
    if (this.element) {
      // Update specific parts instead of re-rendering the whole component
      this.element.querySelector('.bookmark-title').textContent = this.bookmark.title;
      this.element.querySelector('.bookmark-url').textContent = this.bookmark.url;
      this.element.querySelector('.bookmark-description').textContent = 
        this.bookmark.description || 'No description';
      this.element.querySelector('.bookmark-categories').innerHTML = this.renderCategories();
    }
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
