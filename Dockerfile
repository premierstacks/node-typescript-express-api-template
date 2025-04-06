FROM node:23 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm run npm:install
COPY ./ ./
RUN npm run production

FROM node:23
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
RUN npm run npm:ci
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "./dist/index.js", "8080"]
