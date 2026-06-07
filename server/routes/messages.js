import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 100')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { author, content, sticker } = req.body
    const [result] = await pool.query(
      'INSERT INTO messages (author, content, sticker) VALUES (?, ?, ?)',
      [author || 'person1', content, sticker || null]
    )
    const [[row]] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
