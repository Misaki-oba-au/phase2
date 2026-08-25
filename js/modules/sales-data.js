/** Sales Data upload and presentation module. */

import { parseSalesWorkbook } from './sales-excel-parser.js';

export function calculateTotalSales(stores) {
  return stores.reduce((total, store) => total + store.monthlyTotalSales, 0);
}

export function rankStores(stores) {
  return [...stores].sort((a, b) =>
    b.monthlyTotalSales - a.monthlyTotalSales || a.storeName.localeCompare(b.storeName)
  );
}

export class SalesDataModule {
  constructor() {
    this.uploadBtn = document.getElementById('upload-btn');
    this.fileInput = document.getElementById('excel-file-input');
    this.salesSummarySection = document.getElementById('sales-summary-section');
    this.rankingSection = document.getElementById('ranking-section');
    this.salesTableSection = document.getElementById('sales-table-section');
    this.salesContent = document.getElementById('sales-content');
    this.warningSection = document.getElementById('sales-warning-section');
    this.errorSection = document.getElementById('sales-error-section');
    this.result = null;

    this.uploadBtn.addEventListener('click', () => this.handleFileUpload());
  }

  async handleFileUpload() {
    const file = this.fileInput.files[0];
    if (!file) {
      this.displayError('Please select a file.');
      return;
    }

    this.clearMessages();
    this.setLoading(true);
    try {
      const input = await file.arrayBuffer();
      this.result = parseSalesWorkbook(input, file.name);
      this.displayResult();
    } catch (error) {
      console.error('Error processing file:', error);
      this.hideResults();
      this.displayError(`Failed to process the Excel file: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  displayResult() {
    this.displaySummary();
    this.displayWarnings();
    this.displayRanking();
    this.displayTable();
    this.salesSummarySection.classList.remove('hidden');
    this.rankingSection.classList.remove('hidden');
    this.salesTableSection.classList.remove('hidden');
  }

  displaySummary() {
    document.getElementById('total-sales').textContent = this.formatCurrency(
      calculateTotalSales(this.result.stores)
    );
    document.getElementById('sales-period').textContent = this.result.workbookPeriod;
    document.getElementById('sales-currency').textContent = this.result.currency;
  }

  displayWarnings() {
    const warnings = [
      ...this.result.warnings,
      ...this.result.stores.flatMap((store) => store.warnings),
    ];
    this.warningSection.replaceChildren();
    if (warnings.length === 0) {
      this.warningSection.classList.add('hidden');
      return;
    }

    const title = document.createElement('h2');
    title.textContent = `Warnings (${warnings.length})`;
    const list = document.createElement('ul');
    for (const warning of warnings) {
      const item = document.createElement('li');
      item.textContent = this.formatWarning(warning);
      list.appendChild(item);
    }
    this.warningSection.append(title, list);
    this.warningSection.classList.remove('hidden');
  }

  formatWarning(warning) {
    if (warning.code === 'out-of-period-date') {
      return `${warning.sheetName}: excluded ${warning.excludedRowCount} row(s) from ${warning.detectedPeriod}; expected ${warning.expectedPeriod}.`;
    }
    if (warning.code === 'duplicate-store-code') {
      return `Store code ${warning.storeCode} is duplicated in: ${warning.sheets.join(', ')}.`;
    }
    if (warning.code === 'missing-cached-formula-value') {
      return `${warning.sheetName}: formula result is unavailable at row ${warning.row} (${warning.field}).`;
    }
    return `${warning.sheetName ? `${warning.sheetName}: ` : ''}${warning.code}`;
  }

  displayRanking() {
    const list = document.getElementById('ranking-list');
    list.replaceChildren();
    rankStores(this.result.stores).forEach((store, index) => {
      const card = document.createElement('div');
      card.className = 'ranking-card';

      const badge = document.createElement('div');
      badge.className = `ranking-badge${this.getMedalClass(index)}`;
      badge.textContent = String(index + 1);

      const name = document.createElement('p');
      name.className = 'ranking-store-name';
      name.textContent = store.storeName;

      const sales = document.createElement('p');
      sales.className = 'ranking-store-sales';
      sales.textContent = this.formatCurrency(store.monthlyTotalSales);

      const code = document.createElement('p');
      code.className = 'ranking-store-code';
      code.textContent = `Store Code: ${store.storeCode || 'N/A'}`;
      card.append(badge, name, sales, code);
      list.appendChild(card);
    });
  }

  displayTable() {
    const table = document.createElement('table');
    table.className = 'sales-table';
    const headerRow = document.createElement('tr');
    ['Store Name', 'Store Code', 'Monthly Total Sales'].forEach((label) => {
      const header = document.createElement('th');
      header.textContent = label;
      headerRow.appendChild(header);
    });
    const head = document.createElement('thead');
    head.appendChild(headerRow);

    const body = document.createElement('tbody');
    rankStores(this.result.stores).forEach((store) => {
      const row = document.createElement('tr');
      row.append(
        this.createCell(store.storeName),
        this.createCell(store.storeCode || 'N/A'),
        this.createCell(this.formatCurrency(store.monthlyTotalSales), 'numeric')
      );
      body.appendChild(row);
    });
    table.append(head, body);
    this.salesContent.replaceChildren(table);
  }

  createCell(value, className = '') {
    const cell = document.createElement('td');
    cell.className = className;
    cell.textContent = value;
    return cell;
  }

  getMedalClass(index) {
    if (index === 0) return ' gold';
    if (index === 1) return ' silver';
    if (index === 2) return ' bronze';
    return '';
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      currencyDisplay: 'code',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  displayError(message) {
    this.errorSection.textContent = message;
    this.errorSection.classList.remove('hidden');
  }

  clearMessages() {
    this.errorSection.textContent = '';
    this.errorSection.classList.add('hidden');
    this.warningSection.replaceChildren();
    this.warningSection.classList.add('hidden');
  }

  hideResults() {
    this.salesSummarySection.classList.add('hidden');
    this.rankingSection.classList.add('hidden');
    this.salesTableSection.classList.add('hidden');
  }

  setLoading(isLoading) {
    this.uploadBtn.textContent = isLoading ? 'Processing...' : 'Upload';
    this.uploadBtn.disabled = isLoading;
  }
}

export function initSalesData() {
  return new SalesDataModule();
}
