// src/AboutScreen.tsx
import './AboutScreen.css'

// Import gambar dari assets
import PUY from './assets/PUY.png'
import PAY from './assets/PAY.png'
import PEY from './assets/PEY.png'
import PIY from './assets/PIY.png'
import POY from './assets/POY.png'

interface AboutScreenProps {
  onNavigate: (screen: 'home' | 'play' | 'about') => void
}

interface KartuInfo {
  kode: string
  nama: string
  kelas: string
  gambar: string // Properti untuk menyimpan gambar
}

const DAFTAR_KARTU: KartuInfo[] = [
  { kode: 'PUY', nama: 'Kartu Biru',   kelas: 'blue',   gambar: PUY },
  { kode: 'PAY', nama: 'Kartu Merah',  kelas: 'red',    gambar: PAY },
  { kode: 'PEY', nama: 'Kartu Coklat', kelas: 'brown',  gambar: PEY },
  { kode: 'PIY', nama: 'Kartu Pink',   kelas: 'pink',   gambar: PIY },
  { kode: 'POY', nama: 'Kartu Hijau',  kelas: 'green',  gambar: POY },
]

interface AturanInfo {
  kode: string
  kelas: string
  menang: { kode: string; kelas: string }[]
}

const ATURAN_MENANG: AturanInfo[] = [
  { kode: 'PUY', kelas: 'blue',   menang: [{ kode: 'POY', kelas: 'green' }] },
  { kode: 'PAY', kelas: 'red',  menang: [{ kode: 'PEY', kelas: 'brown' }, { kode: 'PUY', kelas: 'blue' }] },
  { kode: 'PEY', kelas: 'brown', menang: [{ kode: 'PIY', kelas: 'pink' }, { kode: 'PUY', kelas: 'blue' }] },
  { kode: 'PIY', kelas: 'pink',   menang: [{ kode: 'PAY', kelas: 'red' }, { kode: 'PUY', kelas: 'blue' }] },
  { kode: 'POY', kelas: 'green',  menang: [{ kode: 'PEY', kelas: 'brown' }, { kode: 'PAY', kelas: 'red' }, { kode: 'PIY', kelas: 'pink' }] },
]

export default function AboutScreen({ onNavigate }: AboutScreenProps) {
  return (
    <div className="about-container">
      <div className="about-glass-panel">

        {/* ================= DAFTAR KARTU ================= */}
        <h2>Daftar Kartu</h2>
        <div className="kartu-grid">
          {DAFTAR_KARTU.map((kartu) => (
            <div className="kartu-item" key={kartu.kode}>
              <img 
                src={kartu.gambar} 
                alt={kartu.nama} 
                className="kartu-gambar" 
              />
              {/* Menambahkan class warna ke dalam className teks */}
              <span className={`kartu-nama ${kartu.kelas}`}>{kartu.kode}</span>
            </div>
          ))}
        </div>

        {/* ================= ATURAN MENANG ================= */}
        <p className="section-note">
          Setiap kartu hanya bisa mengalahkan kartu tertentu. Perhatikan warnanya baik-baik!
        </p>

        <div className="rule-list">
          {ATURAN_MENANG.map((aturan) => (
            <div className="rule-row" key={aturan.kode}>
              <span className={`card-code ${aturan.kelas}`}>{aturan.kode}</span>
              <span className="rule-text"> Mengalahkan </span>
              <span className="chip-group">
                {aturan.menang.map((target) => (
                  <span className={`card-code ${target.kelas}`} key={target.kode}>
                    {target.kode}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>

        <p className="section-note seri-note">
          Jika kedua pemain mengeluarkan kartu yang <strong>sama</strong>, maka hasilnya <strong>SERI</strong>
          <span> tidak ada poin untuk siapa pun.</span>
        </p>

        {/* ================= CARA BERMAIN ================= */}
        <h2>Cara Bermain</h2>
        <ol className="langkah-list">
          <li>Tekan tombol <strong>PLAY</strong> di menu utama.</li>
          <li>Pilih salah satu kartu dari tanganmu (PUY, PAY, PEY, PIY, atau POY).</li>
          <li>Tekan ke layar lalu tunggu kartu lawan terbuka.</li>
          <li>Kartumu akan dibandingkan dengan kartu lawan.</li>
          <li>Kalau kartumu menang, kamu dapat <strong>1 poin</strong>.</li>
          <li>Tarik kartu mu dan siap untuk ronde berikutnya</li>
          <li>Kumpulkan 5 poin untuk naik level!</li>
        </ol>

        <button
          className="modern-menu-btn about-btn"
          onClick={() => onNavigate('home')}
        >
          RETURN
        </button>
      </div>
    </div>
  )
}