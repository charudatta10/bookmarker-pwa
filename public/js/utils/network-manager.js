/**
 * Network Manager - Handles online/offline status
 */
export class NetworkManager {
  constructor() {
    this.offlineIndicator = document.getElementById('offline-indicator');
    this.isOnline = navigator.onLine;
  }
  
  /**
   * Initialize the network manager
   */
  init() {
    // Set initial state
    this.updateOnlineStatus();
    
    // Add event listeners for online/offline events
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }
  
  /**
   * Update the UI based on online status
   */
  updateOnlineStatus() {
    this.isOnline = navigator.onLine;
    
    if (this.isOnline) {
      this.offlineIndicator.classList.add('hidden');
      console.log('Application is online');
    } else {
      this.offlineIndicator.classList.remove('hidden');
      console.log('Application is offline');
    }
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('networkStatusChange', {
      detail: { isOnline: this.isOnline }
    }));
  }
}
