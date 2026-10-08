import { useState, useEffect } from 'react'
import './HomeScreen.css'
import { getLevel, LEVEL_STORAGE_KEY, MAX_LEVEL } from './utils/levelSytem'

import logoImg from './assets/poy_logo.png'

interface HomeScreenProps {
  onNavigate: (screen: 'play' | 'about') => void
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [level, setLevel] = useState<number>(getLevel)

  useEffect(() => {
    // Refresh saat mount
    setLevel(getLevel())

    // Sync kalau ada perubahan dari tab lain
    const onStorage = (e: StorageEvent) => {
      if (e.key === LEVEL_STORAGE_KEY) setLevel(getLevel())
    }
    window.addEventListener('storage', onStorage)

    // Refresh saat tab kembali aktif
    const onFocus = () => setLevel(getLevel())
    window.addEventListener('focus', onFocus)
    window.addEventListener('visibilitychange', onFocus)

    // Polling ringan (fallback kalau tidak ada event)
    const interval = setInterval(() => {
      const cur = getLevel()
      setLevel(prev => (prev !== cur ? cur : prev))
    }, 800)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('visibilitychange', onFocus)
      clearInterval(interval)
    }
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
        <span className="home-level-max">/ {MAX_LEVEL}</span>
      </div>

      <div className="main-menu">
        <button
          className="modern-menu-btn play-btn"
          onClick={() => onNavigate('play')}
        >
          PLAY
        </button>
        <button
          className="modern-menu-btn abouts-btn"
          onClick={() => onNavigate('about')}
        >
          ABOUT
        </button>
      </div>
    </div>
  )
}