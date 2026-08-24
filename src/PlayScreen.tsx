import { useState } from 'react'
import './PlayScreen.css'

import bgImage from './assets/bgimage.jpeg'

interface PlayScreenProps {
  // NEW: Added the isHost boolean to the function signature
  onStartGame: (mode: 'vs-ai' | 'multiplayer', code?: string, isHost?: boolean) => void
  onBack: () => void
}

export default function PlayScreen({ onStartGame, onBack }: PlayScreenProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [joinInput, setJoinInput] = useState('')

  const handleCreateRoom = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString()
    setRoomCode(newCode)
    setShowCreateModal(true)
  }

  return (
    <div 
      className="play-screen-container"
      style={{ background: `#60a3bc url(${bgImage}) no-repeat center bottom`, backgroundSize: 'cover' }}
    >
      <button className="modern-back-btn fixed-top-left" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <div className="play-grid">
        <div className="modern-card create-card" onClick={handleCreateRoom}>
          <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="card-label">CREATE</span>
        </div>

        <div className="modern-card join-card" onClick={() => setShowJoinModal(true)}>
          <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="card-label">JOIN</span>
        </div>

        <div className="modern-card ai-card-horizontal" onClick={() => onStartGame('vs-ai')}>
          <div className="ai-icon-wrapper">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="8.5" cy="16" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="16" r="1.5" fill="currentColor" />
              <path d="M12 2v6M9 4h6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="ai-text-content">
            <span className="card-label-large">VS AI</span>
            <span className="ai-subtext">OFFLINE BOT MATCH</span>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content modern-modal">
            <h2>ROOM CODE</h2>
            <div className="code-display">{roomCode}</div>
            <p>Share code with your opponent!</p>
            {/* NEW: Passed `true` because this user is the HOST */}
            <button className="modern-modal-btn" onClick={() => onStartGame('multiplayer', roomCode, true)}>
              ENTER ROOM
            </button>
            <button className="modern-text-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-content modern-modal">
            <h2>JOIN ROOM</h2>
            <input 
              type="number" 
              className="code-input"
              placeholder="0000"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.slice(0, 4))}
            />
            {/* NEW: Passed `false` because this user is a JOINER */}
            <button 
              className="modern-modal-btn" 
              disabled={joinInput.length !== 4}
              onClick={() => onStartGame('multiplayer', joinInput, false)}
            >
              JOIN GAME
            </button>
            <button className="modern-text-btn" onClick={() => setShowJoinModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}