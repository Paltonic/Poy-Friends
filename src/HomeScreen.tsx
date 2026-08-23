// src/HomeScreen.tsx
import { useState } from 'react'
import './HomeScreen.css'

interface HomeScreenProps {
  onStartGame: (mode: 'vs-ai' | 'multiplayer', code?: string) => void;
}

export default function HomeScreen({ onStartGame }: HomeScreenProps) {
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
    <div className="home-container">
      <h1 className="game-title">POY & FRIENDS</h1>
      <p className="subtitle">The ultimate event battle</p>

      <div className="menu-buttons">
        <button className="menu-btn primary-btn" onClick={handleCreateRoom}>
          Create Private Room
        </button>
        <button className="menu-btn secondary-btn" onClick={() => setShowJoinModal(true)}>
          Join with Code
        </button>
        <button className="menu-btn outline-btn" onClick={() => onStartGame('vs-ai')}>
          Practice vs AI
        </button>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Your Room Code</h2>
            <div className="code-display">{roomCode}</div>
            <p>Tell your friend to enter this code!</p>
            <button className="menu-btn primary-btn mt-4" onClick={() => onStartGame('multiplayer', roomCode)}>
              Enter Waiting Room
            </button>
            <button className="text-btn mt-2" onClick={() => setShowCreateModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Join Room</h2>
            <input 
              type="number" 
              className="code-input"
              placeholder="Enter 4-digit code"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.slice(0, 4))}
            />
            <button 
              className="menu-btn secondary-btn mt-4" 
              disabled={joinInput.length !== 4}
              onClick={() => onStartGame('multiplayer', joinInput)}
            >
              Join Game
            </button>
            <button className="text-btn mt-2" onClick={() => setShowJoinModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}