FROM node:23 AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json .
RUN npm run npm:install
COPY . .
RUN npm run production
RUN npm run npm:ci

FROM node:23
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package*.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "./dist/index.js", "8080"]
