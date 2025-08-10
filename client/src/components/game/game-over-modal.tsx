import { Button } from "@/components/ui/button";
import type { GameState } from "@shared/schema";

interface GameOverModalProps {
  gameEndCheck: { gameEnded: boolean; winner?: string; reason?: string };
  gameState: GameState;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export default function GameOverModal({ 
  gameEndCheck, 
  gameState, 
  onPlayAgain, 
  onBackToLobby 
}: GameOverModalProps) {
  const { room, players } = gameState;
  const isWin = gameEndCheck.reason === "word_guessed";
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">{isWin ? '🎉' : '😔'}</div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isWin ? `${gameEndCheck.winner} Won!` : 'Game Over!'}
          </h2>
          <p className="text-gray-600">
            The word was: <span className="font-bold text-primary">{room.currentWord}</span>
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Final Scores</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div key={player.id} className="flex justify-between">
                  <span>{player.name}</span>
                  <span className="font-bold">{player.score || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={onPlayAgain}
            className="flex-1 bg-primary text-white hover:bg-primary/90"
          >
            Play Again
          </Button>
          <Button 
            onClick={onBackToLobby}
            variant="outline"
            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
