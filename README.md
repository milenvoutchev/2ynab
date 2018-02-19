# db/dkb 2ynab
DeutscheBank to YNAB CSV converter

## Purpose
A tool to convert bank statements from bank CSV format into that required for importing into YNAB4. Currently supported statements are:
- Deutsche KreditBank (DKB) - Credit Card transactions
- DeutscheBank (DB) - Credit Card transactions

Based on Node.js®.

## Requirements
- A running Node.js environment (http://lmgtfy.com/?q=install+node)

## Installation
- Clone the script's repository in a local folder (http://lmgtfy.com/?q=clone+a+github+repository)

## Usage

Convert statement CSV downloaded from "meine.deutsche-bank.de" into YNAB importable format.

```$ node db2ynab.js [--in=]<FILE> [--type=]<DbCreditCard|DkbCreditCard>```

Parameters:
- [--in=]<FILE> The transactions list as downloaded from the bank
- [--type=]<DbCreditCard|DkbCreditCard> Must be any of "DbCreditCard", "DkbCreditCard" depending on the type of statement.

For instace, to convert credit card transactions from DKB:

```
node db2ynab.js 1234________5678.csv DkbCreditCard
```

Thats's it!
