# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: RUNNER
# ==========================================
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]