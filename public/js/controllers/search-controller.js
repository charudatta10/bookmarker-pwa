/**
 * SearchController - Handles search functionality
 */
export class SearchController {
  constructor(bookmarkRepository, toastManager) {
    this.bookmarkRepository = bookmarkRepository;
    this.toastManager = toastManager;
    
    // Search elements
    this.searchToggle = document.getElementById('search-toggle');
    this.searchContainer = document.getElementById('search-container');
    this.searchInput = document.getElementById('search-input');
    this.clearSearch = document.getElementById('clear-search');
    this.searchResults = document.getElementById('search-results');
    
    // State
    this.isSearchOpen = false;
    this.searchTimeout = null;
    
    this.init();
  }
  
  /**
   * Initialize the controller
   */
  init() {
    // Add event listeners
    this.searchToggle.addEventListener('click', () => this.toggleSearch());
    
    this.clearSearch.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchInput.focus();
      this.clearSearchResults();
    });
    
    this.searchInput.addEventListener('input', () => this.debounceSearch());
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }
      
      // Escape to close search
      if (e.key === 'Escape' && this.isSearchOpen) {
        this.closeSearch();
      }
    });
  }
  
  /**
   * Toggle search container visibility
   */
  toggleSearch() {
    if (this.isSearchOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }
  
  /**
   * Open search
   */
  openSearch() {
    this.isSearchOpen = true;
    this.searchContainer.classList.remove('hidden');
    this.searchInput.focus();
  }
  
  /**
   * Close search
   */
  closeSearch() {
    this.isSearchOpen = false;
    this.searchContainer.classList.add('hidden');
    this.clearSearchResults();
  }
  
  /**
   * Clear search results
   */
  clearSearchResults() {
    // Clear the search input
    this.searchInput.value = '';
    
    // Clear results
    if (this.searchResults) {
      this.searchResults.innerHTML = '';
      this.searchResults.classList.add('hidden');
    }
    
    // Trigger event to reset main bookmark list
    window.dispatchEvent(new CustomEvent('search-cleared'));
  }
  
  /**
   * Debounce search to avoid too many requests
   */
  debounceSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300);
  }
  
  /**
   * Perform search
   */
  async performSearch() {
    const query = this.searchInput.value.trim();
    
    if (!query) {
      this.clearSearchResults();
      return;
    }
    
    try {
      // Search bookmarks
      const results = await this.bookmarkRepository.searchBookmarks(query);
      
      // Trigger event with search results
      window.dispatchEvent(new CustomEvent('search-results', {
        detail: { query, results }
      }));
      
      // If we have a dedicated search results container, populate it
      if (this.searchResults) {
        this.displaySearchResults(results, query);
      }
    } catch (error) {
      console.error('Search failed:', error);
      this.toastManager.show('Search failed. Please try again.');
    }
  }
  
  /**
   * Display search results in the search results container
   * @param {Array} results - Search results
   * @param {string} query - Search query
   */
  displaySearchResults(results, query) {
    // Clear previous results
    this.searchResults.innerHTML = '';
    
    if (results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="search-no-results">
          <span class="material-icons">search_off</span>
          <p>No results found for "${query}"</p>
        </div>
      `;
      this.searchResults.classList.remove('hidden');
      return;
    }
    
    // Create results list
    const resultsList = document.createElement('ul');
    resultsList.className = 'search-results-list';
    
    // Add results
    results.slice(0, 5).forEach(bookmark => {
      const resultItem = document.createElement('li');
      resultItem.className = 'search-result-item';
      
      resultItem.innerHTML = `
        <img src="${bookmark.favicon || this.getFaviconUrl(bookmark.url)}" alt="" class="result-favicon">
        <div class="result-content">
          <div class="result-title">${this.highlightText(bookmark.title, query)}</div>
          <div class="result-url">${this.highlightText(bookmark.url, query)}</div>
        </div>
      `;
      
      // Add click event
      resultItem.addEventListener('click', () => {
        window.open(bookmark.url, '_blank');
        this.recordVisit(bookmark.id);
      });
      
      resultsList.appendChild(resultItem);
    });
    
    // Add "View all results" if there are more
    if (results.length > 5) {
      const viewAllItem = document.createElement('li');
      viewAllItem.className = 'search-result-item view-all';
      viewAllItem.innerHTML = `
        <span class="material-icons">search</span>
        <span>View all ${results.length} results</span>
      `;
      
      // Add click event
      viewAllItem.addEventListener('click', () => {
        // Close search dropdown
        this.closeSearch();
        
        // Trigger event to show all results in main view
        window.dispatchEvent(new CustomEvent('show-all-search-results', {
          detail: { query, results }
        }));
      });
      
      resultsList.appendChild(viewAllItem);
    }
    
    // Add to container
    this.searchResults.appendChild(resultsList);
    this.searchResults.classList.remove('hidden');
  }
  
  /**
   * Highlight search terms in text
   * @param {string} text - Text to highlight
   * @param {string} query - Search query
   * @returns {string} Highlighted HTML
   */
  highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  /**
   * Record a bookmark visit
   * @param {number} id - Bookmark ID
   */
  async recordVisit(id) {
    try {
      await this.bookmarkRepository.recordVisit(id);
    } catch (error) {
      console.error('Failed to record visit:', error);
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
