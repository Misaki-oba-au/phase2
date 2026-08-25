/**
 * Parser for the store-per-sheet sales workbooks used by the Sales Data MVP.
 *
 * This module intentionally does not render anything.  It converts a SheetJS
 * workbook into a small, predictable data model that the dashboard can consume.
 */

const MONTH_NAMES = new Map([
  ['january', 1], ['february', 2], ['march', 3], ['april', 4],
  ['may', 5], ['june', 6], ['july', 7], ['august', 8],
  ['september', 9], ['october', 10], ['november', 11], ['december', 12],
]);

const HEADER_SCAN_ROW_LIMIT = 20;
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

/** Parse an ArrayBuffer (or other SheetJS-supported input) and normalize it. */
export function parseSalesWorkbook(input, fileName, options = {}) {
  const xlsx = options.xlsx || globalThis.XLSX;
  if (!xlsx?.read) {
    throw new Error('SheetJS (XLSX) is required to parse the sales workbook');
  }

  const workbook = xlsx.read(input, {
    type: input instanceof ArrayBuffer ? 'array' : undefined,
    cellDates: false,
  });
  return parseSalesWorkbookData(workbook, fileName);
}

/** Normalize an already-loaded SheetJS workbook. Exported to allow unit tests. */
export function parseSalesWorkbookData(workbook, fileName = '') {
  if (!workbook?.SheetNames || !workbook?.Sheets) {
    throw new Error('Invalid workbook');
  }

  const sheets = workbook.SheetNames
    .map((sheetName) => ({ sheetName, worksheet: workbook.Sheets[sheetName] }))
    .filter(({ worksheet }) => !isEmptySheet(worksheet));

  if (sheets.length === 0) {
    throw new Error('No store sheets found in the workbook');
  }

  const workbookPeriod = detectWorkbookPeriod(fileName, sheets, workbook);
  if (!workbookPeriod) {
    throw new Error('Unable to determine the workbook period');
  }

  const stores = sheets.map(({ sheetName, worksheet }) =>
    parseStoreSheet(worksheet, sheetName, workbookPeriod, workbook)
  );
  const warnings = validateDuplicateStoreCodes(stores);

  return {
    workbookPeriod: formatPeriod(workbookPeriod),
    currency: 'THB',
    stores,
    warnings,
  };
}

export function isEmptySheet(worksheet) {
  if (!worksheet || !worksheet['!ref']) return true;
  const range = decodeRange(worksheet['!ref']);
  for (let row = range.startRow; row <= range.endRow; row += 1) {
    for (let column = range.startColumn; column <= range.endColumn; column += 1) {
      const cell = worksheet[encodeCell(row, column)];
      if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') return false;
    }
  }
  return true;
}

export function detectWorkbookPeriod(fileName, sheets, workbook = {}) {
  const normalizedName = String(fileName).normalize('NFKC').toLowerCase();
  for (const [monthName, month] of MONTH_NAMES) {
    const match = normalizedName.match(new RegExp(`(?:^|[^a-z])${monthName}[^0-9]*(20\\d{2})`));
    if (match) return { year: Number(match[1]), month };
  }

  const numericMatch = normalizedName.match(/(?:^|\D)(0?[1-9]|1[0-2])[^0-9]+(20\d{2})(?:\D|$)/);
  if (numericMatch) {
    return { year: Number(numericMatch[2]), month: Number(numericMatch[1]) };
  }

  const periodCounts = new Map();
  for (const { worksheet } of sheets) {
    const dateColumn = findSaleDateColumn(worksheet);
    if (!dateColumn) continue;
    const range = decodeRange(worksheet['!ref']);
    for (let row = dateColumn.headerRow + 1; row <= range.endRow; row += 1) {
      const date = parseExcelDate(worksheet[encodeCell(row, dateColumn.column)], workbook);
      if (!date) continue;
      const period = date.slice(0, 7);
      periodCounts.set(period, (periodCounts.get(period) || 0) + 1);
    }
  }

  const mostCommon = [...periodCounts].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!mostCommon) return null;
  const [year, month] = mostCommon.split('-').map(Number);
  return { year, month };
}

