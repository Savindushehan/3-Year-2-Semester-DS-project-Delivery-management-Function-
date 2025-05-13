# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for root directory
COPY package*.json ./

# Install dependencies for root directory
RUN npm install

# Copy package files for client directory
COPY client/package*.json ./client/

# Install dependencies for client directory
WORKDIR /app/client
RUN npm install

# Copy the rest of the application
WORKDIR /app
COPY . .

# Set working directory to client for running the app
WORKDIR /app/client

# Expose the port your Vite/React app runs on
EXPOSE 5173

# Start the application in development mode
CMD ["npm", "run", "dev", "--", "--host"]