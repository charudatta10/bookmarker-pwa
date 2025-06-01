/**
 * Main application entry point
 * Initializes all components and manages application lifecycle
 */
document.addEventListener('DOMContentLoaded', function() {
  // Import and initialize UI Controller
  import('./controllers/ui-controller.js')
    .then(module => {
      const UIController = module.UIController;
      window.uiController = new UIController();
      console.log('UI Controller loaded and initialized');
    })
    .catch(error => {
      console.error('Failed to load UI Controller:', error);
    });
  
  // Initialize theme from preferences
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-theme');
  }
  
  // Initialize view mode from preferences
  const savedViewMode = localStorage.getItem('viewMode') || 'grid';
  const bookmarksContainer = document.getElementById('bookmarks-container');
  const gridViewBtn = document.getElementById('grid-view-button');
  const listViewBtn = document.getElementById('list-view-button');
  
  if (bookmarksContainer && gridViewBtn && listViewBtn) {
    if (savedViewMode === 'list') {
      bookmarksContainer.classList.add('list-view');
      bookmarksContainer.classList.remove('grid-view');
      listViewBtn.classList.add('active');
      gridViewBtn.classList.remove('active');
    } else {
      bookmarksContainer.classList.add('grid-view');
      bookmarksContainer.classList.remove('list-view');
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
    }
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
