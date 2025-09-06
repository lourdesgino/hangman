import { useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import WelcomeRejoin from "@/components/game/welcome-rejoin";
import GameLobby from "@/components/game/game-lobby";
import WordSetting from "@/components/game/word-setting";
import GameInterface from "@/components/game/game-interface";
import RoundFinished from "@/components/game/round-finished";
import GameOverModal from "@/components/game/game-over-modal";
import type { GameState } from "@shared/schema";

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [roundEndCheck, setRoundEndCheck] = useState<any>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalWinner, setFinalWinner] = useState<any>(null);

  const { sendMessage, isConnected } = useWebSocket((message) => {
    switch (message.type) {
      case 'game_state_update':
        setGameState(message.payload);
        if (message.payload.roundEndCheck?.roundEnded) {
          setRoundEndCheck(message.payload.roundEndCheck);
        }
        if (message.payload.finalWinner !== undefined) {
          setFinalWinner(message.payload.finalWinner);
          setShowGameOver(true);
        }
        break;
      case 'error':
        console.error('Game error:', message.payload.message);
        break;
    }
  });

  const getCurrentScreen = () => {
    if (!gameState) return 'welcome';
    if (gameState.room.gameStatus === 'waiting') return 'lobby';
    if (gameState.room.gameStatus === 'word_setting') return 'word_setting';
    if (gameState.room.gameStatus === 'guessing') return 'game';
    if (gameState.room.gameStatus === 'round_finished') return 'round_finished';
    if (gameState.room.gameStatus === 'game_finished') return 'game_over';
    return 'game';
  };

  const handleJoinRoom = (playerName: string, roomCode?: string) => {
    sendMessage({
      type: 'join_room',
      payload: {
        playerName,
        roomCode,
        isCreating: !roomCode
      }
    });
  };

  const handleRejoinRoom = (playerName: string, roomCode: string) => {
    sendMessage({
      type: 'rejoin_room',
      payload: {
        playerName,
        roomCode
      }
    });
  };

  const handleStartGame = (maxGuesses: number = 6) => {
    console.log(`[DEBUG] Sending start_game with maxGuesses: ${maxGuesses}`);
    sendMessage({ 
      type: 'start_game',
      payload: { maxGuesses }
    });
  };

  const handleGuessLetter = (letter: string) => {
    sendMessage({
      type: 'guess_letter',
      payload: { letter }
    });
  };

  const handleSetWord = (word: string, hint: string) => {
    sendMessage({
      type: 'set_word',
      payload: { word, hint }
    });
  };

  const handleStartRound = () => {
    sendMessage({ type: 'start_round' });
    setRoundEndCheck(null);
  };

  const handleEndGame = () => {
    sendMessage({ type: 'end_game' });
  };

  const handleLeaveGame = () => {
    sendMessage({ type: 'leave_room' });
    setGameState(null);
    setPlayerId("");
    setShowGameOver(false);
    setRoundEndCheck(null);
    setFinalWinner(null);
  };

  const currentPlayer = gameState?.players.find(p => p.name === playerId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-gamepad text-primary text-2xl"></i>
              <h1 className="text-xl font-semibold text-gray-900">Family Hangman</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <span>Play together from anywhere</span>
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-800 font-medium">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {getCurrentScreen() === 'welcome' && (
          <WelcomeRejoin 
            onJoinRoom={handleJoinRoom} 
            onRejoinRoom={handleRejoinRoom}
            setPlayerId={setPlayerId} 
          />
        )}

        {getCurrentScreen() === 'lobby' && gameState && (
          <GameLobby 
            gameState={gameState} 
            currentPlayer={currentPlayer}
            onStartGame={handleStartGame}
            onLeaveGame={handleLeaveGame}
          />
        )}

        {getCurrentScreen() === 'word_setting' && gameState && (
          <WordSetting
            gameState={gameState}
            currentPlayer={currentPlayer}
            onSetWord={handleSetWord}
          />
        )}

        {getCurrentScreen() === 'game' && gameState && (
          <GameInterface 
            gameState={gameState}
            currentPlayer={currentPlayer}
            onGuessLetter={handleGuessLetter}
            onLeaveGame={handleLeaveGame}
          />
        )}

        {getCurrentScreen() === 'round_finished' && gameState && (
          <RoundFinished
            gameState={gameState}
            currentPlayer={currentPlayer}
            roundEndCheck={roundEndCheck}
            onStartRound={handleStartRound}
            onEndGame={handleEndGame}
          />
        )}

        {(getCurrentScreen() === 'game_over' || showGameOver) && gameState && (
          <GameOverModal
            gameState={gameState}
            finalWinner={finalWinner}
            onPlayAgain={() => {
              setShowGameOver(false);
              handleLeaveGame();
            }}
            onBackToLobby={handleLeaveGame}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Family Hangman - Play together from anywhere 🌍</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
