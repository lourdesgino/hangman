# Synology NAS Deployment Guide

This guide provides multiple deployment options for Synology NAS systems that may have network restrictions.

## Option 1: Simplified Synology Build (Recommended)

```bash
# Use the simplified Dockerfile without additional dependencies
sudo docker-compose -f docker-compose.synology.yml build --no-cache app
sudo docker-compose -f docker-compose.synology.yml up -d
```

## Option 2: Pre-built Approach (If network issues persist)

If you're still having network connectivity issues during Docker build:

### Step 1: Build locally on your development machine
```bash
# On your local development machine (not NAS)
npm install
npm run build
```

### Step 2: Copy files to your NAS
```bash
# Copy the entire project including the built dist/ folder to your NAS
# Via File Station, scp, or rsync
```

### Step 3: Use pre-built Docker approach
```bash
# On your Synology NAS, create docker-compose.prebuilt.yml
```

## Option 3: Manual Docker Build (Advanced)

If you need more control over the build process:

```bash
# Build the Docker image manually with verbose output
sudo docker build -f Dockerfile.synology -t hangman-app --progress=plain .

# Run with docker-compose using the pre-built image
sudo docker-compose -f docker-compose.synology.yml up -d
```

## Troubleshooting Network Issues

### DNS Resolution Issues
```bash
# Add DNS servers to your build
sudo docker build -f Dockerfile.synology \
  --build-arg HTTP_PROXY=http://your-proxy:port \
  --build-arg HTTPS_PROXY=http://your-proxy:port \
  -t hangman-app .
```

### Corporate Network/Firewall
```bash
# If behind corporate firewall, you may need to:
# 1. Configure proxy settings in Docker
# 2. Use alternative npm registry
# 3. Build on a machine with internet access and transfer the image
```

## Verifying Deployment

```bash
# Check container status
sudo docker-compose -f docker-compose.synology.yml ps

# View logs
sudo docker-compose -f docker-compose.synology.yml logs -f app

# Test health endpoint
curl http://localhost:3000/health
```

## Performance Tips for Synology NAS

1. **Use SSD cache** if available for Docker volumes
2. **Allocate sufficient RAM** (minimum 2GB for the application)
3. **Enable Docker logging limits** to prevent disk space issues
4. **Regular maintenance**: `docker system prune` to clean up unused images