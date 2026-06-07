import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

// Get all checkins
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM checkins ORDER BY checkin_date DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Check in today
router.post('/', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { mood_emoji, note } = req.body

    // Check if already checked in today
    const [existing] = await pool.query('SELECT id FROM checkins WHERE checkin_date = ?', [today])
    if (existing.length) {
      return res.status(400).json({ message: '今天已经打过卡啦～ 💕' })
    }

    await pool.query(
      'INSERT INTO checkins (checkin_date, mood_emoji, note) VALUES (?, ?, ?)',
      [today, mood_emoji || '💕', note || '']
    )

    const streak = await computeStreak()
    res.json({ ok: true, streak })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get streak info
router.get('/streak', async (req, res) => {
  try {
    const streak = await computeStreak()
    res.json(streak)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

async function computeStreak() {
  const [rows] = await pool.query('SELECT checkin_date FROM checkins ORDER BY checkin_date DESC')

  const dates = rows.map(r => {
    const d = r.checkin_date
    return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)
  })

  if (!dates.length) return { currentStreak: 0, longestStreak: 0, totalDays: 0, todayCheckedIn: false }

  const today = new Date().toISOString().slice(0, 10)
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Check if today is checked in
  const todayCheckedIn = dates[0] === today

  // Compute current streak
  if (todayCheckedIn) {
    currentStreak = 1
    const start = new Date(today)
    for (let i = 1; i < dates.length; i++) {
      const expected = new Date(start)
      expected.setDate(expected.getDate() - i)
      const expectedStr = expected.toISOString().slice(0, 10)
      if (dates[i] === expectedStr) {
        currentStreak++
      } else {
        break
      }
    }
  } else {
    // Check if yesterday was checked in (streak still valid but today missed)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)
    if (dates[0] === yesterdayStr) {
      currentStreak = 1
      const start = new Date(yesterdayStr)
      for (let i = 1; i < dates.length; i++) {
        const expected = new Date(start)
        expected.setDate(expected.getDate() - i)
        const expectedStr = expected.toISOString().slice(0, 10)
        if (dates[i] === expectedStr) {
          currentStreak++
        } else {
          break
        }
      }
    }
  }

  // Compute longest streak
  tempStreak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (prev - curr) / 86400000
    if (diff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak, totalDays: dates.length, todayCheckedIn }
}

export default router
