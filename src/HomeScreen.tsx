// src/HomeScreen.tsx
import { useState } from 'react'
import PlayScreen from './PlayScreen'
import './HomeScreen.css'

import bgImage from './assets/bgimage.jpeg'
import poyLogo from './assets/poy_logo.png' 

interface HomeScreenProps {
  // UPDATED: Added the isHost boolean to pass it up to your main App file
  onStartGame: (mode: 'vs-ai' | 'multiplayer', code?: string, isHost?: boolean) => void
}

export default function HomeScreen({ onStartGame }: HomeScreenProps) {
  const [currentView, setCurrentView] = useState<'main' | 'play'>('main')

  if (currentView === 'play') {
    return <PlayScreen onStartGame={onStartGame} onBack={() => setCurrentView('main')} />
  }

  return (
    <div 
      className="home-container" 
      style={{ background: `#60a3bc url(${bgImage}) no-repeat center bottom`, backgroundSize: 'cover' }}
    >

      <div className="title-wrapper">
        <img src={poyLogo} alt="POY & FRIENDS" className="game-logo-img" />
      </div>

      <div className="main-menu">
        <button className="modern-menu-btn play-btn" onClick={() => setCurrentView('play')}>
          PLAY
        </button>
        <button className="modern-menu-btn about-btn" onClick={() => alert('Tutorial coming soon!')}>
          ABOUT
        </button>
      </div>
    </div>
  )
}