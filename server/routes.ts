import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertGameRoomSchema, insertPlayerSchema, insertGameHistorySchema, type WebSocketMessage, type GameState } from "@shared/schema";
import { z } from "zod";

// Word categories and lists
const WORD_CATEGORIES = {
  "Family & Relationships": ["FAMILY", "MOTHER", "FATHER", "SISTER", "BROTHER", "COUSIN", "GRANDMA", "GRANDPA", "UNCLE", "AUNT"],
  "Animals": ["ELEPHANT", "GIRAFFE", "PENGUIN", "DOLPHIN", "BUTTERFLY", "KANGAROO", "OCTOPUS", "HAMSTER"],
  "Food & Cooking": ["PIZZA", "BURGER", "SANDWICH", "CHOCOLATE", "STRAWBERRY", "BANANA", "APPLE", "ORANGE"],
  "Sports & Games": ["FOOTBALL", "BASKETBALL", "TENNIS", "SWIMMING", "CYCLING", "BASEBALL", "SOCCER"],
  "Travel & Places": ["MOUNTAIN", "OCEAN", "DESERT", "FOREST", "CITY", "VILLAGE", "AIRPORT", "HOTEL"]
};

interface ClientConnection {
  ws: WebSocket;
  playerId?: string;
  roomCode?: string;
}

const clients = new Map<string, ClientConnection>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomWord(): { word: string; category: string } {
  const categories = Object.keys(WORD_CATEGORIES);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const words = WORD_CATEGORIES[category as keyof typeof WORD_CATEGORIES];
  const word = words[Math.floor(Math.random() * words.length)];
  return { word, category };
}

