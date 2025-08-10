import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeScreenProps {
  onJoinRoom: (playerName: string, roomCode?: string) => void;
  setPlayerId: (playerId: string) => void;
}

export default function WelcomeScreen({ onJoinRoom, setPlayerId }: WelcomeScreenProps) {
  const [createPlayerName, setCreatePlayerName] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleCreateRoom = () => {
    if (!createPlayerName.trim()) return;
    setPlayerId(createPlayerName.trim());
    onJoinRoom(createPlayerName.trim());
  };

  const handleJoinRoom = () => {
    if (!joinPlayerName.trim() || !roomCode.trim()) return;
    setPlayerId(joinPlayerName.trim());
    onJoinRoom(joinPlayerName.trim(), roomCode.trim().toUpperCase());
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-gray-900">Ready to Play Hangman?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create a room to start a new game, or join an existing room with a code from your friend or family member.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Create Room Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
                <i className="fas fa-plus text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Create New Room</h3>
              <p className="text-gray-600">Start a new game and invite someone to join</p>
              
              <div className="space-y-3">
                <Input
                  placeholder="Enter your name"
                  value={createPlayerName}
                  onChange={(e) => setCreatePlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
                <Button 
                  onClick={handleCreateRoom}
                  disabled={!createPlayerName.trim()}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  Create Room
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Join Room Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="bg-secondary/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
                <i className="fas fa-sign-in-alt text-secondary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Join Existing Room</h3>
              <p className="text-gray-600">Enter a room code to join a friend's game</p>
              
              <div className="space-y-3">
                <Input
                  placeholder="Enter your name"
                  value={joinPlayerName}
                  onChange={(e) => setJoinPlayerName(e.target.value)}
                />
                <Input
                  placeholder="Enter room code (e.g., ABC123)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="uppercase tracking-wider"
                />
                <Button 
                  onClick={handleJoinRoom}
                  disabled={!joinPlayerName.trim() || !roomCode.trim()}
                  className="w-full bg-secondary text-white hover:bg-secondary/90"
                >
                  Join Room
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
        <div className="text-center space-y-3">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
            <i className="fas fa-wifi text-blue-600 text-xl"></i>
          </div>
          <h4 className="font-semibold text-gray-900">Real-time Play</h4>
          <p className="text-sm text-gray-600">See your opponent's moves instantly</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
            <i className="fas fa-mobile-alt text-green-600 text-xl"></i>
          </div>
          <h4 className="font-semibold text-gray-900">Mobile Friendly</h4>
          <p className="text-sm text-gray-600">Play on any device, anywhere</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
            <i className="fas fa-users text-purple-600 text-xl"></i>
          </div>
          <h4 className="font-semibold text-gray-900">Family Safe</h4>
          <p className="text-sm text-gray-600">Clean, safe environment for all ages</p>
        </div>
      </div>
    </div>
  );
}
