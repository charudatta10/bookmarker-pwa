/**
 * BookmarkController - Connects the UI with the bookmark repository
 */
export class BookmarkController {
  constructor(bookmarkRepository, categoryRepository) {
    this.bookmarkRepository = bookmarkRepository;
    this.categoryRepository = categoryRepository;
    this.bookmarkComponents = new Map();
    this.currentCategory = 'all';
    this.currentView = 'grid';
    this.currentSort = 'updated_at';
    this.currentSortOrder = 'desc';
    this.searchQuery = '';
  }

  /**
   * Initialize the controller
   */
  async initialize() {
    try {
      // Load initial data
      await this.loadBookmarks();
      await this.loadCategories();
      
      // Set up event listeners
      this.setupEventListeners();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize BookmarkController:', error);
      return false;
    }
  }

  /**
   * Load bookmarks
   */
  async loadBookmarks() {
    try {
      const bookmarksContainer = document.getElementById('bookmarks-container');
      bookmarksContainer.innerHTML = '<div class="loading">Loading bookmarks...</div>';
      
      // Apply filters
      const filters = {
        categoryId: this.currentCategory,
        query: this.searchQuery,
        sortBy: this.currentSort,
        sortOrder: this.currentSortOrder
      };
      
      const bookmarks = await this.bookmarkRepository.filterBookmarks(filters);
      
      // Clear container
      bookmarksContainer.innerHTML = '';
      
      // Show empty state if no bookmarks
      if (bookmarks.length === 0) {
        this.showEmptyState();
        return;
      }
      
      // Create bookmark components
      this.bookmarkComponents.clear();
      
      bookmarks.forEach(bookmark => {
        const bookmarkElement = this.createBookmarkElement(bookmark);
        bookmarksContainer.appendChild(bookmarkElement);
      });
      
      // Update bookmark counts
      this.updateBookmarkCounts();
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      document.getElementById('bookmarks-container').innerHTML = 
        '<div class="error">Failed to load bookmarks. Please try again.</div>';
    }
  }

