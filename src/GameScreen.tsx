import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import './GameScreen.css'

import { getLevel, setLevel, MAX_LEVEL } from './utils/levelSytem'

import puyImg from './assets/PUY.png'
import payImg from './assets/PAY.png'
import peyImg from './assets/PEY.png'
import piyImg from './assets/PIY.png'
import poyImg from './assets/POY.png'

const myCards = [puyImg, payImg, peyImg, piyImg, poyImg]

const WIN_SCORE = 5
const REVEAL_MS = 1600
const SCORE_MS = 1400
const RETRACT_ANIM_MS = 600

type Phase = 'waiting' | 'placing' | 'revealing' | 'scoring' | 'retracting' | 'gameover'

// FIX: prop name is `onExit` to match how App.tsx calls <GameScreen />
interface GameScreenProps {
  mode: 'vs-ai' | 'multiplayer'
  roomCode?: string
  isHost?: boolean
  onExit: () => void
}

const CartoonFistSVG = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={`cartoon-fist-svg ${className}`} fill="#fff" stroke="#000" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
    <path d="M35,85 L25,130 L75,130 L65,85 Z" fill="#ff9eb5" />
    <rect x="20" y="75" width="60" height="16" rx="8" fill="#fff" />
    <path d="M15,75 L20,45 C20,30 35,30 37,45 C37,25 52,25 54,45 C54,25 68,25 70,45 C70,35 85,35 85,50 L85,75 Z" fill="#fff" />
  </svg>
)

/**
 * ATURAN MENANG/KALAH
 * winsAgainst[i] = daftar index kartu yang DIKALAHKAN oleh kartu index i.
 *   0 = PUY (biru)
 *   1 = PAY
 *   2 = PEY (hijau goblin)
 *   3 = PIY
 *   4 = POY
 *
 * Rules:
 *   PUY > POY
 *   POY > PAY, PEY, PIY
 *   PAY > PUY, PEY
 *   PEY > PUY, PIY
 *   PIY > PUY, PAY
 */
const WINS_AGAINST: Record<number, number[]> = {
  0: [4],
  1: [0, 2],
  2: [0, 3],
  3: [0, 1],
  4: [1, 2, 3],
}

const checkWinner = (player: number, opponent: number): 'win' | 'lose' | 'draw' => {
  const p = Number(player)   // FIX: konversi dari string DB ke number
  const o = Number(opponent) // FIX
  if (p === o) return 'draw'
  return WINS_AGAINST[p]?.includes(o) ? 'win' : 'lose'
}

interface GameEngine {
  phase: Phase
  playerMove: number | null
  opponentMove: number | null
  myScore: number
  oppScore: number
  playerAck: boolean
  opponentAck: boolean
  isPlayer1: boolean
  invalidRoom: boolean
  roundWinner: number | null   // 1 = P1 menang, 2 = P2 menang, 0 = draw
  level: number
  levelUpToast: boolean
  placeCard: (i: number) => void
  retractCard: () => void
  playAgain: () => void
}

// =====================================================
// LEVEL AWARD HOOK (dipakai oleh AI & Multiplayer)
// =====================================================
function usePlayerLevelInternal(phase: Phase, myScore: number, oppScore: number) {
  const [level, setLevelState] = useState<number>(getLevel)
  const [levelUpToast, setLevelUpToast] = useState(false)
  const awardedRef = useRef(false)

  useEffect(() => {
    if (phase !== 'gameover') {
      awardedRef.current = false
      return
    }
    if (awardedRef.current) return
    awardedRef.current = true

    // Hanya naik level kalau MENANG match (skor sendiri capai 5)
    if (myScore > oppScore) {
      const prev = getLevel()
      const next = Math.min(prev + 1, MAX_LEVEL)
      if (next > prev) {
        setLevel(next)          // simpan ke localStorage
        setLevelState(next)     // update state lokal
        setLevelUpToast(true)
        const t = setTimeout(() => setLevelUpToast(false), 2500)
        return () => clearTimeout(t)
      }
    }
  }, [phase, myScore, oppScore])

  return { level, levelUpToast }
}

