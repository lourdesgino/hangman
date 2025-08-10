import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WelcomeRejoinProps {
  onJoinRoom: (playerName: string, roomCode?: string) => void;
  onRejoinRoom: (playerName: string, roomCode: string) => void;
  setPlayerId: (playerId: string) => void;
}

export default function WelcomeRejoin({ onJoinRoom, onRejoinRoom, setPlayerId }: WelcomeRejoinProps) {
  const [createPlayerName, setCreatePlayerName] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [rejoinPlayerName, setRejoinPlayerName] = useState("");
  const [rejoinRoomCode, setRejoinRoomCode] = useState("");

  const handleCreateRoom = () => {
    if (!createPlayerName.trim()) return;
    setPlayerId(createPlayerName.trim());
    onJoinRoom(createPlayerName.trim());
  };

  const handleJoinRoom = () => {
    if (!joinPlayerName.trim() || !joinRoomCode.trim()) return;
    setPlayerId(joinPlayerName.trim());
    onJoinRoom(joinPlayerName.trim(), joinRoomCode.trim().toUpperCase());
  };

  const handleRejoinRoom = () => {
    if (!rejoinPlayerName.trim() || !rejoinRoomCode.trim()) return;
    setPlayerId(rejoinPlayerName.trim());
    onRejoinRoom(rejoinPlayerName.trim(), rejoinRoomCode.trim().toUpperCase());
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-gray-900">Ready to Play Hangman?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create a room to start a new game, join an existing room, or rejoin a game in progress.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Room</TabsTrigger>
            <TabsTrigger value="join">Join Room</TabsTrigger>
            <TabsTrigger value="rejoin">Rejoin Game</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-6">
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
          </TabsContent>

          <TabsContent value="join" className="mt-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="bg-secondary/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
                    <i className="fas fa-sign-in-alt text-secondary text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Join New Room</h3>
                  <p className="text-gray-600">Enter a room code to join a friend's new game</p>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter your name"
                      value={joinPlayerName}
                      onChange={(e) => setJoinPlayerName(e.target.value)}
                    />
                    <Input
                      placeholder="Enter room code (e.g., ABC123)"
                      value={joinRoomCode}
                      onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                      className="uppercase tracking-wider"
                    />
                    <Button 
                      onClick={handleJoinRoom}
                      disabled={!joinPlayerName.trim() || !joinRoomCode.trim()}
                      className="w-full bg-secondary text-white hover:bg-secondary/90"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejoin" className="mt-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
                    <i className="fas fa-redo text-accent text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Rejoin Game</h3>
                  <p className="text-gray-600">Continue a game in progress with your saved score</p>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter your exact name"
                      value={rejoinPlayerName}
                      onChange={(e) => setRejoinPlayerName(e.target.value)}
                    />
                    <Input
                      placeholder="Enter room code (e.g., ABC123)"
                      value={rejoinRoomCode}
                      onChange={(e) => setRejoinRoomCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleRejoinRoom()}
                      className="uppercase tracking-wider"
                    />
                    <Button 
                      onClick={handleRejoinRoom}
                      disabled={!rejoinPlayerName.trim() || !rejoinRoomCode.trim()}
                      className="w-full bg-accent text-white hover:bg-accent/90"
                    >
                      Rejoin Game
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
        <div className="text-center space-y-3">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
            <i className="fas fa-wifi text-blue-600 text-xl"></i>
          </div>
          <h4 className="font-semibold text-gray-900">Real-time Play</h4>
          <p className="text-sm text-gray-600">See moves instantly across the globe</p>
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
            <i className="fas fa-save text-purple-600 text-xl"></i>
          </div>
          <h4 className="font-semibold text-gray-900">Game Persistence</h4>
          <p className="text-sm text-gray-600">Rejoin games and keep your score</p>
        </div>
        <div className="text-center space-y-3">
          <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
            <i className="fas fa-users text-orange-600 text-xl"></i>
          </div>
          <h4 className="font-semibold text-gray-900">Turn-Based</h4>
          <p className="text-sm text-gray-600">Take turns giving and guessing words</p>
        </div>
      </div>
    </div>
  );
}