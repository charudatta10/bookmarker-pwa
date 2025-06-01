/**
 * UI Controller - Manages all UI interactions and events
 */
export class UIController {
  constructor() {
    // DOM elements
    this.menuToggle = document.getElementById('menu-toggle');
    this.sideNav = document.getElementById('side-nav');
    this.searchToggle = document.getElementById('search-toggle');
    this.searchContainer = document.getElementById('search-container');
    this.searchInput = document.getElementById('search-input');
    this.clearSearch = document.getElementById('clear-search');
    this.addBookmarkBtn = document.getElementById('add-bookmark');
    this.addCategoryBtn = document.getElementById('add-category');
    this.gridViewBtn = document.getElementById('grid-view-button');
    this.listViewBtn = document.getElementById('list-view-button');
    this.bookmarksContainer = document.getElementById('bookmarks-container');
    this.modalContainer = document.getElementById('modal-container');
    this.bookmarkModal = document.getElementById('bookmark-modal');
    this.categoryModal = document.getElementById('category-modal');
    this.closeModalBtns = document.querySelectorAll('.close-modal');
    this.saveBookmarkBtn = document.getElementById('save-bookmark');
    this.saveCategoryBtn = document.getElementById('save-category');
    this.settingsButton = document.getElementById('settings-button');
    this.importExportButton = document.getElementById('import-export-button');
    
    // State
    this.isSearchOpen = false;
    this.currentView = 'grid';
  }
  
  /**
   * Initialize the UI controller
   */
  init() {
    this.attachEventListeners();
    this.createSampleBookmarks(); // Temporary for UI testing
  }
  
  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Menu toggle
    this.menuToggle.addEventListener('click', () => {
      this.sideNav.classList.toggle('open');
    });
    
    // Search toggle
    this.searchToggle.addEventListener('click', () => {
      this.toggleSearch();
    });
    
