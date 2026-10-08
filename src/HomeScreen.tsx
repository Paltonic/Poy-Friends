// src/HomeScreen.tsx
import { useState, useEffect, useRef } from 'react'
import './HomeScreen.css'
import { getLevel, LEVEL_STORAGE_KEY, MAX_LEVEL } from './utils/levelSytem'

import logoImg from './assets/poy_logo.png'
// IMPORT GAMBAR TOMBOL DI SINI
import playBtnImg from './assets/play_button.png'
import aboutBtnImg from './assets/about_button.png'

// IMPORT FILE MUSIK DI SINI
import bgm from './assets/bgm.mp3' 

interface HomeScreenProps {
  onNavigate: (screen: 'play' | 'about') => void
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [level, setLevel] = useState<number>(getLevel)
  
  // State dan Ref untuk Musik
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // === LOGIKA LEVEL ===
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

  // === LOGIKA MUSIK ===
  useEffect(() => {
    audioRef.current = new Audio(bgm)
    audioRef.current.loop = true
    audioRef.current.volume = 0.4

    audioRef.current.play().then(() => {
      setIsPlaying(true)
    }).catch(() => {
      setIsPlaying(false)
    })

    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true)
          document.removeEventListener('click', handleFirstInteraction)
          document.removeEventListener('touchstart', handleFirstInteraction)
        }).catch(() => {})
      }
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('touchstart', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }
  }

  return (
    <div className="home-container">
      
      {/* Tombol Toggle Musik */}
      <button className="music-toggle-btn" onClick={toggleMusic} title="Nyalakan/Matikan Musik">
        {isPlaying ? '🔊' : '🔇'}
      </button>

      <div className="title-wrapper">
        <img src={logoImg} alt="PoyNFriends" className="game-logo-img" />
      </div>

      {/* === LEVEL DISPLAY === */}
      <div className="home-level-display">
        <span className="home-level-label">LEVEL</span>
        <span className="home-level-value">{level}</span>
        <span className="home-level-max">/ {MAX_LEVEL}</span>
      </div>

      {/* === TOMBOL MENU MENGGUNAKAN GAMBAR === */}
      <div className="main-menu">
        <button
          className="image-menu-btn"
          onClick={() => onNavigate('play')}
        >
          <img src={playBtnImg} alt="Play" className="menu-btn-img" />
        </button>
        
        <button
          className="image-menu-btn"
          onClick={() => onNavigate('about')}
        >
          <img src={aboutBtnImg} alt="About" className="menu-btn-img" />
        </button>
      </div>
    </div>
  )
}