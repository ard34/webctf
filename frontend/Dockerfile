# Frontend Dockerfile (Vite dev server)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Expose Vite port
EXPOSE 5173

# Vite dev server binding to 0.0.0.0 for container access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]