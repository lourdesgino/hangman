# Ultra-simple Dockerfile for Synology NAS with network issues
# This approach builds locally first, then just copies everything

FROM node:20-alpine AS production

WORKDIR /app

# Copy everything pre-built (including node_modules)
COPY package*.json ./
COPY dist ./dist
COPY shared ./shared
COPY node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hangman -u 1001 -G nodejs && \
    chown -R hangman:nodejs /app

USER hangman

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 5000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      res.statusCode === 200 ? process.exit(0) : process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start the application
CMD ["npm", "start"]