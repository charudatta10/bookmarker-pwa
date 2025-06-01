/**
 * UI Controller - Manages UI interactions and event handling
 */
export class UIController {
  constructor() {
    this.initEventListeners();
    this.modalStack = [];
  }

  /**
   * Initialize all event listeners
   */
  initEventListeners() {
    // Menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Search toggle
    const searchToggle = document.getElementById('search-toggle');
    if (searchToggle) {
      searchToggle.addEventListener('click', () => this.toggleSearch());
    }

    // Add bookmark button
    const addBookmarkBtn = document.getElementById('add-bookmark');
    if (addBookmarkBtn) {
      addBookmarkBtn.addEventListener('click', () => this.showAddBookmarkModal());
    }

    // Add category button
    const addCategoryBtn = document.getElementById('add-category');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => this.showAddCategoryModal());
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-button');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showSettings());
    }

    // Import/Export button
    const importExportBtn = document.getElementById('import-export-button');
    if (importExportBtn) {
      importExportBtn.addEventListener('click', () => this.showImportExport());
    }

    // View toggle buttons
    const gridViewBtn = document.getElementById('grid-view-button');
    const listViewBtn = document.getElementById('list-view-button');
    
    if (gridViewBtn) {
      gridViewBtn.addEventListener('click', () => this.setViewMode('grid'));
    }
    
    if (listViewBtn) {
      listViewBtn.addEventListener('click', () => this.setViewMode('list'));
    }

    // Sort button
    const sortBtn = document.getElementById('sort-button');
    if (sortBtn) {
      sortBtn.addEventListener('click', () => this.showSortOptions());
    }

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => this.closeCurrentModal());
    });

    // Modal backdrop
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', () => this.closeCurrentModal());
    }

    // Save bookmark button
    const saveBookmarkBtn = document.getElementById('save-bookmark');
    if (saveBookmarkBtn) {
      saveBookmarkBtn.addEventListener('click', () => this.saveBookmark());
    }

    // Save category button
    const saveCategoryBtn = document.getElementById('save-category');
    if (saveCategoryBtn) {
      saveCategoryBtn.addEventListener('click', () => this.saveCategory());
    }

    // Add new category button in bookmark form
    const addNewCategoryBtn = document.getElementById('add-new-category');
    if (addNewCategoryBtn) {
      addNewCategoryBtn.addEventListener('click', () => {
        this.showAddCategoryModal(true); // true indicates called from bookmark form
      });
    }

    // Category list items
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
      item.addEventListener('click', () => {
        this.selectCategory(item.dataset.category);
      });
    });

    // Clear search button
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => this.clearSearch());
    }

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.handleSearchInput());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape key closes modals
      if (e.key === 'Escape') {
        this.closeCurrentModal();
      }
      
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleSearch(true); // true forces open
      }
    });

    console.log('UI Controller initialized');
  }

  /**
   * Toggle menu visibility
   */
  toggleMenu() {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.toggle('nav-open');
      console.log('Menu toggled');
    }
  }

  /**
   * Toggle search visibility
   * @param {boolean} forceOpen - Whether to force open the search
   */
  toggleSearch(forceOpen = false) {
    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
      if (forceOpen) {
        searchContainer.classList.remove('hidden');
      } else {
        searchContainer.classList.toggle('hidden');
      }
      
      if (!searchContainer.classList.contains('hidden')) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      console.log('Search toggled');
    }
  }

  /**
   * Clear search
   */
  clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    
    // Trigger search clear event
    window.dispatchEvent(new CustomEvent('search-cleared'));
    console.log('Search cleared');
  }

  /**
   * Handle search input
   */
  handleSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      const query = searchInput.value.trim();
      
      // Trigger search event
      window.dispatchEvent(new CustomEvent('search-query', {
        detail: { query }
      }));
      
      console.log('Search query:', query);
    }
  }

  /**
   * Show add bookmark modal
   */
  showAddBookmarkModal() {
    const modalContainer = document.getElementById('modal-container');
    const bookmarkModal = document.getElementById('bookmark-modal');
    
    if (modalContainer && bookmarkModal) {
      modalContainer.classList.remove('hidden');
      bookmarkModal.classList.remove('hidden');
      
      // Set modal title
      const modalTitle = bookmarkModal.querySelector('#bookmark-modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'Add Bookmark';
      }
      
      // Reset form
      const bookmarkForm = document.getElementById('bookmark-form');
      if (bookmarkForm) {
        bookmarkForm.reset();
      }
      
      // Add to modal stack
      this.modalStack.push('bookmark');
      
      console.log('Add bookmark modal shown');
    }
  }

  /**
   * Show add category modal
   * @param {boolean} fromBookmarkForm - Whether called from bookmark form
   */
  showAddCategoryModal(fromBookmarkForm = false) {
    const modalContainer = document.getElementById('modal-container');
    const categoryModal = document.getElementById('category-modal');
    
    if (modalContainer && categoryModal) {
      // If called from bookmark form, store current modal
      if (fromBookmarkForm) {
        // Store that we came from bookmark form
        categoryModal.dataset.fromBookmarkForm = 'true';
      } else {
        delete categoryModal.dataset.fromBookmarkForm;
      }
      
      modalContainer.classList.remove('hidden');
      categoryModal.classList.remove('hidden');
      
      // Set modal title
      const modalTitle = categoryModal.querySelector('#category-modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'Add Category';
      }
      
      // Reset form
      const categoryForm = document.getElementById('category-form');
      if (categoryForm) {
        categoryForm.reset();
        
        // Set random color
        const colorInput = categoryForm.querySelector('#category-color');
        if (colorInput) {
          colorInput.value = this.getRandomColor();
        }
      }
      
      // Add to modal stack
      this.modalStack.push('category');
      
      console.log('Add category modal shown');
    }
  }

  /**
   * Close current modal
   */
  closeCurrentModal() {
    const modalContainer = document.getElementById('modal-container');
    const modals = document.querySelectorAll('.modal');
    
    if (modalContainer && modals.length > 0) {
      // Get current modal from stack
      const currentModal = this.modalStack.pop();
      
      if (currentModal) {
        // Hide current modal
        const modalElement = document.getElementById(`${currentModal}-modal`);
        if (modalElement) {
          modalElement.classList.add('hidden');
        }
      }
      
      // If no more modals in stack, hide container
      if (this.modalStack.length === 0) {
        modalContainer.classList.add('hidden');
      }
      
      console.log('Modal closed');
    }
  }

  /**
   * Save bookmark
   */
  saveBookmark() {
    // In a real app, this would be handled by the BookmarkController
    // For now, we'll just close the modal and show a toast
    this.showToast('Bookmark saved');
    this.closeCurrentModal();
    
    // Trigger bookmark saved event
    window.dispatchEvent(new CustomEvent('bookmark-saved'));
    
    console.log('Bookmark saved');
  }

  /**
   * Save category
   */
  saveCategory() {
    // In a real app, this would be handled by the CategoryController
    // For now, we'll just close the modal and show a toast
    this.showToast('Category saved');
    
    const categoryModal = document.getElementById('category-modal');
    const fromBookmarkForm = categoryModal && categoryModal.dataset.fromBookmarkForm === 'true';
    
    this.closeCurrentModal();
    
    // If called from bookmark form, reopen bookmark modal
    if (fromBookmarkForm) {
      // In a real app, we would update the categories list in the bookmark form
      // For now, we'll just reopen the bookmark modal
      this.showAddBookmarkModal();
    }
    
    // Trigger category saved event
    window.dispatchEvent(new CustomEvent('category-saved'));
    
    console.log('Category saved');
  }

  /**
   * Show settings view
   */
  showSettings() {
    this.showView('settings-view');
    console.log('Settings view shown');
  }

  /**
   * Show import/export view
   */
  showImportExport() {
    this.showView('import-export-view');
    console.log('Import/Export view shown');
  }

  /**
   * Show a specific view
   * @param {string} viewId - ID of the view to show
   */
  showView(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => {
      view.classList.add('hidden');
      view.classList.remove('active');
    });
    
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.remove('hidden');
      view.classList.add('active');
    }
    
    // Update current view title
    const viewTitle = document.getElementById('current-view-title');
    if (viewTitle) {
      switch (viewId) {
        case 'settings-view':
          viewTitle.textContent = 'Settings';
          break;
        case 'import-export-view':
          viewTitle.textContent = 'Import/Export';
          break;
        default:
          viewTitle.textContent = 'All Bookmarks';
      }
    }
  }

  /**
   * Set view mode (grid or list)
   * @param {string} mode - View mode ('grid' or 'list')
   */
  setViewMode(mode) {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const gridViewBtn = document.getElementById('grid-view-button');
    const listViewBtn = document.getElementById('list-view-button');
    
    if (bookmarksContainer && gridViewBtn && listViewBtn) {
      if (mode === 'grid') {
        bookmarksContainer.classList.add('grid-view');
        bookmarksContainer.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
      } else {
        bookmarksContainer.classList.add('list-view');
        bookmarksContainer.classList.remove('grid-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
      }
      
      // Save preference
      localStorage.setItem('viewMode', mode);
      
      console.log('View mode set to:', mode);
    }
  }

  /**
   * Show sort options
   */
  showSortOptions() {
    // In a real app, this would show a dropdown or modal with sort options
    // For now, we'll just cycle through sort options
    const sortOptions = ['date-added', 'title', 'most-visited'];
    const currentSort = localStorage.getItem('sortBy') || 'date-added';
    
    // Get next sort option
    const currentIndex = sortOptions.indexOf(currentSort);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    const nextSort = sortOptions[nextIndex];
    
    // Save preference
    localStorage.setItem('sortBy', nextSort);
    
    // Show toast
    let sortName;
    switch (nextSort) {
      case 'date-added':
        sortName = 'Date Added';
        break;
      case 'title':
        sortName = 'Title';
        break;
      case 'most-visited':
        sortName = 'Most Visited';
        break;
      default:
        sortName = 'Date Added';
    }
    
    this.showToast(`Sorted by: ${sortName}`);
    
    // Trigger sort event
    window.dispatchEvent(new CustomEvent('sort-changed', {
      detail: { sortBy: nextSort }
    }));
    
    console.log('Sort changed to:', nextSort);
  }

  /**
   * Select a category
   * @param {string} categoryId - ID of the category to select
   */
  selectCategory(categoryId) {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
      item.classList.toggle('active', item.dataset.category === categoryId);
    });
    
    // Update current view title
    const viewTitle = document.getElementById('current-view-title');
    if (viewTitle) {
      if (categoryId === 'all') {
        viewTitle.textContent = 'All Bookmarks';
      } else if (categoryId === 'uncategorized') {
        viewTitle.textContent = 'Uncategorized';
      } else {
        // In a real app, we would get the category name from the database
        const categoryItem = document.querySelector(`.category-item[data-category="${categoryId}"]`);
        if (categoryItem) {
          const categoryName = categoryItem.querySelector('.category-name');
          if (categoryName) {
            viewTitle.textContent = categoryName.textContent;
          }
        }
      }
    }
    
    // Trigger category selected event
    window.dispatchEvent(new CustomEvent('category-selected', {
      detail: { categoryId }
    }));
    
    console.log('Category selected:', categoryId);
  }

  /**
   * Show toast notification
   * @param {string} message - Message to show
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.remove('hidden');
      
      // Hide after duration
      setTimeout(() => {
        toast.classList.add('hidden');
      }, duration);
      
      console.log('Toast shown:', message);
    }
  }

  /**
   * Get a random color for categories
   * @returns {string} Random color in hex format
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
