# 🎯 Hangman: Multiplayer Word Challenge

<div align="center">

**A modern, real-time multiplayer hangman game that brings the classic word-guessing experience to the digital age!**

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

*Play from anywhere, with anyone, in real-time! 🌍*

</div>

---

## ✨ Features That Make It Special

### 🚀 **Real-Time Multiplayer Experience**
- **WebSocket-powered** instant gameplay - no page refreshes!
- **Turn-based mechanics** with automatic role switching
- **Live game state sync** across all connected players
- **Connection recovery** - rejoin games seamlessly

### 🎮 **Intuitive Game Design**
- **6-character room codes** for easy sharing
- **Beautiful hangman drawings** with SVG stick figures
- **Smart difficulty system** - from impossible (0 mistakes) to forgiving (9 mistakes)
- **Room creator controls** - only the host sets difficulty and starts games

### 🏆 **Advanced Scoring & Competition**
- **Win-rate based tie-breaking** - not just raw scores!
- **Draw detection** when players perform equally well
- **Round-by-round statistics** with detailed win percentages
- **Complete game history** tracking

### 🎨 **Modern User Experience**
- **Responsive design** - perfect on desktop, tablet, and mobile
- **Dark/light theme support** via Tailwind CSS
- **Smooth animations** and micro-interactions
- **Accessibility-first** component design with Radix UI

### 🔧 **Production-Ready Architecture**
- **Fully containerized** with Docker Compose
- **Multi-stage builds** for optimized production images
- **Health checks** and auto-restart capabilities
- **PostgreSQL persistence** with automatic backups

---

## 🎯 How to Play

### **Creating a Game**
1. **Enter your name** and click "Create New Room"
2. **Set the difficulty** using the smart slider (0-9 wrong guesses allowed)
3. **Share the 6-character room code** with your friend
4. **Start the game** when both players are ready!

### **Game Flow**
1. 🏷️ **Word Setting Phase**: One player sets a secret word and optional hint
2. 🔤 **Guessing Phase**: The other player guesses letters one by one
3. 🎨 **Visual Feedback**: Watch the hangman drawing appear with each wrong guess
4. 🏆 **Round Results**: See who won and switch roles for the next round
5. 🔄 **Continue Playing**: Keep going as long as you want, or end when ready

### **Winning Strategies**
- **As Word Setter**: Choose challenging but fair words, provide helpful hints
- **As Guesser**: Start with common vowels (A, E, I, O, U) and frequent consonants (R, S, T, L, N)
- **Advanced**: Consider word length, category clues, and letter frequency patterns

---

## 🚀 Quick Start (Docker - Recommended)

### **Prerequisites**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- 2GB+ free disk space
- Any modern web browser

### **1-Minute Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/hangman-game.git
cd hangman-game

# Start the application (pulls images automatically)
docker compose up -d

# 🎉 Game is now running at http://localhost:3000
```

### **Managing the Application**
```bash
# View logs
docker compose logs -f app

# Stop the application
docker compose down

# Complete reset (removes all game data)
docker compose down -v && docker compose up -d

# Update to latest version
git pull && docker compose build --no-cache && docker compose up -d
```

---

## 🛠️ Development Setup

Perfect for contributors and those who want to customize the game!

### **Local Development**
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database settings

# Start PostgreSQL (using Docker)
docker run --name hangman-dev-db \
  -e POSTGRES_USER=hangman \
  -e POSTGRES_PASSWORD=hangman_password \
  -e POSTGRES_DB=hangman_db \
  -p 5432:5432 -d postgres:16-alpine

# Initialize database
npm run db:push

# Start development server with hot reload
npm run dev
```

### **Available Commands**
| Command | Description |
|---------|-------------|
| `npm run dev` | 🔥 Development server with hot reload |
| `npm run build` | 📦 Production build (client + server) |
| `npm run start` | 🚀 Start production server |
| `npm run check` | ✅ TypeScript type checking |
| `npm run db:push` | 📊 Push database schema changes |
| `npm run db:migrate` | 🔄 Run database migrations |
| `npm run db:generate` | 📝 Generate migration files |

---

## 🌐 Deployment Guide

### **🏠 Home Server / NAS Deployment**

**Synology NAS:**
```bash
# SSH into your NAS
ssh admin@your-nas-ip

# Create project directory
sudo mkdir -p /volume1/docker/hangman
cd /volume1/docker/hangman

# Upload files via File Station or git clone
git clone https://github.com/yourusername/hangman-game.git .

# Start the application
sudo docker compose up -d

# Access at http://your-nas-ip:3000
```

**Generic Linux Server:**
```bash
# Works on Ubuntu, Debian, CentOS, etc.
git clone https://github.com/yourusername/hangman-game.git
cd hangman-game
docker compose up -d

# Optional: Set up reverse proxy with nginx
# Game will be available at http://your-server-ip:3000
```

### **☁️ Cloud Deployment**

**DigitalOcean Droplet:**
```bash
# Create $5/month droplet with Docker
doctl compute droplet create hangman-game \
  --image docker-20-04 \
  --size s-1vcpu-1gb \
  --region nyc1

# SSH and deploy
git clone https://github.com/yourusername/hangman-game.git
cd hangman-game
docker compose up -d
```

**AWS EC2 / Google Cloud:**
- Use t2.micro (AWS) or e2-micro (GCP) instances
- Install Docker and Docker Compose
- Clone repo and run `docker compose up -d`
- Configure security groups to allow port 3000

### **🚀 Production Considerations**

**Environment Variables:**
```bash
# docker-compose.override.yml
version: '3.8'
services:
  app:
    environment:
      - NODE_ENV=production
      - PORT=5000
    restart: always
```

