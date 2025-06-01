/**
 * Settings Manager - Handles user settings and preferences
 */
export class SettingsManager {
  constructor() {
    this.settings = {
      theme: 'system', // 'light', 'dark', or 'system'
      viewMode: 'grid', // 'grid' or 'list'
      sortOrder: 'newest', // 'newest', 'oldest', 'alphabetical'
      enableNotifications: true,
      autoFetchMetadata: true
    };
    
    this.loadSettings();
    this.applySettings();
  }
  
  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('bookmarker-settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('bookmarker-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
  
  /**
   * Apply settings to the UI
   */
  applySettings() {
    // Apply theme
    this.applyTheme();
    
    // Apply view mode
    document.getElementById('bookmarks-container').className = 
      `bookmarks-container ${this.settings.viewMode}-view`;
    
    // Update UI elements to reflect current settings
    this.updateSettingsUI();
  }
  
  /**
   * Apply theme setting
   */
  applyTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (this.settings.theme === 'dark' || 
        (this.settings.theme === 'system' && prefersDark)) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }
  
  /**
   * Update settings UI elements
   */
  updateSettingsUI() {
    // Update theme selector
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.value = this.settings.theme;
    }
    
    // Update view mode buttons
    const gridViewBtn = document.getElementById('grid-view-button');
    const listViewBtn = document.getElementById('list-view-button');
    
    if (gridViewBtn && listViewBtn) {
      gridViewBtn.classList.toggle('active', this.settings.viewMode === 'grid');
      listViewBtn.classList.toggle('active', this.settings.viewMode === 'list');
    }
    
    // Update sort order
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.value = this.settings.sortOrder;
    }
    
    // Update toggle switches
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
      notificationsToggle.checked = this.settings.enableNotifications;
    }
    
    const metadataToggle = document.getElementById('metadata-toggle');
    if (metadataToggle) {
      metadataToggle.checked = this.settings.autoFetchMetadata;
    }
  }
  
  /**
   * Update a setting
   * @param {string} key - The setting key
   * @param {any} value - The setting value
   */
  updateSetting(key, value) {
    if (key in this.settings) {
      this.settings[key] = value;
      this.saveSettings();
      this.applySettings();
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: { key, value, settings: this.settings }
      }));
    }
  }
  
  /**
   * Get a setting value
   * @param {string} key - The setting key
   * @returns {any} The setting value
   */
  getSetting(key) {
    return this.settings[key];
  }
  
  /**
   * Get all settings
   * @returns {Object} All settings
   */
  getAllSettings() {
    return { ...this.settings };
  }
}
