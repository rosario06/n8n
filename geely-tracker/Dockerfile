# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage - serve static files
FROM node:18-alpine

WORKDIR /app

# Install serve to run the static app
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy src for pgClient if needed at runtime
COPY package*.json ./
COPY src ./src

# Expose default Coolify-compatible port
EXPOSE 3000

# Default command - serve the built app (uses Coolify PORT if provided)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
