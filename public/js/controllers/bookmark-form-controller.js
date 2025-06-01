/**
 * BookmarkFormController - Handles bookmark form interactions
 */
export class BookmarkFormController {
  constructor(bookmarkRepository, categoryRepository, modalManager, toastManager) {
    this.bookmarkRepository = bookmarkRepository;
    this.categoryRepository = categoryRepository;
    this.modalManager = modalManager;
    this.toastManager = toastManager;
    
    // Form elements
    this.bookmarkForm = document.getElementById('bookmark-form');
    this.bookmarkUrlInput = document.getElementById('bookmark-url');
    this.bookmarkTitleInput = document.getElementById('bookmark-title');
    this.bookmarkDescriptionInput = document.getElementById('bookmark-description');
    this.bookmarkCategoriesContainer = document.getElementById('bookmark-categories-container');
    this.saveBookmarkBtn = document.getElementById('save-bookmark');
    
    // Current bookmark being edited (if any)
    this.currentBookmarkId = null;
    
    // Selected categories
    this.selectedCategories = [];
    
    this.init();
  }
  
  /**
   * Initialize the controller
   */
  init() {
    // Add event listeners
    this.saveBookmarkBtn.addEventListener('click', () => this.saveBookmark());
    
    // URL input blur event to fetch metadata
    this.bookmarkUrlInput.addEventListener('blur', () => this.fetchMetadata());
    
    // Initialize category selection
    this.initCategorySelection();
  }
  
  /**
   * Initialize category selection
   */
  async initCategorySelection() {
    try {
      // Get all categories
      const categories = await this.categoryRepository.getAllCategories();
      
      // Clear container
      this.bookmarkCategoriesContainer.innerHTML = '';
      
      // Add categories
      categories.forEach(category => {
        const categoryChip = document.createElement('div');
        categoryChip.className = 'category-chip selectable';
        categoryChip.dataset.id = category.id;
        categoryChip.innerHTML = `
          <span class="category-color" style="background-color: ${category.color}"></span>
          <span class="category-name">${category.name}</span>
        `;
        
        // Add click event
        categoryChip.addEventListener('click', () => {
          this.toggleCategory(category.id);
          categoryChip.classList.toggle('selected');
        });
        
        this.bookmarkCategoriesContainer.appendChild(categoryChip);
      });
    } catch (error) {
      console.error('Failed to load categories for selection:', error);
    }
  }
  
  /**
   * Toggle category selection
   * @param {number} categoryId - Category ID
   */
  toggleCategory(categoryId) {
    const index = this.selectedCategories.indexOf(categoryId);
    
    if (index === -1) {
      // Add category
      this.selectedCategories.push(categoryId);
    } else {
      // Remove category
      this.selectedCategories.splice(index, 1);
    }
  }
  
  /**
   * Show add bookmark modal
   */
  showAddBookmarkModal() {
    // Reset form
    this.resetForm();
    
    // Show modal
    this.modalManager.open('bookmark', {}, {
      onSave: (data) => this.saveBookmark(),
      onClose: () => this.resetForm()
    });
    
    // Try to get URL from clipboard
    this.tryGetUrlFromClipboard();
  }
  
  /**
   * Show edit bookmark modal
   * @param {Object} bookmark - Bookmark to edit
   */
  async showEditBookmarkModal(bookmark) {
    // Reset form
    this.resetForm();
    
    // Set current bookmark ID
    this.currentBookmarkId = bookmark.id;
    
    // Populate form
    this.bookmarkUrlInput.value = bookmark.url;
    this.bookmarkTitleInput.value = bookmark.title;
    this.bookmarkDescriptionInput.value = bookmark.description || '';
    
    // Set selected categories
    this.selectedCategories = bookmark.categories.map(cat => cat.id);
    
    // Update category chips
    this.updateCategoryChips();
    
    // Show modal
    this.modalManager.open('bookmark', {
      id: bookmark.id,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description
    }, {
      onSave: (data) => this.saveBookmark(),
      onClose: () => this.resetForm()
    });
  }
  
  /**
   * Update category chips to reflect selected categories
   */
  updateCategoryChips() {
    // Update selected state
    document.querySelectorAll('.category-chip').forEach(chip => {
      const categoryId = parseInt(chip.dataset.id);
      chip.classList.toggle('selected', this.selectedCategories.includes(categoryId));
    });
  }
  
  /**
   * Reset the form
   */
  resetForm() {
    this.bookmarkForm.reset();
    this.currentBookmarkId = null;
    this.selectedCategories = [];
    this.updateCategoryChips();
  }
  
  /**
   * Try to get URL from clipboard
   */
  async tryGetUrlFromClipboard() {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        
        // Check if text is a URL
        if (this.isValidUrl(text)) {
          this.bookmarkUrlInput.value = text;
          this.fetchMetadata();
        }
      }
    } catch (error) {
      console.warn('Could not read clipboard:', error);
    }
  }
  
  /**
   * Check if a string is a valid URL
   * @param {string} url - URL to check
   * @returns {boolean} Whether the URL is valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Fetch metadata for the current URL
   */
  async fetchMetadata() {
    const url = this.bookmarkUrlInput.value;
    
    if (!url || !this.isValidUrl(url)) {
      return;
    }
    
    // Only fetch if title is empty
    if (this.bookmarkTitleInput.value) {
      return;
    }
    
    try {
      // In a real app, this would use a server-side proxy or browser extension
      // For now, we'll just set a placeholder title
      this.bookmarkTitleInput.value = new URL(url).hostname.replace('www.', '');
    } catch (error) {
      console.warn('Failed to fetch metadata:', error);
    }
  }
  
  /**
   * Save the current bookmark
   */
  async saveBookmark() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    // Get form data
    const bookmarkData = {
      url: this.bookmarkUrlInput.value,
      title: this.bookmarkTitleInput.value,
      description: this.bookmarkDescriptionInput.value
    };
    
    try {
      if (this.currentBookmarkId) {
        // Update existing bookmark
        await this.bookmarkRepository.updateBookmark(
          this.currentBookmarkId, 
          bookmarkData, 
          this.selectedCategories
        );
        
        this.toastManager.show('Bookmark updated successfully');
      } else {
        // Add new bookmark
        await this.bookmarkRepository.addBookmark(
          bookmarkData, 
          this.selectedCategories
        );
        
        this.toastManager.show('Bookmark added successfully');
      }
      
      // Close modal
      this.modalManager.close();
      
      // Reset form
      this.resetForm();
      
      // Trigger bookmark list refresh
      window.dispatchEvent(new CustomEvent('bookmarks-changed'));
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      this.toastManager.show('Failed to save bookmark. Please try again.');
    }
  }
  
  /**
   * Validate the form
   * @returns {boolean} Whether the form is valid
   */
  validateForm() {
    const url = this.bookmarkUrlInput.value;
    const title = this.bookmarkTitleInput.value;
    
    if (!url) {
      this.toastManager.show('Please enter a URL');
      this.bookmarkUrlInput.focus();
      return false;
    }
    
    if (!this.isValidUrl(url)) {
      this.toastManager.show('Please enter a valid URL (including http:// or https://)');
      this.bookmarkUrlInput.focus();
      return false;
    }
    
    if (!title) {
      this.toastManager.show('Please enter a title');
      this.bookmarkTitleInput.focus();
      return false;
    }
    
    return true;
  }
}
