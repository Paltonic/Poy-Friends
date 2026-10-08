// src/App.tsx
import { useState, useEffect } from 'react'
import { useMusic } from './MusicContext'   // ← HANYA useMusic, JANGAN MusicProvider

import HomeScreen from './HomeScreen'
import PlayScreen from './PlayScreen'
import AboutScreen from './AboutScreen'
import GameScreen from './GameScreen'

type Screen = 'home' | 'play' | 'about' | 'game'

interface GameConfig {
  mode: 'vs-ai' | 'multiplayer'
  roomCode?: string
  isHost?: boolean
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)

  const { pauseMusic, resumeMusic } = useMusic()

  // pause saat masuk game, resume saat keluar game.
  // Audio element-nya SAMA → resume lanjut dari posisi terakhir.
  useEffect(() => {
    if (screen === 'game') {
      pauseMusic()
    } else {
      resumeMusic()
    }
  }, [screen, pauseMusic, resumeMusic])

  const handleStartGame = (
    mode: 'vs-ai' | 'multiplayer',
    roomCode?: string,
    isHost?: boolean
  ) => {
    setGameConfig({ mode, roomCode, isHost })
    setScreen('game')
  }

  const handleExitGame = () => {
    setGameConfig(null)
    setScreen('home')
  }

  return (
    <>
      {screen === 'home' && (
        <HomeScreen onNavigate={(s) => setScreen(s)} />
      )}

      {screen === 'play' && (
        <PlayScreen
          onBack={() => setScreen('home')}
          onStartGame={handleStartGame}
        />
      )}

      {screen === 'about' && (
        <AboutScreen onNavigate={(s) => setScreen(s)} />
      )}

      {screen === 'game' && gameConfig && (
        <GameScreen
          mode={gameConfig.mode}
          roomCode={gameConfig.roomCode}
          isHost={gameConfig.isHost}
          onExit={handleExitGame}
        />
      )}
    </>
  )
}