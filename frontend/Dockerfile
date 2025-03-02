FROM node:20-slim

WORKDIR /app

# Install system dependencies and CA certificates
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create a .env file if it doesn't exist
RUN touch .env

# Add environment variables
ENV VITE_API_URL=http://backend:8000
ENV NODE_ENV=development
ENV HOST=0.0.0.0

# Expose ports (5173-5180)
EXPOSE 5173 5174 5175 5176 5177 5178 5179 5180

# Start the application with host flag
CMD ["npm", "run", "dev", "--", "--host"] 