**SSL/HTTPS Setup:**
```bash
# Add nginx reverse proxy
# Use Let's Encrypt for free SSL certificates
# Configure firewall rules (ufw, iptables)
```

**Monitoring:**
```bash
# Check application health
curl http://localhost:3000/health

# Monitor logs
docker compose logs -f --tail=100 app

# Database backups
docker exec hangman-db-1 pg_dump -U hangman hangman_db > backup.sql
```

---

## 🏗️ Technical Architecture

### **🎯 System Overview**
```
┌─────────────────┐    WebSocket    ┌──────────────────┐    SQL     ┌──────────────┐
│   React Client  │ ←──────────────→ │   Node.js Server │ ←─────────→ │ PostgreSQL   │
│   (Frontend)    │                 │   (Backend)      │            │ (Database)   │
└─────────────────┘                 └──────────────────┘            └──────────────┘
```

### **🧱 Technology Stack**

**Frontend Excellence:**
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development and builds
- **Tailwind CSS** + **Shadcn/UI** for beautiful, accessible components
- **TanStack Query** for intelligent server state management
- **Wouter** for lightweight client-side routing

**Backend Power:**
- **Express.js** with full TypeScript support
- **Native WebSockets** for real-time communication
- **Drizzle ORM** for type-safe database operations
- **Zod** schemas for runtime data validation

**Database & DevOps:**
- **PostgreSQL 16** with optimized queries and indexing
- **Docker Compose** for consistent development and deployment
- **Multi-stage builds** for production optimization
- **Health checks** and automatic restarts

### **📁 Project Structure**
```
hangman-game/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route components
│   │   └── lib/           # Utilities and helpers
│   └── index.html
├── server/                 # Node.js backend
│   ├── index.ts           # Application entry point
│   ├── routes.ts          # WebSocket event handlers
│   ├── storage.ts         # Database abstraction layer
│   └── vite.ts           # Development server integration
├── shared/                 # Shared code between client/server
│   └── schema.ts          # Database schema & TypeScript types
├── docker-compose.yml      # Multi-container orchestration
├── Dockerfile             # Production container definition
└── init-db.sql           # Database initialization
```

---

## 🎮 Game Features Deep Dive

### **🎯 Smart Difficulty System**
- **Granular Control**: 0-9 incorrect guesses allowed
- **Visual Feedback**: Difficulty labels from "Very Hard" to "Very Easy"  
- **Room Creator Authority**: Only the person who creates the room sets difficulty
- **Consistent Experience**: Difficulty applies to all rounds in a game

### **🏆 Advanced Scoring Algorithm**
```typescript
// Win-rate based tie-breaking
const winRate = (wins as guesser) / (total rounds as guesser)

// If scores are tied:
// 1. Compare win rates
// 2. If win rates are equal → DRAW
// 3. Otherwise → Higher win rate wins
```

### **🔄 Real-Time Game State Management**
- **Optimistic Updates**: Instant UI feedback
- **Conflict Resolution**: Server authority for game state
- **Connection Recovery**: Automatic reconnection with state sync
- **Offline Handling**: Graceful degradation when players disconnect

### **📊 Comprehensive Statistics**
- Points earned per round
- Win/loss record as both word-setter and guesser
- Win percentage calculations
- Historical game data persistence

---

## 🔧 Configuration & Customization

### **Environment Variables**
```bash
# Application Settings
NODE_ENV=production              # Environment mode
PORT=5000                       # Internal server port

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:port/db

# Optional: Custom Settings
MAX_ROOM_CODE_LENGTH=6          # Room code length
DEFAULT_MAX_GUESSES=6           # Default difficulty
WEBSOCKET_HEARTBEAT_INTERVAL=30000  # Connection keepalive
```

### **Customizing Game Rules**
```typescript
// server/routes.ts - Modify game constants
const ROOM_CODE_LENGTH = 6;
const DEFAULT_MAX_GUESSES = 6;
const MAX_PLAYERS_PER_ROOM = 2;

// Extend difficulty range
const MIN_DIFFICULTY = 0;  // Very Hard
const MAX_DIFFICULTY = 12; // Ultra Easy
```

### **Styling Customization**
```css
/* tailwind.config.ts - Custom theme */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-brand-color',
        secondary: '#your-accent-color'
      }
    }
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### **Development Workflow**
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/yourusername/hangman-game.git

# Create a feature branch
git checkout -b feature/amazing-new-feature

# Make your changes
# Test thoroughly
npm run check  # Type checking
npm run build  # Production build test

# Commit with clear messages
git commit -m "Add amazing new feature"

# Push and create a Pull Request
git push origin feature/amazing-new-feature
```

### **Contribution Ideas**
- 🎨 **UI/UX Improvements**: New themes, animations, mobile optimizations
- 🎮 **Game Features**: Tournament mode, spectator view, custom word lists
- 🔧 **Technical Enhancements**: Performance optimizations, testing, CI/CD
- 📱 **Platform Support**: PWA features, mobile apps, desktop apps
- 🌐 **Internationalization**: Multi-language support

### **Code Standards**
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Component-driven architecture
- Comprehensive error handling
- Security-first mindset

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Drizzle ORM** for excellent TypeScript database integration
- **Docker** for making deployment universally simple
- **The Open Source Community** for inspiration and tools

---

<div align="center">

**Built with ❤️ for word game enthusiasts everywhere**

[Report Bug](https://github.com/yourusername/hangman-game/issues) • [Request Feature](https://github.com/yourusername/hangman-game/issues) • [Contribute](https://github.com/yourusername/hangman-game/pulls)

*Made with TypeScript, React, Node.js, and lots of coffee ☕*

</div>