import { Router } from 'express'
import { unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import pool from '../config/db.js'
import { upload } from '../middleware/upload.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

// List all media
router.get('/', async (req, res) => {
  try {
    const type = req.query.type
    let query = 'SELECT * FROM media'
    const params = []
    if (type && ['image', 'video'].includes(type)) {
      query += ' WHERE type = ?'
      params.push(type)
    }
    query += ' ORDER BY created_at DESC'
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Upload single media
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '请选择文件' })

    const isVideo = req.file.mimetype.startsWith('video/')
    const sub = isVideo ? 'videos' : 'images'
    const filePath = `/uploads/media/${sub}/${req.file.filename}`

    const [result] = await pool.query(
      `INSERT INTO media (type, file_path, original_name, file_size, mime_type, note, location, taken_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        isVideo ? 'video' : 'image',
        filePath,
        req.file.originalname,
        req.file.size,
        req.file.mimetype,
        req.body.note || '',
        req.body.location || '',
        req.body.taken_date || null
      ]
    )

    const [[row]] = await pool.query('SELECT * FROM media WHERE id = ?', [result.insertId])
    res.json(row)
  } catch (err) {
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
    const [[row]] = await pool.query('SELECT * FROM media WHERE id = ?', [req.params.id])
    res.json(row)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete media
router.delete('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM media WHERE id = ?', [req.params.id])
    if (!row) return res.status(404).json({ message: '文件不存在' })

    // Delete physical file
    const filePath = join(__dirname, '..', row.file_path)
    if (existsSync(filePath)) unlinkSync(filePath)
    if (row.thumbnail_path) {
      const thumbPath = join(__dirname, '..', row.thumbnail_path)
      if (existsSync(thumbPath)) unlinkSync(thumbPath)
    }

    await pool.query('DELETE FROM media WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
