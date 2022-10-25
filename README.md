# 2ynab
Bank CSV to YNAB converter.

Command-line tool to convert account transaction reports (.csv) to YNAB4 import-ready format (.csv). The currently supported reports are:
- Deutsche KreditBank (DKB) - Girokonto (e.g. VPay), credit card (e.g. Visa)
- DeutscheBank (db) - Girokonto (e.g. Maestro card), credit card (e.g. MasterCard)
- Hanseaticbank - credit card (see below for how to get the transactions)

Based on Node.js®.

## Requirements
- A running Node.js environment (http://lmgtfy.com/?q=install+node)

## Installation
- Clone the script's repository in a local folder (http://lmgtfy.com/?q=clone+a+github+repository)

## Usage

To run the conversion tool:

```
$ node 2ynab.js FILE [TYPE]
```

Parameters:
- _[--in=]FILE_ (required) The transactions export as downloaded from the bank.
- _[--type=]TYPE_ (optional) The type of export/conversion to run. Must be any of:
  - DbDebitCard
  - DbCreditCard
  - DkbCreditCard
  - DkbGirokonto
  - HanseaticBank

For instance, to convert credit card transactions from DKB:

```
node 2ynab.js 1234________5678.csv

// or, if TYPE could not be automatically detected from the file name
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

### HanseaticBank
HanseaticBank does not provide any option to download the transaction list. Luckily, using the browser's Developer Tools (e.g. in Chrome, but similar in FF, Edge) we can save the resuls of the AJAX request, listing all the transactions. 

![image](https://user-images.githubusercontent.com/8949578/197753328-3adce229-1013-41a6-a06f-209ee59a37b3.png)

Find the request (it has the number of your account in the request URL) and save the results as .json. Then parse with 2ynab, like so:

```
$ node 2ynab.js hanseaticbank-or-so.json HanseaticBank
```

## Alternatives
If you've made it here, chances are you might be interested in conversion tools for your bank or YNAB. So why don't you also check out this useful tool: https://github.com/bank2ynab/bank2ynab
