# Tests

## Run

```bash
npm test           # all tests
npm run test:watch # watch mode
npm run test:coverage # coverage
```

## Coverage

- **DkbGirokonto2026Strategy.js**: 100%
- **HanseticbankStrategy.js**: ~80%
- **EpayMicroaccountStrategy.js**: ~85%
- **DkbGirokontoStrategy.js**: 80%+

## Test Breakdown (43 Tests)

| Strategy | isMatch | Transform | Convert | Total |
|----------|---------|-----------|---------|-------|
| DkbGirokonto2026Strategy | 5 | 6 | 3 | 14 |
| DkbGirokontoStrategy | 4 | - | - | 4 |
| HanseticbankStrategy | 2 | 6 | 1 | 9 |
| EpayMicroaccountStrategy | 3 | 8 | 1 | 12 |
| Pattern Separation | - | - | 2 | 2 |

## Key Tests

✓ Pattern matching (all strategies)
✓ Date conversion (multiple formats)
✓ Amount formatting (decimal parsing, empty cells)
✓ Inflow/outflow splitting by sign
✓ Field mapping accuracy
✓ Transaction filtering (unbooked, zero-amount)
✓ Currency conversion (BGN → EUR)
✓ No strategy overlap

