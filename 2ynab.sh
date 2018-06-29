#!/bin/bash

docker run -it --rm -v "$PWD":/usr/src/app -w /usr/src/app node:alpine node 2ynab.js
