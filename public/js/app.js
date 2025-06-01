/**
 * Main application entry point
 * Initializes all components and manages application lifecycle
 */
document.addEventListener('DOMContentLoaded', async function() {
  // Import and initialize all controllers and repositories
  const [
    { UIController },
    { BookmarkController },
    { BookmarkFormController },
    { SearchController },
    { ImportExportController },
    { ShareController },
    { ModalManager }
  ] = await Promise.all([
    import('./controllers/ui-controller.js'),
    import('./controllers/bookmark-controller.js'),
    import('./controllers/bookmark-form-controller.js'),
    import('./controllers/search-controller.js'),
    import('./controllers/import-export-controller.js'),
    import('./controllers/share-controller.js'),
    import('./utils/modal-manager.js')
  ]);

  // Dummy repositories and toast manager for demonstration
  // Replace with your actual implementations
  const bookmarkRepository = window.bookmarkRepository;
  const categoryRepository = window.categoryRepository;
  const toastManager = {
    show: (msg) => {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
      }
    }
  };

  // Modal manager
  const modalManager = new ModalManager();

  // Controllers
  window.uiController = new UIController();
  window.bookmarkController = new BookmarkController(bookmarkRepository, categoryRepository);
  window.bookmarkFormController = new BookmarkFormController(bookmarkRepository, categoryRepository, modalManager, toastManager);
  window.searchController = new SearchController(bookmarkRepository, toastManager);
  window.importExportController = new ImportExportController(bookmarkRepository, categoryRepository, modalManager, toastManager);
  window.shareController = new ShareController(bookmarkRepository, toastManager);

  // Initialize bookmark controller (loads bookmarks/categories)
  if (window.bookmarkController.initialize) {
    window.bookmarkController.initialize();
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }

  // Check for online/offline status
  function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      if (navigator.onLine) {
        offlineIndicator.classList.add('hidden');
      } else {
        offlineIndicator.classList.remove('hidden');
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  console.log('Application initialized');
});
