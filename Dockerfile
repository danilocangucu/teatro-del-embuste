FROM node:20.18.1-alpine

# Set working directory
WORKDIR /app

# Copy all source files (including prisma/schema.prisma) early
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the app in production mode
CMD ["npm", "start"]
