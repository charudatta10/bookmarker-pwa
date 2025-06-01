/**
 * Modal Manager - Handles modal dialogs
 */
export class ModalManager {
  constructor() {
    this.modalContainer = document.getElementById('modal-container');
    this.modals = {
      bookmark: document.getElementById('bookmark-modal'),
      category: document.getElementById('category-modal')
    };
    
    this.currentModal = null;
    this.callbacks = {
      onSave: null,
      onClose: null
    };
    
    this.init();
  }
  
  /**
   * Initialize the modal manager
   */
  init() {
    // Close modal when clicking on backdrop
    this.modalContainer.querySelector('.modal-backdrop').addEventListener('click', () => {
      this.close();
    });
    
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.close();
      });
    });
    
    // Save buttons
    document.getElementById('save-bookmark').addEventListener('click', () => {
      this.handleSave('bookmark');
    });
    
    document.getElementById('save-category').addEventListener('click', () => {
      this.handleSave('category');
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.close();
      }
    });
  }
  
  /**
   * Open a modal
   * @param {string} modalType - The type of modal to open ('bookmark' or 'category')
   * @param {Object} data - Data to populate the modal with
   * @param {Object} callbacks - Callback functions
   */
  open(modalType, data = {}, callbacks = {}) {
    this.currentModal = modalType;
    this.callbacks = { ...this.callbacks, ...callbacks };
    
    // Show modal container
    this.modalContainer.classList.remove('hidden');
    
    // Hide all modals first
    Object.values(this.modals).forEach(modal => {
      modal.classList.add('hidden');
    });
    
    // Show the requested modal
    if (this.modals[modalType]) {
      this.modals[modalType].classList.remove('hidden');
      
      // Populate form if data is provided
      if (Object.keys(data).length > 0) {
        this.populateForm(modalType, data);
      } else {
        // Reset form
        this.resetForm(modalType);
      }
      
      // Focus first input
      const firstInput = this.modals[modalType].querySelector('input');
      if (firstInput) {
        setTimeout(() => {
          firstInput.focus();
        }, 100);
      }
    }
  }
  
  /**
   * Close the current modal
   */
  close() {
    this.modalContainer.classList.add('hidden');
    
    if (this.currentModal && this.modals[this.currentModal]) {
      this.modals[this.currentModal].classList.add('hidden');
    }
    
    // Reset forms
    this.resetForm('bookmark');
    this.resetForm('category');
    
    // Call onClose callback if provided
    if (this.callbacks.onClose) {
      this.callbacks.onClose();
    }
    
    this.currentModal = null;
  }
  
  /**
   * Handle save button click
   * @param {string} modalType - The type of modal ('bookmark' or 'category')
   */
  handleSave(modalType) {
    // Validate form
    if (!this.validateForm(modalType)) {
      return;
    }
    
    // Get form data
    const formData = this.getFormData(modalType);
    
    // Call onSave callback if provided
    if (this.callbacks.onSave) {
      this.callbacks.onSave(formData);
    }
    
    // Close modal
    this.close();
  }
  
  /**
   * Validate form data
   * @param {string} modalType - The type of modal ('bookmark' or 'category')
   * @returns {boolean} - Whether the form is valid
   */
  validateForm(modalType) {
    if (modalType === 'bookmark') {
      const url = document.getElementById('bookmark-url').value;
      const title = document.getElementById('bookmark-title').value;
      
      if (!url) {
        alert('Please enter a URL');
        document.getElementById('bookmark-url').focus();
        return false;
      }
      
      if (!title) {
        alert('Please enter a title');
        document.getElementById('bookmark-title').focus();
        return false;
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        alert('Please enter a valid URL (including http:// or https://)');
        document.getElementById('bookmark-url').focus();
        return false;
      }
    } else if (modalType === 'category') {
      const name = document.getElementById('category-name').value;
      
      if (!name) {
        alert('Please enter a category name');
        document.getElementById('category-name').focus();
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get form data
   * @param {string} modalType - The type of modal ('bookmark' or 'category')
   * @returns {Object} - The form data
   */
  getFormData(modalType) {
    if (modalType === 'bookmark') {
      return {
        url: document.getElementById('bookmark-url').value,
        title: document.getElementById('bookmark-title').value,
        description: document.getElementById('bookmark-description').value,
        // In a real app, we would also get selected categories
        categories: []
      };
    } else if (modalType === 'category') {
      return {
        name: document.getElementById('category-name').value,
        color: document.getElementById('category-color').value
      };
    }
    
    return {};
  }
  
  /**
   * Populate form with data
   * @param {string} modalType - The type of modal ('bookmark' or 'category')
   * @param {Object} data - The data to populate the form with
   */
  populateForm(modalType, data) {
    if (modalType === 'bookmark') {
      document.getElementById('bookmark-url').value = data.url || '';
      document.getElementById('bookmark-title').value = data.title || '';
      document.getElementById('bookmark-description').value = data.description || '';
      
      // Update modal title
      document.getElementById('bookmark-modal-title').textContent = data.id ? 'Edit Bookmark' : 'Add Bookmark';
      
      // In a real app, we would also set selected categories
    } else if (modalType === 'category') {
      document.getElementById('category-name').value = data.name || '';
      document.getElementById('category-color').value = data.color || '#4285f4';
      
      // Update modal title
      document.getElementById('category-modal-title').textContent = data.id ? 'Edit Category' : 'Add Category';
    }
  }
  
  /**
   * Reset form
   * @param {string} modalType - The type of modal ('bookmark' or 'category')
   */
  resetForm(modalType) {
    if (modalType === 'bookmark') {
      document.getElementById('bookmark-form').reset();
      document.getElementById('bookmark-modal-title').textContent = 'Add Bookmark';
    } else if (modalType === 'category') {
      document.getElementById('category-form').reset();
      document.getElementById('category-modal-title').textContent = 'Add Category';
    }
  }
}
