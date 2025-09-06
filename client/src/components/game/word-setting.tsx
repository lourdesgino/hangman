import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { GameState, Player } from "@shared/schema";

interface WordSettingProps {
  gameState: GameState;
  currentPlayer?: Player;
  onSetWord: (word: string, hint: string) => void;
}

export default function WordSetting({ gameState, currentPlayer, onSetWord }: WordSettingProps) {
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");

  const { room, players } = gameState;
  const wordGiver = players.find(p => p.id === room.wordGiverId);
  const guesser = players.find(p => p.id === room.guesserId);
  const isMyTurn = currentPlayer && room.wordGiverId === currentPlayer.id;

  const handleSubmit = () => {
    if (!word.trim()) return;
    onSetWord(word.trim(), hint.trim() || "No hint provided");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">📝</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Round {room.roundNumber} - Word Setting
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-800 font-medium">
                <span className="font-bold">{wordGiver?.name}</span> is setting a word for{" "}
                <span className="font-bold">{guesser?.name}</span> to guess
              </p>
            </div>

            {isMyTurn ? (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="word">Your Word</Label>
                  <Input
                    id="word"
                    placeholder="Enter the word to guess"
                    value={word}
                    onChange={(e) => setWord(e.target.value.toUpperCase())}
                    className="uppercase tracking-wider text-center font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hint">Hint (Optional)</Label>
                  <Input
                    id="hint"
                    placeholder="Give a helpful hint (optional)"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={!word.trim()}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  Set Word & Start Round
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-gray-600">
                    Waiting for <span className="font-semibold">{wordGiver?.name}</span> to set a word...
                  </p>
                  <div className="flex justify-center mt-3">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Players Status */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Scores</h3>
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
                        : 'Waiting'}
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
    </div>
  );
}