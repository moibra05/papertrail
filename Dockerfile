# -----------------------------
# 1️⃣ Build stage
# -----------------------------
FROM node:current-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build the Next.js app
RUN npm run build

# -----------------------------
# 2️⃣ Run stage (lightweight)
# -----------------------------
FROM node:current-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js collects telemetry unless disabled
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built app and node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port 3000 (default for Next.js)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
