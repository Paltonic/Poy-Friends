// src/App.tsx
import { useState } from 'react'
import HomeScreen from './HomeScreen'
import GameScreen from './GameScreen'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'vs-ai' | 'multiplayer'>('home')
  const [activeRoomCode, setActiveRoomCode] = useState<string | undefined>(undefined)
  
  // --- NEW: Add state to track if the current player is the host ---
  const [isHost, setIsHost] = useState<boolean>(false)

  // --- UPDATED: Catch the `host` flag coming from PlayScreen ---
  const handleStartGame = (mode: 'vs-ai' | 'multiplayer', code?: string, host: boolean = false) => {
    setActiveRoomCode(code)
    setIsHost(host) // Save the host status!
    setCurrentScreen(mode)
  }

  if (currentScreen === 'home') {
    return <HomeScreen onStartGame={handleStartGame} />
  }

  return (
    <GameScreen 
      mode={currentScreen} 
      roomCode={activeRoomCode} 
      isHost={isHost} /* --- NEW: Pass the host status down to GameScreen --- */
      onQuit={() => setCurrentScreen('home')} 
    />
  )
}

export default App