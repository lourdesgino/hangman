import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { GameState, Player } from "@shared/schema";

interface GameLobbyProps {
  gameState: GameState;
  currentPlayer?: Player;
  onStartGame: (maxGuesses: number) => void;
  onLeaveGame: () => void;
}

export default function GameLobby({ gameState, currentPlayer, onStartGame, onLeaveGame }: GameLobbyProps) {
  const { room, players } = gameState;
  const [difficulty, setDifficulty] = useState([6]); // Default to 6 incorrect guesses
  
  // The room creator is the player who joined first (earliest joinedAt timestamp)
  const roomCreator = players.reduce((earliest, player) => 
    !earliest || (player.joinedAt && earliest.joinedAt && new Date(player.joinedAt) < new Date(earliest.joinedAt)) 
      ? player 
      : earliest
  );
  
  const isRoomCreator = currentPlayer && roomCreator && currentPlayer.id === roomCreator.id;
  
  const getDifficultyLabel = (value: number) => {
    if (value <= 2) return "Very Hard";
    if (value <= 4) return "Hard";
    if (value <= 6) return "Medium";
    if (value <= 8) return "Easy";
    return "Very Easy";
  };
  
  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomCode);
  };

  const handleStartGame = () => {
    console.log(`[DEBUG] Starting game with difficulty: ${difficulty[0]}`);
    onStartGame(difficulty[0]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <i className="fas fa-door-open text-primary text-2xl"></i>
              <h2 className="text-2xl font-bold text-gray-900">
                Room: <span className="text-primary font-mono">{room.roomCode}</span>
              </h2>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-800 font-medium">Share this room code with your friend:</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="text-2xl font-mono font-bold text-blue-900">{room.roomCode}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyRoomCode}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <i className="fas fa-copy"></i>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Players</h3>
              <div className="grid gap-3 max-w-md mx-auto">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-primary text-sm"></i>
                      </div>
                      <span className="font-medium text-gray-900">{player.name}</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Ready
                    </span>
                  </div>
                ))}
                
                {players.length < 2 && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-gray-400 text-sm"></i>
                      </div>
                      <span className="text-gray-500">Waiting for player...</span>
                    </div>
                    <div className="animate-pulse">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Settings - Only for Room Creator */}
            {isRoomCreator && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Game Difficulty</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
                        Incorrect Guesses Allowed
                      </Label>
                      <span className="text-sm font-semibold text-primary">
                        {difficulty[0]} ({getDifficultyLabel(difficulty[0])})
                      </span>
                    </div>
                    <Slider
                      id="difficulty"
                      min={0}
                      max={9}
                      step={1}
                      value={difficulty}
                      onValueChange={setDifficulty}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 (Very Hard)</span>
                      <span>9 (Very Easy)</span>
                    </div>
                    <p className="text-xs text-gray-600 text-center">
                      {difficulty[0] === 0 ? "No mistakes allowed!" : 
                       difficulty[0] === 1 ? "Only 1 mistake allowed" : 
                       `Up to ${difficulty[0]} mistakes allowed`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Show difficulty info for non-creators */}
            {!isRoomCreator && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Game Difficulty</h3>
                <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-center text-sm">
                    <span className="font-semibold">{roomCreator?.name}</span> will set the difficulty level when starting the game.
                  </p>
                </div>
              </div>
            )}

            <div className="flex space-x-3 justify-center">
              {isRoomCreator ? (
                <Button 
                  onClick={handleStartGame}
                  disabled={players.length < 2}
                  className="bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Game
                </Button>
              ) : (
                <div className="bg-blue-50 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-blue-800 text-center text-sm">
                    Waiting for <span className="font-semibold">{roomCreator?.name}</span> to start the game...
                  </p>
                </div>
              )}
              <Button 
                onClick={onLeaveGame}
                variant="outline"
                className="border-error text-error hover:bg-error/5"
              >
                Leave Room
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
