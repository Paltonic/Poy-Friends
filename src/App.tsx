// src/App.tsx
import { useState } from 'react'
import HomeScreen from './HomeScreen'
import GameScreen from './GameScreen'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'vs-ai' | 'multiplayer'>('home')
  const [activeRoomCode, setActiveRoomCode] = useState<string | undefined>(undefined)

  const handleStartGame = (mode: 'vs-ai' | 'multiplayer', code?: string) => {
    setActiveRoomCode(code)
    setCurrentScreen(mode)
  }

  if (currentScreen === 'home') {
    return <HomeScreen onStartGame={handleStartGame} />
  }

  return (
    <GameScreen 
      mode={currentScreen} 
      roomCode={activeRoomCode} 
      onQuit={() => setCurrentScreen('home')} 
    />
  )
}

export default App