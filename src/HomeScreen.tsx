import { useState, useEffect } from 'react'
import './HomeScreen.css'
import { getLevel } from './utils/levelSystem'

import logoImg from './assets/logo.png' // ← sesuaikan nama file logo Anda

interface HomeScreenProps {
  onNavigate: (screen: 'play' | 'about') => void
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [level, setLevel] = useState(getLevel())

  useEffect(() => {
    // Refresh setiap kali kembali ke Home
    setLevel(getLevel())
  }, [])

  return (
    <div className="home-container">
      <div className="title-wrapper">
        <img src={logoImg} alt="PoyNFriends" className="game-logo-img" />
      </div>

      {/* === LEVEL DISPLAY === */}
      <div className="home-level-display">
        <span className="home-level-label">LEVEL</span>
        <span className="home-level-value">{level}</span>
        <span className="home-level-max">/ 5</span>
      </div>

      <div className="main-menu">
        <button
          className="modern-menu-btn play-btn"
          onClick={() => onNavigate('play')}
        >
          PLAY
        </button>
        <button
          className="modern-menu-btn about-btn"
          onClick={() => onNavigate('about')}
        >
          ABOUT
        </button>
      </div>
    </div>
  )
}