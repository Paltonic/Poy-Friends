import { useState } from 'react'
import './PlayScreen.css'
import { getLevel } from './utils/levelSystem'

interface PlayScreenProps {
  onBack: () => void
  onStartGame: (mode: 'vs-ai' | 'multiplayer', roomCode?: string, isHost?: boolean) => void
}

export default function PlayScreen({ onBack, onStartGame }: PlayScreenProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [joinCode, setJoinCode] = useState('')

  const currentLevel = getLevel()

  const handleCreateRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedCode(code)
    setShowCreateModal(true)
  }

  const handleConfirmCreate = () => {
    setShowCreateModal(false)
    onStartGame('multiplayer', generatedCode, true)
  }

  const handleJoinRoom = () => {
    setJoinCode('')
    setShowJoinModal(true)
  }

  const handleConfirmJoin = () => {
    if (joinCode.length === 4) {
      setShowJoinModal(false)
      onStartGame('multiplayer', joinCode, false)
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

        {/* VS AI — with LEVEL display */}
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
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <h2>ROOM CODE</h2>
            <p>Share this code with your friend</p>
            <div className="code-display">{generatedCode}</div>
            <button className="modern-modal-btn" onClick={handleConfirmCreate}>
              START
            </button>
            <button className="modern-text-btn" onClick={() => setShowCreateModal(false)}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* JOIN ROOM MODAL */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
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
            />
            <button
              className="modern-modal-btn"
              disabled={joinCode.length !== 4}
              onClick={handleConfirmJoin}
            >
              JOIN
            </button>
            <button className="modern-text-btn" onClick={() => setShowJoinModal(false)}>
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}