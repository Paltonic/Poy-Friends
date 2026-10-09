// src/HomeScreen.tsx
import { useState, useEffect } from 'react'
import './HomeScreen.css'
import { getLevel, LEVEL_STORAGE_KEY, MAX_LEVEL } from './utils/levelSytem'
import { useMusic } from './MusicContext'

import logoImg from './assets/poy_logo.png'
import playBtnImg from './assets/play_button.png'
import aboutBtnImg from './assets/about_button.png'

interface HomeScreenProps {
  onNavigate: (screen: 'play' | 'about') => void
}

const APP_VERSION = 'v1.0.5' // ← ubah manual setiap rilis
const APP_CREDIT = '© 2026 Frederick Liko'

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [level, setLevel] = useState<number>(getLevel)

  const { isPlaying, toggleMusic } = useMusic()

  useEffect(() => {
    setLevel(getLevel())

    const onStorage = (e: StorageEvent) => {
      if (e.key === LEVEL_STORAGE_KEY) setLevel(getLevel())
    }
    window.addEventListener('storage', onStorage)

    const onFocus = () => setLevel(getLevel())
    window.addEventListener('focus', onFocus)
    window.addEventListener('visibilitychange', onFocus)

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
      <button className="music-toggle-btn" onClick={toggleMusic} title="Nyalakan/Matikan Musik">
        {isPlaying ? '🔊' : '🔇'}
      </button>

      <div className="title-wrapper">
        <img src={logoImg} alt="PoyNFriends" className="game-logo-img" />
      </div>

      <div className="home-level-display">
        <span className="home-level-label">LEVEL</span>
        <span className="home-level-value">{level}</span>
        <span className="home-level-max">/ {MAX_LEVEL}</span>
      </div>

      <div className="main-menu">
        <button className="image-menu-btn" onClick={() => onNavigate('play')}>
          <img src={playBtnImg} alt="Play" className="menu-btn-img" />
        </button>
        <button className="image-menu-btn" onClick={() => onNavigate('about')}>
          <img src={aboutBtnImg} alt="About" className="menu-btn-img" />
        </button>
      </div>

      {/* Credit & versi di sudut kanan bawah */}
      <div className="home-footer">
        <span className="home-credit">{APP_CREDIT}</span>
        <span className="home-version">{APP_VERSION}</span>
      </div>
    </div>
  )
}