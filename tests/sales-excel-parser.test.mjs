import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  detectWorkbookPeriod,
  findSaleTotalColumns,
  getCachedNumericValue,
  parseSalesWorkbookData,
} from '../js/modules/sales-excel-parser.js';
import { calculateTotalSales, rankStores } from '../js/modules/sales-data.js';

const excelFile = readdirSync(new URL('../data/', import.meta.url))
  .find((name) => name.endsWith('.xlsx'));
const workbook = JSON.parse(execFileSync(
  'python3',
  [fileURLToPath(new URL('./extract-sales-workbook.py', import.meta.url)),
    fileURLToPath(new URL(`../data/${excelFile}`, import.meta.url))],
  { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
));
const result = parseSalesWorkbookData(workbook, excelFile);
const sheets = workbook.SheetNames.map((sheetName) => ({
  sheetName,
  worksheet: workbook.Sheets[sheetName],
}));

test('prioritizes abbreviated or full English month names in filenames', () => {
  assert.deepEqual(
    detectWorkbookPeriod(
      '08 .แบบฟอร์มรายงานยอดขาย ร้าน Onitsuka 09 สาขา Aug 2026.xlsx',
      sheets,
      workbook
    ),
    { year: 2026, month: 8 }
  );
  assert.deepEqual(
    detectWorkbookPeriod('09-2026 report July 2026.xlsx', sheets, workbook),
    { year: 2026, month: 7 }
  );
  assert.deepEqual(
    detectWorkbookPeriod('03_March 2026 sales.xlsx', sheets, workbook),
    { year: 2026, month: 3 }
  );
});

test('uses only adjacent numeric year/month pairs before falling back to sale dates', () => {
  assert.deepEqual(
    detectWorkbookPeriod('sales 2026-07.xlsx', sheets, workbook),
    { year: 2026, month: 7 }
  );
  assert.deepEqual(
    detectWorkbookPeriod('09 สาขา sales report 2026.xlsx', sheets, workbook),
    { year: 2026, month: 3 }
  );
});

test('parses every non-empty store sheet and detects March 2026', () => {
  assert.equal(result.workbookPeriod, '2026-03');
  assert.equal(result.currency, 'THB');
  assert.equal(result.stores.length, 11);
  assert.equal(result.stores.some((store) => store.sheetName === 'Sheet1'), false);
});

test('finds Sale Total Qty and Amount from headers on every store sheet', () => {
  for (const store of result.stores) {
    const columns = findSaleTotalColumns(workbook.Sheets[store.sheetName]);
    assert.deepEqual(
      { qtyColumn: columns.qtyColumn, amountColumn: columns.amountColumn },
      { qtyColumn: 16, amountColumn: 17 },
      store.sheetName
    );
  }
});

test('extracts store identity, daily rows and monthly totals', () => {
  const iconSiam = result.stores.find((store) => store.sheetName === 'Icon Siam');
  assert.equal(iconSiam.storeCode, '00008');
  assert.equal(iconSiam.dailySales.length, 31);
  assert.equal(iconSiam.dailySales[0].date, '2026-03-01');
  assert.equal(iconSiam.dailySales[0].totalSalesQty, 49);
  assert.equal(iconSiam.dailySales[0].totalSalesAmount, 410750);
  assert.equal(
    iconSiam.monthlyTotalSales,
    iconSiam.dailySales.reduce((sum, day) => sum + (day.totalSalesAmount ?? 0), 0)
  );
});

test('uses cached formula values and also accepts direct numeric values', () => {
  const formulaCell = workbook.Sheets['Icon Siam'].R7;
  const directCell = workbook.Sheets['Central Ladprao'].R7;
  assert.ok(formulaCell.f);
  assert.equal(getCachedNumericValue(formulaCell), formulaCell.v);
  assert.equal(directCell.f, undefined);
  assert.equal(getCachedNumericValue(directCell), directCell.v);
});

test('excludes Fashion Island out-of-period rows and reports them', () => {
  const fashionIsland = result.stores.find((store) => store.sheetName === 'Fashion Island');
  assert.equal(fashionIsland.storeCode, '00001');
  assert.equal(fashionIsland.dailySales.length, 0);
  assert.equal(fashionIsland.monthlyTotalSales, 0);
  assert.deepEqual(fashionIsland.warnings, [{
    code: 'out-of-period-date',
    sheetName: 'Fashion Island',
    expectedPeriod: '2026-03',
    detectedPeriod: '2025-12',
    excludedRowCount: 31,
  }]);
});

test('warns about duplicate store codes without dropping either store', () => {
  assert.deepEqual(result.warnings, [{
    code: 'duplicate-store-code',
    storeCode: '00008',
    sheets: ['Icon Siam', 'Central Westgate'],
  }]);
});

test('calculates dashboard total and ranks every store by monthly sales', () => {
  assert.equal(calculateTotalSales(result.stores), 40245450);
  assert.deepEqual(
    rankStores(result.stores).map((store) => [store.storeName, store.monthlyTotalSales]),
    [
      ['Icon Siam', 11490700],
      ['Central World', 8066500],
      ['Central Phuket', 5020550],
      ['Terminal 21 Asoke', 4342990],
      ['Central Pattaya', 3028850],
      ['Mega Bangna', 2981560],
      ['Central Ladprao', 2734400],
      ['Terminal 21 Pattaya', 2579900],
      ['Central park', 0],
      ['Central Westgate', 0],
      ['Fashion Island', 0],
    ]
  );
});
