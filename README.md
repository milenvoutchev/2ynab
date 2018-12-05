# 2ynab
Bank CSV to YNAB converter. 

Command-line tool to convert account transaction reports (.csv) to YNAB4 import-ready format (.csv). Currently supported statements are:
- Deutsche KreditBank (DKB) - Girokonto, credit card
- DeutscheBank (db) - Credit card

Based on Node.js®.

## Requirements
- A running Node.js environment (http://lmgtfy.com/?q=install+node)

## Installation
- Clone the script's repository in a local folder (http://lmgtfy.com/?q=clone+a+github+repository)

## Usage

To run the conversion tool:

```
$ node 2ynab.js [--in=]FILE [[--type=]TYPE]
```

Parameters:
- _[--in=]FILE_ (required) The transactions export as downloaded from the bank.
- _[--type=]TYPE_ (optional) The type of export/conversion to run. Must be any of:
 - DbCreditCard
 - DkbCreditCard
 - DkbGirokonto

For instance, to convert credit card transactions from DKB:

```
node 2ynab.js 1234________5678.csv DkbCreditCard
```

### Type auto-detect
If run without the `--type` parameter, the file name will be matched against saved patterns, in attempt to auto-detect the type.

```
$ node 2ynab.js 1234________5678.csv
Matched by filename: DkbCreditCardStrategy
[...]
Written: 1234________5678-YNAB.csv
```


Thats's it!
