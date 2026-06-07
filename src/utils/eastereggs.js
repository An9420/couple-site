import { eggApi, checkinApi } from './api.js'

// ============ Check Streak-Based Unlocks ============
export async function checkStreakUnlocks() {
  try {
    const streak = await checkinApi.streak()
    const eggs = []

    if (streak.currentStreak >= 365) eggs.push('streak_365')
    else if (streak.currentStreak >= 100) eggs.push('streak_100')
    else if (streak.currentStreak >= 30) eggs.push('streak_30')
    else if (streak.currentStreak >= 7) eggs.push('streak_7')

    for (const eggId of eggs) {
      await eggApi.unlock(eggId)
    }

    return eggs
  } catch { return [] }
}

// ============ Anniversary Check ============
export function checkAnniversary(startDateStr) {
  if (!startDateStr) return null
  const start = new Date(startDateStr + 'T00:00:00')
  const today = new Date()
  const days = Math.floor((today.getTime() - start.getTime()) / 86400000)

  // Anniversary (same month + day)
  const isAnniversary =
    start.getMonth() === today.getMonth() &&
    start.getDate() === today.getDate() &&
    days > 0

  // Special milestones
  const milestones = [100, 500, 520, 1000, 1314, 2000]
  const hitMilestone = milestones.find(m => days === m)

  return {
    days,
    isAnniversary,
    hitMilestone,
    years: Math.floor(days / 365)
  }
}

// ============ Time-Based Surprises ============
export function checkTimeSurprise() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const time = h * 100 + m

  if (time === 520) return 'time_520'    // 5:20
  if (time === 1314) return 'time_1314'  // 13:14

  return null
}

// ============ Konami Code ============
const KONAMI = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight'
]
let konamiIndex = 0

export function setupKonamiCode() {
  document.addEventListener('keydown', async (e) => {
    if (e.key === KONAMI[konamiIndex]) {
      konamiIndex++
      if (konamiIndex === KONAMI.length) {
        konamiIndex = 0
        await eggApi.unlock('konami_code')
        window.dispatchEvent(new CustomEvent('egg:konami'))
      }
    } else {
      konamiIndex = 0
    }
  })
}

// ============ Navigation Sequence ============
const LOVE_PATH = ['/', '/diary', '/secret', '/album', '/']
let navSequence = []

export function trackNavigation(path) {
  navSequence.push(path)
  if (navSequence.length > 5) navSequence.shift()
  if (arraysEqual(navSequence, LOVE_PATH)) {
    navSequence = []
    eggApi.unlock('true_love_path')
    window.dispatchEvent(new CustomEvent('egg:lovepath'))
  }
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

// ============ Load unlocked eggs ============
let unlockedEggs = []

export async function loadUnlockedEggs() {
  try {
    unlockedEggs = await eggApi.list()
    return unlockedEggs
  } catch {
    return []
  }
}

export function isUnlocked(eggId) {
  return unlockedEggs.includes(eggId)
}
