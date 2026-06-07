const PREFIX = 'couple_site_'

function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.warn('localStorage write failed:', e)
  }
}

// ============ Couple Info ============
const DEFAULT_COUPLE = {
  name1: '🐰 小安',
  name2: '🐲 小婷子',
  avatar1: '',
  avatar2: '',
  startDate: '2023-06-29',
  message: ''
}

export function getCoupleInfo() {
  return read('couple') || { ...DEFAULT_COUPLE }
}

export function saveCoupleInfo(info) {
  write('couple', { ...DEFAULT_COUPLE, ...info })
}

// ============ Photos ============
export function getPhotos() {
  return read('photos') || []
}

export function savePhoto(photo) {
  const photos = getPhotos()
  photos.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    dataUrl: photo.dataUrl,
    note: photo.note || '',
    location: photo.location || '',
    date: photo.date || new Date().toISOString().slice(0, 10),
    createdAt: Date.now()
  })
  write('photos', photos)
  return photos
}

export function deletePhoto(id) {
  const photos = getPhotos().filter(p => p.id !== id)
  write('photos', photos)
  return photos
}

// ============ Diary ============
export function getDiaries() {
  return read('diaries') || []
}

export function saveDiary(entry) {
  const diaries = getDiaries()
  diaries.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    content: entry.content || '',
    mood: entry.mood || '💕',
    createdAt: Date.now()
  })
  write('diaries', diaries)
  return diaries
}

export function deleteDiary(id) {
  const diaries = getDiaries().filter(d => d.id !== id)
  write('diaries', diaries)
  return diaries
}

// ============ Milestones ============
const DEFAULT_MILESTONES = [
  { id: 'first-meet', title: '💫 第一次见面', date: '2023-12-15', icon: '✨' },
  { id: 'together', title: '💝 在一起的日子', date: '2024-01-01', icon: '💕' },
  { id: 'first-date', title: '🌹 第一次约会', date: '2024-01-07', icon: '🥂' },
  { id: 'first-kiss', title: '💋 第一次亲吻', date: '2024-02-14', icon: '💗' },
  { id: 'anniversary', title: '💍 周年纪念日', date: '2025-01-01', icon: '💎' }
]

export function getMilestones() {
  return read('milestones') || [...DEFAULT_MILESTONES]
}

export function saveMilestone(milestone) {
  const milestones = getMilestones()
  milestones.push({
    id: Date.now().toString(36),
    ...milestone
  })
  write('milestones', milestones)
  return milestones
}

export function deleteMilestone(id) {
  const milestones = getMilestones().filter(m => m.id !== id)
  write('milestones', milestones)
  return milestones
}

// ============ Secret Messages ============
const DEFAULT_SECRETS = [
  '你是我所有温柔的理由。',
  '有你的每一天，都是最好的时光。',
  '世界很大，但我的心很小，小到只装得下你。',
  '遇见你，是我最美丽的意外。',
  '我想和你一起，看遍这世界所有的日出日落。',
  '你笑起来的时候，整个世界都亮了。',
  '不管未来有多远，我都想和你一起走。',
  '你是我平淡生活里的甜蜜奇迹。'
]

export function getSecrets() {
  return read('secrets') || [...DEFAULT_SECRETS]
}

export function addSecret(text) {
  const secrets = getSecrets()
  secrets.push(text)
  write('secrets', secrets)
  return secrets
}
