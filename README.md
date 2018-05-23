# 2ynab
Bank CSV to YNAB converter. Supports DeutscheBank (db), Deutsche KreditBank (DKB).

## Purpose
A command-line tool to convert account transaction reports (.csv) to YNAB4 import-ready format (.csv). Currently supported statements are:
- Deutsche KreditBank (DKB) - Credit Card transactions
- DeutscheBank (db) - Credit Card transactions

Based on Node.js®.

## Requirements
- A running Node.js environment (http://lmgtfy.com/?q=install+node)

## Installation
- Clone the script's repository in a local folder (http://lmgtfy.com/?q=clone+a+github+repository)

## Usage

To run the conversion tool:

```
$ node db2ynab.js [--in=]<FILE> [--type=]<DbCreditCard|DkbCreditCard>
```

Parameters:
- [--in=]<FILE> The transactions list as downloaded from the bank
- [--type=]<DbCreditCard|DkbCreditCard> Must be any of "DbCreditCard", "DkbCreditCard" depending on the type of statement.

For instance, to convert credit card transactions from DKB:

```
node db2ynab.js 1234________5678.csv DkbCreditCard
```

Thats's it!
