import { Router } from 'express'
import pool from '../config/db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const status = req.query.status
    let query = 'SELECT * FROM tasks'
    const params = []
    if (status && ['pending', 'done'].includes(status)) {
      query += ' WHERE status = ?'
      params.push(status)
    }
    query += ' ORDER BY created_at DESC'
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, assigned_to } = req.body
    const [result] = await pool.query(
      'INSERT INTO tasks (title, assigned_to) VALUES (?, ?)',
      [title, assigned_to || 'both']
    )
    const [[row]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { status, title, assigned_to } = req.body
    const updates = []
    const values = []

    if (status) { updates.push('status = ?'); values.push(status); updates.push('completed_at = NOW()') }
    if (title) { updates.push('title = ?'); values.push(title) }
    if (assigned_to) { updates.push('assigned_to = ?'); values.push(assigned_to) }

    if (updates.length) {
      values.push(req.params.id)
      await pool.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    const [[row]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
