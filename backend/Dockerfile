# Backend Dockerfile
FROM node:20-alpine

# Set workdir
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Expose backend port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]