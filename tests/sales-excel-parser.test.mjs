import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  findSaleTotalColumns,
  getCachedNumericValue,
  parseSalesWorkbookData,
} from '../js/modules/sales-excel-parser.js';

const excelFile = readdirSync(new URL('../data/', import.meta.url))
  .find((name) => name.endsWith('.xlsx'));
const workbook = JSON.parse(execFileSync(
  'python3',
  [fileURLToPath(new URL('./extract-sales-workbook.py', import.meta.url)),
    fileURLToPath(new URL(`../data/${excelFile}`, import.meta.url))],
  { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
));
const result = parseSalesWorkbookData(workbook, excelFile);

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
