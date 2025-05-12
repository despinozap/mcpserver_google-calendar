FROM node:slim

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY dist ./

ENTRYPOINT ["node", "index.js"]