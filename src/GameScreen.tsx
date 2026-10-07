import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import './GameScreen.css'

import { getLevel, increaseLevelOnWin, handleLoss } from './utils/levelSystem'

import puyImg from './assets/PUY.png'
import payImg from './assets/PAY.png'
import peyImg from './assets/PEY.png'
import piyImg from './assets/PIY.png'
import poyImg from './assets/POY.png'

const myCards = [puyImg, payImg, peyImg, piyImg, poyImg]

interface GameScreenProps {
  mode: 'vs-ai' | 'multiplayer'
  roomCode?: string
  isHost?: boolean
  onQuit: () => void
}

const CartoonFistSVG = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={`cartoon-fist-svg ${className}`} fill="#fff" stroke="#000" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
    <path d="M35,85 L25,130 L75,130 L65,85 Z" fill="#ff9eb5" />
    <rect x="20" y="75" width="60" height="16" rx="8" fill="#fff" />
    <path d="M15,75 L20,45 C20,30 35,30 37,45 C37,25 52,25 54,45 C54,25 68,25 70,45 C70,35 85,35 85,50 L85,75 Z" fill="#fff" />
  </svg>
)

export default function GameScreen({ mode, roomCode, isHost = false, onQuit }: GameScreenProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [confirmedCardIndex, setConfirmedCardIndex] = useState<number | null>(null)
  const [opponentCardIndex, setOpponentCardIndex] = useState<number | null>(null)
  
  const [score, setScore] = useState({ player: 0, opponent: 0 })
  const [roundResult, setRoundResult] = useState<string | null>(null)
  const [attackState, setAttackState] = useState<'player' | 'opponent' | 'draw' | null>(null)
  
  const [playerRetracting, setPlayerRetracting] = useState(false)
  const [opponentRetracting, setOpponentRetracting] = useState(false)

  const [isPlayer1, setIsPlayer1] = useState<boolean>(isHost) // Initialize directly based on role!
  const [opponentConnected, setOpponentConnected] = useState<boolean>(!isHost) // Joiner is connected immediately
  const [dbMatch, setDbMatch] = useState<any>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [invalidRoom, setInvalidRoom] = useState(false)

  const [pressProgress, setPressProgress] = useState(0)
  const requestRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const isPressing = useRef(false)

  // --- LEVEL SYSTEM STATE (only relevant for VS AI) ---
  const [currentLevel, setCurrentLevel] = useState<number>(getLevel())
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    // Refresh displayed level when entering the screen
    setCurrentLevel(getLevel())
  }, [])

  const startPress = () => {
    isPressing.current = true
    startTimeRef.current = Date.now()
    const animate = () => {
      if (!isPressing.current) return
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / 1500, 1)
      setPressProgress(progress)
      
      if (progress >= 1) {
        isPressing.current = false
        onQuit()
      } else {
        requestRef.current = requestAnimationFrame(animate)
      }
    }
    requestRef.current = requestAnimationFrame(animate)
  }

  const stopPress = () => {
    isPressing.current = false
    setPressProgress(0)
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
  }

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [])

  // --- Clean Room Setup & Sync Logic ---
  useEffect(() => {
    if (mode !== 'multiplayer' || !roomCode) return

    const setupMatch = async () => {
      if (isHost) {
        // HOST LOGIC: Explicitly create the room and wait
        setIsPlayer1(true)
        setOpponentConnected(false)
        
        const newMatch = { room_code: roomCode, status: 'waiting', player1_move: null, player2_move: null }
        // Use upsert so it overwrites safely if a ghost record lingered
        await supabase.from('matches').upsert([newMatch], { onConflict: 'room_code' })
        setDbMatch(newMatch)
      } else {
        // JOINER LOGIC: Verify the room exists first
        const { data } = await supabase.from('matches').select('*').eq('room_code', roomCode).single()
        
        if (!data) {
          setInvalidRoom(true)
          return
        }

        setIsPlayer1(false)
        setOpponentConnected(true)
        
        // Update room status to playing so the host's screen unlocks
        await supabase.from('matches').update({ status: 'playing' }).eq('room_code', roomCode)
        const { data: updatedData } = await supabase.from('matches').select('*').eq('room_code', roomCode).single()
        setDbMatch(updatedData)
      }
    }

    setupMatch()

    // Listen for changes in this specific room
    const channel = supabase.channel(`room_${roomCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `room_code=eq.${roomCode}` },
        (payload: any) => {
          setDbMatch(payload.new)
          if (payload.new.status === 'playing') {
            setOpponentConnected(true)
          }
        }
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [mode, roomCode, isHost])

  useEffect(() => {
    if (!dbMatch || mode !== 'multiplayer') return
    const myMove = isPlayer1 ? dbMatch.player1_move : dbMatch.player2_move
    const theirMove = isPlayer1 ? dbMatch.player2_move : dbMatch.player1_move

    if (myMove !== null && theirMove !== null && opponentCardIndex === null && !isResolving) {
      setIsResolving(true)
      setOpponentCardIndex(theirMove)
      
      setTimeout(() => {
        const result = checkWinner(myMove, theirMove)
        if (result === 'win') setAttackState('player')
        else if (result === 'lose') setAttackState('opponent')
        else setAttackState('draw')
        
        setTimeout(() => {
          if (result === 'win') { setRoundResult('WIN!'); setScore(p => ({ ...p, player: p.player + 1 })) } 
          else if (result === 'lose') { setRoundResult('LOSE!'); setScore(p => ({ ...p, opponent: p.opponent + 1 })) } 
          else { setRoundResult('DRAW!') }
          setIsResolving(false)
        }, 800) 
      }, 1900) 
    }

    if (theirMove === null && opponentCardIndex !== null && !opponentRetracting && roundResult !== null) {
      setOpponentRetracting(true)
      setTimeout(() => {
        setOpponentCardIndex(null)
        setOpponentRetracting(false)
      }, 600) 
    }
  }, [dbMatch, isPlayer1, opponentCardIndex, isResolving, opponentRetracting, roundResult, mode])

  useEffect(() => {
    if (confirmedCardIndex === null && opponentCardIndex === null && roundResult !== null) {
      setRoundResult(null)
      setAttackState(null)
    }
  }, [confirmedCardIndex, opponentCardIndex, roundResult])

  const checkWinner = (player: number, opponent: number) => {
    if (player === opponent) return 'draw'
    const winsAgainst: Record<number, number[]> = { 1: [2, 0], 2: [3, 0], 3: [1, 0], 4: [1, 2, 3], 0: [4] }
    return winsAgainst[player].includes(opponent) ? 'win' : 'lose'
  }

  const playCard = async (indexToPlay: number) => {
    setConfirmedCardIndex(indexToPlay)
    setSelectedCardIndex(null)
    
    if (mode === 'vs-ai') {
      setTimeout(() => {
        const randomChoice = Math.floor(Math.random() * 5)
        setOpponentCardIndex(randomChoice)
        
        setTimeout(() => {
          const result = checkWinner(indexToPlay, randomChoice)
          if (result === 'win') setAttackState('player')
          else if (result === 'lose') setAttackState('opponent')
          else setAttackState('draw')
          
          setTimeout(() => {
            if (result === 'win') {
              setRoundResult('WIN!')
              setScore(p => ({ ...p, player: p.player + 1 }))

              // === LEVEL UP LOGIC (VS AI ONLY) ===
              const prevLevel = getLevel()
              const newLevel = increaseLevelOnWin()
              setCurrentLevel(newLevel)
              if (newLevel > prevLevel) {
                setShowLevelUp(true)
                setTimeout(() => setShowLevelUp(false), 1600)
              }
              // ====================================
            } 
            else if (result === 'lose') {
              setRoundResult('LOSE!')
              setScore(p => ({ ...p, opponent: p.opponent + 1 }))

              // === LEVEL STAYS THE SAME ON LOSS (VS AI ONLY) ===
              const levelNow = handleLoss()
              setCurrentLevel(levelNow)
              // ==================================================
            } 
            else {
              setRoundResult('DRAW!')
              // Draw = no level change
            }
          }, 800)
        }, 1900)
      }, 500)
    } else {
      const updateField = isPlayer1 ? { player1_move: indexToPlay } : { player2_move: indexToPlay }
      await supabase.from('matches').update(updateField).eq('room_code', roomCode)
    }
  }

  const handleArenaClick = () => {
    if (selectedCardIndex !== null && confirmedCardIndex === null && roundResult === null) {
      playCard(selectedCardIndex)
    }
  }

  const handleTakeBack = async () => {
    if (roundResult === null || playerRetracting || confirmedCardIndex === null) return
    setPlayerRetracting(true)
    
    setTimeout(async () => {
      setConfirmedCardIndex(null)
      setPlayerRetracting(false)
      
      if (mode === 'vs-ai') {
        setTimeout(() => {
          setOpponentRetracting(true)
          setTimeout(() => {
            setOpponentCardIndex(null)
            setOpponentRetracting(false)
          }, 600)
        }, 400)
      } else {
        const updateField = isPlayer1 ? { player1_move: null } : { player2_move: null }
        await supabase.from('matches').update(updateField).eq('room_code', roomCode)
      }
    }, 600) 
  }

  const isWaiting = mode === 'multiplayer' && !opponentConnected && !invalidRoom;

  return (
    <div className="game-container pov-mode">
      
      {invalidRoom && (
        <div className="waiting-screen-overlay">
          <div className="modern-waiting-card">
            <h2 style={{ color: '#ff7675' }}>ROOM NOT FOUND</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '0.9rem' }}>
              Check the code and try again.
            </p>
            <button className="error-return-btn" onClick={onQuit}>
              RETURN
            </button>
          </div>
        </div>
      )}

      {isWaiting && (
        <div className="waiting-screen-overlay">
          <button className="modern-back-btn fixed-top-left" onClick={onQuit} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          
          <div className="modern-waiting-card">
            <div className="slow-loader-ring"></div>
            <h2>WAITING FOR OPPONENT</h2>
            <div className="code-pill">{roomCode}</div>
          </div>
        </div>
      )}

      <div className={`game-board-wrapper ${isWaiting || invalidRoom ? 'blurred-game' : ''}`}>
        
        {!(isWaiting || invalidRoom) && (
          <div 
            className="glass-home-btn"
            onMouseDown={startPress}
            onMouseUp={stopPress}
            onMouseLeave={stopPress}
            onTouchStart={startPress}
            onTouchEnd={stopPress}
          >
            <svg className="progress-ring" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="23" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2"
                strokeDasharray="144.51" strokeDashoffset={144.51 - (144.51 * pressProgress)} strokeLinecap="round" />
            </svg>
            <svg className="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* === LEVEL BADGE (only shows during VS AI) === */}
        {mode === 'vs-ai' && !(isWaiting || invalidRoom) && (
          <div className="level-badge">
            LV {currentLevel}
          </div>
        )}

        {/* === LEVEL UP TOAST === */}
        {showLevelUp && (
          <div className="level-up-toast">LEVEL UP!</div>
        )}

        <div className="glass-score">
          <span>{score.opponent}</span>
          <span className="score-dash">-</span>
          <span>{score.player}</span>
        </div>

        <div className="opponent-hand-area">
          <CartoonFistSVG className={`
            ${opponentCardIndex !== null && roundResult === null && attackState === null ? 'fist-shove' : ''}
            ${opponentRetracting ? 'fist-grab' : ''}
          `} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`card card-back-design card-pos-${i} ${opponentCardIndex !== null ? 'card-hidden' : ''}`}>
               <div className="card-pattern"></div>
            </div>
          ))}
        </div>

        <div className="arena-layer" onClick={handleArenaClick}>
          {opponentCardIndex !== null && (
            <div className={`opponent-played-wrapper 
              ${attackState === 'opponent' && !opponentRetracting ? 'grow-win' : ''} 
              ${attackState === 'player' && !opponentRetracting ? 'shrink-lose' : ''}
              ${attackState === 'draw' && !opponentRetracting ? 'clash-shake' : ''}
              ${opponentRetracting ? 'card-retract-opponent' : ''}
            `}>
               <div className="flipper">
                  <div className="card face front card-back-design"></div>
                  <div className="card face back">
                    <img src={myCards[opponentCardIndex]} alt="Opponent Card" style={{ transform: 'rotate(180deg)' }} />
                    {attackState === 'player' && <div className="defeated-overlay"></div>}
                  </div>
               </div>
            </div>
          )}

          {confirmedCardIndex !== null && (
            <div 
              className={`card player-played-card 
                ${attackState === 'player' && !playerRetracting ? 'grow-win' : ''} 
                ${attackState === 'opponent' && !playerRetracting ? 'shrink-lose' : ''}
                ${attackState === 'draw' && !playerRetracting ? 'clash-shake' : ''}
                ${playerRetracting ? 'card-retract-player' : ''}
                ${roundResult !== null && !playerRetracting ? 'clickable-card' : ''}
              `}
              onClick={(e) => {
                 e.stopPropagation();
                 handleTakeBack();
              }}
            >
              <img src={myCards[confirmedCardIndex]} alt="Your Card" />
              {attackState === 'opponent' && <div className="defeated-overlay"></div>}
            </div>
          )}
        </div>

        <div className="player-hand-area">
          <CartoonFistSVG className={`
            ${confirmedCardIndex !== null && roundResult === null && attackState === null ? 'fist-shove' : ''}
            ${playerRetracting ? 'fist-grab' : ''}
          `} />
          {myCards.map((src, index) => {
            if (confirmedCardIndex === index) return <div key={index} className={`card-slot card-pos-${index}`} />
            return (
              <div key={index} className={`card hand-card card-pos-${index} ${selectedCardIndex === index ? 'selected' : ''} ${confirmedCardIndex !== null ? 'card-hidden' : ''}`}
                onClick={() => setSelectedCardIndex(index)}>
                <img src={src} alt="Card" draggable="false" /> 
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}