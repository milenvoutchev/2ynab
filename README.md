# 2ynab
Bank CSV to YNAB converter.

Command-line tool to convert account transaction reports (.csv) to YNAB4 import-ready format (.csv). The currently supported reports are:
- Deutsche KreditBank (DKB) - Girokonto (e.g. VPay), credit card (e.g. Visa)
- DeutscheBank (db) - Girokonto (e.g. Maestro card), credit card (e.g. MasterCard)

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
 - DbDebitCard
 - DbCreditCard
 - DkbCreditCard
 - DkbGirokonto

For instance, to convert credit card transactions from DKB:

```
node 2ynab.js 1234________5678.csv DkbCreditCard
```

### Type auto-detect
The script could try to detect the type of conversion, based on the filename. When run without the `--type` parameter, the file name will be matched against hard-coded patterns.

```
$ node 2ynab.js 1234________5678.csv
Matched by filename: DkbCreditCardStrategy
[...]
Written: 1234________5678-YNAB.csv
```


Thats's it!


---- 

## Alternatives
If you've made it here, chances are you might be interested in conversion tools for your bank or YNAB. So why don't you also check out this useful tool: https://github.com/bank2ynab/bank2ynab
