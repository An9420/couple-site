import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { extname, join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { mkdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadsDir = join(__dirname, '..', 'uploads', 'media')

// Ensure directories exist
for (const sub of ['images', 'videos', 'thumbnails']) {
  const dir = join(uploadsDir, sub)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = file.mimetype.startsWith('video/') ? 'videos' : 'images'
    cb(null, join(uploadsDir, sub))
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname) || '.jpg'
    cb(null, `${uuidv4()}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件格式'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})
