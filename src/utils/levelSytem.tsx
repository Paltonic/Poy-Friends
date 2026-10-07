// =========================================
// utils/levelSytem.ts
// Single source of truth untuk level pemain.
// Level disimpan di localStorage, di-cap di MAX_LEVEL.
// =========================================

export const LEVEL_STORAGE_KEY = 'poy_player_level'
export const MAX_LEVEL = 5

/**
 * Ambil level saat ini dari localStorage.
 * Default = 1 kalau belum ada / corrupt.
 */
export function getLevel(): number {
  try {
    const v = localStorage.getItem(LEVEL_STORAGE_KEY)
    const n = v ? parseInt(v, 10) : 1
    if (!Number.isFinite(n) || n < 1) return 1
    return Math.min(n, MAX_LEVEL)
  } catch {
    return 1
  }
}

/**
 * Simpan level ke localStorage (di-clamp antara 1..MAX_LEVEL).
 */
export function setLevel(lv: number): void {
  try {
    const safe = Math.max(1, Math.min(lv, MAX_LEVEL))
    localStorage.setItem(LEVEL_STORAGE_KEY, String(safe))
  } catch {
    // localStorage mungkin disabled (mode private). Abaikan.
  }
}

/**
 * Naik 1 level (dengan cap MAX_LEVEL).
 * Return level baru setelah increment.
 */
export function incrementLevel(): number {
  const next = Math.min(getLevel() + 1, MAX_LEVEL)
  setLevel(next)
  return next
}

/**
 * Reset ke level 1 (untuk testing / debug).
 */
export function resetLevel(): void {
  setLevel(1)
}