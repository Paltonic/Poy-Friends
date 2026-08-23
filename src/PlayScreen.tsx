// src/PlayScreen.tsx
import { useState } from 'react'
import './PlayScreen.css'

interface PlayScreenProps {
  onStartGame: (mode: 'vs-ai' | 'multiplayer', code?: string) => void
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
    <div className="play-screen-container">
      {/* Top Left Jagged Glass Back Button */}
      <button className="glass-back-btn" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      {/* Asymmetric Play Options Grid */}
      <div className="play-grid">
        
        {/* CREATE ROOM CARD (Side-by-Side Left) */}
        <div className="jagged-card create-card" onClick={handleCreateRoom}>
          <div className="card-badge">HOST</div>
          <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="card-label">CREATE ROOM</span>
        </div>

        {/* JOIN ROOM CARD (Side-by-Side Right) */}
        <div className="jagged-card join-card" onClick={() => setShowJoinModal(true)}>
          <div className="card-badge">ENTER</div>
          <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="card-label">JOIN ROOM</span>
        </div>

        {/* SLEEPING HORIZONTAL VS AI CARD (Bottom Full-Width) */}
        <div className="jagged-card ai-card-horizontal" onClick={() => onStartGame('vs-ai')}>
          <div className="ai-icon-wrapper">
            <svg className="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="8.5" cy="16" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="16" r="1.5" fill="currentColor" />
              <path d="M12 2v6M9 4h6" strokeLinecap="round" />
            </svg>
            <span className="zzz-text">zZz...</span>
          </div>
          <div className="ai-text-content">
            <span className="card-label-large">VS AI</span>
            <span className="ai-subtext">OFFLINE BOT MATCH</span>
          </div>
        </div>

      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content jagged-modal">
            <h2>ROOM CODE</h2>
            <div className="code-display">{roomCode}</div>
            <p>Share code with your opponent!</p>
            <button className="au-modal-btn" onClick={() => onStartGame('multiplayer', roomCode)}>
              ENTER ROOM
            </button>
            <button className="text-btn" onClick={() => setShowCreateModal(false)}>CANCEL</button>
          </div>
        </div>
      )}

      {/* JOIN ROOM MODAL */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-content jagged-modal">
            <h2>JOIN ROOM</h2>
            <input 
              type="number" 
              className="code-input"
              placeholder="4-DIGITS"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.slice(0, 4))}
            />
            <button 
              className="au-modal-btn" 
              disabled={joinInput.length !== 4}
              onClick={() => onStartGame('multiplayer', joinInput)}
            >
              JOIN GAME
            </button>
            <button className="text-btn" onClick={() => setShowJoinModal(false)}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  )
}