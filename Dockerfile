FROM node:slim

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY dist ./
COPY credentials.json ./

ENTRYPOINT ["node", "index.js"]