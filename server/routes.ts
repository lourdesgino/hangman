import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertGameRoomSchema, insertPlayerSchema, insertGameHistorySchema, insertGameRoundSchema, type WebSocketMessage, type GameState } from "@shared/schema";
import { z } from "zod";

interface ClientConnection {
  ws: WebSocket;
  playerId?: string;
  roomCode?: string;
  playerName?: string;
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

function getNextWordGiver(players: any[], currentWordGiverId: string): string {
  const currentIndex = players.findIndex(p => p.id === currentWordGiverId);
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex].id;
}

function broadcastToRoom(roomCode: string, message: WebSocketMessage, excludeClientId?: string) {
  clients.forEach((client, clientId) => {
    if (client.roomCode === roomCode && clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function determineGameRoles(players: any[], roundNumber: number): { wordGiverId: string; guesserId: string } {
  // Alternate who gives the word each round
  const wordGiverIndex = (roundNumber - 1) % players.length;
  const guesserIndex = (wordGiverIndex + 1) % players.length;
  
  return {
    wordGiverId: players[wordGiverIndex].id,
    guesserId: players[guesserIndex].id
  };
}

async function checkRoundEnd(roomCode: string): Promise<{ roundEnded: boolean; winner?: string; reason?: string }> {
  const gameState = await storage.getGameState(roomCode);
  if (!gameState || !gameState.currentRound) return { roundEnded: false };

  const { currentRound, players } = gameState;
  const currentWord = currentRound.word || '';
  const guessedLetters = currentRound.guessedLetters || [];
  
  // Check if word is completely guessed
  const isWordComplete = currentWord.split('').every(letter => 
    guessedLetters.includes(letter.toUpperCase())
  );
  
  if (isWordComplete) {
    // Guesser wins the round
    const guesser = players.find(p => p.id === currentRound.guesserId);
    if (guesser) {
      await storage.updatePlayer(guesser.id, { score: (guesser.score || 0) + 1 });
    }
    await storage.updateGameRound(currentRound.id, { 
      status: "won",
      pointsAwarded: 1,
      completedAt: new Date()
    });
    return { roundEnded: true, winner: guesser?.name, reason: "word_guessed" };
  }
  
  // Check if max wrong guesses reached
  if ((currentRound.wrongGuesses || 0) >= (currentRound.maxGuesses || 9)) {
    await storage.updateGameRound(currentRound.id, { 
      status: "lost",
      pointsAwarded: 0,
      completedAt: new Date()
    });
    return { roundEnded: true, reason: "max_guesses_reached" };
  }
  
  return { roundEnded: false };
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
                maxGuesses: 9,
                roundNumber: 1
              });
              
              const player = await storage.createPlayer({
                roomId: room.id,
                name: playerName,
                score: 0,
                isReady: true,
                isOnline: true
              });
              
              client.playerId = player.id;
              client.roomCode = newRoomCode;
              client.playerName = playerName;
              
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
                isReady: true,
                isOnline: true
              });
              
              client.playerId = player.id;
              client.roomCode = roomCode;
              client.playerName = playerName;
              
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

          case 'rejoin_room': {
            const { roomCode, playerName } = message.payload;
            
            const gameState = await storage.getGameState(roomCode);
            if (!gameState) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Room not found' }
              }));
              return;
            }
            
            // Find existing player by name
            const existingPlayer = await storage.getPlayerByName(gameState.room.id, playerName);
            if (!existingPlayer) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Player not found in this room' }
              }));
              return;
            }
            
            // Update player online status
            await storage.updatePlayerOnlineStatus(existingPlayer.id, true);
            
            client.playerId = existingPlayer.id;
            client.roomCode = roomCode;
            client.playerName = playerName;
            
            // Send updated game state
            const updatedGameState = await storage.getGameState(roomCode);
            broadcastToRoom(roomCode, {
              type: 'game_state_update',
              payload: updatedGameState
            });
            
            ws.send(JSON.stringify({
              type: 'game_state_update',
              payload: updatedGameState
            }));
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
            
            // Get maxGuesses from payload, default to 6
            const maxGuesses = message.payload?.maxGuesses || 6;
            console.log(`[DEBUG] Starting game with maxGuesses: ${maxGuesses} for room ${client.roomCode}`);
            
            // Determine roles for first round
            const { wordGiverId, guesserId } = determineGameRoles(gameState.players, 1);
            
            await storage.updateGameRoom(gameState.room.id, {
              gameStatus: "word_setting",
              wordGiverId,
              guesserId,
              roundNumber: 1,
              maxGuesses
            });
            
            const updatedGameState = await storage.getGameState(client.roomCode);
            broadcastToRoom(client.roomCode, {
              type: 'game_state_update',
              payload: updatedGameState
            });
            break;
          }

          case 'set_word': {
            if (!client.roomCode || !client.playerId) return;
            
            const { word, hint } = message.payload;
            const gameState = await storage.getGameState(client.roomCode);
            
            if (!gameState || gameState.room.gameStatus !== "word_setting") return;
            if (gameState.room.wordGiverId !== client.playerId) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Not your turn to set the word' }
              }));
              return;
            }
            
            // Create new round
            const round = await storage.createGameRound({
              roomId: gameState.room.id,
              roundNumber: gameState.room.roundNumber || 1,
              wordGiverId: gameState.room.wordGiverId,
              guesserId: gameState.room.guesserId,
              word: word.toUpperCase(),
              hint,
              guessedLetters: [],
              wrongGuesses: 0,
              maxGuesses: gameState.room.maxGuesses || 6,
              status: "in_progress"
            });
            
            console.log(`[DEBUG] Created round with maxGuesses: ${gameState.room.maxGuesses || 6} for room ${client.roomCode}`);
            
            await storage.updateGameRoom(gameState.room.id, {
              gameStatus: "guessing",
              currentWord: word.toUpperCase(),
              hint
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
            
            if (!gameState || gameState.room.gameStatus !== "guessing" || !gameState.currentRound) return;
            if (gameState.room.guesserId !== client.playerId) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Not your turn to guess' }
              }));
              return;
            }
            
            const upperLetter = letter.toUpperCase();
            const currentWord = gameState.currentRound.word || '';
            const guessedLetters = gameState.currentRound.guessedLetters || [];
            
            if (guessedLetters.includes(upperLetter)) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Letter already guessed' }
              }));
              return;
            }
            
            const isCorrect = currentWord.includes(upperLetter);
            const newGuessedLetters = [...guessedLetters, upperLetter];
            const newWrongGuesses = isCorrect ? gameState.currentRound.wrongGuesses : (gameState.currentRound.wrongGuesses || 0) + 1;
            
            // Update round state
            await storage.updateGameRound(gameState.currentRound.id, {
              guessedLetters: newGuessedLetters,
              wrongGuesses: newWrongGuesses
            });
            
            // Add to history
            await storage.addGameHistory({
              roomId: gameState.room.id,
              playerId: client.playerId,
              letter: upperLetter,
              isCorrect
            });
            
            // Check for round end
            const roundEndCheck = await checkRoundEnd(client.roomCode);
            
            if (roundEndCheck.roundEnded) {
              await storage.updateGameRoom(gameState.room.id, {
                gameStatus: "round_finished"
              });
            }
            
            const updatedGameState = await storage.getGameState(client.roomCode);
            broadcastToRoom(client.roomCode, {
              type: 'game_state_update',
              payload: { ...updatedGameState, roundEndCheck }
            });
            break;
          }

          case 'start_round': {
            if (!client.roomCode) return;
            
            const gameState = await storage.getGameState(client.roomCode);
            if (!gameState || gameState.room.gameStatus !== "round_finished") return;
            
            const newRoundNumber = (gameState.room.roundNumber || 1) + 1;
            const { wordGiverId, guesserId } = determineGameRoles(gameState.players, newRoundNumber);
            
            await storage.updateGameRoom(gameState.room.id, {
              gameStatus: "word_setting",
              wordGiverId,
              guesserId,
              roundNumber: newRoundNumber,
              currentWord: null,
              hint: null
            });
            
            const updatedGameState = await storage.getGameState(client.roomCode);
            broadcastToRoom(client.roomCode, {
              type: 'game_state_update',
              payload: updatedGameState
            });
            break;
          }

          case 'end_game': {
            if (!client.roomCode) return;
            
            const gameState = await storage.getGameState(client.roomCode);
            if (!gameState) return;
            
            // Calculate final winner with tie-breaking logic
            const sortedPlayers = gameState.players.sort((a, b) => {
              const scoreA = a.score || 0;
              const scoreB = b.score || 0;
              
              // First sort by score
              if (scoreB !== scoreA) {
                return scoreB - scoreA;
              }
              
              // If scores are tied, use win rate as guesser for tie-breaking
              const playerAAsGuesser = gameState.rounds.filter(round => round.guesserId === a.id);
              const playerBAsGuesser = gameState.rounds.filter(round => round.guesserId === b.id);
              
              const playerAWins = playerAAsGuesser.filter(round => round.status === 'won').length;
              const playerBWins = playerBAsGuesser.filter(round => round.status === 'won').length;
              
              // Calculate win rates (avoid division by zero)
              const playerAWinRate = playerAAsGuesser.length > 0 ? playerAWins / playerAAsGuesser.length : 0;
              const playerBWinRate = playerBAsGuesser.length > 0 ? playerBWins / playerBAsGuesser.length : 0;
              
              // Sort by win rate (higher win rate first)
              return playerBWinRate - playerAWinRate;
            });
            
            // Check if top players are tied
            let finalWinner = null;
            if (sortedPlayers.length >= 2) {
              const topScore = sortedPlayers[0].score || 0;
              const secondScore = sortedPlayers[1].score || 0;
              
              if (topScore === secondScore) {
                // Calculate win rates for tie-breaking
                const topPlayerAsGuesser = gameState.rounds.filter(round => round.guesserId === sortedPlayers[0].id);
                const secondPlayerAsGuesser = gameState.rounds.filter(round => round.guesserId === sortedPlayers[1].id);
                
                const topPlayerWins = topPlayerAsGuesser.filter(round => round.status === 'won').length;
                const secondPlayerWins = secondPlayerAsGuesser.filter(round => round.status === 'won').length;
                
                const topPlayerWinRate = topPlayerAsGuesser.length > 0 ? topPlayerWins / topPlayerAsGuesser.length : 0;
                const secondPlayerWinRate = secondPlayerAsGuesser.length > 0 ? secondPlayerWins / secondPlayerAsGuesser.length : 0;
                
                if (Math.abs(topPlayerWinRate - secondPlayerWinRate) < 0.001) { // Use small epsilon for float comparison
                  finalWinner = null; // It's a draw
                } else {
                  finalWinner = sortedPlayers[0];
                }
              } else {
                finalWinner = sortedPlayers[0];
              }
            } else if (sortedPlayers.length === 1) {
              finalWinner = sortedPlayers[0];
            }
            
            await storage.updateGameRoom(gameState.room.id, {
              gameStatus: "game_finished"
            });
            
            const updatedGameState = await storage.getGameState(client.roomCode);
            broadcastToRoom(client.roomCode, {
              type: 'game_state_update',
              payload: { ...updatedGameState, finalWinner }
            });
            break;
          }

          case 'leave_room': {
            if (!client.roomCode || !client.playerId) return;
            
            // Mark player as offline instead of deleting
            await storage.updatePlayerOnlineStatus(client.playerId, false);
            
            const gameState = await storage.getGameState(client.roomCode);
            if (gameState) {
              broadcastToRoom(client.roomCode, {
                type: 'game_state_update',
                payload: gameState
              }, clientId);
            }
            
            client.playerId = undefined;
            client.roomCode = undefined;
            client.playerName = undefined;
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
        // Mark player as offline instead of deleting
        await storage.updatePlayerOnlineStatus(client.playerId, false);
        
        const gameState = await storage.getGameState(client.roomCode);
        if (gameState) {
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
