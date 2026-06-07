import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const offset = (page - 1) * limit
    const [rows] = await pool.query('SELECT * FROM diaries ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset])
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM diaries')
    res.json({ items: rows, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { content, mood } = req.body
    const [result] = await pool.query('INSERT INTO diaries (content, mood) VALUES (?, ?)', [content || '', mood || '💕'])
    const [[row]] = await pool.query('SELECT * FROM diaries WHERE id = ?', [result.insertId])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM diaries WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
