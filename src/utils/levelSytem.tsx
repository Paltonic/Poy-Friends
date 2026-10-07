const STORAGE_KEY = 'ai_game_level';
const MAX_LEVEL = 5;

export function getLevel(): number {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return 1;
  const level = parseInt(saved, 10);
  return isNaN(level) ? 1 : Math.min(Math.max(level, 1), MAX_LEVEL);
}

export function setLevel(level: number): void {
  const clamped = Math.min(Math.max(level, 1), MAX_LEVEL);
  localStorage.setItem(STORAGE_KEY, String(clamped));
}

/** Panggil saat pemain MENANG. Level naik 1 (maks 5). */
export function increaseLevelOnWin(): number {
  const current = getLevel();
  const next = Math.min(current + 1, MAX_LEVEL);
  setLevel(next);
  return next;
}

/** Panggil saat pemain KALAH. Level tidak berubah. */
export function handleLoss(): number {
  return getLevel();
}