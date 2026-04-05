# Multi-stage build for NestJS Backend
FROM node:20 AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# =====================
FROM node:20 AS prod-deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# =====================
FROM node:20 AS build

WORKDIR /app

# Copy dependencies from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# =====================
FROM node:20 AS runtime

WORKDIR /app

# Install all dependencies (bcrypt needs native bindings from dev deps)
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY package*.json ./

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
