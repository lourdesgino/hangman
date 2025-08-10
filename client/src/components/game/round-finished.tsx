import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GameState, Player } from "@shared/schema";

interface RoundFinishedProps {
  gameState: GameState;
  currentPlayer?: Player;
  roundEndCheck?: { roundEnded: boolean; winner?: string; reason?: string };
  onStartRound: () => void;
  onEndGame: () => void;
}

export default function RoundFinished({ 
  gameState, 
  currentPlayer, 
  roundEndCheck, 
  onStartRound, 
  onEndGame 
}: RoundFinishedProps) {
  const { room, players, currentRound } = gameState;
  const isWin = roundEndCheck?.reason === "word_guessed";
  
  const wordGiver = players.find(p => p.id === room.wordGiverId);
  const guesser = players.find(p => p.id === room.guesserId);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">{isWin ? '🎉' : '😔'}</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Round {room.roundNumber} Complete!
            </h2>
            
            {isWin ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-800 font-medium">
                  <span className="font-bold">{roundEndCheck?.winner}</span> guessed the word correctly!
                </p>
                <p className="text-green-600 text-sm mt-1">+1 point awarded</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-red-800 font-medium">
                  The hangman is complete! <span className="font-bold">{guesser?.name}</span> couldn't guess the word.
                </p>
                <p className="text-red-600 text-sm mt-1">No points awarded</p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-gray-600 text-sm">The word was:</p>
              <p className="font-bold text-primary text-2xl tracking-wider font-mono">
                {currentRound?.word || gameState.room.currentWord}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                <span className="font-medium">Hint:</span> {currentRound?.hint || gameState.room.hint}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Current Scores</h3>
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.id} className="flex justify-between">
                    <span className={player.isOnline ? "text-gray-900" : "text-gray-400"}>
                      {player.name} {!player.isOnline && "(Offline)"}
                    </span>
                    <span className="font-bold">{player.score || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3 justify-center">
              <Button 
                onClick={onStartRound}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Next Round
              </Button>
              <Button 
                onClick={onEndGame}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                End Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Round Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Round Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Word Giver:</span>
              <span className="font-medium ml-2">{wordGiver?.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Guesser:</span>
              <span className="font-medium ml-2">{guesser?.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Wrong Guesses:</span>
              <span className="font-medium ml-2">{currentRound?.wrongGuesses} / {currentRound?.maxGuesses}</span>
            </div>
            <div>
              <span className="text-gray-600">Letters Guessed:</span>
              <span className="font-medium ml-2">{currentRound?.guessedLetters?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}