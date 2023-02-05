FROM node:18-alpine

COPY src src/
COPY server.js server.js
COPY package.json package.json
COPY package-lock.json package-lock.json

EXPOSE 3000

RUN npm ci

CMD [ "node", "server.js", "DkbGirokontoStrategy"]