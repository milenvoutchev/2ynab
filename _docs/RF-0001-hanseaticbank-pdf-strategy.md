# Feature: HanseaticBank PDF Strategy

## Overview
Added `HanseticbankPdfStrategy` to convert HanseaticBank PDF statements (Kontoauszug) to YNAB format, complementing the existing JSON strategy.

## Implementation
- **Library**: `pdf-parse` v2 with `getTable()` for structured extraction
- **Row Detection**: Identifies transactions by 5-column format; skips headers/balance rows
- **Field Mapping**:
  - Column 0 → Date (Buchungsdatum)
  - Column 2 (split) → Payee & Memo
  - Column 3 → Card suffix (appended to Memo)
  - Column 4 → Amount (split into Inflow/Outflow)

## Changes
| File | Change |
|------|--------|
| `src/strategy/HanseticbankPdfStrategy.js` | New strategy |
| `package.json` | Added `pdf-parse ^2.4.5`; removed unused PDF libs; added `NODE_OPTIONS=--experimental-vm-modules` |
| `tests/HanseticbankPdfStrategy.test.js` | 12 unit & integration tests |

## Usage
```sh
node 2ynab.js Kontoauszug-GenialCard-2026-04_1234567890.pdf
node 2ynab.js file.pdf HanseticbankPdf
```

## Backward Compatibility
Existing JSON-based `HanseticbankStrategy` unchanged.

