import { getToken, clearToken } from './auth.js'

const BASE = '/api'

async function request(method, path, body, isFormData = false) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined)
  })

  if (res.status === 401) {
    clearToken()
    // Dispatch event so App.vue can show login modal
    window.dispatchEvent(new CustomEvent('auth:required'))
    throw new Error('请先登录')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '请求失败' }))
    throw new Error(err.message || '请求失败')
  }

  return res.json()
}

// ============ Auth ============
export const authApi = {
  hasPassword: () => request('GET', '/auth/has-password'),
  setup: (password) => request('POST', '/auth/setup', { password }),
  login: (password) => request('POST', '/auth/login', { password }),
  verify: () => request('GET', '/auth/verify'),
  changePassword: (oldPassword, newPassword) => request('PUT', '/auth/change-password', { oldPassword, newPassword })
}

// ============ Couple Info ============
export const coupleApi = {
  get: () => request('GET', '/couple'),
  update: (data) => request('PUT', '/couple', data)
}

// ============ Diaries ============
export const diaryApi = {
  list: (page = 1, limit = 50) => request('GET', `/diaries?page=${page}&limit=${limit}`),
  create: (data) => request('POST', '/diaries', data),
  remove: (id) => request('DELETE', `/diaries/${id}`)
}

// ============ Milestones ============
export const milestoneApi = {
  list: () => request('GET', '/milestones'),
  create: (data) => request('POST', '/milestones', data),
  remove: (id) => request('DELETE', `/milestones/${id}`)
}

// ============ Secrets ============
export const secretApi = {
  list: () => request('GET', '/secrets'),
  create: (content) => request('POST', '/secrets', { content }),
  remove: (id) => request('DELETE', `/secrets/${id}`)
}

// ============ Media ============
export const mediaApi = {
  list: (type) => request('GET', `/media${type ? `?type=${type}` : ''}`),
  upload: (formData) => request('POST', '/media', formData, true),
  update: (id, data) => request('PUT', `/media/${id}`, data),
  remove: (id) => request('DELETE', `/media/${id}`)
}

// ============ Checkins ============
export const checkinApi = {
  list: () => request('GET', '/checkins'),
  create: (data) => request('POST', '/checkins', data),
  streak: () => request('GET', '/checkins/streak')
}

// ============ Tasks ============
export const taskApi = {
  list: (status) => request('GET', `/tasks${status ? `?status=${status}` : ''}`),
  create: (data) => request('POST', '/tasks', data),
  update: (id, data) => request('PUT', `/tasks/${id}`, data),
  remove: (id) => request('DELETE', `/tasks/${id}`)
}

// ============ Messages ============
export const msgApi = {
  list: () => request('GET', '/messages'),
  create: (data) => request('POST', '/messages', data),
  remove: (id) => request('DELETE', `/messages/${id}`)
}

// ============ Footprints ============
export const footprintApi = {
  list: () => request('GET', '/footprints'),
  create: (data) => request('POST', '/footprints', data),
  remove: (id) => request('DELETE', `/footprints/${id}`)
}

// ============ Bucket List ============
export const bucketApi = {
  list: () => request('GET', '/bucketlist'),
  create: (data) => request('POST', '/bucketlist', data),
  update: (id, data) => request('PUT', `/bucketlist/${id}`, data),
  remove: (id) => request('DELETE', `/bucketlist/${id}`)
}

// ============ First Times ============
export const firsttimeApi = {
  list: () => request('GET', '/firsttimes'),
  create: (data) => request('POST', '/firsttimes', data),
  remove: (id) => request('DELETE', `/firsttimes/${id}`)
}

// ============ Easter Eggs ============
export const eggApi = {
  list: () => request('GET', '/eastereggs'),
  unlock: (eggId) => request('POST', `/eastereggs/${eggId}`)
}

// ============ Stats ============
export const statsApi = {
  get: () => request('GET', '/stats')
}
