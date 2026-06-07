import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

// Get all unlocked eggs
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT egg_id, unlocked_at FROM easteregg_unlocks ORDER BY unlocked_at DESC')
    res.json(rows.map(r => r.egg_id))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Unlock an egg
router.post('/:eggId', async (req, res) => {
  try {
    await pool.query('INSERT IGNORE INTO easteregg_unlocks (egg_id) VALUES (?)', [req.params.eggId])
    res.json({ ok: true, eggId: req.params.eggId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
