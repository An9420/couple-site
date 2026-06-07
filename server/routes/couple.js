import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

// Get couple info
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT name1, name2, avatar1, avatar2, start_date FROM couple_info WHERE id = 1'
    )
    if (!rows.length) return res.json(null)
    const c = rows[0]
    res.json({
      name1: c.name1,
      name2: c.name2,
      avatar1: c.avatar1,
      avatar2: c.avatar2,
      startDate: c.start_date instanceof Date ? c.start_date.toISOString().slice(0, 10) : String(c.start_date).slice(0, 10)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update couple info
router.put('/', async (req, res) => {
  try {
    const { name1, name2, startDate } = req.body
    const updates = []
    const values = []

    if (name1 !== undefined) { updates.push('name1 = ?'); values.push(name1) }
    if (name2 !== undefined) { updates.push('name2 = ?'); values.push(name2) }
    if (startDate) { updates.push('start_date = ?'); values.push(startDate) }

    if (updates.length) {
      await pool.query(`UPDATE couple_info SET ${updates.join(', ')} WHERE id = 1`, values)
    }

    const [rows] = await pool.query('SELECT name1, name2, avatar1, avatar2, start_date FROM couple_info WHERE id = 1')
    const c = rows[0]
    res.json({
      name1: c.name1,
      name2: c.name2,
      avatar1: c.avatar1,
      avatar2: c.avatar2,
      startDate: c.start_date instanceof Date ? c.start_date.toISOString().slice(0, 10) : String(c.start_date).slice(0, 10)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
