import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bucketlist ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, category, due_date } = req.body
    const [result] = await pool.query(
      'INSERT INTO bucketlist (title, category, due_date) VALUES (?, ?, ?)',
      [title, category || 'general', due_date || null]
    )
    const [[row]] = await pool.query('SELECT * FROM bucketlist WHERE id = ?', [result.insertId])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { completed, title, category } = req.body
    const updates = []
    const values = []

    if (completed !== undefined) {
      updates.push('completed = ?')
      values.push(completed ? 1 : 0)
      if (completed) {
        updates.push('completed_date = CURDATE()')
      }
    }
    if (title) { updates.push('title = ?'); values.push(title) }
    if (category) { updates.push('category = ?'); values.push(category) }

    if (updates.length) {
      values.push(req.params.id)
      await pool.query(`UPDATE bucketlist SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    const [[row]] = await pool.query('SELECT * FROM bucketlist WHERE id = ?', [req.params.id])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bucketlist WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
