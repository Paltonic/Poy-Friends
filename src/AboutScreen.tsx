// src/AboutScreen.tsx
import './AboutScreen.css'

interface AboutScreenProps {
  onNavigate: (screen: 'home' | 'play' | 'about') => void
}

export default function AboutScreen({ onNavigate }: AboutScreenProps) {
  return (
    <div className="about-container">
      {/* Bungkus konten dengan about-glass-panel */}
      <div className="about-glass-panel">
        <h1>Tentang PoyNFriends</h1>
        <p>
          PoyNFriends adalah game kartu seru di mana kamu bisa bermain melawan AI 
          atau menantang temanmu secara multiplayer. Kumpulkan kemenangan dan 
          naikkan levelmu hingga level 5!
        </p>
        
        <button 
          className="modern-menu-btn about-btn" 
          onClick={() => onNavigate('home')}
        >
          KEMBALI
        </button>
      </div>
    </div>
  )
}