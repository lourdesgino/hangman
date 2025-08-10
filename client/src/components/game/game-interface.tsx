import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HangmanDrawing from "./hangman-drawing";
import { getWordDisplay, getLetterStatus } from "@/lib/game-utils";
import type { GameState, Player } from "@shared/schema";

interface GameInterfaceProps {
  gameState: GameState;
  currentPlayer?: Player;
  onGuessLetter: (letter: string) => void;
  onLeaveGame: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GameInterface({ 
  gameState, 
  currentPlayer, 
  onGuessLetter, 
  onLeaveGame 
}: GameInterfaceProps) {
  const { room, players, history, currentRound } = gameState;
  const isMyTurn = currentPlayer && room.guesserId === currentPlayer.id;
  const wordGiver = players.find(p => p.id === room.wordGiverId);
  const guesser = players.find(p => p.id === room.guesserId);
  
  const wordDisplay = getWordDisplay(currentRound?.word || '', currentRound?.guessedLetters || []);
  const recentGuesses = history.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Room:</span>
              <span className="font-mono font-bold text-primary">{room.roomCode}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Round {room.roundNumber}:</span>
                <span className="font-semibold text-gray-900">
                  {guesser?.name} is guessing
                  {isMyTurn && <span className="text-primary ml-1">(You)</span>}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onLeaveGame}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-lg"></i>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hangman Drawing */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Hangman</h3>
              <HangmanDrawing wrongGuesses={currentRound?.wrongGuesses || 0} />
              <div className="text-center mt-4">
                <span className="text-sm text-gray-600">Wrong guesses: </span>
                <span className="font-semibold text-error">{currentRound?.wrongGuesses || 0}</span>
                <span className="text-gray-600"> / </span>
                <span className="font-semibold text-gray-900">{currentRound?.maxGuesses || 9}</span>
              </div>
            </CardContent>
          </Card>

          {/* Word Display */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Word</h3>
              <div className="flex justify-center">
                <div className="flex space-x-3 text-3xl font-bold font-mono">
                  {wordDisplay.map((letter, index) => (
                    <span
                      key={index}
                      className={`w-12 h-12 border-b-4 flex items-center justify-center ${
                        letter === '_' 
                          ? 'border-gray-300 text-gray-400' 
                          : 'border-primary text-primary'
                      }`}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center mt-4">
                <span className="text-sm text-gray-600">Hint: </span>
                <span className="font-medium text-gray-900">{currentRound?.hint}</span>
              </div>
            </CardContent>
          </Card>

          {/* Letter Selection */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Select a Letter</h3>
              <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-9 gap-2">
                {ALPHABET.map((letter) => {
                  const status = getLetterStatus(letter, currentRound?.guessedLetters || [], currentRound?.word || '');
                  
                  return (
                    <Button
                      key={letter}
                      onClick={() => onGuessLetter(letter)}
                      disabled={!isMyTurn || status !== 'available'}
                      variant="outline"
                      className={`aspect-square font-semibold text-lg ${
                        status === 'correct' 
                          ? 'bg-secondary/20 border-secondary text-secondary cursor-not-allowed' 
                          : status === 'incorrect'
                          ? 'bg-error/20 border-error text-error cursor-not-allowed line-through'
                          : 'hover:bg-primary hover:text-white hover:border-primary'
                      }`}
                    >
                      {letter}
                    </Button>
                  );
                })}
              </div>
              {!isMyTurn && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  {wordGiver?.name} is the word giver. Waiting for {guesser?.name} to guess...
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game Status Panel */}
        <div className="space-y-6">
          {/* Players Status */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Players</h3>
              <div className="space-y-3">
                {players.map((player) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      room.wordGiverId === player.id
                        ? 'bg-primary/5 border-primary/20'
                        : room.guesserId === player.id
                        ? 'bg-secondary/5 border-secondary/20'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        room.wordGiverId === player.id
                          ? 'bg-primary/20'
                          : room.guesserId === player.id
                          ? 'bg-secondary/20'
                          : 'bg-gray-200'
                      }`}>
                        <i className={`fas text-sm ${
                          room.wordGiverId === player.id
                            ? 'fa-pencil-alt text-primary'
                            : room.guesserId === player.id
                            ? 'fa-search text-secondary'
                            : 'fa-user text-gray-400'
                        }`}></i>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className={`text-xs font-medium ${
                          room.wordGiverId === player.id
                            ? 'text-primary'
                            : room.guesserId === player.id
                            ? 'text-secondary'
                            : 'text-gray-500'
                        }`}>
                          {room.wordGiverId === player.id 
                            ? 'Word Giver' 
                            : room.guesserId === player.id 
                            ? 'Guesser' 
                            : 'Waiting...'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        Score: {player.score || 0}
                      </div>
                      <div className={`text-xs ${
                        player.isOnline ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {player.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game History */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Guesses</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentGuesses.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No guesses yet</p>
                ) : (
                  recentGuesses.map((guess) => {
                    const player = players.find(p => p.id === guess.playerId);
                    return (
                      <div key={guess.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">{player?.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold">{guess.letter}</span>
                          <span className={guess.isCorrect ? 'text-secondary' : 'text-error'}>
                            {guess.isCorrect ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Game Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button 
                onClick={onLeaveGame}
                variant="outline"
                className="w-full border-error text-error hover:bg-error/5"
              >
                Leave Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
