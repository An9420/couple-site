import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM firsttimes ORDER BY event_date DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, event_date, note, icon } = req.body
    const [result] = await pool.query(
      'INSERT INTO firsttimes (title, event_date, note, icon) VALUES (?, ?, ?, ?)',
      [title, event_date, note || '', icon || '🌟']
    )
    const [[row]] = await pool.query('SELECT * FROM firsttimes WHERE id = ?', [result.insertId])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM firsttimes WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
