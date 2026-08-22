// src/GameScreen.tsx
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

import puyImg from './assets/PUY.png'
import payImg from './assets/PAY.png'
import peyImg from './assets/PEY.png'
import piyImg from './assets/PIY.png'
import poyImg from './assets/POY.png'

const myCards = [puyImg, payImg, peyImg, piyImg, poyImg]

interface GameScreenProps {
  mode: 'vs-ai' | 'multiplayer'
  roomCode?: string
  onQuit: () => void
}

export default function GameScreen({ mode, roomCode, onQuit }: GameScreenProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [confirmedCardIndex, setConfirmedCardIndex] = useState<number | null>(null)
  const [opponentCardIndex, setOpponentCardIndex] = useState<number | null>(null)
  
  const [score, setScore] = useState({ player: 0, opponent: 0 })
  const [roundResult, setRoundResult] = useState<string | null>(null)
  
  // Multiplayer specific state
  const [isPlayer1, setIsPlayer1] = useState<boolean>(true)
  const [opponentConnected, setOpponentConnected] = useState<boolean>(false)

  // --- MULTIPLAYER SETUP & LISTENER ---
  useEffect(() => {
    if (mode !== 'multiplayer' || !roomCode) return

    const setupMatch = async () => {
      // Check if room exists
      const { data } = await supabase.from('matches').select('*').eq('room_code', roomCode).single()

      if (!data) {
        // Room doesn't exist, I am Player 1
        setIsPlayer1(true)
        await supabase.from('matches').insert([{ room_code: roomCode, status: 'waiting' }])
      } else {
        // Room exists, I am Player 2
        setIsPlayer1(false)
        setOpponentConnected(true)
        await supabase.from('matches').update({ status: 'playing' }).eq('room_code', roomCode)
      }
    }

    setupMatch()

    // Listen to changes in the Supabase database
    const channel = supabase
      .channel(`room_${roomCode}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `room_code=eq.${roomCode}` },
        (payload) => {
          const match = payload.new
          
          if (match.status === 'playing') setOpponentConnected(true)

          // If both players made a move, resolve the round!
          if (match.player1_move !== null && match.player2_move !== null) {
            const myMove = isPlayer1 ? match.player1_move : match.player2_move
            const theirMove = isPlayer1 ? match.player2_move : match.player1_move
            
            // Only resolve if we haven't already seen this result
            setOpponentCardIndex(theirMove)
            const result = checkWinner(myMove, theirMove)
            
            if (result === 'win') {
              setRoundResult('WIN! 🎉')
              setScore(prev => ({ ...prev, player: prev.player + 1 }))
            } else if (result === 'lose') {
              setRoundResult('LOSE! 💀')
              setScore(prev => ({ ...prev, opponent: prev.opponent + 1 }))
            } else {
              setRoundResult('DRAW! 🤝')
            }
          }

          // Listen for a board reset (Next Round)
          if (match.player1_move === null && match.player2_move === null && match.status === 'playing') {
            setConfirmedCardIndex(null)
            setOpponentCardIndex(null)
            setRoundResult(null)
          }
        }
      )
      .subscribe()

    // Cleanup when leaving the room
    return () => { supabase.removeChannel(channel) }
  }, [mode, roomCode, isPlayer1])


  // --- GAME LOGIC ---
  const checkWinner = (player: number, opponent: number) => {
    if (player === opponent) return 'draw'
    const winsAgainst: Record<number, number[]> = {
      1: [2, 0], 2: [3, 0], 3: [1, 0], 4: [1, 2, 3], 0: [4],
    }
    return winsAgainst[player].includes(opponent) ? 'win' : 'lose'
  }

  // --- INTERACTIONS ---
  const handleSelect = (index: number) => {
    if (confirmedCardIndex === null) setSelectedCardIndex(index)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setSelectedCardIndex(index)
    e.dataTransfer.setData('cardIndex', index.toString())
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const draggedIndex = parseInt(e.dataTransfer.getData('cardIndex'), 10)
    
    if (!isNaN(draggedIndex) && confirmedCardIndex === null) {
      setConfirmedCardIndex(draggedIndex)
      setSelectedCardIndex(null)
      
      if (mode === 'vs-ai') {
        setTimeout(() => {
          const randomChoice = Math.floor(Math.random() * 5)
          setOpponentCardIndex(randomChoice)
          const result = checkWinner(draggedIndex, randomChoice)
          if (result === 'win') {
            setRoundResult('WIN! 🎉'); setScore(p => ({ ...p, player: p.player + 1 }))
          } else if (result === 'lose') {
            setRoundResult('LOSE! 💀'); setScore(p => ({ ...p, opponent: p.opponent + 1 }))
          } else {
            setRoundResult('DRAW! 🤝')
          }
        }, 800)
      } else {
        // MULTIPLAYER: Push move to database
        const updateField = isPlayer1 ? { player1_move: draggedIndex } : { player2_move: draggedIndex }
        await supabase.from('matches').update(updateField).eq('room_code', roomCode)
      }
    }
  }

  const handleReset = async () => {
    if (mode === 'vs-ai') {
      setConfirmedCardIndex(null)
      setOpponentCardIndex(null)
      setRoundResult(null)
    } else {
      // MULTIPLAYER: Tell the database to reset the board
      await supabase
        .from('matches')
        .update({ player1_move: null, player2_move: null })
        .eq('room_code', roomCode)
    }
  }

  return (
    <div className="game-container">
      <div className="header-bar">
        <button className="back-btn" onClick={onQuit}>← Quit</button>
        <span className="room-badge">
          {mode === 'vs-ai' ? 'Practice (AI)' : `Room: ${roomCode}`}
        </span>
      </div>

      {mode === 'multiplayer' && !opponentConnected && (
        <div style={{ color: '#f1c40f', textAlign: 'center', marginTop: '10px' }}>
          Waiting for opponent to join...
        </div>
      )}

      <div className="opponent-area">
        {opponentCardIndex !== null && (
          <div className="card opponent-card">
             <img src={myCards[opponentCardIndex]} alt="Opponent Card" />
          </div>
        )}
      </div>

      <div className="arena-area" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <div className="score-board">{score.player} - {score.opponent}</div>

        {roundResult && (
          <div className={`result-text ${roundResult.includes('WIN') ? 'text-win' : roundResult.includes('LOSE') ? 'text-lose' : 'text-draw'}`}>
            {roundResult}
          </div>
        )}

        {confirmedCardIndex !== null && opponentCardIndex !== null && (
           <button onClick={handleReset} className="action-button reset-btn">Next Round</button>
        )}

        {confirmedCardIndex !== null ? (
          <div className="card player-confirmed-card">
            <img src={myCards[confirmedCardIndex]} alt="Your Confirmed Card" />
          </div>
        ) : (
          <div className="arena-hint">Drag your card here</div>
        )}
      </div>

      <div className="hand-area">
        {myCards.map((src, index) => {
          if (confirmedCardIndex === index) return <div key={index} className="card-slot" />
          return (
            <div
              key={index}
              className={`card hand-card ${selectedCardIndex === index ? 'selected' : ''}`}
              onClick={() => handleSelect(index)}
              draggable={confirmedCardIndex === null}
              onDragStart={(e) => handleDragStart(e, index)}
            >
              <img src={src} alt={`Card ${index + 1}`} draggable="false" /> 
            </div>
          )
        })}
      </div>
    </div>
  )
}