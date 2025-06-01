/**
 * Service Worker Registration
 * Handles registration and updates of the service worker
 */

// Check if service workers are supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

/**
 * Register the service worker
 */
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('ServiceWorker registration successful with scope:', registration.scope);
    
    // Check if there's an update and notify the user
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is installed but waiting
          showUpdateNotification();
        }
      });
    });
    
    // Handle controller change (when a new service worker takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker activated');
    });
    
    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);
      
      if (event.data.type === 'offline') {
        showOfflineNotification(event.data.offline);
      }
    });
  } catch (error) {
    console.error('ServiceWorker registration failed:', error);
  }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-notification-content">
      <span class="material-icons">system_update</span>
      <span>New version available!</span>
      <button class="button primary" id="update-button">Update Now</button>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Add event listener to update button
  document.getElementById('update-button').addEventListener('click', () => {
    // Send message to service worker to skip waiting
    navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    
    // Remove notification
    notification.remove();
    
    // Reload the page to activate the new service worker
    window.location.reload();
  });
}

/**
 * Show offline notification
 * @param {boolean} offline - Whether the app is offline
 */
function showOfflineNotification(offline) {
  const offlineIndicator = document.getElementById('offline-indicator');
  
  if (offline) {
    offlineIndicator.classList.remove('hidden');
  } else {
    offlineIndicator.classList.add('hidden');
  }
}

/**
 * Check if the app is installed
 * @returns {boolean} Whether the app is installed
 */
function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

/**
 * Handle install prompt
 */
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default prompt
  e.preventDefault();
  
  // Store the event for later use
  deferredPrompt = e;
  
  // Show install button if available
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.classList.remove('hidden');
    
    installButton.addEventListener('click', async () => {
      // Hide the install button
      installButton.classList.add('hidden');
      
      // Show the prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond
      const choiceResult = await deferredPrompt.userChoice;
      
      // Reset the deferred prompt
      deferredPrompt = null;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  }
});

// Hide install button if app is already installed
window.addEventListener('appinstalled', (e) => {
  console.log('App was installed');
  
  // Hide install button
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.classList.add('hidden');
  }
  
  // Reset the deferred prompt
  deferredPrompt = null;
});
