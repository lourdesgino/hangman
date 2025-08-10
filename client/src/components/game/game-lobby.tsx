import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GameState } from "@shared/schema";

interface GameLobbyProps {
  gameState: GameState;
  onStartGame: () => void;
  onLeaveGame: () => void;
}

export default function GameLobby({ gameState, onStartGame, onLeaveGame }: GameLobbyProps) {
  const { room, players } = gameState;
  
  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomCode);
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

            <div className="flex space-x-3 justify-center">
              <Button 
                onClick={onStartGame}
                disabled={players.length < 2}
                className="bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Game
              </Button>
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
