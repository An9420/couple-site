import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM footprints ORDER BY visit_date DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, latitude, longitude, visit_date, note, photo_path } = req.body
    const [result] = await pool.query(
      'INSERT INTO footprints (name, latitude, longitude, visit_date, note, photo_path) VALUES (?, ?, ?, ?, ?, ?)',
      [name, latitude, longitude, visit_date, note || '', photo_path || null]
    )
    const [[row]] = await pool.query('SELECT * FROM footprints WHERE id = ?', [result.insertId])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM footprints WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