function broadcastToRoom(roomCode: string, message: WebSocketMessage, excludeClientId?: string) {
  clients.forEach((client, clientId) => {
    if (client.roomCode === roomCode && clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function getNextPlayer(players: any[], currentPlayerId: string): string {
  const currentIndex = players.findIndex(p => p.id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex].id;
}

async function checkGameEnd(roomCode: string): Promise<{ gameEnded: boolean; winner?: string; reason?: string }> {
  const gameState = await storage.getGameState(roomCode);
  if (!gameState) return { gameEnded: false };

  const { room, players } = gameState;
  const currentWord = room.currentWord || '';
  const guessedLetters = room.guessedLetters || [];
  
  // Check if word is completely guessed
  const isWordComplete = currentWord.split('').every(letter => 
    guessedLetters.includes(letter.toUpperCase())
  );
  
  if (isWordComplete) {
    // Current player wins
    const currentPlayer = players.find(p => p.id === room.currentTurn);
    if (currentPlayer) {
      await storage.updatePlayer(currentPlayer.id, { score: (currentPlayer.score || 0) + 1 });
    }
    await storage.updateGameRoom(room.id, { 
      gameStatus: "finished",
      winner: room.currentTurn || undefined
    });
    return { gameEnded: true, winner: currentPlayer?.name, reason: "word_guessed" };
  }
  
  // Check if max wrong guesses reached
  if ((room.wrongGuesses || 0) >= (room.maxGuesses || 6)) {
    await storage.updateGameRoom(room.id, { 
      gameStatus: "finished"
    });
    return { gameEnded: true, reason: "max_guesses_reached" };
  }
  
  return { gameEnded: false };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const clientId = Math.random().toString(36).substring(7);
    clients.set(clientId, { ws });

    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        const client = clients.get(clientId);
        
        if (!client) return;

        switch (message.type) {
          case 'join_room': {
            const { roomCode, playerName, isCreating } = message.payload;
            
            if (isCreating) {
              // Create new room
              const newRoomCode = generateRoomCode();
              const room = await storage.createGameRoom({
                roomCode: newRoomCode,
                gameStatus: "waiting",
                guessedLetters: [],
                wrongGuesses: 0,
                maxGuesses: 6
              });
              
              const player = await storage.createPlayer({
                roomId: room.id,
                name: playerName,
                score: 0,
                isReady: true
              });
              
              client.playerId = player.id;
              client.roomCode = newRoomCode;
              
              ws.send(JSON.stringify({
                type: 'game_state_update',
                payload: await storage.getGameState(newRoomCode)
              }));
            } else {
              // Join existing room
              const gameState = await storage.getGameState(roomCode);
              if (!gameState) {
                ws.send(JSON.stringify({
                  type: 'error',
                  payload: { message: 'Room not found' }
                }));
                return;
              }
              
              if (gameState.players.length >= 2) {
                ws.send(JSON.stringify({
                  type: 'error',
                  payload: { message: 'Room is full' }
                }));
                return;
              }
              
              const player = await storage.createPlayer({
                roomId: gameState.room.id,
                name: playerName,
                score: 0,
                isReady: true
              });
              
              client.playerId = player.id;
              client.roomCode = roomCode;
              
              // Broadcast to all clients in room
              const updatedGameState = await storage.getGameState(roomCode);
              broadcastToRoom(roomCode, {
                type: 'game_state_update',
                payload: updatedGameState
              });
              
              ws.send(JSON.stringify({
                type: 'game_state_update',
                payload: updatedGameState
              }));
            }
            break;
          }

          case 'start_game': {
            if (!client.roomCode) return;
            
            const gameState = await storage.getGameState(client.roomCode);
            if (!gameState || gameState.players.length < 2) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Need 2 players to start' }
              }));
              return;
            }
            
            const { word, category } = getRandomWord();
            const firstPlayer = gameState.players[0];
            
            await storage.updateGameRoom(gameState.room.id, {
              currentWord: word,
              category,
              gameStatus: "playing",
              currentTurn: firstPlayer.id,
              guessedLetters: [],
              wrongGuesses: 0
            });
            
            await storage.clearGameHistory(gameState.room.id);
            
            const updatedGameState = await storage.getGameState(client.roomCode);
            broadcastToRoom(client.roomCode, {
              type: 'game_state_update',
              payload: updatedGameState
            });
            break;
          }

          case 'guess_letter': {
            if (!client.roomCode || !client.playerId) return;
            
            const { letter } = message.payload;
            const gameState = await storage.getGameState(client.roomCode);
            
            if (!gameState || gameState.room.gameStatus !== "playing") return;
            if (gameState.room.currentTurn !== client.playerId) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Not your turn' }
              }));
              return;
            }
            
            const upperLetter = letter.toUpperCase();
            const currentWord = gameState.room.currentWord || '';
            const guessedLetters = gameState.room.guessedLetters || [];
            
            if (guessedLetters.includes(upperLetter)) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Letter already guessed' }
              }));
              return;
            }
            
            const isCorrect = currentWord.includes(upperLetter);
            const newGuessedLetters = [...guessedLetters, upperLetter];
            const newWrongGuesses = isCorrect ? gameState.room.wrongGuesses : (gameState.room.wrongGuesses || 0) + 1;
            
            // Update game state
            await storage.updateGameRoom(gameState.room.id, {
              guessedLetters: newGuessedLetters,
              wrongGuesses: newWrongGuesses,
              currentTurn: isCorrect ? client.playerId : getNextPlayer(gameState.players, client.playerId)
            });
            
            // Add to history
            await storage.addGameHistory({
              roomId: gameState.room.id,
              playerId: client.playerId,
              letter: upperLetter,
              isCorrect
            });
            
            // Check for game end
            const gameEndCheck = await checkGameEnd(client.roomCode);
            
            const updatedGameState = await storage.getGameState(client.roomCode);
            broadcastToRoom(client.roomCode, {
              type: 'game_state_update',
              payload: { ...updatedGameState, gameEndCheck }
            });
            break;
          }

          case 'new_game': {
            if (!client.roomCode) return;
            
            const gameState = await storage.getGameState(client.roomCode);
            if (!gameState) return;
            
            const { word, category } = getRandomWord();
            const firstPlayer = gameState.players[0];
            
            await storage.updateGameRoom(gameState.room.id, {
              currentWord: word,
              category,
              gameStatus: "playing",
              currentTurn: firstPlayer.id,
              guessedLetters: [],
              wrongGuesses: 0,
              winner: null
            });
            
            await storage.clearGameHistory(gameState.room.id);
            
            const updatedGameState = await storage.getGameState(client.roomCode);
            broadcastToRoom(client.roomCode, {
              type: 'game_state_update',
              payload: updatedGameState
            });
            break;
          }

          case 'leave_room': {
            if (!client.roomCode || !client.playerId) return;
            
            await storage.deletePlayer(client.playerId);
            
            const gameState = await storage.getGameState(client.roomCode);
            if (gameState && gameState.players.length === 0) {
              await storage.deleteGameRoom(gameState.room.id);
            } else if (gameState) {
              broadcastToRoom(client.roomCode, {
                type: 'game_state_update',
                payload: gameState
              }, clientId);
            }
            
            client.playerId = undefined;
            client.roomCode = undefined;
            break;
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' }
        }));
      }
    });

    ws.on('close', async () => {
      const client = clients.get(clientId);
      if (client?.playerId && client?.roomCode) {
        await storage.deletePlayer(client.playerId);
        
        const gameState = await storage.getGameState(client.roomCode);
        if (gameState && gameState.players.length === 0) {
          await storage.deleteGameRoom(gameState.room.id);
        } else if (gameState) {
          broadcastToRoom(client.roomCode, {
            type: 'game_state_update',
            payload: gameState
          }, clientId);
        }
      }
      clients.delete(clientId);
    });
  });

  return httpServer;
}
