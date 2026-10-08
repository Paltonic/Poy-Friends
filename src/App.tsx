// src/App.tsx
import { useState, useEffect } from 'react'
import './App.css'
import HomeScreen from './HomeScreen'
import PlayScreen from './PlayScreen'
import AboutScreen from './AboutScreen'
import GameScreen from './GameScreen'
import { useMusic } from './MusicContext'

type Screen = 'home' | 'play' | 'about' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [gameMode, setGameMode] = useState<'vs-ai' | 'multiplayer'>('vs-ai')
  const [roomCode, setRoomCode] = useState<string | undefined>()
  const [isHost, setIsHost] = useState<boolean>(false)

  const { pauseMusic, resumeMusic } = useMusic()

  // === Kontrol musik berdasarkan halaman ===
  useEffect(() => {
    if (screen === 'game') {
      pauseMusic()
    } else {
      resumeMusic()
    }
  }, [screen, pauseMusic, resumeMusic])

  const handleStartGame = (
    mode: 'vs-ai' | 'multiplayer',
    code?: string,
    host?: boolean
  ) => {
    setGameMode(mode)
    setRoomCode(code)
    setIsHost(host ?? false)
    setScreen('game')
  }

  return (
    <>
      {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
      {screen === 'play' && (
        <PlayScreen
          onBack={() => setScreen('home')}
          onStartGame={handleStartGame}
        />
      )}
      {screen === 'about' && <AboutScreen onNavigate={setScreen} />}
      {screen === 'game' && (
        <GameScreen
          mode={gameMode}
          roomCode={roomCode}
          isHost={isHost}
          onExit={() => setScreen('home')}
        />
      )}
    </>
  )
}