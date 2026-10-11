// src/HomeScreen.tsx
import { useState, useEffect } from 'react'
import './HomeScreen.css'
import { getLevel, LEVEL_STORAGE_KEY, MAX_LEVEL, resetLevel } from './utils/levelSytem'
import { useMusic } from './MusicContext'

import logoImg from './assets/poy_logo.png'
import playBtnImg from './assets/play_button.png'
import aboutBtnImg from './assets/about_button.png'

interface HomeScreenProps {
  onNavigate: (screen: 'play' | 'about') => void
}

const APP_VERSION = 'v1.0.6'
const APP_CREDIT = '© 2026 Frederick Liko'

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [level, setLevel] = useState<number>(getLevel)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

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

  const handleConfirmReset = () => {
    resetLevel()
    setLevel(1)
    setShowResetConfirm(false)
  }

  return (
    <div className="home-container">
      <button className="music-toggle-btn" onClick={toggleMusic} title="Nyalakan/Matikan Musik">
        {isPlaying ? '🔊' : '🔇'}
      </button>

      {/* Tombol Reset Level */}
      <button
        className="level-reset-btn"
        onClick={() => setShowResetConfirm(true)}
        title="Reset Level"
        aria-label="Reset Level"
      >
        ↺
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

      {/* Modal Konfirmasi Reset Level */}
      {showResetConfirm && (
        <div className="level-reset-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="level-reset-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="level-reset-title">RESET LEVEL?</h2>
            <p className="level-reset-desc">
              Level kamu akan kembali ke <b>1</b>. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="level-reset-actions">
              <button className="level-reset-confirm" onClick={handleConfirmReset}>
                YES, RESET
              </button>
              <button className="level-reset-cancel" onClick={() => setShowResetConfirm(false)}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit & versi di sudut kanan bawah */}
      <div className="home-footer">
        <span className="home-version">{APP_VERSION}</span>
        <span className="home-credit">{APP_CREDIT}</span>
      </div>
    </div>
  )
}