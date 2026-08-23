// src/HomeScreen.tsx
import { useState } from 'react'
import PlayScreen from './PlayScreen'
import './HomeScreen.css'

interface HomeScreenProps {
  onStartGame: (mode: 'vs-ai' | 'multiplayer', code?: string) => void
}

export default function HomeScreen({ onStartGame }: HomeScreenProps) {
  const [currentView, setCurrentView] = useState<'main' | 'play'>('main')

  if (currentView === 'play') {
    return <PlayScreen onStartGame={onStartGame} onBack={() => setCurrentView('main')} />
  }

  return (
    <div className="home-container">
      <div className="title-wrapper">
        <h1 className="game-title">POY & FRIENDS</h1>
        <p className="subtitle">Welcome to the Jungle</p>
      </div>

      <div className="main-menu">
        <button className="au-main-btn play-btn" onClick={() => setCurrentView('play')}>
          PLAY
        </button>
        <button className="au-main-btn how-btn" onClick={() => alert('Tutorial coming soon!')}>
          HOW TO PLAY
        </button>
      </div>
    </div>
  )
}