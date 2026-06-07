import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { authMiddleware } from './middleware/auth.js'

// Load env
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

// Route imports
import authRoutes from './routes/auth.js'
import coupleRoutes from './routes/couple.js'
import diaryRoutes from './routes/diaries.js'
import milestoneRoutes from './routes/milestones.js'
import secretRoutes from './routes/secrets.js'
import mediaRoutes from './routes/media.js'
import checkinRoutes from './routes/checkins.js'
import taskRoutes from './routes/tasks.js'
import messageRoutes from './routes/messages.js'
import footprintRoutes from './routes/footprints.js'
import bucketlistRoutes from './routes/bucketlist.js'
import firsttimesRoutes from './routes/firsttimes.js'
import eastereggRoutes from './routes/eastereggs.js'
import statsRoutes from './routes/stats.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Static files (uploaded media)
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// Auth middleware for all /api routes
app.use('/api', authMiddleware)

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/couple', coupleRoutes)
app.use('/api/diaries', diaryRoutes)
app.use('/api/milestones', milestoneRoutes)
app.use('/api/secrets', secretRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/checkins', checkinRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/footprints', footprintRoutes)
app.use('/api/bucketlist', bucketlistRoutes)
app.use('/api/firsttimes', firsttimesRoutes)
app.use('/api/eastereggs', eastereggRoutes)
app.use('/api/stats', statsRoutes)

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'))
  })
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ message: '服务器出错了 💔', error: err.message })
})

app.listen(PORT, () => {
  console.log(`💕 Couple Site Server running on http://localhost:${PORT}`)
  console.log(`   API: http://localhost:${PORT}/api`)
  console.log(`   Uploads: http://localhost:${PORT}/uploads`)
})