export function parseStoreSheet(worksheet, sheetName, targetPeriod, workbook = {}) {
  const saleDateColumn = findSaleDateColumn(worksheet);
  const saleTotalColumns = findSaleTotalColumns(worksheet);
  if (!saleDateColumn) throw new Error(`Sale Date header not found in sheet "${sheetName}"`);
  if (!saleTotalColumns) throw new Error(`Sale Total Qty/Amount headers not found in sheet "${sheetName}"`);

  const storeWarnings = [];
  const dailySales = parseDailySalesRows(
    worksheet,
    { saleDateColumn, ...saleTotalColumns },
    targetPeriod,
    workbook,
    storeWarnings,
    sheetName
  );

  return {
    sheetName,
    storeName: sheetName,
    storeCode: extractStoreCode(worksheet),
    dailySales,
    monthlyTotalSales: dailySales.reduce(
      (total, day) => total + (day.totalSalesAmount ?? 0),
      0
    ),
    currency: 'THB',
    warnings: storeWarnings,
  };
}

export function findSaleTotalColumns(worksheet) {
  const range = decodeRange(worksheet['!ref']);
  const maxHeaderRow = Math.min(range.endRow, HEADER_SCAN_ROW_LIMIT - 1);

  for (let row = range.startRow; row <= maxHeaderRow; row += 1) {
    for (let column = range.startColumn; column <= range.endColumn; column += 1) {
      const text = normalizeHeader(worksheet[encodeCell(row, column)]?.v);
      if (!text.includes('sale total')) continue;

      const merge = findContainingMerge(worksheet['!merges'], row, column);
      const startColumn = merge?.startColumn ?? column;
      const endColumn = merge?.endColumn ?? Math.min(column + 3, range.endColumn);
      const endRow = Math.min(row + 3, maxHeaderRow);
      let qtyColumn = null;
      let amountColumn = null;
      let subHeaderRow = null;

      for (let subRow = row + 1; subRow <= endRow; subRow += 1) {
        for (let subColumn = startColumn; subColumn <= endColumn; subColumn += 1) {
          const subHeader = normalizeHeader(worksheet[encodeCell(subRow, subColumn)]?.v);
          if (!subHeader) continue;
          if (/\bqty\b|quantity/.test(subHeader)) qtyColumn = subColumn;
          if (/\bamount\b/.test(subHeader)) amountColumn = subColumn;
          if (qtyColumn !== null || amountColumn !== null) subHeaderRow = subRow;
        }
        if (qtyColumn !== null && amountColumn !== null) {
          return { qtyColumn, amountColumn, headerRow: subHeaderRow };
        }
      }
    }
  }
  return null;
}

export function findSaleDateColumn(worksheet) {
  const range = decodeRange(worksheet['!ref']);
  const maxHeaderRow = Math.min(range.endRow, HEADER_SCAN_ROW_LIMIT - 1);
  for (let row = range.startRow; row <= maxHeaderRow; row += 1) {
    for (let column = range.startColumn; column <= range.endColumn; column += 1) {
      const header = normalizeHeader(worksheet[encodeCell(row, column)]?.v);
      if (header.includes('sale date')) return { column, headerRow: row };
    }
  }
  return null;
}

export function extractStoreCode(worksheet) {
  const range = decodeRange(worksheet['!ref']);
  const maxRow = Math.min(range.endRow, 4);
  for (let row = range.startRow; row <= maxRow; row += 1) {
    for (let column = range.startColumn; column <= range.endColumn; column += 1) {
      const value = worksheet[encodeCell(row, column)]?.v;
      if (typeof value !== 'string') continue;
      const match = value.trim().match(/\b(\d{5})\s*$/);
      if (match) return match[1];
    }
  }
  return null;
}

export function parseDailySalesRows(
  worksheet,
  columns,
  targetPeriod,
  workbook,
  warnings = [],
  sheetName = ''
) {
  const range = decodeRange(worksheet['!ref']);
  const firstDataRow = Math.max(columns.saleDateColumn.headerRow, columns.headerRow) + 1;
  const dailySales = [];
  const excludedPeriods = new Map();

  for (let row = firstDataRow; row <= range.endRow; row += 1) {
    const date = parseExcelDate(
      worksheet[encodeCell(row, columns.saleDateColumn.column)],
      workbook
    );
    if (!date) continue;

    const period = date.slice(0, 7);
    if (period !== formatPeriod(targetPeriod)) {
      excludedPeriods.set(period, (excludedPeriods.get(period) || 0) + 1);
      continue;
    }

    const qtyCell = worksheet[encodeCell(row, columns.qtyColumn)];
    const amountCell = worksheet[encodeCell(row, columns.amountColumn)];
    const qty = getCachedNumericValue(qtyCell);
    const amount = getCachedNumericValue(amountCell);

    if (qtyCell?.f && qty === null) {
      warnings.push(missingCachedValueWarning(sheetName, row, 'qty'));
    }
    if (amountCell?.f && amount === null) {
      warnings.push(missingCachedValueWarning(sheetName, row, 'amount'));
    }

    dailySales.push({ date, totalSalesQty: qty, totalSalesAmount: amount });
  }

  for (const [detectedPeriod, excludedRowCount] of excludedPeriods) {
    warnings.push({
      code: 'out-of-period-date',
      sheetName,
      expectedPeriod: formatPeriod(targetPeriod),
      detectedPeriod,
      excludedRowCount,
    });
  }
  return dailySales;
}

