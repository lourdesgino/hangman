# Family Hangman - Real-time Multiplayer Game

## Overview

Family Hangman is a real-time multiplayer word guessing game built for families and friends to play together online. The application allows users to create game rooms with simple 6-character codes, invite others to join, and play the classic hangman game with turn-based gameplay. The system features real-time communication via WebSockets, persistent game state management, and a mobile-friendly interface designed for accessibility across all devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, utilizing a component-based architecture that separates concerns into distinct UI components. The frontend uses Vite as the build tool and development server, with hot module replacement for efficient development. The application implements a single-page architecture using Wouter for lightweight client-side routing.

The UI is constructed using Shadcn/UI components built on top of Radix UI primitives, providing accessible and customizable interface elements. The design system is implemented through Tailwind CSS with a custom theme configuration that supports both light and dark modes through CSS custom properties.

State management follows a hybrid approach using React's built-in state management for component-level state and TanStack Query for server state management and caching. Real-time game state synchronization is handled through a custom WebSocket hook that manages connection lifecycle, automatic reconnection, and message broadcasting.

### Backend Architecture
The server is built using Express.js with TypeScript, implementing a RESTful API alongside WebSocket connections for real-time gameplay. The architecture follows a layered approach with clear separation between route handling, business logic, and data storage.

The WebSocket implementation manages real-time communication for game events including player joins, turn management, letter guessing, and game state updates. Connection management tracks active players and their associated game rooms, enabling targeted message broadcasting and room-based communication.

Game logic is centralized in the server to prevent cheating and ensure consistent state across all connected clients. Turn management, word validation, scoring, and game progression are all handled server-side with state updates pushed to clients via WebSocket messages.

### Data Storage Solutions
The application implements a flexible storage abstraction layer that supports both in-memory storage for development and PostgreSQL for production environments. The storage layer uses Drizzle ORM for type-safe database operations and schema management.

The database schema includes tables for game rooms, players, and game history, with proper foreign key relationships and indexing. Game state is stored in JSON columns for flexible data structures while maintaining relational integrity for core entities.

Session-based data is handled through the storage layer, with game rooms automatically cleaned up when empty and player connections managed through WebSocket lifecycle events.

### Authentication and Authorization Mechanisms
The application currently implements a simple session-based approach where players are identified by their connection and associated with game rooms through unique player IDs. No formal authentication system is implemented, allowing for quick access and family-friendly gameplay without registration barriers.

Room access is controlled through 6-character room codes that serve as simple access tokens. Players can create new rooms or join existing ones using these codes, with validation ensuring proper room state management.

### Real-time Communication System
WebSocket connections are established on the client side with automatic reconnection logic and exponential backoff for connection failures. The communication protocol uses structured JSON messages with type definitions shared between client and server.

Message routing is handled through a centralized message dispatcher that processes different message types including game state updates, player actions, error notifications, and room management events. The system implements room-based broadcasting to ensure messages are only sent to relevant participants.

Connection state is tracked per client with proper cleanup when players disconnect, ensuring game state remains consistent and other players are notified of departures.

## External Dependencies

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL database service providing the primary data storage
- **Drizzle ORM**: Type-safe ORM for database operations and schema management
- **Drizzle Kit**: CLI tool for database migrations and schema synchronization

### Frontend Libraries
- **React**: Core UI library for component-based interface development
- **Vite**: Build tool and development server with hot module replacement
- **TanStack Query**: Server state management and caching solution
- **Wouter**: Lightweight client-side routing library
- **Shadcn/UI**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Unstyled, accessible UI components for complex interactions

### Backend Infrastructure
- **Express.js**: Web framework for REST API and static file serving
- **WebSocket (ws)**: Real-time bidirectional communication library
- **Zod**: Runtime type validation for API requests and WebSocket messages

### Development Tools
- **TypeScript**: Static type checking for both client and server code
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing for Tailwind CSS integration

### Utility Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Component variant management for styled components
- **CLSX**: Conditional CSS class name utility
- **Nanoid**: Secure URL-friendly unique ID generator for sessions and entities

### Font Integration
- **Inter Font**: Primary typeface loaded from Google Fonts
- **Font Awesome**: Icon library for UI elements and visual indicators