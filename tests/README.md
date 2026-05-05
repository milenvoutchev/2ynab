# Tests

## Run

```bash
npm test           # all tests
npm run test:watch # watch mode
npm run test:coverage # coverage
```

## Coverage

- **DkbGirokontoStrategy_2026.js**: 100% (20 tests pass)
- **DkbGirokontoStrategy.js**: 80%+

## What's Tested

| Test | Coverage |
|------|----------|
| Pattern matching (2026 vs legacy format) | 5 tests |
| Date conversion `DD.MM.YY` → `DD/MM/YY` | 6 tests |
| Amount formatting (inflow/outflow split) | 3 tests |
| Zero-amount row filtering | 1 test |
| Strategy separation (no overlap) | 2 tests |
| Legacy backward compatibility | 3 tests |

## Key Validations

- ✓ German decimal format: `1.234,56` → `1234.56`
- ✓ Empty cells (not `0`) for zero amounts
- ✓ Correct field mapping (payee, memo, date)
- ✓ Header: `Date,Payee,Category,Memo,Outflow,Inflow`