    // Clear search
    this.clearSearch.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchInput.focus();
    });
    
    // View toggle
    this.gridViewBtn.addEventListener('click', () => {
      this.setView('grid');
    });
    
    this.listViewBtn.addEventListener('click', () => {
      this.setView('list');
    });
    
    // Add bookmark
    this.addBookmarkBtn.addEventListener('click', () => {
      this.openModal('bookmark');
    });
    
    // Add category
    this.addCategoryBtn.addEventListener('click', () => {
      this.openModal('category');
    });
    
    // Close modals
    this.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
      });
    });
    
    // Modal backdrop click
    this.modalContainer.querySelector('.modal-backdrop').addEventListener('click', () => {
      this.closeModal();
    });
    
    // Save bookmark
    this.saveBookmarkBtn.addEventListener('click', () => {
      this.saveBookmark();
    });
    
    // Save category
    this.saveCategoryBtn.addEventListener('click', () => {
      this.saveCategory();
    });
    
    // Settings button
    this.settingsButton.addEventListener('click', () => {
      this.showView('settings-view');
    });
    
    // Import/Export button
    this.importExportButton.addEventListener('click', () => {
      this.showView('import-export-view');
    });
    
    // Category list items
    document.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectCategory(item.dataset.category);
      });
    });
  }
  
  /**
   * Toggle search container visibility
   */
  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    this.searchContainer.classList.toggle('hidden', !this.isSearchOpen);
    
    if (this.isSearchOpen) {
      this.searchInput.focus();
    }
  }
  
  /**
   * Set the current view (grid or list)
   * @param {string} view - The view type ('grid' or 'list')
   */
  setView(view) {
    this.currentView = view;
    
    if (view === 'grid') {
      this.bookmarksContainer.classList.add('grid-view');
      this.bookmarksContainer.classList.remove('list-view');
      this.gridViewBtn.classList.add('active');
      this.listViewBtn.classList.remove('active');
    } else {
      this.bookmarksContainer.classList.add('list-view');
      this.bookmarksContainer.classList.remove('grid-view');
      this.gridViewBtn.classList.remove('active');
      this.listViewBtn.classList.add('active');
    }
    
    // Save preference to localStorage
    localStorage.setItem('bookmarker-view-preference', view);
  }
  
  /**
   * Open a modal
   * @param {string} modalType - The type of modal to open ('bookmark' or 'category')
   */
  openModal(modalType) {
    this.modalContainer.classList.remove('hidden');
    
    if (modalType === 'bookmark') {
      this.bookmarkModal.classList.remove('hidden');
      this.categoryModal.classList.add('hidden');
      document.getElementById('bookmark-url').focus();
    } else if (modalType === 'category') {
      this.categoryModal.classList.remove('hidden');
      this.bookmarkModal.classList.add('hidden');
      document.getElementById('category-name').focus();
    }
  }
  
  /**
   * Close the current modal
   */
  closeModal() {
    this.modalContainer.classList.add('hidden');
    this.bookmarkModal.classList.add('hidden');
    this.categoryModal.classList.add('hidden');
    
    // Reset form fields
    document.getElementById('bookmark-form').reset();
    document.getElementById('category-form').reset();
  }
  
  /**
   * Save a bookmark
   */
  saveBookmark() {
    const url = document.getElementById('bookmark-url').value;
    const title = document.getElementById('bookmark-title').value;
    const description = document.getElementById('bookmark-description').value;
    
    if (!url || !title) {
      alert('URL and title are required');
      return;
    }
    
    // In a real app, this would save to the database
    console.log('Saving bookmark:', { url, title, description });
    
    // For now, just add it to the UI
    this.addBookmarkToUI({
      url,
      title,
      description,
      favicon: this.getFaviconUrl(url),
      categories: []
    });
    
    this.closeModal();
  }
  
  /**
   * Save a category
   */
  saveCategory() {
    const name = document.getElementById('category-name').value;
    const color = document.getElementById('category-color').value;
    
    if (!name) {
      alert('Category name is required');
      return;
    }
    
    // In a real app, this would save to the database
    console.log('Saving category:', { name, color });
    
    // For now, just add it to the UI
    this.addCategoryToUI({
      id: Date.now().toString(),
      name,
      color,
      count: 0
    });
    
    this.closeModal();
  }
  
  /**
   * Add a bookmark to the UI
   * @param {Object} bookmark - The bookmark object
   */
  addBookmarkToUI(bookmark) {
    // Remove empty state if present
    const emptyState = this.bookmarksContainer.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }
    
    const bookmarkElement = document.createElement('div');
    bookmarkElement.className = 'bookmark-card';
    bookmarkElement.innerHTML = `
      <div class="bookmark-card-header">
        <img src="${bookmark.favicon}" alt="" class="bookmark-favicon">
        <h3 class="bookmark-title">${bookmark.title}</h3>
      </div>
      <div class="bookmark-content">
        <div class="bookmark-url">${bookmark.url}</div>
        <div class="bookmark-description">${bookmark.description || 'No description'}</div>
      </div>
      <div class="bookmark-footer">
        <div class="bookmark-categories">
          ${bookmark.categories.map(cat => `
            <span class="bookmark-category" style="background-color: ${cat.color}20; color: ${cat.color}">
              ${cat.name}
            </span>
          `).join('') || '<span class="bookmark-category">Uncategorized</span>'}
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
    bookmarkElement.addEventListener('click', (e) => {
      // Don't open if clicking on action buttons
      if (!e.target.closest('.bookmark-actions')) {
        window.open(bookmark.url, '_blank');
      }
    });
    
    // Add edit and delete functionality
    const editBtn = bookmarkElement.querySelector('.edit-bookmark');
    const deleteBtn = bookmarkElement.querySelector('.delete-bookmark');
    
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // In a real app, this would open the edit modal with the bookmark data
      console.log('Edit bookmark:', bookmark);
    });
    
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // In a real app, this would delete from the database
      console.log('Delete bookmark:', bookmark);
      bookmarkElement.remove();
      
      // Show empty state if no bookmarks left
      if (this.bookmarksContainer.children.length === 0) {
        this.showEmptyState();
      }
    });
    
    this.bookmarksContainer.appendChild(bookmarkElement);
  }
  
  /**
   * Add a category to the UI
   * @param {Object} category - The category object
   */
  addCategoryToUI(category) {
    const categoryList = document.getElementById('category-list');
    const categoryElement = document.createElement('li');
    categoryElement.className = 'category-item';
    categoryElement.dataset.category = category.id;
    categoryElement.innerHTML = `
      <span class="material-icons" style="color: ${category.color}">label</span>
      <span class="category-name">${category.name}</span>
      <span class="bookmark-count">${category.count}</span>
    `;
    
    categoryElement.addEventListener('click', () => {
      this.selectCategory(category.id);
    });
    
    // Insert before the last item (which is usually a "Add category" button)
    categoryList.appendChild(categoryElement);
  }
  
  /**
   * Select a category
   * @param {string} categoryId - The ID of the category to select
   */
  selectCategory(categoryId) {
    // Update active state in the UI
    document.querySelectorAll('.category-item').forEach(item => {
      item.classList.toggle('active', item.dataset.category === categoryId);
    });
    
    // Update the current view title
    const categoryName = document.querySelector(`.category-item[data-category="${categoryId}"] .category-name`).textContent;
    document.getElementById('current-view-title').textContent = categoryName;
    
    // In a real app, this would filter bookmarks by category
    console.log('Selected category:', categoryId);
    
    // Close the side nav on mobile
    if (window.innerWidth <= 768) {
      this.sideNav.classList.remove('open');
    }
  }
  
  /**
   * Show a specific view
   * @param {string} viewId - The ID of the view to show
   */
  showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.add('hidden');
    });
    
    // Show the requested view
    document.getElementById(viewId).classList.remove('hidden');
    
    // Close the side nav on mobile
    if (window.innerWidth <= 768) {
      this.sideNav.classList.remove('open');
    }
  }
  
  /**
   * Show empty state when no bookmarks
   */
  showEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <span class="material-icons">bookmark_border</span>
      <h3>No bookmarks yet</h3>
      <p>Add your first bookmark by clicking the + button</p>
    `;
    this.bookmarksContainer.appendChild(emptyState);
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
  
  /**
   * Create sample bookmarks for UI testing
   * This would be removed in the final app
   */
  createSampleBookmarks() {
    const sampleBookmarks = [
      {
        url: 'https://developer.mozilla.org',
        title: 'MDN Web Docs',
        description: 'Resources for developers, by developers',
        favicon: this.getFaviconUrl('https://developer.mozilla.org'),
        categories: [{ name: 'Development', color: '#4285f4' }]
      },
      {
        url: 'https://github.com',
        title: 'GitHub',
        description: 'Where the world builds software',
        favicon: this.getFaviconUrl('https://github.com'),
        categories: [{ name: 'Development', color: '#4285f4' }, { name: 'Tools', color: '#34a853' }]
      },
      {
        url: 'https://news.ycombinator.com',
        title: 'Hacker News',
        description: 'A social news website focusing on computer science and entrepreneurship',
        favicon: this.getFaviconUrl('https://news.ycombinator.com'),
        categories: [{ name: 'News', color: '#fbbc05' }]
      }
    ];
    
    // Clear any existing content
    this.bookmarksContainer.innerHTML = '';
    
    // Add sample bookmarks to UI
    sampleBookmarks.forEach(bookmark => {
      this.addBookmarkToUI(bookmark);
    });
  }
}