  /**
   * Load categories
   */
  async loadCategories() {
    try {
      const categoryList = document.getElementById('category-list');
      
      // Keep the default categories (All and Uncategorized)
      const defaultCategories = Array.from(categoryList.querySelectorAll('.category-item[data-category="all"], .category-item[data-category="uncategorized"]'));
      categoryList.innerHTML = '';
      
      // Add default categories back
      defaultCategories.forEach(category => {
        categoryList.appendChild(category);
      });
      
      // Get categories from repository
      const categories = await this.categoryRepository.getAllCategories();
      
      // Add categories to the list
      categories.forEach(category => {
        const categoryElement = this.createCategoryElement(category);
        categoryList.appendChild(categoryElement);
      });
      
      // Update active category
      this.updateActiveCategory();
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Category selection
    document.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectCategory(item.dataset.category);
      });
    });
    
    // View toggle
    document.getElementById('grid-view-button').addEventListener('click', () => {
      this.setView('grid');
    });
    
    document.getElementById('list-view-button').addEventListener('click', () => {
      this.setView('list');
    });
    
    // Sort button
    document.getElementById('sort-button').addEventListener('click', () => {
      this.showSortOptions();
    });
    
    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
      this.searchQuery = searchInput.value;
      this.debounceSearch();
    });
    
    // Clear search
    document.getElementById('clear-search').addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      this.loadBookmarks();
    });
    
    // Add bookmark button
    document.getElementById('add-bookmark').addEventListener('click', () => {
      this.showAddBookmarkModal();
    });
    
    // Add category button
    document.getElementById('add-category').addEventListener('click', () => {
      this.showAddCategoryModal();
    });
  }

  /**
   * Create a bookmark element
   * @param {Object} bookmark - Bookmark data
   * @returns {HTMLElement} Bookmark element
   */
  createBookmarkElement(bookmark) {
    const element = document.createElement('div');
    element.className = 'bookmark-card';
    element.dataset.id = bookmark.id;
    
    element.innerHTML = `
      <div class="bookmark-card-header">
        <img src="${bookmark.favicon || this.getFaviconUrl(bookmark.url)}" alt="" class="bookmark-favicon">
        <h3 class="bookmark-title">${bookmark.title}</h3>
      </div>
      <div class="bookmark-content">
        <div class="bookmark-url">${bookmark.url}</div>
        <div class="bookmark-description">${bookmark.description || 'No description'}</div>
      </div>
      <div class="bookmark-footer">
        <div class="bookmark-categories">
          ${this.renderBookmarkCategories(bookmark)}
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
    
    // Add click event to open the bookmark
    element.addEventListener('click', (e) => {
      // Don't open if clicking on action buttons
      if (!e.target.closest('.bookmark-actions')) {
        this.openBookmark(bookmark);
      }
    });
    
    // Add edit and delete functionality
    const editBtn = element.querySelector('.edit-bookmark');
    const deleteBtn = element.querySelector('.delete-bookmark');
    
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showEditBookmarkModal(bookmark);
    });
    
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.confirmDeleteBookmark(bookmark);
    });
    
    // Store reference to the element
    this.bookmarkComponents.set(bookmark.id, element);
    
    return element;
  }

  /**
   * Create a category element
   * @param {Object} category - Category data
   * @returns {HTMLElement} Category element
   */
  createCategoryElement(category) {
    const element = document.createElement('li');
    element.className = 'category-item';
    element.dataset.category = category.id;
    
    element.innerHTML = `
      <span class="material-icons" style="color: ${category.color || 'var(--primary-color)'}">label</span>
      <span class="category-name">${category.name}</span>
      <span class="bookmark-count">${category.count || 0}</span>
    `;
    
    element.addEventListener('click', () => {
      this.selectCategory(category.id);
    });
    
    // Add context menu for edit/delete
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showCategoryContextMenu(e, category);
    });
    
    return element;
  }

  /**
   * Render bookmark categories
   * @param {Object} bookmark - Bookmark data
   * @returns {string} HTML for categories
   */
  renderBookmarkCategories(bookmark) {
    if (!bookmark.categories || bookmark.categories.length === 0) {
      return '<span class="bookmark-category">Uncategorized</span>';
    }
    
    return bookmark.categories.map(cat => `
      <span class="bookmark-category" style="background-color: ${cat.color}20; color: ${cat.color}">
        ${cat.name}
      </span>
    `).join('');
  }

  /**
   * Select a category
   * @param {string|number} categoryId - Category ID
   */
  selectCategory(categoryId) {
    this.currentCategory = categoryId;
    
    // Update active state in the UI
    this.updateActiveCategory();
    
    // Update the current view title
    const categoryName = document.querySelector(`.category-item[data-category="${categoryId}"] .category-name`).textContent;
    document.getElementById('current-view-title').textContent = categoryName;
    
    // Load bookmarks for this category
    this.loadBookmarks();
    
    // Close the side nav on mobile
    if (window.innerWidth <= 768) {
      document.getElementById('side-nav').classList.remove('open');
    }
  }

  /**
   * Update active category in the UI
   */
  updateActiveCategory() {
    document.querySelectorAll('.category-item').forEach(item => {
      item.classList.toggle('active', item.dataset.category === this.currentCategory.toString());
    });
  }

  /**
   * Set the current view (grid or list)
   * @param {string} view - The view type ('grid' or 'list')
   */
  setView(view) {
    this.currentView = view;
    
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const gridViewBtn = document.getElementById('grid-view-button');
    const listViewBtn = document.getElementById('list-view-button');
    
    if (view === 'grid') {
      bookmarksContainer.classList.add('grid-view');
      bookmarksContainer.classList.remove('list-view');
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
    } else {
      bookmarksContainer.classList.add('list-view');
      bookmarksContainer.classList.remove('grid-view');
      gridViewBtn.classList.remove('active');
      listViewBtn.classList.add('active');
    }
    
    // Save preference to localStorage
    localStorage.setItem('bookmarker-view-preference', view);
  }

  /**
   * Show sort options
   */
  showSortOptions() {
    // Create a dropdown menu for sort options
    const sortButton = document.getElementById('sort-button');
    const rect = sortButton.getBoundingClientRect();
    
    // Remove any existing dropdown
    const existingDropdown = document.getElementById('sort-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
      return;
    }
    
    const dropdown = document.createElement('div');
    dropdown.id = 'sort-dropdown';
    dropdown.className = 'dropdown-menu';
    dropdown.style.position = 'absolute';
    dropdown.style.top = `${rect.bottom + 5}px`;
    dropdown.style.right = `${window.innerWidth - rect.right}px`;
    dropdown.style.zIndex = '100';
    
    const sortOptions = [
      { value: 'updated_at', label: 'Last Updated' },
      { value: 'created_at', label: 'Date Added' },
      { value: 'title', label: 'Title' },
      { value: 'url', label: 'URL' },
      { value: 'visit_count', label: 'Most Visited' }
    ];
    
    dropdown.innerHTML = `
      <div class="dropdown-header">Sort By</div>
      <div class="dropdown-items">
        ${sortOptions.map(option => `
          <div class="dropdown-item ${this.currentSort === option.value ? 'active' : ''}" data-value="${option.value}">
            <span>${option.label}</span>
            <span class="material-icons">${this.currentSort === option.value ? (this.currentSortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : ''}</span>
          </div>
        `).join('')}
      </div>
    `;
    
    document.body.appendChild(dropdown);
    
    // Add click event listeners
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        
        if (this.currentSort === value) {
          // Toggle sort order
          this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          // Set new sort field
          this.currentSort = value;
          this.currentSortOrder = 'desc';
        }
        
        // Save preferences
        localStorage.setItem('bookmarker-sort', this.currentSort);
        localStorage.setItem('bookmarker-sort-order', this.currentSortOrder);
        
        // Reload bookmarks
        this.loadBookmarks();
        
        // Remove dropdown
        dropdown.remove();
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
      if (!dropdown.contains(e.target) && e.target !== sortButton) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    });
  }

  /**
   * Debounce search to avoid too many requests
   */
  debounceSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.loadBookmarks();
    }, 300);
  }

  /**
   * Show empty state when no bookmarks
   */
  showEmptyState() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    if (this.searchQuery) {
      emptyState.innerHTML = `
        <span class="material-icons">search_off</span>
        <h3>No matching bookmarks</h3>
        <p>Try a different search term</p>
      `;
    } else if (this.currentCategory !== 'all') {
      emptyState.innerHTML = `
        <span class="material-icons">bookmark_border</span>
        <h3>No bookmarks in this category</h3>
        <p>Add bookmarks to this category or select a different one</p>
      `;
    } else {
      emptyState.innerHTML = `
        <span class="material-icons">bookmark_border</span>
        <h3>No bookmarks yet</h3>
        <p>Add your first bookmark by clicking the + button</p>
      `;
    }
    
    bookmarksContainer.appendChild(emptyState);
  }

  /**
   * Update bookmark counts in categories
   */
  async updateBookmarkCounts() {
    try {
      const categories = await this.categoryRepository.getAllCategories();
      
      // Update counts in the UI
      categories.forEach(category => {
        const categoryElement = document.querySelector(`.category-item[data-category="${category.id}"]`);
        if (categoryElement) {
          categoryElement.querySelector('.bookmark-count').textContent = category.count || 0;
        }
      });
      
      // Update "All Bookmarks" count
      const allBookmarks = await this.bookmarkRepository.getAllBookmarks();
      const allElement = document.querySelector('.category-item[data-category="all"]');
      if (allElement) {
        allElement.querySelector('.bookmark-count').textContent = allBookmarks.length;
      }
      
      // Update "Uncategorized" count
      const uncategorized = await this.bookmarkRepository.getBookmarksByCategory('uncategorized');
      const uncategorizedElement = document.querySelector('.category-item[data-category="uncategorized"]');
      if (uncategorizedElement) {
        uncategorizedElement.querySelector('.bookmark-count').textContent = uncategorized.length;
      }
    } catch (error) {
      console.error('Failed to update bookmark counts:', error);
    }
  }

  /**
   * Open a bookmark
   * @param {Object} bookmark - Bookmark data
   */
  async openBookmark(bookmark) {
    // Open the bookmark in a new tab
    window.open(bookmark.url, '_blank');
    
    // Record the visit
    try {
      await this.bookmarkRepository.recordVisit(bookmark.id);
    } catch (error) {
      console.error('Failed to record visit:', error);
    }
  }

  /**
   * Show add bookmark modal
   */
  showAddBookmarkModal() {
    // This would use the ModalManager in a real implementation
    console.log('Show add bookmark modal');
  }

  /**
   * Show edit bookmark modal
   * @param {Object} bookmark - Bookmark to edit
   */
  showEditBookmarkModal(bookmark) {
    // This would use the ModalManager in a real implementation
    console.log('Show edit bookmark modal', bookmark);
  }

  /**
   * Confirm delete bookmark
   * @param {Object} bookmark - Bookmark to delete
   */
  confirmDeleteBookmark(bookmark) {
    // This would use a confirmation dialog in a real implementation
    if (confirm(`Are you sure you want to delete "${bookmark.title}"?`)) {
      this.deleteBookmark(bookmark.id);
    }
  }

  /**
   * Delete a bookmark
   * @param {number} id - Bookmark ID
   */
  async deleteBookmark(id) {
    try {
      const success = await this.bookmarkRepository.deleteBookmark(id);
      
      if (success) {
        // Remove from UI
        const element = this.bookmarkComponents.get(id);
        if (element) {
          element.remove();
          this.bookmarkComponents.delete(id);
        }
        
        // Update counts
        this.updateBookmarkCounts();
        
        // Show empty state if no bookmarks left
        if (this.bookmarkComponents.size === 0) {
          this.showEmptyState();
        }
      }
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      alert('Failed to delete bookmark. Please try again.');
    }
  }

  /**
   * Show add category modal
   */
  showAddCategoryModal() {
    // This would use the ModalManager in a real implementation
    console.log('Show add category modal');
  }

  /**
   * Show category context menu
   * @param {Event} event - Context menu event
   * @param {Object} category - Category data
   */
  showCategoryContextMenu(event, category) {
    // This would show a context menu in a real implementation
    console.log('Show category context menu', category);
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
