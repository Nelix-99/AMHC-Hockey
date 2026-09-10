import { HALF_DURATION_MS } from './positions'

export const todayISO = () => new Date().toISOString().slice(0, 10)

// The score on a match row doubles as the live scoreboard from the Opstelling
// page, so its mere presence does not mean the match was played. A match only
// counts as finished once the second half has run out (the clock is kept in the
// match's lineup snapshot), or once its match day has passed — the fallback for
// results that were entered by hand or played before the clock existed.
export function isFinished(match, today = todayISO()) {
  const clock = match.lineupSnapshot?.clock
  if (clock && clock.half >= 2 && (clock.elapsed ?? 0) >= HALF_DURATION_MS) return true
  return match.date < today
}

// Only a finished match has a result worth showing or counting.
export function hasResult(match, today = todayISO()) {
  return match.scoreHome != null && match.scoreAway != null && isFinished(match, today)
}

// 'W' win, 'G' draw, 'V' loss — from our side, so an away match flips the score.
export function resultOf(match) {
  const ours = match.isHome ? match.scoreHome : match.scoreAway
  const theirs = match.isHome ? match.scoreAway : match.scoreHome
  if (ours > theirs) return 'W'
  if (ours < theirs) return 'V'
  return 'G'
}
