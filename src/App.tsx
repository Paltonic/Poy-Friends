// src/App.tsx
import { useState } from 'react'
import HomeScreen from './HomeScreen'
import PlayScreen from './PlayScreen' // Ini Lobby (Create/Join Room)
import GameScreen from './GameScreen' // Ini tempat main kartu PUY/PAY
import AboutScreen from './AboutScreen' 
import './App.css'

function App() {
  // Tambahkan 'about' dan pisahkan 'play' (lobby) dengan 'game'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'play' | 'about' | 'game'>('home')
  
  const [activeRoomCode, setActiveRoomCode] = useState<string | undefined>(undefined)
  const [isHost, setIsHost] = useState<boolean>(false)
  const [gameMode, setGameMode] = useState<'vs-ai' | 'multiplayer'>('vs-ai')

  // Fungsi ini dipanggil dari PlayScreen saat pemain klik "Create", "Join", atau "VS AI"
  const handleStartGame = (mode: 'vs-ai' | 'multiplayer', code?: string, host: boolean = false) => {
    setActiveRoomCode(code)
    setIsHost(host)
    setGameMode(mode)
    setCurrentScreen('game') // Pindah ke GameScreen
  }

  // --- ROUTING LAYAR ---
  if (currentScreen === 'home') {
    return <HomeScreen onNavigate={setCurrentScreen} />
  }

  if (currentScreen === 'play') {
    // Kirim onBack (untuk kembali ke home) dan onStartGame (untuk masuk ke game)
    return <PlayScreen onBack={() => setCurrentScreen('home')} onStartGame={handleStartGame} />
  }

  if (currentScreen === 'about') {
    return <AboutScreen onNavigate={setCurrentScreen} />
  }

  if (currentScreen === 'game') {
    return (
      <GameScreen 
        mode={gameMode} 
        roomCode={activeRoomCode} 
        isHost={isHost} 
        onQuit={() => setCurrentScreen('home')} 
      />
    )
  }

  return null
}

export default App