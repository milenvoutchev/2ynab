# Architecture Overview

## Configuration Structure

All strategies load from either `config/2ynab.conf` (project-specific) or `config/bank2ynab/bank2ynab.conf` (third-party base).

### Key Configuration Sections

| Section | Source | Strategy | Pattern |
|---------|--------|----------|---------|
| [DE Deutsche Bank Credit Card] | bank2ynab.conf | DbCreditCardStrategy | `CreditCardTransactions\d{16}_\d{4}_\d{2}` |
| [DE Deutsche Bank] | bank2ynab.conf | DbDebitCardStrategy | `(Transactions\|Kontoumsaetze)_\d{3}_\d{9}_\d{8}_\d{6}` |
| [DE Deutsche Kreditbank credit card] | bank2ynab.conf | DkbCreditCardStrategy | `\d{4}_{8}\d{4}` |
| [DE Deutsche Kreditbank checking new] | bank2ynab.conf | DkbGirokonto2026Strategy | `\d{2}-\d{2}-\d{4}_Umsatzliste_` |
| [DE Deutsche Kreditbank checking] | bank2ynab.conf | DkbGirokontoStrategy | `^[0-9]{10}\.csv$` |
| [ePay microaccount] | 2ynab.conf | EpayMicroaccountStrategy | `epay_(microaccount\|movements)_` |

### Configuration Loading

All CSV strategies use **semantic column names** from `Input Columns`:
- **Date** - Transaction date
- **Payee** - Transaction counterparty
- **Memo** - Additional details
- **Inflow** - Money received
- **Outflow** - Money spent
- **skip** - Ignored columns

Example from `bank2ynab.conf`:
```
[DE Deutsche Kreditbank checking new]
Input Columns = skip,Date,skip,skip,Payee,Memo,skip,skip,Inflow,skip,skip,skip
Date Format = %d.%m.%y
```

## Strategy Architecture

### CsvStrategy Base Class
All CSV-based strategies extend `CsvStrategy` which provides the template method pattern:
1. Read CSV file
2. Parse with configured delimiter & header rows
3. Optional row filtering (e.g., zero-amount filtering)
4. Transform each row to YNAB format via `lineTransform()`
5. Write YNAB CSV output

Each strategy only implements:
- `isMatch(filename)` - Filename pattern matching
- `lineTransform(data)` - Row data transformation
- Constructor with `SETTINGS = loadCsvConfig(sectionName, configSource)`

### Strategy Implementations
- **DbCreditCardStrategy** - Deutsche Bank credit card (semantic names already used)
- **DbDebitCardStrategy** - Deutsche Bank debit card (supports Transactions & Kontoumsaetze formats)
- **DkbCreditCardStrategy** - Deutsche Kreditbank credit card CSV
- **DkbGirokontoStrategy** - Legacy DKB Girokonto (10-digit format)
- **DkbGirokonto2026Strategy** - New DKB format with enhanced column mapping
- **EpayMicroaccountStrategy** - Bulgarian ePay account statements
- **HanseticbankStrategy** - HanseaticBank JSON statements
- **HanseticbankPdfStrategy** - HanseaticBank PDF statements

## Benefits Achieved

✅ **50% Config Reduction** - `2ynab.conf` halved through DRY principle  
✅ **Single Source of Truth** - `bank2ynab.conf` authoritative; `2ynab.conf` only overrides  
✅ **Semantic Naming** - All strategies use consistent column names  
✅ **Code Reusability** - `CsvStrategy` template eliminates duplication  
✅ **Extensibility** - Add new banks by adding config sections  
✅ **Maintainability** - Changes propagate automatically through inheritance  

## Testing

✅ **70+ tests passing** covering:
- File pattern matching (all strategies)
- Date conversions (DD.MM.YY, DD.MM.YYYY HH:MM:SS, ISO)
- Amount parsing (German decimals, currency conversions, sign-based splits)
- Field mapping (payee, memo, category)
- Row filtering (unbooked, zero-amount)
- YNAB CSV format compliance

Run tests: `npm test`

