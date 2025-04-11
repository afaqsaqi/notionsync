# Build Stage
FROM node:23-alpine3.21 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production=false

COPY . .

RUN npm run build

# Production Stage
FROM node:23-alpine3.21 AS runner

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
