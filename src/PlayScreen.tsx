import { useState } from 'react'
import './PlayScreen.css'
import { getLevel } from './utils/levelSytem'
// PENTING: Sesuaikan path import ini dengan lokasi file supabase client milikmu
// Contoh: import { supabase } from '../lib/supabaseClient'
import { supabase } from './supabaseClient' 

interface PlayScreenProps {
  onBack: () => void
  onStartGame: (mode: 'vs-ai' | 'multiplayer', roomCode?: string, isHost?: boolean) => void
}

export default function PlayScreen({ onBack, onStartGame }: PlayScreenProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  
  // State tambahan untuk menangani proses ke Supabase
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const currentLevel = getLevel()

  // 1. Buka modal Create dan generate kode acak
  const handleCreateRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedCode(code)
    setErrorMessage('')
    setShowCreateModal(true)
  }

  // 2. Konfirmasi Create: Simpan kode ke Supabase
  const handleConfirmCreate = async () => {
    setIsLoading(true)
    setErrorMessage('')

    // Simpan ke tabel 'rooms'
    const { error } = await supabase
      .from('rooms')
      .insert([{ code: generatedCode }])

    setIsLoading(false)

    if (error) {
      console.error('Error creating room:', error)
      setErrorMessage('Gagal membuat room. Cek koneksi atau coba lagi.')
    } else {
      setShowCreateModal(false)
      onStartGame('multiplayer', generatedCode, true)
    }
  }

  // 3. Buka modal Join
  const handleJoinRoom = () => {
    setJoinCode('')
    setErrorMessage('')
    setShowJoinModal(true)
  }

  // 4. Konfirmasi Join: Cek apakah kode ada di Supabase
  const handleConfirmJoin = async () => {
    if (joinCode.length === 4) {
      setIsLoading(true)
      setErrorMessage('')

      // Cek kode di tabel 'rooms'
      const { data, error } = await supabase
        .from('rooms')
        .select('code')
        .eq('code', joinCode)
        .maybeSingle() // Gunakan maybeSingle agar tidak error jika data kosong

      setIsLoading(false)

      if (error) {
        console.error('Error joining room:', error)
        setErrorMessage('Terjadi kesalahan. Coba lagi.')
      } else if (!data) {
        // Jika data tidak ditemukan (tabel kosong / kode salah)
        setErrorMessage('ROOM NOT FOUND. Check the code and try again.')
      } else {
        // Jika ketemu
        setShowJoinModal(false)
        onStartGame('multiplayer', joinCode, false)
      }
    }
  }

  return (
    <div className="play-screen-container">
      <button className="modern-back-btn" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <div className="play-grid">
        {/* CREATE ROOM */}
        <div className="modern-card create-card" onClick={handleCreateRoom}>
          <svg className="card-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="card-label">Create</span>
        </div>

        {/* JOIN ROOM */}
        <div className="modern-card join-card" onClick={handleJoinRoom}>
          <svg className="card-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span className="card-label">Join</span>
        </div>

        {/* VS AI */}
        <div className="modern-card ai-card-horizontal" onClick={() => onStartGame('vs-ai')}>
          <div className="ai-icon-wrapper">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
          </div>
          <div className="ai-text-content">
            <span className="card-label-large">VS AI</span>
            <span className="ai-subtext">LEVEL {currentLevel} / 5</span>
          </div>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => !isLoading && setShowCreateModal(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <h2>ROOM CODE</h2>
            <p>Share this code with your friend</p>
            <div className="code-display">{generatedCode}</div>
            
            {errorMessage && (
              <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '10px', fontWeight: 'bold' }}>
                {errorMessage}
              </p>
            )}
            
            <button 
              className="modern-modal-btn" 
              onClick={handleConfirmCreate} 
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'CREATING...' : 'START'}
            </button>
            <button 
              className="modern-text-btn" 
              onClick={() => setShowCreateModal(false)} 
              disabled={isLoading}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* JOIN ROOM MODAL */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => !isLoading && setShowJoinModal(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <h2>ENTER CODE</h2>
            <p>Ask your friend for the room code</p>
            <input
              type="number"
              className="code-input"
              placeholder="0000"
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.slice(0, 4))}
              autoFocus
              disabled={isLoading}
            />
            
            {errorMessage && (
              <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '10px', fontWeight: 'bold' }}>
                {errorMessage}
              </p>
            )}

            <button
              className="modern-modal-btn"
              disabled={joinCode.length !== 4 || isLoading}
              onClick={handleConfirmJoin}
              style={{ opacity: (joinCode.length !== 4 || isLoading) ? 0.7 : 1 }}
            >
              {isLoading ? 'CHECKING...' : 'JOIN'}
            </button>
            <button 
              className="modern-text-btn" 
              onClick={() => setShowJoinModal(false)} 
              disabled={isLoading}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}