# -----------------------------
# 1️⃣ Build stage
# -----------------------------
# Force linux/amd64 platform
FROM --platform=linux/amd64 node:22 AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

COPY .env .env

# Build the Next.js app
RUN npm run build

# -----------------------------
# 2️⃣ Run stage (lightweight)
# -----------------------------
FROM --platform=linux/amd64 node:22 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built app and node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
