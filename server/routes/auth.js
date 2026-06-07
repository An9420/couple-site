import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { generateToken } from '../middleware/auth.js'

const router = Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body
    const [rows] = await pool.query('SELECT password_hash FROM couple_info WHERE id = 1')

    if (!rows.length || !rows[0].password_hash) {
      return res.status(400).json({ message: '尚未设置密码，请先设置' })
    }

    const valid = await bcrypt.compare(password, rows[0].password_hash)
    if (!valid) {
      return res.status(401).json({ message: '密码错误' })
    }

    const token = generateToken()
    res.json({ token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// First-time setup (set password)
router.post('/setup', async (req, res) => {
  try {
    const { password } = req.body
    const [rows] = await pool.query('SELECT password_hash FROM couple_info WHERE id = 1')

    if (rows.length && rows[0].password_hash) {
      return res.status(400).json({ message: '密码已设置，请使用登录接口' })
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE couple_info SET password_hash = ? WHERE id = 1', [hash])

    const token = generateToken()
    res.json({ token, message: '密码设置成功！欢迎来到你们的小站 💕' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Verify token
router.get('/verify', async (req, res) => {
  // If it passes authMiddleware, it's valid
  res.json({ valid: true })
})

// Check if password is set
router.get('/has-password', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT password_hash FROM couple_info WHERE id = 1')
    const hasPassword = !!(rows.length && rows[0].password_hash)
    res.json({ hasPassword })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Change password (requires old password)
router.put('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: '新密码至少4位' })
    }

    const [rows] = await pool.query('SELECT password_hash FROM couple_info WHERE id = 1')

    if (rows.length && rows[0].password_hash) {
      const valid = await bcrypt.compare(oldPassword, rows[0].password_hash)
      if (!valid) {
        return res.status(401).json({ message: '原密码错误' })
      }
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE couple_info SET password_hash = ? WHERE id = 1', [hash])

    res.json({ message: '密码修改成功！🔐' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
