import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameRooms = pgTable("game_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code", { length: 6 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  currentWord: text("current_word"),
  hint: text("hint"),
  guessedLetters: jsonb("guessed_letters").$type<string[]>().default([]),
  wrongGuesses: integer("wrong_guesses").default(0),
  maxGuesses: integer("max_guesses").default(6),
  wordGiverId: varchar("word_giver_id"), // Who sets the word for this round
  guesserId: varchar("guesser_id"), // Who guesses the word for this round
  gameStatus: varchar("game_status").default("waiting"), // waiting, word_setting, guessing, round_finished, game_finished
  roundNumber: integer("round_number").default(1),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => gameRooms.id),
  name: text("name").notNull().unique(),
  score: integer("score").default(0),
  isReady: boolean("is_ready").default(false),
  isOnline: boolean("is_online").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
});

export const gameHistory = pgTable("game_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => gameRooms.id),
  playerId: varchar("player_id").references(() => players.id),
  letter: varchar("letter", { length: 1 }).notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const gameRounds = pgTable("game_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => gameRooms.id),
  roundNumber: integer("round_number").notNull(),
  wordGiverId: varchar("word_giver_id").references(() => players.id),
  guesserId: varchar("guesser_id").references(() => players.id),
  word: text("word").notNull(),
  hint: text("hint").notNull(),
  guessedLetters: jsonb("guessed_letters").$type<string[]>().default([]),
  wrongGuesses: integer("wrong_guesses").default(0),
  maxGuesses: integer("max_guesses").default(6),
  status: varchar("status").default("in_progress"), // in_progress, won, lost
  pointsAwarded: integer("points_awarded").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  joinedAt: true,
});

export const insertGameHistorySchema = createInsertSchema(gameHistory).omit({
  id: true,
  timestamp: true,
});

export const insertGameRoundSchema = createInsertSchema(gameRounds).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GameRoom = typeof gameRooms.$inferSelect;
export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type GameHistory = typeof gameHistory.$inferSelect;
export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;

export type GameRound = typeof gameRounds.$inferSelect;
export type InsertGameRound = z.infer<typeof insertGameRoundSchema>;

// Game-specific types
export type GameState = {
  room: GameRoom;
  players: Player[];
  history: GameHistory[];
  currentRound?: GameRound;
  rounds: GameRound[];
};

export type WebSocketMessage = {
  type: 'join_room' | 'rejoin_room' | 'leave_room' | 'guess_letter' | 'start_game' | 'set_word' | 'start_round' | 'end_game' | 'game_state_update' | 'player_joined' | 'player_left' | 'error';
  payload?: any;
  roomCode?: string;
  playerId?: string;
};
