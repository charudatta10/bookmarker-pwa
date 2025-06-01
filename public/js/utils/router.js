/**
 * Router - Simple client-side router for single-page application
 */
export class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        this.navigateTo(e.state.view, false);
      }
    });
  }
  
  /**
   * Register a route
   * @param {string} viewId - The ID of the view element
   * @param {Function} callback - Function to call when route is activated
   */
  register(viewId, callback) {
    this.routes[viewId] = callback;
  }
  
  /**
   * Navigate to a specific view
   * @param {string} viewId - The ID of the view to navigate to
   * @param {boolean} addToHistory - Whether to add this navigation to browser history
   */
  navigateTo(viewId, addToHistory = true) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.add('hidden');
    });
    
    // Show the requested view
    const viewElement = document.getElementById(viewId);
    if (viewElement) {
      viewElement.classList.remove('hidden');
      this.currentView = viewId;
      
      // Call the route callback if registered
      if (this.routes[viewId]) {
        this.routes[viewId]();
      }
      
      // Add to browser history if requested
      if (addToHistory) {
        const viewName = viewId.replace('-view', '');
        window.history.pushState({ view: viewId }, viewName, `#/${viewName}`);
      }
    }
  }
  
  /**
   * Initialize the router with default route
   * @param {string} defaultViewId - The default view to show
   */
  init(defaultViewId = 'home-view') {
    // Check if there's a route in the URL hash
    const hash = window.location.hash.substring(2); // Remove #/
    if (hash && document.getElementById(`${hash}-view`)) {
      this.navigateTo(`${hash}-view`, false);
    } else {
      this.navigateTo(defaultViewId, false);
    }
  }
}
