/**
 * ShareController - Handles bookmark sharing functionality
 */
export class ShareController {
  constructor(bookmarkRepository, toastManager) {
    this.bookmarkRepository = bookmarkRepository;
    this.toastManager = toastManager;
    
    // Initialize Web Share API detection
    this.webShareAvailable = navigator.share !== undefined;
    
    this.init();
  }
  
  /**
   * Initialize the controller
   */
  init() {
    // Listen for share target events
    this.handleShareTarget();
    
    // Set up event listeners for share buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.share-bookmark')) {
        const bookmarkCard = e.target.closest('.bookmark-card');
        if (bookmarkCard && bookmarkCard.dataset.id) {
          this.shareBookmark(bookmarkCard.dataset.id);
        }
      }
    });
  }
  
  /**
   * Handle incoming share target data
   */
  async handleShareTarget() {
    try {
      // Check if this is a share target navigation
      const url = new URL(window.location.href);
      const sharedTitle = url.searchParams.get('title');
      const sharedText = url.searchParams.get('text');
      const sharedUrl = url.searchParams.get('url');
      
      // If we have shared data, process it
      if (sharedUrl || (sharedText && this.isValidUrl(sharedText))) {
        const bookmarkUrl = sharedUrl || this.extractUrl(sharedText);
        
        if (bookmarkUrl) {
          // Check if bookmark already exists
          const existingBookmarks = await this.bookmarkRepository.getAllBookmarks();
          const existingBookmark = existingBookmarks.find(b => b.url === bookmarkUrl);
          
          if (existingBookmark) {
            this.toastManager.show('Bookmark already exists');
            
            // Navigate to the bookmark
            // In a real app, we would navigate to the bookmark detail view
          } else {
            // Create new bookmark
            const newBookmark = await this.bookmarkRepository.addBookmark({
              url: bookmarkUrl,
              title: sharedTitle || this.getDefaultTitle(bookmarkUrl),
              description: sharedText || ''
            });
            
            this.toastManager.show('Bookmark added successfully');
            
            // Trigger refresh
            window.dispatchEvent(new CustomEvent('bookmarks-changed'));
          }
          
          // Clear the URL parameters
          window.history.replaceState({}, document.title, '/');
        }
      }
    } catch (error) {
      console.error('Failed to process shared data:', error);
    }
  }
  
  /**
   * Share a bookmark
   * @param {number} bookmarkId - Bookmark ID
   */
  async shareBookmark(bookmarkId) {
    try {
      const bookmark = await this.bookmarkRepository.getBookmarkById(bookmarkId);
      
      if (!bookmark) {
        this.toastManager.show('Bookmark not found');
        return;
      }
      
      if (this.webShareAvailable) {
        // Use Web Share API
        await navigator.share({
          title: bookmark.title,
          text: bookmark.description || 'Check out this bookmark',
          url: bookmark.url
        });
        
        this.toastManager.show('Bookmark shared successfully');
      } else {
        // Fallback to clipboard
        await this.copyToClipboard(bookmark.url);
        this.toastManager.show('Bookmark URL copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to share bookmark:', error);
      
      if (error.name !== 'AbortError') {
        // AbortError is thrown when user cancels share dialog
        this.toastManager.show('Failed to share bookmark');
      }
    }
  }
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<void>}
   */
  async copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy text:', err);
        throw err;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }
  
  /**
   * Extract URL from text
   * @param {string} text - Text to extract URL from
   * @returns {string|null} Extracted URL or null if not found
   */
  extractUrl(text) {
    // Simple URL extraction regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    
    return match ? match[0] : null;
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
   * Get default title from URL
   * @param {string} url - URL to extract title from
   * @returns {string} Extracted title
   */
  getDefaultTitle(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return 'New Bookmark';
    }
  }
}
