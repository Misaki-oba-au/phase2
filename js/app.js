/**
 * Store Dashboard - Main Application
 * Manages tab navigation and module initialization
 */

import { initSalesData } from './modules/sales-data.js';

class Dashboard {
  constructor() {
    this.currentTab = 'culture-calendar';
    this.setupTabNavigation();
    this.initializeModules();
  }

  /**
   * Setup tab navigation listeners
   */
  setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName, tabBtns, tabContents);
      });
    });
  }

  /**
   * Switch active tab
   */
  switchTab(tabName, tabBtns, tabContents) {
    // Deactivate all tabs
    tabBtns.forEach((btn) => btn.classList.remove('active'));
    tabContents.forEach((content) => {
      content.classList.remove('active');
      content.classList.add('hidden');
    });

    // Activate selected tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    const tabContent = document.getElementById(`${tabName}-tab`);
    tabContent.classList.add('active');
    tabContent.classList.remove('hidden');

    this.currentTab = tabName;

    // Trigger any module-specific initialization
    if (tabName === 'sales-data') {
      this.onSalesDataTabActivated();
    } else if (tabName === 'culture-calendar') {
      this.onCultureCalendarTabActivated();
    }
  }

  /**
   * Initialize all modules
   */
  initializeModules() {
    // Culture Calendar is initialized by script.js
    // Initialize Sales Data module
    initSalesData();
  }

  /**
   * Called when Sales Data tab is activated
   */
  onSalesDataTabActivated() {
    // Lazy load sales data module if needed
    console.log('Sales Data tab activated');
  }

  /**
   * Called when Culture Calendar tab is activated
   */
  onCultureCalendarTabActivated() {
    console.log('Culture Calendar tab activated');
  }
}

// Initialize Dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});

// Export for module usage
export { Dashboard };
