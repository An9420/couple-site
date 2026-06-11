import { Router } from 'express'
import pool from '../config/db.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// List all media
router.get('/', async (req, res) => {
  try {
    const type = req.query.type
    let query = 'SELECT id, type, original_name, file_size, mime_type, note, location, taken_date, created_at FROM media'
    const params = []
    if (type && ['image', 'video'].includes(type)) {
      query += ' WHERE type = ?'
      params.push(type)
    }
    query += ' ORDER BY created_at DESC'
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    console.error('media list error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Get single media with data_url
router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM media WHERE id = ?', [req.params.id])
    if (!row) return res.status(404).json({ message: '文件不存在' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Upload — stores file as base64 in DB (serverless-safe)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '请选择文件' })

    const isVideo = req.file.mimetype.startsWith('video/')
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

    const [result] = await pool.query(
      `INSERT INTO media (type, data_url, original_name, file_size, mime_type, note, location, taken_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        isVideo ? 'video' : 'image',
        dataUrl,
        req.file.originalname,
        req.file.size,
        req.file.mimetype,
        req.body.note || '',
        req.body.location || '',
        req.body.taken_date || null
      ]
    )

    const [[row]] = await pool.query(
      'SELECT id, type, original_name, file_size, mime_type, note, location, taken_date, created_at FROM media WHERE id = ?',
      [result.insertId]
    )
    // Include data_url in create response
    row.data_url = dataUrl
    res.json(row)
  } catch (err) {
    console.error('media upload error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Update media metadata
router.put('/:id', async (req, res) => {
  try {
    const { note, location, taken_date } = req.body
    await pool.query(
      'UPDATE media SET note = ?, location = ?, taken_date = ? WHERE id = ?',
      [note || '', location || '', taken_date || null, req.params.id]
    )
    const [[row]] = await pool.query(
      'SELECT id, type, original_name, file_size, mime_type, note, location, taken_date, created_at FROM media WHERE id = ?',
      [req.params.id]
    )
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete media
router.delete('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id FROM media WHERE id = ?', [req.params.id])
    if (!row) return res.status(404).json({ message: '文件不存在' })
    await pool.query('DELETE FROM media WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
