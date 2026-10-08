// src/App.tsx
import { useState, useEffect } from 'react'
import { MusicProvider, useMusic } from './MusicContext'

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

/**
 * AppShell adalah komponen DALAM MusicProvider,
 * sehingga boleh memakai useMusic().
 */
function AppShell() {
  const [screen, setScreen] = useState<Screen>('home')
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)

  const { pauseMusic, resumeMusic } = useMusic()

  // ⚠️ KUNCI: pause saat masuk game, resume saat keluar game.
  //    Audio element-nya SAMA → resume lanjut dari posisi terakhir,
  //    bukan mulai dari 0. Tidak ada audio baru yang dibuat.
  useEffect(() => {
    if (screen === 'game') {
      pauseMusic()
    } else {
      resumeMusic()
    }
  }, [screen, pauseMusic, resumeMusic])

  // Dipanggil PlayScreen saat user memilih VS AI / Create / Join
  const handleStartGame = (
    mode: 'vs-ai' | 'multiplayer',
    roomCode?: string,
    isHost?: boolean
  ) => {
    setGameConfig({ mode, roomCode, isHost })
    setScreen('game')
  }

  // Dipanggil GameScreen saat user keluar dari game
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

export default function App() {
  return (
    <MusicProvider>
      <AppShell />
    </MusicProvider>
  )
}