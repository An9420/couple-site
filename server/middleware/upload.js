import multer from 'multer'

// Memory storage — required for Vercel serverless (no disk write)
const storage = multer.memoryStorage()

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
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max (Vercel body limit)
})
