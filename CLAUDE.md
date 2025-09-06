# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (both client and server)
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes using Drizzle
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate database migration files

## Docker Commands

- `docker-compose up -d` - Start the application with PostgreSQL database
- `docker-compose down` - Stop the application
- `docker-compose down -v` - Stop and remove all data (reset database)
- `docker-compose logs -f app` - View application logs
- `docker-compose logs -f db` - View database logs

## Architecture Overview

This is a real-time multiplayer hangman game with a client-server architecture, fully containerized with Docker:

### Frontend (`client/`)
- **React + TypeScript** with Vite build system
- **Shadcn/UI components** built on Radix UI primitives with Tailwind CSS
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **Custom WebSocket hook** (`client/src/hooks/use-websocket.tsx`) for real-time communication
- Game components located in `client/src/components/game/`

### Backend (`server/`)
- **Express.js** server with WebSocket support
- **Real-time game logic** in `server/routes.ts` using WebSocket connections
- **Storage abstraction** in `server/storage.ts` with PostgreSQL backend
- All game state management happens server-side to prevent cheating

### Shared (`shared/`)
- **Database schema** and types in `shared/schema.ts` using Drizzle ORM
- **WebSocket message types** for type-safe real-time communication

### Database
- **PostgreSQL 16** with Drizzle ORM for type-safe database operations
- Schema includes: game rooms, players, game history, and game rounds
- Runs in Docker container with persistent volume storage
- **Database connection**: Uses standard `pg` driver (removed Neon dependency)

## Key Technical Details

### Docker Configuration
- **Multi-stage build** for optimized production image
- **PostgreSQL sidecar** container with persistent storage
- **Health checks** for both application and database
- **Non-root user** for security in production container
- Application runs on port 5000 internally, exposed on port 3000

### WebSocket Communication
- Real-time game state synchronization via WebSocket messages
- Room-based broadcasting with unique 6-character room codes
- Message types: join_room, guess_letter, set_word, start_game, etc.
- Connection management with auto-reconnection and offline player handling

### Game Flow
1. Players create/join rooms using 6-character codes
2. Turn-based gameplay where one player sets word, other guesses
3. Server-side validation of all game actions
4. Real-time updates to all players in the room
5. Round progression with role switching between players

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### Development Environment
- Removed all Replit dependencies and configurations
- Health check endpoint at `/health`
- Production-ready with proper error handling and logging