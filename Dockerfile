# Step 1: Use the official Node.js image
FROM node:20-slim

# Step 2: Install dependencies for Puppeteer/Chrome
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Step 3: Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Step 4: Create app directory
WORKDIR /usr/src/app

# Step 5: Copy package files and install
COPY package*.json ./
RUN npm install --only=production

# Step 6: Copy the rest of your code
COPY . .

# Step 7: Expose the port (Render uses 10000 by default)
EXPOSE 10000

# Step 8: Start the app
CMD [ "node", "index.js" ]