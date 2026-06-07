import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const JWT_SECRET = process.env.JWT_SECRET || 'couple_love_secret_2026'

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/setup',
  '/api/auth/has-password',
  '/api/auth/change-password'
]

export function generateToken() {
  return jwt.sign({ authed: true }, JWT_SECRET, { expiresIn: '30d' })
}

export function authMiddleware(req, res, next) {
  // originalUrl always contains the full request path
  const url = req.originalUrl || req.url

  // Skip auth for public paths
  if (PUBLIC_PATHS.some(p => url.startsWith(p))) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '请先登录 🔐' })
  }

  const token = authHeader.split(' ')[1]
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ message: '登录已过期，请重新登录' })
  }
}
