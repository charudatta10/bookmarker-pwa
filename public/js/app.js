/**
 * App - Main application entry point
 * Initializes all components and manages application lifecycle
 */
export class App {
  constructor() {
    this.initialized = false;
    this.components = {
      databaseService: null,
      bookmarkRepository: null,
      categoryRepository: null,
      bookmarkController: null,
      settingsManager: null,
      modalManager: null,
      toastManager: null,
      networkManager: null,
      router: null
    };
  }

  /**
   * Initialize the application
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('Initializing Bookmarker PWA...');
      
      // Show loading state
      document.body.classList.add('loading');
      document.getElementById('loading-screen').classList.remove('hidden');
      
      // Initialize utilities first
      await this.initializeUtilities();
      
      // Initialize database and repositories
      await this.initializeDatabase();
      
      // Initialize controllers
      await this.initializeControllers();
      
      // Hide loading screen
      document.body.classList.remove('loading');
      document.getElementById('loading-screen').classList.add('hidden');
      
      this.initialized = true;
      console.log('Bookmarker PWA initialized successfully');
      
      // Show welcome toast
      this.components.toastManager.show('Welcome to Bookmarker!');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize application:', error);
      
      // Show error state
      document.body.classList.remove('loading');
      document.body.classList.add('error');
      document.getElementById('loading-screen').classList.add('hidden');
      document.getElementById('error-screen').classList.remove('hidden');
      
      return false;
    }
  }

  /**
   * Initialize utilities
   * @returns {Promise<void>}
   */
  async initializeUtilities() {
    // Import utilities
    const { ToastManager } = await import('./utils/toast-manager.js');
    const { NetworkManager } = await import('./utils/network-manager.js');
    const { Router } = await import('./utils/router.js');
    const { ModalManager } = await import('./utils/modal-manager.js');
    const { SettingsManager } = await import('./utils/settings-manager.js');
    
    // Create instances
    this.components.toastManager = new ToastManager();
    this.components.networkManager = new NetworkManager();
    this.components.router = new Router();
    this.components.modalManager = new ModalManager();
    this.components.settingsManager = new SettingsManager();
    
    // Initialize components
    this.components.networkManager.init();
    this.components.settingsManager.applySettings();
    
    // Set up router
    this.components.router.register('home-view', () => {
      console.log('Home view activated');
    });
    
    this.components.router.register('settings-view', () => {
      console.log('Settings view activated');
    });
    
    this.components.router.register('import-export-view', () => {
      console.log('Import/Export view activated');
    });
    
    this.components.router.init('home-view');
  }

  /**
   * Initialize database and repositories
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    // Import database service and repositories
    const { DatabaseService } = await import('./models/database-service.js');
    const { BookmarkRepository } = await import('./models/bookmark-repository.js');
    const { CategoryRepository } = await import('./models/category-repository.js');
    
    // Create and initialize database service
    this.components.databaseService = new DatabaseService();
    const dbInitialized = await this.components.databaseService.initialize();
    
    if (!dbInitialized) {
      throw new Error('Failed to initialize database');
    }
    
    // Create repositories
    this.components.bookmarkRepository = new BookmarkRepository(this.components.databaseService);
    this.components.categoryRepository = new CategoryRepository(this.components.databaseService);
    
    console.log('Database initialized with persistence type:', this.components.databaseService.getPersistenceType());
  }

  /**
   * Initialize controllers
   * @returns {Promise<void>}
   */
  async initializeControllers() {
    // Import controllers
    const { BookmarkController } = await import('./controllers/bookmark-controller.js');
    
    // Create and initialize controllers
    this.components.bookmarkController = new BookmarkController(
      this.components.bookmarkRepository,
      this.components.categoryRepository
    );
    
    await this.components.bookmarkController.initialize();
  }
}
