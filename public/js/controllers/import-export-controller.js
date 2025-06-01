/**
 * ImportExportController - Handles import and export functionality
 */
export class ImportExportController {
  constructor(bookmarkRepository, categoryRepository, modalManager, toastManager) {
    this.bookmarkRepository = bookmarkRepository;
    this.categoryRepository = categoryRepository;
    this.modalManager = modalManager;
    this.toastManager = toastManager;
    
    // Elements
    this.importBtn = document.getElementById('import-button');
    this.exportBtn = document.getElementById('export-button');
    this.fileInput = document.getElementById('import-file');
    
    this.init();
  }
  
  /**
   * Initialize the controller
   */
  init() {
    if (this.importBtn) {
      this.importBtn.addEventListener('click', () => this.showImportDialog());
    }
    
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => this.exportBookmarks());
    }
    
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }
  }
  
  /**
   * Show import dialog
   */
  showImportDialog() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }
  
  /**
   * Handle file selection
   * @param {Event} event - File input change event
   */
  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const fileContent = await this.readFileContent(file);
      
      // Parse the file content
      const importData = JSON.parse(fileContent);
      
      // Validate the import data
      if (!this.validateImportData(importData)) {
        this.toastManager.show('Invalid import file format');
        return;
      }
      
      // Show confirmation dialog
      this.showImportConfirmation(importData);
    } catch (error) {
      console.error('Import failed:', error);
      this.toastManager.show('Import failed. Please check the file format.');
    } finally {
      // Reset file input
      event.target.value = '';
    }
  }
  
  /**
   * Read file content
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = (e) => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Validate import data
   * @param {Object} data - Import data
   * @returns {boolean} Whether the data is valid
   */
  validateImportData(data) {
    // Check if data has bookmarks and categories arrays
    if (!data || !Array.isArray(data.bookmarks) || !Array.isArray(data.categories)) {
      return false;
    }
    
    // Check if bookmarks have required fields
    for (const bookmark of data.bookmarks) {
      if (!bookmark.url || !bookmark.title) {
        return false;
      }
    }
    
    // Check if categories have required fields
    for (const category of data.categories) {
      if (!category.name) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Show import confirmation dialog
   * @param {Object} importData - Import data
   */
  showImportConfirmation(importData) {
    const bookmarkCount = importData.bookmarks.length;
    const categoryCount = importData.categories.length;
    
    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Import Confirmation</h2>
          <button class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <p>You are about to import:</p>
          <ul>
            <li>${bookmarkCount} bookmark${bookmarkCount !== 1 ? 's' : ''}</li>
            <li>${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}</li>
          </ul>
          <p>How would you like to proceed?</p>
          <div class="import-options">
            <label>
              <input type="radio" name="import-mode" value="merge" checked>
              Merge with existing data
            </label>
            <label>
              <input type="radio" name="import-mode" value="replace">
              Replace all existing data
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button secondary" id="cancel-import">Cancel</button>
          <button class="button primary" id="confirm-import">Import</button>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(dialog);
    
    // Add event listeners
    const closeButton = dialog.querySelector('.close-button');
    const cancelButton = dialog.querySelector('#cancel-import');
    const confirmButton = dialog.querySelector('#confirm-import');
    
    const closeDialog = () => {
      dialog.remove();
    };
    
    closeButton.addEventListener('click', closeDialog);
    cancelButton.addEventListener('click', closeDialog);
    
    confirmButton.addEventListener('click', () => {
      const importMode = dialog.querySelector('input[name="import-mode"]:checked').value;
      this.performImport(importData, importMode);
      closeDialog();
    });
  }
  
  /**
   * Perform import
   * @param {Object} importData - Import data
   * @param {string} importMode - Import mode ('merge' or 'replace')
   */
  async performImport(importData, importMode) {
    try {
      // Show loading state
      this.toastManager.show('Importing data...');
      
      if (importMode === 'replace') {
        // Clear existing data
        await this.clearAllData();
      }
      
      // Import categories first
      const categoryMap = await this.importCategories(importData.categories);
      
      // Import bookmarks
      await this.importBookmarks(importData.bookmarks, categoryMap);
      
      // Show success message
      this.toastManager.show('Import completed successfully');
      
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('bookmarks-changed'));
      window.dispatchEvent(new CustomEvent('categories-changed'));
    } catch (error) {
      console.error('Import failed:', error);
      this.toastManager.show('Import failed. Please try again.');
    }
  }
  
  /**
   * Clear all data
   * @returns {Promise<void>}
   */
  async clearAllData() {
    // Get all bookmarks and categories
    const bookmarks = await this.bookmarkRepository.getAllBookmarks();
    const categories = await this.categoryRepository.getAllCategories();
    
    // Delete all bookmarks
    for (const bookmark of bookmarks) {
      await this.bookmarkRepository.deleteBookmark(bookmark.id);
    }
    
    // Delete all categories
    for (const category of categories) {
      await this.categoryRepository.deleteCategory(category.id);
    }
  }
  
  /**
   * Import categories
   * @param {Array} categories - Categories to import
   * @returns {Promise<Object>} Map of old category IDs to new category IDs
   */
  async importCategories(categories) {
    const categoryMap = {};
    const existingCategories = await this.categoryRepository.getAllCategories();
    
    for (const category of categories) {
      // Check if category already exists
      const existingCategory = existingCategories.find(c => c.name === category.name);
      
      if (existingCategory) {
        // Use existing category
        categoryMap[category.id] = existingCategory.id;
      } else {
        // Create new category
        const newCategory = await this.categoryRepository.addCategory({
          name: category.name,
          color: category.color
        });
        
        categoryMap[category.id] = newCategory.id;
      }
    }
    
    return categoryMap;
  }
  
  /**
   * Import bookmarks
   * @param {Array} bookmarks - Bookmarks to import
   * @param {Object} categoryMap - Map of old category IDs to new category IDs
   * @returns {Promise<void>}
   */
  async importBookmarks(bookmarks, categoryMap) {
    const existingBookmarks = await this.bookmarkRepository.getAllBookmarks();
    
    for (const bookmark of bookmarks) {
      // Check if bookmark already exists
      const existingBookmark = existingBookmarks.find(b => b.url === bookmark.url);
      
      // Map category IDs
      const categoryIds = bookmark.categories
        ? bookmark.categories.map(catId => categoryMap[catId]).filter(Boolean)
        : [];
      
      if (existingBookmark) {
        // Update existing bookmark
        await this.bookmarkRepository.updateBookmark(existingBookmark.id, {
          title: bookmark.title,
          description: bookmark.description,
          favicon: bookmark.favicon
        }, categoryIds);
      } else {
        // Create new bookmark
        await this.bookmarkRepository.addBookmark({
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description,
          favicon: bookmark.favicon
        }, categoryIds);
      }
    }
  }
  
  /**
   * Export bookmarks
   */
  async exportBookmarks() {
    try {
      // Get all bookmarks and categories
      const bookmarks = await this.bookmarkRepository.getAllBookmarks();
      const categories = await this.categoryRepository.getAllCategories();
      
      // Prepare export data
      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        bookmarks: bookmarks.map(bookmark => ({
          id: bookmark.id,
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description,
          favicon: bookmark.favicon,
          created_at: bookmark.created_at,
          updated_at: bookmark.updated_at,
          categories: bookmark.categories.map(cat => cat.id)
        })),
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          color: category.color
        }))
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookmarker-export-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      this.toastManager.show('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      this.toastManager.show('Export failed. Please try again.');
    }
  }
}
