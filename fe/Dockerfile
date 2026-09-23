FROM node:20-alpine AS base
ENV NODE_ENV=development
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

FROM node:20-alpine AS builer
WORKDIR /app
COPY --from=base /app /app
RUN npm run build

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