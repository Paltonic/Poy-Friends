// src/MusicContext.tsx
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import bgm from './assets/bgm.mp3'

interface MusicContextType {
  isPlaying: boolean
  toggleMusic: () => void
  pauseMusic: () => void
  resumeMusic: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserEnabled, setHasUserEnabled] = useState(true) // user preference (mute/unmute)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
      if (audioRef.current && audioRef.current.paused && hasUserEnabled) {
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
    }
  }, [hasUserEnabled])

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        setHasUserEnabled(false)
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
        setHasUserEnabled(true)
      }
    }
  }

  // Dipakai oleh App.tsx saat masuk halaman Game
  const pauseMusic = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Dipakai oleh App.tsx saat keluar dari halaman Game
  const resumeMusic = () => {
    if (audioRef.current && hasUserEnabled && audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic, pauseMusic, resumeMusic }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) throw new Error('useMusic must be used within MusicProvider')
  return context
}