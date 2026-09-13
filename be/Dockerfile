# ==========================================
# STAGE 1: SETUP
# ==========================================
FROM node:20-alpine AS base
ENV NODE_ENV=development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ==========================================
# STAGE 2: BUILDER
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=base /app /app
RUN npm run build

# ==========================================
# STAGE 3: RUNNER
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