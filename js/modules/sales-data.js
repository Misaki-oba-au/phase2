/**
 * Sales Data Module
 * Handles Excel file upload, parsing, and sales data visualization
 */

export class SalesDataModule {
  constructor() {
    this.uploadBtn = document.getElementById('upload-btn');
    this.fileInput = document.getElementById('excel-file-input');
    this.salesSummarySection = document.getElementById('sales-summary-section');
    this.rankingSection = document.getElementById('ranking-section');
    this.salesTableSection = document.getElementById('sales-table-section');
    this.salesContent = document.getElementById('sales-content');

    this.salesData = [];
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.uploadBtn.addEventListener('click', () => this.handleFileUpload());
    this.fileInput.addEventListener('change', () => {
      // Optional: auto-upload on file selection
    });
  }

  /**
   * Handle file upload
   */
  async handleFileUpload() {
    const file = this.fileInput.files[0];
    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      this.uploadBtn.textContent = 'Uploading...';
      this.uploadBtn.disabled = true;

      const data = await this.parseExcelFile(file);
      this.validateData(data);
      this.salesData = data;

      // Display results
      this.displaySummary();
      this.displayRanking();
      this.displayTable();

      // Show sections
      this.salesSummarySection.classList.remove('hidden');
      this.rankingSection.classList.remove('hidden');
      this.salesTableSection.classList.remove('hidden');
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error: ${error.message}`);
    } finally {
      this.uploadBtn.textContent = 'Upload';
      this.uploadBtn.disabled = false;
    }
  }

  /**
   * Parse Excel file using SheetJS
   */
  async parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });

          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            throw new Error('No data found in the spreadsheet');
          }

          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate data structure
   */
  validateData(data) {
    // Expected columns (case-insensitive)
    const requiredFields = [
      'Store ID',
      'Store Name',
      'Target Sales',
      'Actual Sales',
      'Achievement Rate (%)',
    ];

    if (data.length === 0) {
      throw new Error('No data rows found');
    }

    // Check if required fields exist
    const firstRow = data[0];
    const headers = Object.keys(firstRow);

    for (const field of requiredFields) {
      const fieldExists = headers.some(
        (h) => h.trim().toLowerCase() === field.toLowerCase()
      );
      if (!fieldExists) {
        throw new Error(`Missing required column: "${field}"`);
      }
    }
  }

  /**
   * Get column name (case-insensitive)
   */
  getColumn(row, columnName) {
    const key = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === columnName.toLowerCase()
    );
    return key ? row[key] : null;
  }

  /**
   * Parse numeric value
   */
  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }

  /**
   * Display sales summary (Total Sales, Target Achievement %)
   */
  displaySummary() {
    const totalSales = this.salesData.reduce((sum, row) => {
      const actual = this.parseNumber(this.getColumn(row, 'Actual Sales'));
      return sum + actual;
    }, 0);

    const totalTarget = this.salesData.reduce((sum, row) => {
      const target = this.parseNumber(this.getColumn(row, 'Target Sales'));
      return sum + target;
    }, 0);

    const achievementRate =
      totalTarget > 0 ? ((totalSales / totalTarget) * 100).toFixed(1) : 0;

    document.getElementById('total-sales').textContent = this.formatCurrency(
      totalSales
    );
    document.getElementById('target-achievement').textContent =
      `${achievementRate}%`;
  }

  /**
   * Display store ranking
   */
  displayRanking() {
    // Sort by actual sales descending
    const sorted = [...this.salesData].sort((a, b) => {
      const salesA = this.parseNumber(this.getColumn(a, 'Actual Sales'));
      const salesB = this.parseNumber(this.getColumn(b, 'Actual Sales'));
      return salesB - salesA;
    });

    // Display top 5 or all if less than 5
    const topStores = sorted.slice(0, 5);

    const rankingHtml = topStores
      .map((row, index) => {
        const storeName = this.getColumn(row, 'Store Name');
        const sales = this.parseNumber(this.getColumn(row, 'Actual Sales'));
        const achievement = this.parseNumber(
          this.getColumn(row, 'Achievement Rate (%)')
        );

        let badgeClass = '';
        if (index === 0) badgeClass = 'gold';
        else if (index === 1) badgeClass = 'silver';
        else if (index === 2) badgeClass = 'bronze';

        return `
          <div class="ranking-card">
            <div class="ranking-badge ${badgeClass}">${index + 1}</div>
            <p class="ranking-store-name">${storeName}</p>
            <p class="ranking-store-sales">${this.formatCurrency(sales)}</p>
            <p class="ranking-store-achievement">Achievement: ${achievement.toFixed(1)}%</p>
          </div>
        `;
      })
      .join('');

    document.getElementById('ranking-list').innerHTML = rankingHtml;
  }

  /**
   * Display sales table
   */
  displayTable() {
    if (this.salesData.length === 0) {
      this.salesContent.innerHTML = '<div class="empty-state">No data to display</div>';
      return;
    }

    // Get all headers from first row
    const headers = Object.keys(this.salesData[0]);

    // Create table
    let html = '<table class="sales-table"><thead><tr>';

    headers.forEach((header) => {
      html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Add data rows
    this.salesData.forEach((row) => {
      html += '<tr>';
      headers.forEach((header) => {
        let value = this.getColumn(row, header);

        // Format numeric values
        if (header.toLowerCase().includes('sales')) {
          const num = this.parseNumber(value);
          value = this.formatCurrency(num);
        } else if (header.toLowerCase().includes('achievement') || header.toLowerCase().includes('rate')) {
          const num = this.parseNumber(value);
          value = `${num.toFixed(1)}%`;
        }

        const isNumeric = header.toLowerCase().includes('sales') || 
                         header.toLowerCase().includes('achievement') || 
                         header.toLowerCase().includes('rate');
        const className = isNumeric ? 'numeric' : '';

        html += `<td class="${className}">${value || '-'}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    this.salesContent.innerHTML = html;
  }

  /**
   * Format currency
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}

/**
 * Initialize Sales Data Module
 */
export function initSalesData() {
  return new SalesDataModule();
}

// Initialize when this module is imported
let salesModule = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the sales data tab
  const salesDataTab = document.getElementById('sales-data-tab');
  if (salesDataTab) {
    salesModule = initSalesData();
  }
});
