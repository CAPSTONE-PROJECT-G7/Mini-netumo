FROM node:20-alpine
WORKDIR /app

COPY worker/package*.json ./

# replace npm ci → npm install so lock-file is optional
RUN npm install --omit=dev

COPY api/src/models models
COPY worker/src       src

CMD ["node", "src/index.js"]