// =====================================================
// AI GAME HOOK
// =====================================================
function useAIGame(): GameEngine {
  const [phase, setPhase] = useState<Phase>('placing')
  const [playerMove, setPlayerMove] = useState<number | null>(null)
  const [opponentMove, setOpponentMove] = useState<number | null>(null)
  const [p1Score, setP1Score] = useState(0)
  const [p2Score, setP2Score] = useState(0)
  const [playerAck, setPlayerAck] = useState(false)
  const [opponentAck, setOpponentAck] = useState(false)
  const [roundWinner, setRoundWinner] = useState<number | null>(null)

  const { level, levelUpToast } = usePlayerLevelInternal(phase, p1Score, p2Score)

  const placeCard = (i: number) => {
    if (phase !== 'placing' || playerMove !== null) return
    setPlayerMove(i)
    setPhase('revealing')
    setTimeout(() => setOpponentMove(Math.floor(Math.random() * 5)), 600)
  }

  useEffect(() => {
    if (phase !== 'revealing' || playerMove === null || opponentMove === null) return
    const t = setTimeout(() => {
      const r = checkWinner(playerMove, opponentMove)
      const winner = r === 'win' ? 1 : r === 'lose' ? 2 : 0
      setRoundWinner(winner)
      setP1Score(s => s + (r === 'win' ? 1 : 0))
      setP2Score(s => s + (r === 'lose' ? 1 : 0))
      setPhase('scoring')
    }, REVEAL_MS)
    return () => clearTimeout(t)
  }, [phase, playerMove, opponentMove])

  useEffect(() => {
    if (phase !== 'scoring') return
    const t = setTimeout(() => {
      if (p1Score >= WIN_SCORE || p2Score >= WIN_SCORE) setPhase('gameover')
      else setPhase('retracting')
    }, SCORE_MS)
    return () => clearTimeout(t)
  }, [phase, p1Score, p2Score])

  const retractCard = () => {
    if (phase !== 'retracting' || playerAck) return
    setPlayerAck(true)
    setTimeout(() => setOpponentAck(true), 500)
    setTimeout(() => {
      setPlayerMove(null); setOpponentMove(null)
      setPlayerAck(false); setOpponentAck(false)
      setRoundWinner(null); setPhase('placing')
    }, RETRACT_ANIM_MS + 500)
  }

  const playAgain = () => {
    setP1Score(0); setP2Score(0)
    setPlayerMove(null); setOpponentMove(null)
    setPlayerAck(false); setOpponentAck(false)
    setRoundWinner(null); setPhase('placing')
  }

  return {
    phase, playerMove, opponentMove,
    myScore: p1Score, oppScore: p2Score,
    playerAck, opponentAck,
    isPlayer1: true, invalidRoom: false,
    roundWinner, level, levelUpToast,
    placeCard, retractCard, playAgain,
  }
}