export function parseExcelDate(cell, workbook = {}) {
  if (!cell || cell.v === undefined || cell.v === null || cell.v === '') return null;
  if (cell.v instanceof Date && !Number.isNaN(cell.v.getTime())) {
    return formatDateParts(cell.v.getUTCFullYear(), cell.v.getUTCMonth() + 1, cell.v.getUTCDate());
  }
  if (typeof cell.v !== 'number' || !Number.isFinite(cell.v)) return null;

  const date1904 = Boolean(workbook.Workbook?.WBProps?.date1904);
  const milliseconds = EXCEL_EPOCH_UTC + (cell.v + (date1904 ? 1462 : 0)) * 86400000;
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) return null;
  return formatDateParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Return a direct numeric value or a formula cell's cached numeric `v` value. */
export function getCachedNumericValue(cell) {
  if (!cell || cell.v === undefined || cell.v === null || cell.v === '') return null;
  if (typeof cell.v === 'number' && Number.isFinite(cell.v)) return cell.v;
  if (typeof cell.v === 'string' && cell.v.trim() !== '') {
    const number = Number(cell.v.replace(/,/g, ''));
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

export function validateDuplicateStoreCodes(stores) {
  const sheetsByCode = new Map();
  for (const store of stores) {
    if (!store.storeCode) continue;
    const sheetNames = sheetsByCode.get(store.storeCode) || [];
    sheetNames.push(store.sheetName);
    sheetsByCode.set(store.storeCode, sheetNames);
  }

  return [...sheetsByCode]
    .filter(([, sheetNames]) => sheetNames.length > 1)
    .map(([storeCode, sheetNames]) => ({
      code: 'duplicate-store-code',
      storeCode,
      sheets: sheetNames,
    }));
}

function missingCachedValueWarning(sheetName, row, field) {
  return { code: 'missing-cached-formula-value', sheetName, row: row + 1, field };
}

function normalizeHeader(value) {
  return typeof value === 'string'
    ? value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase()
    : '';
}

function findContainingMerge(merges = [], row, column) {
  return merges
    .map(normalizeRange)
    .find((range) =>
      row >= range.startRow && row <= range.endRow &&
      column >= range.startColumn && column <= range.endColumn
    );
}

function formatPeriod({ year, month }) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatDateParts(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function decodeRange(reference) {
  const [start, end = start] = String(reference || 'A1').split(':').map(decodeCell);
  return {
    startRow: start.row,
    startColumn: start.column,
    endRow: end.row,
    endColumn: end.column,
  };
}

function normalizeRange(range) {
  if (typeof range === 'string') return decodeRange(range);
  if (range?.s && range?.e) {
    return {
      startRow: range.s.r,
      startColumn: range.s.c,
      endRow: range.e.r,
      endColumn: range.e.c,
    };
  }
  return { startRow: 0, startColumn: 0, endRow: -1, endColumn: -1 };
}

function decodeCell(reference) {
  const match = String(reference).match(/^([A-Z]+)(\d+)$/i);
  if (!match) throw new Error(`Invalid cell reference: ${reference}`);
  let column = 0;
  for (const character of match[1].toUpperCase()) {
    column = column * 26 + character.charCodeAt(0) - 64;
  }
  return { row: Number(match[2]) - 1, column: column - 1 };
}

function encodeCell(row, column) {
  let letters = '';
  for (let value = column + 1; value > 0; value = Math.floor((value - 1) / 26)) {
    letters = String.fromCharCode(((value - 1) % 26) + 65) + letters;
  }
  return `${letters}${row + 1}`;
}
