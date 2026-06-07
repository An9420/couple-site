/**
 * IndexedDB-based media storage
 * Supports large photo/video storage with thumbnails
 */
const DB_NAME = 'CoupleMediaDB'
const DB_VERSION = 1
const STORE_NAME = 'media'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('type', 'type', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ============ CRUD ============

export async function getAllMedia() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('createdAt')
    const req = index.openCursor(null, 'prev')
    const items = []
    req.onsuccess = (e) => {
      const cursor = e.target.result
      if (cursor) {
        items.push(cursor.value)
        cursor.continue()
      } else {
        resolve(items)
      }
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getMediaById(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(id)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

export async function saveMedia(item) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.put(item)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function deleteMedia(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getMediaCount() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ============ Video Thumbnail Generation ============

export function generateVideoThumbnail(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const url = URL.createObjectURL(file)

    video.onloadeddata = () => {
      // Seek to 1 second or 25% of duration
      video.currentTime = Math.min(1, video.duration * 0.25)
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 320
      canvas.height = video.videoHeight || 240
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Add play icon overlay
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 24, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 8, canvas.height / 2 - 12)
      ctx.lineTo(canvas.width / 2 + 12, canvas.height / 2)
      ctx.lineTo(canvas.width / 2 - 8, canvas.height / 2 + 12)
      ctx.fill()

      const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
      URL.revokeObjectURL(url)
      resolve({
        thumbnail,
        width: canvas.width,
        height: canvas.height,
        duration: video.duration
      })
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      // Fallback thumbnail
      resolve({
        thumbnail: null,
        width: 320,
        height: 240,
        duration: 0
      })
    }
  })
}

// ============ Batch Import ============

/**
 * Import files from gallery selection
 * @param {File[]} files - Selected files
 * @param {Function} onProgress - (current, total, fileName) => void
 * @returns {Promise<{imported: number, skipped: number, errors: number}>}
 */
export async function batchImport(files, onProgress) {
  const db = await openDB()
  let imported = 0
  let skipped = 0
  let errors = 0
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      // Check for duplicates (same name + size)
      const isDup = await checkDuplicate(db, file.name, file.size)
      if (isDup) {
        skipped++
        onProgress?.(i + 1, total, file.name, 'skipped')
        continue
      }

      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')

      if (!isVideo && !isImage) {
        skipped++
        onProgress?.(i + 1, total, file.name, 'skipped')
        continue
      }

      let dataUrl = null
      let thumbnail = null
      let meta = {}

      if (isVideo) {
        // For videos, generate thumbnail and store as blob URL reference
        const thumbInfo = await generateVideoThumbnail(file)
        thumbnail = thumbInfo.thumbnail
        meta = {
          duration: thumbInfo.duration,
          width: thumbInfo.width,
          height: thumbInfo.height,
          fileSize: file.size,
          fileName: file.name,
          mimeType: file.type
        }
        // Store video as data URL (for simplicity; large videos may hit limits)
        dataUrl = await readFileAsDataURL(file)
      } else {
        // For images, compress if too large
        dataUrl = await compressImage(file, 1920, 0.85)
        meta = {
          fileSize: file.size,
          fileName: file.name,
          mimeType: file.type
        }
      }

      const mediaItem = {
        id: generateId(),
        type: isVideo ? 'video' : 'image',
        dataUrl,
        thumbnail: thumbnail || dataUrl,
        note: '',
        location: '',
        date: extractDateFromFile(file),
        createdAt: Date.now(),
        meta
      }

      await saveMediaItem(db, mediaItem)
      imported++
      onProgress?.(i + 1, total, file.name, 'imported')
    } catch (err) {
      console.error('Failed to import file:', file.name, err)
      errors++
      onProgress?.(i + 1, total, file.name, 'error')
    }
  }

  return { imported, skipped, errors }
}

// ============ Internal Helpers ============

function generateId() {
  return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10)
}

function saveMediaItem(db, item) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).put(item)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

function checkDuplicate(db, fileName, fileSize) {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => {
      const items = req.result || []
      const dup = items.some(
        item => item.meta?.fileName === fileName && item.meta?.fileSize === fileSize
      )
      resolve(dup)
    }
    req.onerror = () => resolve(false)
  })
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function compressImage(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => {
        // If compression fails, return original
        resolve(reader.result)
      }
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function extractDateFromFile(file) {
  // Try to get date from EXIF or file metadata
  if (file.lastModified) {
    return new Date(file.lastModified).toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

// ============ Storage Stats ============

export async function getStorageStats() {
  const items = await getAllMedia()
  const totalSize = items.reduce((sum, item) => {
    if (item.dataUrl) sum += item.dataUrl.length * 0.75 // Approximate byte size of base64
    return sum
  }, 0)
  return {
    count: items.length,
    images: items.filter(i => i.type === 'image').length,
    videos: items.filter(i => i.type === 'video').length,
    estimatedSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
  }
}

// ============ Migration from localStorage ============

export async function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem('couple_site_photos')
    if (!raw) return 0

    const photos = JSON.parse(raw)
    if (!Array.isArray(photos) || photos.length === 0) return 0

    const db = await openDB()
    let migrated = 0

    for (const photo of photos) {
      const isDup = await checkDuplicate(db, photo.id || '', 0)
      if (isDup) continue

      await saveMediaItem(db, {
        id: photo.id || generateId(),
        type: 'image',
        dataUrl: photo.dataUrl || '',
        thumbnail: photo.dataUrl || '',
        note: photo.note || '',
        location: photo.location || '',
        date: photo.date || '',
        createdAt: photo.createdAt || Date.now(),
        meta: { fileName: '', fileSize: 0, mimeType: 'image/jpeg' }
      })
      migrated++
    }

    if (migrated > 0) {
      localStorage.removeItem('couple_site_photos')
    }

    return migrated
  } catch (e) {
    console.warn('Migration from localStorage failed:', e)
    return 0
  }
}