// =====================================================
// MULTIPLAYER GAME HOOK (Host-driven, DB-authoritative)
// =====================================================
function useMultiplayerGame(roomCode: string | undefined, isHost: boolean): GameEngine {
  const [match, setMatch] = useState<any>(null)
  const [invalidRoom, setInvalidRoom] = useState(false)
  const isPlayer1 = isHost

  useEffect(() => {
    if (!roomCode) return
    let cancelled = false

    const setup = async () => {
      if (isHost) {
        const newMatch = {
          room_code: roomCode, status: 'waiting', phase: 'placing',
          player1_move: null, player2_move: null,
          player1_ack: false, player2_ack: false,
          player1_score: 0, player2_score: 0,
          round_winner: null,
        }
        const { data } = await supabase.from('matches').upsert([newMatch], { onConflict: 'room_code' }).select().single()
        if (!cancelled) setMatch(data ?? newMatch)
      } else {
        const { data } = await supabase.from('matches').select('*').eq('room_code', roomCode).single()
        if (cancelled) return
        if (!data) { setInvalidRoom(true); return }
        const { data: updated } = await supabase.from('matches').update({ status: 'playing' }).eq('room_code', roomCode).select().single()
        if (!cancelled) setMatch(updated ?? { ...data, status: 'playing' })
      }
    }
    setup()

    const channel = supabase
      .channel(`room_${roomCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `room_code=eq.${roomCode}` },
        (payload: any) => { if (!cancelled) setMatch(payload.new) })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [roomCode, isHost])

  const phase: Phase = (() => {
    if (!match) return 'waiting'
    if (match.status === 'waiting') return 'waiting'
    if (match.status === 'gameover') return 'gameover'
    return (match.phase as Phase) ?? 'placing'
  })()

  const playerMove = isPlayer1 ? match?.player1_move : match?.player2_move
  const opponentMove = isPlayer1 ? match?.player2_move : match?.player1_move
  const p1Score = match?.player1_score ?? 0
  const p2Score = match?.player2_score ?? 0
  const playerAck = !!(isPlayer1 ? match?.player1_ack : match?.player2_ack)
  const opponentAck = !!(isPlayer1 ? match?.player2_ack : match?.player1_ack)
  const myScore = isPlayer1 ? p1Score : p2Score
  const oppScore = isPlayer1 ? p2Score : p1Score
  const roundWinner: number | null = match?.round_winner ?? null

  const { level, levelUpToast } = usePlayerLevelInternal(phase, myScore, oppScore)

  const placeCard = (i: number) => {
    if (phase !== 'placing' || playerMove !== null || !roomCode) return
    const field = isPlayer1 ? 'player1_move' : 'player2_move'
    supabase.from('matches').update({ [field]: i }).eq('room_code', roomCode).then(() => {})
  }

  const retractCard = () => {
    if (phase !== 'retracting' || playerAck || !roomCode) return
    const field = isPlayer1 ? 'player1_ack' : 'player2_ack'
    supabase.from('matches').update({ [field]: true }).eq('room_code', roomCode).then(() => {})
  }

  const playAgain = () => {
    if (!isHost || !roomCode) return
    supabase.from('matches').update({
      status: 'playing', phase: 'placing',
      player1_move: null, player2_move: null,
      player1_ack: false, player2_ack: false,
      player1_score: 0, player2_score: 0,
      round_winner: null,
    }).eq('room_code', roomCode).then(() => {})
  }

  // 1. placing -> revealing (butuh KEDUA move)
  useEffect(() => {
    if (!match || !roomCode || !isHost) return
    if (match.phase === 'placing' && match.player1_move !== null && match.player2_move !== null) {
      supabase.from('matches').update({ phase: 'revealing' })
        .eq('room_code', roomCode).eq('phase', 'placing').then(() => {})
    }
  }, [match, roomCode, isHost])

  // 2. revealing -> scoring (hitung winner SEKALI, simpan ke DB)
  useEffect(() => {
    if (!match || !roomCode || !isHost || match.phase !== 'revealing') return
    const t = setTimeout(() => {
      const resultP1 = checkWinner(match.player1_move, match.player2_move)
      const winner = resultP1 === 'win' ? 1 : resultP1 === 'lose' ? 2 : 0
      const newP1 = (match.player1_score ?? 0) + (winner === 1 ? 1 : 0)
      const newP2 = (match.player2_score ?? 0) + (winner === 2 ? 1 : 0)
      const isOver = newP1 >= WIN_SCORE || newP2 >= WIN_SCORE
      supabase.from('matches').update({
        phase: 'scoring', player1_score: newP1, player2_score: newP2,
        round_winner: winner,
        ...(isOver ? { status: 'gameover' } : {}),
      }).eq('room_code', roomCode).eq('phase', 'revealing').then(() => {})
    }, REVEAL_MS)
    return () => clearTimeout(t)
  }, [match, roomCode, isHost])

  // 3. scoring -> retracting
  useEffect(() => {
    if (!match || !roomCode || !isHost || match.phase !== 'scoring') return
    const t = setTimeout(() => {
      supabase.from('matches').update({ phase: 'retracting' })
        .eq('room_code', roomCode).eq('phase', 'scoring').then(() => {})
    }, SCORE_MS)
    return () => clearTimeout(t)
  }, [match, roomCode, isHost])

  // 4. retracting -> placing (butuh KEDUA ack) + reset round_winner
  useEffect(() => {
    if (!match || !roomCode || !isHost || match.phase !== 'retracting') return
    if (match.player1_ack && match.player2_ack) {
      supabase.from('matches').update({
        phase: 'placing',
        player1_move: null, player2_move: null,
        player1_ack: false, player2_ack: false,
        round_winner: null,
      }).eq('room_code', roomCode).eq('phase', 'retracting').then(() => {})
    }
  }, [match, roomCode, isHost])

  return {
    phase, playerMove, opponentMove,
    myScore, oppScore,
    playerAck, opponentAck,
    isPlayer1, invalidRoom,
    roundWinner, level, levelUpToast,
    placeCard, retractCard, playAgain,
  }
}

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function GameScreen({ mode, roomCode, isHost = false, onExit }: GameScreenProps) {
  const engine = mode === 'vs-ai' ? useAIGame() : useMultiplayerGame(roomCode, isHost)

  const {
    phase, playerMove, opponentMove, myScore, oppScore,
    playerAck, opponentAck, invalidRoom, roundWinner,
    level, levelUpToast,
    placeCard, retractCard, playAgain,
  } = engine

  const isWaiting = phase === 'waiting'
  const isGameOver = phase === 'gameover'
  const isRevealed = phase === 'revealing' || phase === 'scoring' || phase === 'retracting'

  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [pressProgress, setPressProgress] = useState(0)
  const requestRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const isPressing = useRef(false)

  // roundResult dari DB (bukan hitung lokal) — konsisten antar device
  const roundResult: 'win' | 'lose' | 'draw' | null = (() => {
    if (roundWinner === null) return null
    if (roundWinner === 0) return 'draw'
    return roundWinner === (engine.isPlayer1 ? 1 : 2) ? 'win' : 'lose'
  })()

  const attackState: 'player' | 'opponent' | 'draw' | null = (() => {
    if ((phase !== 'scoring' && phase !== 'retracting') || !roundResult) return null
    if (roundResult === 'win') return 'player'
    if (roundResult === 'lose') return 'opponent'
    return 'draw'
  })()

  useEffect(() => {
    if (phase !== 'placing') setSelectedCardIndex(null)
  }, [phase])

  const handleArenaClick = () => {
    if (phase === 'placing' && selectedCardIndex !== null && playerMove === null) {
      placeCard(selectedCardIndex)
      setSelectedCardIndex(null)
    }
  }

  const startPress = () => {
    isPressing.current = true
    startTimeRef.current = Date.now()
    const animate = () => {
      if (!isPressing.current) return
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / 1500, 1)
      setPressProgress(progress)
      if (progress >= 1) { isPressing.current = false; onExit() }
      else requestRef.current = requestAnimationFrame(animate)
    }
    requestRef.current = requestAnimationFrame(animate)
  }
  const stopPress = () => {
    isPressing.current = false
    setPressProgress(0)
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
  }
  useEffect(() => () => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }, [])

  const youWin = myScore > oppScore

  return (
    <div className="game-container pov-mode">

      {invalidRoom && (
        <div className="waiting-screen-overlay">
          <div className="modern-waiting-card">
            <h2 style={{ color: '#ff7675' }}>ROOM NOT FOUND</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '0.9rem' }}>Check the code and try again.</p>
            <button className="error-return-btn" onClick={onExit}>RETURN</button>
          </div>
        </div>
      )}

      {isWaiting && (
        <div className="waiting-screen-overlay">
          <button className="modern-back-btn fixed-top-left" onClick={onExit} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className="modern-waiting-card">
            <div className="slow-loader-ring"></div>
            <h2>WAITING FOR OPPONENT</h2>
            <div className="code-pill">{roomCode}</div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="waiting-screen-overlay">
          <div className="modern-waiting-card">
            <h2 style={{ color: youWin ? '#55efc4' : '#ff7675' }}>
              {youWin ? 'YOU WIN!' : 'YOU LOSE'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '10px', fontSize: '1rem', textAlign: 'center' }}>
              {youWin ? `Level ${level} unlocked!` : `Level ${level}`}
            </p>
            <div className="code-pill" style={{ fontSize: '1.6rem', letterSpacing: '4px' }}>
              {myScore} - {oppScore}
            </div>
            {mode === 'vs-ai' && (
              <button className="error-return-btn" style={{ background: 'linear-gradient(135deg,#00b894,#55efc4)', color: '#0d1a12', marginTop: '20px' }} onClick={playAgain}>
                PLAY AGAIN
              </button>
            )}
            {mode === 'multiplayer' && engine.isPlayer1 && (
              <button className="error-return-btn" style={{ background: 'linear-gradient(135deg,#00b894,#55efc4)', color: '#0d1a12', marginTop: '20px' }} onClick={playAgain}>
                PLAY AGAIN
              </button>
            )}
            {mode === 'multiplayer' && !engine.isPlayer1 && (
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '20px', fontSize: '0.85rem' }}>
                Waiting for host to restart...
              </p>
            )}
            <button className="error-return-btn" style={{ marginTop: '12px' }} onClick={onExit}>
              QUIT
            </button>
          </div>
        </div>
      )}

      <div className={`game-board-wrapper ${isWaiting || invalidRoom || isGameOver ? 'blurred-game' : ''}`}>
        {!isWaiting && !invalidRoom && !isGameOver && (
          <div className="glass-home-btn"
            onMouseDown={startPress} onMouseUp={stopPress} onMouseLeave={stopPress}
            onTouchStart={startPress} onTouchEnd={stopPress}>
            <svg className="progress-ring" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="23" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2"
                strokeDasharray="144.51" strokeDashoffset={144.51 - (144.51 * pressProgress)} strokeLinecap="round" />
            </svg>
            <svg className="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* Level Badge (in-game) */}
        {!isWaiting && !invalidRoom && (
          <div className="level-badge">LV {level}</div>
        )}

        {/* Level Up Toast */}
        {levelUpToast && (
          <div className="level-up-toast">LEVEL UP! → LV {level}</div>
        )}

        {/* Skor relatif: ATAS = lawan, BAWAH = Anda */}
        <div className="glass-score">
          <span>{oppScore}</span>
          <span className="score-dash">-</span>
          <span>{myScore}</span>
        </div>

        <div className="opponent-hand-area">
          <CartoonFistSVG className={`
            ${phase === 'placing' && opponentMove === null ? 'fist-shove' : ''}
            ${opponentAck ? 'fist-grab' : ''}
          `} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`card card-back-design card-pos-${i} ${opponentMove !== null ? 'card-hidden' : ''}`}>
              <div className="card-pattern"></div>
            </div>
          ))}
        </div>

        <div className="arena-layer" onClick={handleArenaClick}>
          {opponentMove !== null && (
            <div className={`opponent-played-wrapper
              ${attackState === 'opponent' && !opponentAck ? 'grow-win' : ''}
              ${attackState === 'player' && !opponentAck ? 'shrink-lose' : ''}
              ${attackState === 'draw' && !opponentAck ? 'clash-shake' : ''}
              ${opponentAck ? 'card-retract-opponent' : ''}
            `}>
              <div className={`flipper ${isRevealed ? 'reveal' : ''}`}>
                <div className="card face front card-back-design"></div>
                <div className="card face back">
                  <img src={myCards[opponentMove]} alt="Opponent Card" style={{ transform: 'rotate(180deg)' }} />
                  {attackState === 'player' && <div className="defeated-overlay"></div>}
                </div>
              </div>
              {phase === 'retracting' && !opponentAck && (
                <div className="waiting-opponent-badge">Waiting...</div>
              )}
            </div>
          )}

          {playerMove !== null && (
            <div className={`card player-played-card
              ${attackState === 'player' && !playerAck ? 'grow-win' : ''}
              ${attackState === 'opponent' && !playerAck ? 'shrink-lose' : ''}
              ${attackState === 'draw' && !playerAck ? 'clash-shake' : ''}
              ${playerAck ? 'card-retract-player' : ''}
              ${phase === 'retracting' && !playerAck ? 'clickable-card pulse-hint' : ''}
            `}
              onClick={(e) => {
                e.stopPropagation()
                if (phase === 'retracting') retractCard()
              }}>
              <img src={myCards[playerMove]} alt="Your Card" />
              {attackState === 'opponent' && <div className="defeated-overlay"></div>}
            </div>
          )}
        </div>

        <div className="player-hand-area">
          <CartoonFistSVG className={`
            ${phase === 'placing' && playerMove === null ? 'fist-shove' : ''}
            ${playerAck ? 'fist-grab' : ''}
          `} />
          {myCards.map((src, index) => {
            if (playerMove === index) return <div key={index} className={`card-slot card-pos-${index}`} />
            return (
              <div key={index}
                className={`card hand-card card-pos-${index} 
                  ${selectedCardIndex === index ? 'selected' : ''} 
                  ${playerMove !== null ? 'card-hidden' : ''}`}
                onClick={() => { if (phase === 'placing' && playerMove === null) setSelectedCardIndex(index) }}>
                <img src={src} alt="Card" draggable="false" />
              </div>
            )
          })}
        </div>

        {/* DEBUG PANEL — hapus setelah selesai */}
{/* <div className="debug-panel">
  <div>P: {phase}</div>
  <div>Your: {playerMove !== null ? ['PUY','PAY','PEY','PIY','POY'][playerMove] : '-'}</div>
  <div>Opp: {opponentMove !== null ? ['PUY','PAY','PEY','PIY','POY'][opponentMove] : '-'}</div>
  <div>RoundWinner: {roundWinner === 1 ? 'P1' : roundWinner === 2 ? 'P2' : roundWinner === 0 ? 'DRAW' : '-'}</div>
  <div>R: {roundResult ?? '-'}</div>
  <div>My: {myScore} | Opp: {oppScore}</div>
</div> */}

        {/* Hint text */}
        {phase === 'placing' && selectedCardIndex === null && playerMove === null && (
          <div className="phase-hint">Tap a card to choose</div>
        )}
        {phase === 'placing' && selectedCardIndex !== null && playerMove === null && (
          <div className="phase-hint">Tap arena to confirm</div>
        )}
        {phase === 'placing' && playerMove !== null && (
          <div className="phase-hint">Waiting for opponent...</div>
        )}
        {phase === 'retracting' && !playerAck && (
          <div className="phase-hint highlight">Tap your card to retract</div>
        )}
        {phase === 'retracting' && playerAck && !opponentAck && (
          <div className="phase-hint">Waiting for opponent to retract...</div>
        )}
      </div>
    </div>
  )
}