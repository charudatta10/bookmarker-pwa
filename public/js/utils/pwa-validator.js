/**
 * PWA Validation Module
 * Performs validation checks for PWA functionality, accessibility, and security
 */
export class PwaValidator {
  constructor() {
    this.validationResults = {
      manifest: { passed: false, details: [] },
      serviceWorker: { passed: false, details: [] },
      offline: { passed: false, details: [] },
      installability: { passed: false, details: [] },
      accessibility: { passed: false, details: [] },
      security: { passed: false, details: [] },
      performance: { passed: false, details: [] }
    };
  }

  /**
   * Run all validation checks
   * @returns {Promise<Object>} Validation results
   */
  async validateAll() {
    await this.validateManifest();
    await this.validateServiceWorker();
    await this.validateOfflineSupport();
    await this.validateInstallability();
    await this.validateAccessibility();
    await this.validateSecurity();
    await this.validatePerformance();
    
    return this.validationResults;
  }

  /**
   * Validate web app manifest
   * @returns {Promise<Object>} Validation results
   */
  async validateManifest() {
    try {
      // Fetch the manifest
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      
      // Check required fields
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        this.validationResults.manifest.details.push(`Missing required fields: ${missingFields.join(', ')}`);
      } else {
        this.validationResults.manifest.details.push('All required fields present');
      }
      
      // Check icons
      if (manifest.icons && Array.isArray(manifest.icons)) {
        const requiredSizes = ['192x192', '512x512'];
        const availableSizes = manifest.icons.map(icon => icon.sizes);
        
        const missingSizes = requiredSizes.filter(size => !availableSizes.includes(size));
        
        if (missingSizes.length > 0) {
          this.validationResults.manifest.details.push(`Missing required icon sizes: ${missingSizes.join(', ')}`);
        } else {
          this.validationResults.manifest.details.push('All required icon sizes present');
        }
      } else {
        this.validationResults.manifest.details.push('No icons defined in manifest');
      }
      
      // Check share target
      if (manifest.share_target) {
        this.validationResults.manifest.details.push('Share target defined');
      } else {
        this.validationResults.manifest.details.push('No share target defined');
      }
      
      // Set overall result
      this.validationResults.manifest.passed = missingFields.length === 0;
      
      return this.validationResults.manifest;
    } catch (error) {
      this.validationResults.manifest.details.push(`Error validating manifest: ${error.message}`);
      this.validationResults.manifest.passed = false;
      return this.validationResults.manifest;
    }
  }

  /**
   * Validate service worker
   * @returns {Promise<Object>} Validation results
   */
  async validateServiceWorker() {
    try {
      // Check if service worker is registered
      if (!('serviceWorker' in navigator)) {
        this.validationResults.serviceWorker.details.push('Service Worker API not supported');
        this.validationResults.serviceWorker.passed = false;
        return this.validationResults.serviceWorker;
      }
      
      // Check registration
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        this.validationResults.serviceWorker.details.push('No service worker registered');
        this.validationResults.serviceWorker.passed = false;
        return this.validationResults.serviceWorker;
      }
      
      // Check if service worker is active
      const activeServiceWorker = registrations.find(reg => reg.active);
      
      if (!activeServiceWorker) {
        this.validationResults.serviceWorker.details.push('Service worker registered but not active');
        this.validationResults.serviceWorker.passed = false;
        return this.validationResults.serviceWorker;
      }
      
      this.validationResults.serviceWorker.details.push('Service worker registered and active');
      this.validationResults.serviceWorker.passed = true;
      
      return this.validationResults.serviceWorker;
    } catch (error) {
      this.validationResults.serviceWorker.details.push(`Error validating service worker: ${error.message}`);
      this.validationResults.serviceWorker.passed = false;
      return this.validationResults.serviceWorker;
    }
  }

  /**
   * Validate offline support
   * @returns {Promise<Object>} Validation results
   */
  async validateOfflineSupport() {
    try {
      // Check cache storage
      if (!('caches' in window)) {
        this.validationResults.offline.details.push('Cache Storage API not supported');
        this.validationResults.offline.passed = false;
        return this.validationResults.offline;
      }
      
      // Check if critical resources are cached
      const criticalResources = [
        '/',
        '/index.html',
        '/css/main.css',
        '/js/app.js',
        '/offline.html'
      ];
      
      const cacheNames = await caches.keys();
      
      if (cacheNames.length === 0) {
        this.validationResults.offline.details.push('No caches found');
        this.validationResults.offline.passed = false;
        return this.validationResults.offline;
      }
      
      // Check if critical resources are in any cache
      const cachedResources = [];
      const missingResources = [];
      
      for (const resource of criticalResources) {
        let found = false;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const match = await cache.match(resource);
          
          if (match) {
            found = true;
            break;
          }
        }
        
        if (found) {
          cachedResources.push(resource);
        } else {
          missingResources.push(resource);
        }
      }
      
      if (missingResources.length > 0) {
        this.validationResults.offline.details.push(`Missing critical resources in cache: ${missingResources.join(', ')}`);
      } else {
        this.validationResults.offline.details.push('All critical resources cached');
      }
      
      // Check offline page
      const offlinePageCached = cachedResources.includes('/offline.html');
      
      if (!offlinePageCached) {
        this.validationResults.offline.details.push('Offline page not cached');
      } else {
        this.validationResults.offline.details.push('Offline page cached');
      }
      
      // Set overall result
      this.validationResults.offline.passed = missingResources.length === 0 && offlinePageCached;
      
      return this.validationResults.offline;
    } catch (error) {
      this.validationResults.offline.details.push(`Error validating offline support: ${error.message}`);
      this.validationResults.offline.passed = false;
      return this.validationResults.offline;
    }
  }

  /**
   * Validate installability
   * @returns {Promise<Object>} Validation results
   */
  async validateInstallability() {
    try {
      // Check if app is already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true;
      
      if (isStandalone) {
        this.validationResults.installability.details.push('App is already installed');
        this.validationResults.installability.passed = true;
        return this.validationResults.installability;
      }
      
      // Check manifest
      const manifestValidation = await this.validateManifest();
      
      if (!manifestValidation.passed) {
        this.validationResults.installability.details.push('Manifest validation failed, app may not be installable');
      } else {
        this.validationResults.installability.details.push('Manifest validation passed');
      }
      
      // Check service worker
      const serviceWorkerValidation = await this.validateServiceWorker();
      
      if (!serviceWorkerValidation.passed) {
        this.validationResults.installability.details.push('Service worker validation failed, app may not be installable');
      } else {
        this.validationResults.installability.details.push('Service worker validation passed');
      }
      
      // Set overall result
      this.validationResults.installability.passed = manifestValidation.passed && serviceWorkerValidation.passed;
      
      return this.validationResults.installability;
    } catch (error) {
      this.validationResults.installability.details.push(`Error validating installability: ${error.message}`);
      this.validationResults.installability.passed = false;
      return this.validationResults.installability;
    }
  }

  /**
   * Validate accessibility
   * @returns {Promise<Object>} Validation results
   */
  async validateAccessibility() {
    try {
      // Basic accessibility checks
      const accessibilityIssues = [];
      
      // Check for alt text on images
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        accessibilityIssues.push(`${images.length} images missing alt text`);
      } else {
        this.validationResults.accessibility.details.push('All images have alt text');
      }
      
      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.substring(1)));
      
      // Check if heading levels are in order
      let previousLevel = 0;
      let headingOrderIssue = false;
      
      for (const level of headingLevels) {
        if (level > previousLevel + 1) {
          headingOrderIssue = true;
          break;
        }
        previousLevel = level;
      }
      
      if (headingOrderIssue) {
        accessibilityIssues.push('Heading structure is not sequential');
      } else {
        this.validationResults.accessibility.details.push('Heading structure is sequential');
      }
      
      // Check for proper ARIA attributes
      const elementsWithAria = document.querySelectorAll('[aria-*]');
      let ariaIssues = 0;
      
      elementsWithAria.forEach(el => {
        // Check for aria-label on elements that should have it
        if (el.getAttribute('role') && !el.getAttribute('aria-label')) {
          ariaIssues++;
        }
      });
      
      if (ariaIssues > 0) {
        accessibilityIssues.push(`${ariaIssues} elements with ARIA roles missing aria-label`);
      } else {
        this.validationResults.accessibility.details.push('All ARIA roles have proper labels');
      }
      
      // Check for color contrast (simplified)
      // In a real app, we would use a more sophisticated method
      this.validationResults.accessibility.details.push('Color contrast check requires manual verification');
      
      // Check for keyboard navigation
      const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
      let tabindexIssues = 0;
      
      interactiveElements.forEach(el => {
        const tabindex = el.getAttribute('tabindex');
        if (tabindex && parseInt(tabindex) < 0 && !el.hasAttribute('aria-hidden')) {
          tabindexIssues++;
        }
      });
      
      if (tabindexIssues > 0) {
        accessibilityIssues.push(`${tabindexIssues} interactive elements with negative tabindex`);
      } else {
        this.validationResults.accessibility.details.push('No issues with tabindex found');
      }
      
      // Add all issues to details
      if (accessibilityIssues.length > 0) {
        this.validationResults.accessibility.details.push(...accessibilityIssues);
      }
      
      // Set overall result
      this.validationResults.accessibility.passed = accessibilityIssues.length === 0;
      
      return this.validationResults.accessibility;
    } catch (error) {
      this.validationResults.accessibility.details.push(`Error validating accessibility: ${error.message}`);
      this.validationResults.accessibility.passed = false;
      return this.validationResults.accessibility;
    }
  }

  /**
   * Validate security
   * @returns {Promise<Object>} Validation results
   */
  async validateSecurity() {
    try {
      // Check HTTPS
      const isHttps = window.location.protocol === 'https:';
      
      if (!isHttps) {
        this.validationResults.security.details.push('Not using HTTPS');
      } else {
        this.validationResults.security.details.push('Using HTTPS');
      }
      
      // Check Content Security Policy
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      
      if (!cspMeta) {
        this.validationResults.security.details.push('No Content Security Policy meta tag found');
      } else {
        this.validationResults.security.details.push('Content Security Policy meta tag found');
      }
      
      // Check for vulnerable patterns in localStorage usage
      // This is a simplified check
      const localStorageKeys = Object.keys(localStorage);
      const sensitiveKeywords = ['password', 'token', 'auth', 'key', 'secret'];
      
      const potentiallyVulnerableKeys = localStorageKeys.filter(key => 
        sensitiveKeywords.some(keyword => key.toLowerCase().includes(keyword))
      );
      
      if (potentiallyVulnerableKeys.length > 0) {
        this.validationResults.security.details.push(`Potentially sensitive data in localStorage: ${potentiallyVulnerableKeys.join(', ')}`);
      } else {
        this.validationResults.security.details.push('No potentially sensitive data found in localStorage');
      }
      
      // Set overall result
      // For security, we're more strict - all checks must pass
      this.validationResults.security.passed = isHttps && (cspMeta !== null) && potentiallyVulnerableKeys.length === 0;
      
      return this.validationResults.security;
    } catch (error) {
      this.validationResults.security.details.push(`Error validating security: ${error.message}`);
      this.validationResults.security.passed = false;
      return this.validationResults.security;
    }
  }

  /**
   * Validate performance
   * @returns {Promise<Object>} Validation results
   */
  async validatePerformance() {
    try {
      // Check if Performance API is available
      if (!('performance' in window)) {
        this.validationResults.performance.details.push('Performance API not supported');
        this.validationResults.performance.passed = false;
        return this.validationResults.performance;
      }
      
      // Get performance metrics
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      
      if (!navigationTiming) {
        this.validationResults.performance.details.push('Navigation timing data not available');
      } else {
        // Calculate key metrics
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
        const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime;
        const firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;
        
        this.validationResults.performance.details.push(`Load time: ${Math.round(loadTime)}ms`);
        this.validationResults.performance.details.push(`DOM Content Loaded: ${Math.round(domContentLoaded)}ms`);
        
        if (firstPaint) {
          this.validationResults.performance.details.push(`First Paint: ${Math.round(firstPaint)}ms`);
        }
        
        // Check if performance is acceptable
        const isPerformanceGood = loadTime < 3000 && domContentLoaded < 2000;
        
        if (isPerformanceGood) {
          this.validationResults.performance.details.push('Performance metrics are within acceptable range');
        } else {
          this.validationResults.performance.details.push('Performance metrics exceed recommended thresholds');
        }
        
        this.validationResults.performance.passed = isPerformanceGood;
      }
      
      // Check resource size
      const resourceEntries = performance.getEntriesByType('resource');
      const totalResourceSize = resourceEntries.reduce((total, entry) => total + (entry.transferSize || 0), 0);
      const totalResourceSizeInMB = totalResourceSize / (1024 * 1024);
      
      this.validationResults.performance.details.push(`Total resource size: ${totalResourceSizeInMB.toFixed(2)}MB`);
      
      if (totalResourceSizeInMB > 5) {
        this.validationResults.performance.details.push('Total resource size exceeds recommended limit of 5MB');
        this.validationResults.performance.passed = false;
      }
      
      return this.validationResults.performance;
    } catch (error) {
      this.validationResults.performance.details.push(`Error validating performance: ${error.message}`);
      this.validationResults.performance.passed = false;
      return this.validationResults.performance;
    }
  }

  /**
   * Generate validation report
   * @returns {string} HTML report
   */
  generateReport() {
    const report = document.createElement('div');
    report.className = 'validation-report';
    
    // Add header
    const header = document.createElement('h2');
    header.textContent = 'PWA Validation Report';
    report.appendChild(header);
    
    // Add timestamp
    const timestamp = document.createElement('p');
    timestamp.textContent = `Generated on: ${new Date().toLocaleString()}`;
    report.appendChild(timestamp);
    
    // Add results
    const results = document.createElement('div');
    results.className = 'validation-results';
    
    for (const [category, result] of Object.entries(this.validationResults)) {
      const categoryElement = document.createElement('div');
      categoryElement.className = `validation-category ${result.passed ? 'passed' : 'failed'}`;
      
      const categoryHeader = document.createElement('h3');
      categoryHeader.innerHTML = `${category}: <span class="${result.passed ? 'passed' : 'failed'}">${result.passed ? 'PASSED' : 'FAILED'}</span>`;
      categoryElement.appendChild(categoryHeader);
      
      const detailsList = document.createElement('ul');
      
      for (const detail of result.details) {
        const detailItem = document.createElement('li');
        detailItem.textContent = detail;
        detailsList.appendChild(detailItem);
      }
      
      categoryElement.appendChild(detailsList);
      results.appendChild(categoryElement);
    }
    
    report.appendChild(results);
    
    // Add summary
    const summary = document.createElement('div');
    summary.className = 'validation-summary';
    
    const passedCategories = Object.values(this.validationResults).filter(result => result.passed).length;
    const totalCategories = Object.keys(this.validationResults).length;
    
    const summaryText = document.createElement('p');
    summaryText.innerHTML = `Overall: <strong>${passedCategories}/${totalCategories}</strong> categories passed`;
    summary.appendChild(summaryText);
    
    const overallResult = passedCategories === totalCategories;
    
    const overallStatus = document.createElement('p');
    overallStatus.className = overallResult ? 'passed' : 'failed';
    overallStatus.textContent = overallResult ? 'PWA validation PASSED' : 'PWA validation FAILED';
    summary.appendChild(overallStatus);
    
    report.appendChild(summary);
    
    return report.outerHTML;
  }
}
