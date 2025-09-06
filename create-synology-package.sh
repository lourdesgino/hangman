#!/bin/bash

# Synology NAS Deployment Script
# This script prepares a complete deployment package for NAS systems with network issues

echo "🚀 Preparing Hangman Game deployment package for Synology NAS..."

# Build the application locally
echo "📦 Building application..."
npm run build

# Create deployment directory
echo "📁 Creating deployment package..."
mkdir -p synology-deploy
cp docker-compose.prebuilt.yml synology-deploy/docker-compose.yml
cp Dockerfile.prebuilt synology-deploy/Dockerfile
cp init-db.sql synology-deploy/
cp package*.json synology-deploy/
cp -r dist synology-deploy/
cp -r shared synology-deploy/
cp -r node_modules synology-deploy/

# Create deployment instructions
cat > synology-deploy/DEPLOY.md << 'EOF'
# Synology NAS Deployment Instructions

## Prerequisites
- Docker and Docker Compose installed on your Synology NAS
- SSH access to your NAS

## Deployment Steps

1. **Upload this entire `synology-deploy` folder to your NAS**
   - Via File Station, scp, or any preferred method
   - Place it in a directory like `/volume1/docker/hangman/`

2. **SSH into your NAS and navigate to the folder**
   ```bash
   ssh admin@your-nas-ip
   cd /volume1/docker/hangman/synology-deploy
   ```

3. **Start the application**
   ```bash
   sudo docker-compose up -d
   ```

4. **Verify deployment**
   ```bash
   # Check containers are running
   sudo docker-compose ps
   
   # Check logs
   sudo docker-compose logs -f app
   
   # Test the application
   curl http://localhost:3000/health
   ```

5. **Access your game**
   - Open browser to: `http://your-nas-ip:3000`
   - Create a room and start playing!

## Troubleshooting

If you encounter issues:

1. **Check Docker logs:**
   ```bash
   sudo docker-compose logs -f
   ```

2. **Restart containers:**
   ```bash
   sudo docker-compose down
   sudo docker-compose up -d
   ```

3. **Reset everything:**
   ```bash
   sudo docker-compose down -v
   sudo docker-compose up -d
   ```

## File Structure
```
synology-deploy/
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Container definition (pre-built)
├── init-db.sql         # Database initialization
├── package*.json       # Node.js dependencies
├── dist/               # Pre-built application
├── shared/             # Shared code
└── DEPLOY.md           # This file
```
EOF

echo "✅ Deployment package created in ./synology-deploy/"
echo ""
echo "📋 Next steps:"
echo "1. Copy the './synology-deploy' folder to your Synology NAS"
echo "2. SSH into your NAS and run: sudo docker-compose up -d"
echo "3. Access the game at: http://your-nas-ip:3000"
echo ""
echo "📖 See ./synology-deploy/DEPLOY.md for detailed instructions"