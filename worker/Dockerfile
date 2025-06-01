FROM node:20-alpine
WORKDIR /worker
COPY package*.json ./
RUN npm ci --omit=dev
COPY src src
CMD ["node","src/index.js"]
