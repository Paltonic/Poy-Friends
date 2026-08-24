// src/HomeScreen.tsx
import { useState } from 'react'
import PlayScreen from './PlayScreen'
import './HomeScreen.css'

import bgImage from './assets/forestbg.jpeg'
import poyLogo from './assets/poy_logo.png' 

// NEW: Import your newly generated button images!
import playBtnImg from './assets/play_button.png'
import aboutBtnImg from './assets/about_button.png'

interface HomeScreenProps {
  onStartGame: (mode: 'vs-ai' | 'multiplayer', code?: string) => void
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
        <button className="image-btn" onClick={() => setCurrentView('play')}>
          <img src={playBtnImg} alt="PLAY" />
        </button>
        <button className="image-btn" onClick={() => alert('Tutorial coming soon!')}>
          <img src={aboutBtnImg} alt="HOW TO PLAY" />
        </button>
      </div>
    </div>
  )
}