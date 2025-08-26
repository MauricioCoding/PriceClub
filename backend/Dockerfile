FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Temporary debug step: list files in the app directory to confirm they were copied
RUN ls -la

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/src ./src
COPY .env ./
EXPOSE 5001
CMD ["npm", "start"]
