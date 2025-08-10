import { type GameRoom, type InsertGameRoom, type Player, type InsertPlayer, type GameHistory, type InsertGameHistory, type GameRound, type InsertGameRound, type GameState } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Game Rooms
  createGameRoom(room: InsertGameRoom): Promise<GameRoom>;
  getGameRoom(id: string): Promise<GameRoom | undefined>;
  getGameRoomByCode(roomCode: string): Promise<GameRoom | undefined>;
  updateGameRoom(id: string, updates: Partial<GameRoom>): Promise<GameRoom | undefined>;
  deleteGameRoom(id: string): Promise<void>;

  // Players
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByRoom(roomId: string): Promise<Player[]>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<void>;
  deletePlayersByRoom(roomId: string): Promise<void>;

  // Game History
  addGameHistory(history: InsertGameHistory): Promise<GameHistory>;
  getGameHistory(roomId: string): Promise<GameHistory[]>;
  clearGameHistory(roomId: string): Promise<void>;

  // Game Rounds
  createGameRound(round: InsertGameRound): Promise<GameRound>;
  getGameRound(roomId: string, roundNumber: number): Promise<GameRound | undefined>;
  updateGameRound(id: string, updates: Partial<GameRound>): Promise<GameRound | undefined>;
  getGameRounds(roomId: string): Promise<GameRound[]>;
  getCurrentRound(roomId: string): Promise<GameRound | undefined>;

  // Player Management
  getPlayerByName(roomId: string, name: string): Promise<Player | undefined>;
  updatePlayerOnlineStatus(playerId: string, isOnline: boolean): Promise<void>;

  // Utility
  getGameState(roomCode: string): Promise<GameState | undefined>;
}

export class MemStorage implements IStorage {
  private gameRooms: Map<string, GameRoom>;
  private players: Map<string, Player>;
  private gameHistory: Map<string, GameHistory>;
  private gameRounds: Map<string, GameRound>;

  constructor() {
    this.gameRooms = new Map();
    this.players = new Map();
    this.gameHistory = new Map();
    this.gameRounds = new Map();
  }

  async createGameRoom(insertRoom: InsertGameRoom): Promise<GameRoom> {
    const id = randomUUID();
    const room: GameRoom = {
      ...insertRoom,
      id,
      createdAt: new Date(),
    };
    this.gameRooms.set(id, room);
    return room;
  }

  async getGameRoom(id: string): Promise<GameRoom | undefined> {
    return this.gameRooms.get(id);
  }

  async getGameRoomByCode(roomCode: string): Promise<GameRoom | undefined> {
    return Array.from(this.gameRooms.values()).find(room => room.roomCode === roomCode);
  }

  async updateGameRoom(id: string, updates: Partial<GameRoom>): Promise<GameRoom | undefined> {
    const room = this.gameRooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.gameRooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async deleteGameRoom(id: string): Promise<void> {
    this.gameRooms.delete(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      ...insertPlayer,
      id,
      joinedAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByRoom(roomId: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.roomId === roomId);
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: string): Promise<void> {
    this.players.delete(id);
  }

  async deletePlayersByRoom(roomId: string): Promise<void> {
    Array.from(this.players.entries()).forEach(([id, player]) => {
      if (player.roomId === roomId) {
        this.players.delete(id);
      }
    });
  }

  async addGameHistory(insertHistory: InsertGameHistory): Promise<GameHistory> {
    const id = randomUUID();
    const history: GameHistory = {
      ...insertHistory,
      id,
      timestamp: new Date(),
    };
    this.gameHistory.set(id, history);
    return history;
  }

  async getGameHistory(roomId: string): Promise<GameHistory[]> {
    return Array.from(this.gameHistory.values())
      .filter(history => history.roomId === roomId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async clearGameHistory(roomId: string): Promise<void> {
    Array.from(this.gameHistory.entries()).forEach(([id, history]) => {
      if (history.roomId === roomId) {
        this.gameHistory.delete(id);
      }
    });
  }

  async createGameRound(insertRound: InsertGameRound): Promise<GameRound> {
    const id = randomUUID();
    const round: GameRound = {
      ...insertRound,
      id,
      createdAt: new Date(),
    };
    this.gameRounds.set(id, round);
    return round;
  }

  async getGameRound(roomId: string, roundNumber: number): Promise<GameRound | undefined> {
    return Array.from(this.gameRounds.values())
      .find(round => round.roomId === roomId && round.roundNumber === roundNumber);
  }

  async updateGameRound(id: string, updates: Partial<GameRound>): Promise<GameRound | undefined> {
    const round = this.gameRounds.get(id);
    if (!round) return undefined;
    
    const updatedRound = { ...round, ...updates };
    this.gameRounds.set(id, updatedRound);
    return updatedRound;
  }

  async getGameRounds(roomId: string): Promise<GameRound[]> {
    return Array.from(this.gameRounds.values())
      .filter(round => round.roomId === roomId)
      .sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0));
  }

  async getCurrentRound(roomId: string): Promise<GameRound | undefined> {
    const rounds = await this.getGameRounds(roomId);
    return rounds.find(round => round.status === "in_progress");
  }

  async getPlayerByName(roomId: string, name: string): Promise<Player | undefined> {
    return Array.from(this.players.values())
      .find(player => player.roomId === roomId && player.name === name);
  }

  async updatePlayerOnlineStatus(playerId: string, isOnline: boolean): Promise<void> {
    const player = this.players.get(playerId);
    if (player) {
      const updatedPlayer = { 
        ...player, 
        isOnline, 
        lastSeen: new Date()
      };
      this.players.set(playerId, updatedPlayer);
    }
  }

  async getGameState(roomCode: string): Promise<GameState | undefined> {
    const room = await this.getGameRoomByCode(roomCode);
    if (!room) return undefined;
    
    const players = await this.getPlayersByRoom(room.id);
    const history = await this.getGameHistory(room.id);
    const rounds = await this.getGameRounds(room.id);
    const currentRound = await this.getCurrentRound(room.id);
    
    return { room, players, history, rounds, currentRound };
  }
}

export const storage = new MemStorage();
