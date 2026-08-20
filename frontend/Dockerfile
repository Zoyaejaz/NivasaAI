FROM node:20-alpine

WORKDIR /app

# Copy package config
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build Next.js project
RUN npm run build

EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
