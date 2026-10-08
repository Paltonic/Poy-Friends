// src/MusicContext.tsx
import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react'
import bgm from './assets/bgm.mp3'

interface MusicContextType {
  isPlaying: boolean
  toggleMusic: () => void
  pauseMusic: () => void
  resumeMusic: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

const MUTE_KEY = 'poy_music_muted'

export function MusicProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState<boolean>(() => {
    try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false }
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mutedRef = useRef(muted)

  useEffect(() => { mutedRef.current = muted }, [muted])

  // Audio dibuat SEKALI. Tidak pernah dibuat ulang → tidak ada timpa musik.
  useEffect(() => {
    const audio = new Audio(bgm)
    audio.loop = true
    audio.volume = 0.4
    audioRef.current = audio

    const syncPlay = () => setIsPlaying(true)
    const syncPause = () => setIsPlaying(false)
    audio.addEventListener('play', syncPlay)
    audio.addEventListener('pause', syncPause)

    // Coba autoplay (mungkin diblokir browser)
    if (!mutedRef.current) audio.play().catch(() => setIsPlaying(false))

    // Retry pada gesture pertama user (mengatasi autoplay block)
    const removeGestures = () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
      window.removeEventListener('touchstart', onGesture)
    }
    const onGesture = () => {
      if (mutedRef.current) return
      if (audio.paused) {
        audio.play()
          .then(() => { setIsPlaying(true); removeGestures() })
          .catch(() => {})
      } else {
        removeGestures()
      }
    }
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
    window.addEventListener('touchstart', onGesture)

    return () => {
      removeGestures()
      audio.removeEventListener('play', syncPlay)
      audio.removeEventListener('pause', syncPause)
      audio.pause()
      audioRef.current = null
    }
  }, []) // ← JANGAN tambah deps, biar audio tidak dibuat ulang

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      setMuted(true)
      try { localStorage.setItem(MUTE_KEY, '1') } catch {}
    } else {
      setMuted(false)
      try { localStorage.setItem(MUTE_KEY, '0') } catch {}
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [])

  // Pause dari posisi sekarang. Audio element tetap hidup.
  const pauseMusic = useCallback(() => {
    const audio = audioRef.current
    if (audio && !audio.paused) audio.pause()
  }, [])

  // Resume dari posisi terakhir (bukan restart). Kalau di-mute manual, tidak resume.
  const resumeMusic = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.paused && !mutedRef.current) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [])

  const value = useMemo(
    () => ({ isPlaying, toggleMusic, pauseMusic, resumeMusic }),
    [isPlaying, toggleMusic, pauseMusic, resumeMusic]
  )

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) throw new Error('useMusic must be used within MusicProvider')
  return context
}