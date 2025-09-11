# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --prefix server
RUN npm install --prefix client

# Copy source code
COPY . .

# Build applications
RUN npm run build --prefix server
RUN npm run build --prefix client

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start:prod", "--prefix", "server"]
