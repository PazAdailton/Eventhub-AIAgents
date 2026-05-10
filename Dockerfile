FROM mcr.microsoft.com/playwright:v1.49.1-noble

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Note: playwright browsers are already included in the base image
RUN npm install

# Copy project files
COPY . .

# Set default command to run tests
CMD ["npx", "playwright", "test"]
