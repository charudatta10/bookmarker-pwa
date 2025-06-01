/**
 * Toast Manager - Handles toast notifications
 */
export class ToastManager {
  constructor() {
    this.toastElement = document.getElementById('toast');
    this.timeout = null;
    this.duration = 3000; // Default duration in ms
  }
  
  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {number} duration - How long to show the toast (in ms)
   */
  show(message, duration = this.duration) {
    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    // Set the message
    this.toastElement.textContent = message;
    
    // Show the toast
    this.toastElement.classList.remove('hidden');
    
    // Set timeout to hide the toast
    this.timeout = setTimeout(() => {
      this.hide();
    }, duration);
  }
  
  /**
   * Hide the toast notification
   */
  hide() {
    this.toastElement.classList.add('hidden');
  }
}
