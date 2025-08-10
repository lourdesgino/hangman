import { Button } from "@/components/ui/button";
import type { GameState } from "@shared/schema";

interface GameOverModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export default function GameOverModal({ 
  gameState, 
  onPlayAgain, 
  onBackToLobby 
}: GameOverModalProps) {
  const { players, rounds } = gameState;
  
  // Calculate final winner
  const sortedPlayers = players.sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sortedPlayers[0];
  const totalRounds = rounds.length;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">🏆</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Game Complete!
          </h2>
          <p className="text-gray-600">
            <span className="font-bold text-primary">{winner?.name}</span> wins with {winner?.score || 0} points!
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Final Scores</h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className={`flex justify-between items-center ${
                  index === 0 ? 'text-primary font-bold' : ''
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{index + 1}.</span>
                    <span>{player.name}</span>
                    {index === 0 && <span className="text-yellow-500">👑</span>}
                  </div>
                  <span className="font-bold">{player.score || 0} points</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <span className="font-medium">Game Summary:</span> {totalRounds} rounds played
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={onPlayAgain}
            className="flex-1 bg-primary text-white hover:bg-primary/90"
          >
            New Game
          </Button>
          <Button 
            onClick={onBackToLobby}
            variant="outline"
            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Leave Game
          </Button>
        </div>
      </div>
    </div>
  );
}
