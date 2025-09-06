import { Button } from "@/components/ui/button";
import type { GameState } from "@shared/schema";

interface GameOverModalProps {
  gameState: GameState;
  finalWinner?: any | null; // Can be null for a draw
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export default function GameOverModal({ 
  gameState, 
  finalWinner,
  onPlayAgain, 
  onBackToLobby 
}: GameOverModalProps) {
  const { players, rounds } = gameState;
  
  // Calculate final scores with tie-breaking logic
  const sortedPlayers = players.sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    
    // First sort by score
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    
    // If scores are tied, use win rate as guesser for tie-breaking
    const playerAAsGuesser = rounds.filter(round => round.guesserId === a.id);
    const playerBAsGuesser = rounds.filter(round => round.guesserId === b.id);
    
    const playerAWins = playerAAsGuesser.filter(round => round.status === 'won').length;
    const playerBWins = playerBAsGuesser.filter(round => round.status === 'won').length;
    
    // Calculate win rates (avoid division by zero)
    const playerAWinRate = playerAAsGuesser.length > 0 ? playerAWins / playerAAsGuesser.length : 0;
    const playerBWinRate = playerBAsGuesser.length > 0 ? playerBWins / playerBAsGuesser.length : 0;
    
    // Sort by win rate (higher win rate first)
    return playerBWinRate - playerAWinRate;
  });
  
  const totalRounds = rounds.length;
  const isDraw = finalWinner === null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">{isDraw ? '🤝' : '🏆'}</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Game Complete!
          </h2>
          <p className="text-gray-600">
            {isDraw ? (
              <span className="font-bold text-primary">It's a Draw!</span>
            ) : (
              <>
                <span className="font-bold text-primary">{finalWinner?.name}</span> wins with {finalWinner?.score || 0} points!
              </>
            )}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Final Scores</h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => {
                const isWinner = !isDraw && player.id === finalWinner?.id;
                const playerAsGuesser = rounds.filter(round => round.guesserId === player.id);
                const playerWins = playerAsGuesser.filter(round => round.status === 'won').length;
                const winRate = playerAsGuesser.length > 0 ? (playerWins / playerAsGuesser.length * 100).toFixed(0) : '0';
                
                return (
                  <div key={player.id} className={`flex justify-between items-center ${
                    isWinner ? 'text-primary font-bold' : ''
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{index + 1}.</span>
                      <span>{player.name}</span>
                      {isWinner && <span className="text-yellow-500">👑</span>}
                      {isDraw && index === 0 && sortedPlayers[0].score === sortedPlayers[1]?.score && (
                        <span className="text-blue-500">🤝</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{player.score || 0} points</div>
                      <div className="text-xs text-gray-500">
                        {playerWins}/{playerAsGuesser.length} wins ({winRate}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <span className="font-medium">Game Summary:</span> {totalRounds} rounds played
              {isDraw && <span className="block mt-1">Both players have the same score and win rate!</span>}
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
