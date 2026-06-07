<template>
  <div class="page-container album-page">
    <h2 class="page-title">📷 时光相册</h2>
    <p class="page-subtitle">每一次快门，都是心动的瞬间</p>

    <!-- Storage Stats Bar -->
    <div v-if="mediaList.length" class="stats-bar">
      <span>📸 {{ stats.images }} 张照片</span>
      <span v-if="stats.videos">🎬 {{ stats.videos }} 个视频</span>
      <span>💾 {{ stats.estimatedSizeMB }} MB</span>
    </div>

    <!-- Import Area -->
    <div class="import-area">
      <!-- Main import button: triggers device gallery -->
      <!-- <div class="import-main card" @click="triggerGalleryImport">
        <span class="import-icon">📱</span>
        <div class="import-text">
          <p class="import-title">从手机相册批量导入</p>
          <p class="import-hint">点击后选择图片和视频 · 支持多选</p>
        </div>
        <span class="import-arrow">→</span>
      </div> -->

      <!-- Also keep single file upload + drag -->
      <div
        class="upload-area card"
        @click="triggerSingleUpload"
        @dragover.prevent
        @drop.prevent="onDrop"
      >
        <span class="upload-icon">📸</span>
        <p class="upload-text">点击或拖拽上传</p>
        <p class="upload-hint">图片 · 视频 都可以</p>
      </div>

      <!-- Hidden file inputs -->
      <input
        ref="galleryInputRef"
        type="file"
        accept="image/*,video/*"
        multiple
        style="display:none"
        @change="onGalleryFilesSelected"
      />
      <input
        ref="singleInputRef"
        type="file"
        accept="image/*,video/*"
        multiple
        style="display:none"
        @change="onSingleFilesSelected"
      />
    </div>

    <!-- Import Progress Modal -->
    <Teleport to="body">
      <div v-if="importing" class="modal-overlay">
        <div class="modal-content import-progress-modal">
          <h3>📥 正在导入...</h3>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: importPercent + '%' }"></div>
          </div>
          <p class="progress-text">
            {{ importCurrent }} / {{ importTotal }}
            <span v-if="importFileName" class="progress-file">{{ importFileName }}</span>
          </p>
          <div class="progress-stats">
            <span class="stat-ok">✅ {{ importStats.imported }}</span>
            <span class="stat-skip">⏭️ {{ importStats.skipped }}</span>
            <span v-if="importStats.errors" class="stat-err">❌ {{ importStats.errors }}</span>
          </div>
          <p class="progress-wait">请耐心等待，正在处理中...</p>
        </div>
      </div>
    </Teleport>

    <!-- Media Grid -->
    <div v-if="mediaList.length" class="photo-grid">
      <div
        v-for="item in mediaList"
        :key="item.id"
        class="photo-card stagger-card"
        @click="openPreview(item)"
      >
        <!-- Thumbnail or video preview -->
        <div class="card-media-wrap">
          <img
            :src="item.thumbnail || item.dataUrl"
            :alt="item.note"
            class="photo-img"
            loading="lazy"
          />
          <!-- Video badge -->
          <div v-if="item.type === 'video'" class="video-badge">
            <span class="play-icon">▶</span>
            <span v-if="item.meta?.duration" class="duration">{{ formatDuration(item.meta.duration) }}</span>
          </div>
        </div>

        <!-- Hover overlay -->
        <div class="photo-overlay">
          <p v-if="item.note" class="photo-note">{{ item.note }}</p>
          <p class="photo-meta">
            <span v-if="item.location">📍 {{ item.location }}</span>
            <span>{{ item.date || formatDate(item.createdAt) }}</span>
          </p>
          <p class="photo-type">
            <span v-if="item.type === 'video'">🎬 视频</span>
            <span v-else>📷 照片</span>
          </p>
        </div>

        <!-- Delete button -->
        <button class="photo-delete" @click.stop="removeMedia(item.id)" title="删除">×</button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <span class="icon">📷</span>
      <p>还没有照片或视频哦</p>
      <p class="empty-hint">点击上方按钮从相册导入吧～</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-state">
      <span class="icon">⏳</span>
      <p>加载中...</p>
    </div>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div v-if="previewItem" class="modal-overlay" @click.self="previewItem = null">
        <div class="modal-content preview-modal">
          <button class="modal-close" @click="previewItem = null">✕</button>

          <!-- Video player -->
          <video
            v-if="previewItem.type === 'video'"
            :src="previewItem.dataUrl"
            class="preview-video"
            controls
            autoplay
          ></video>
          <!-- Image -->
          <img
            v-else
            :src="previewItem.dataUrl"
            class="preview-img"
          />

          <div class="preview-info">
            <p v-if="previewItem.note">📝 {{ previewItem.note }}</p>
            <p v-if="previewItem.location">📍 {{ previewItem.location }}</p>
            <p>📅 {{ previewItem.date || formatDate(previewItem.createdAt) }}</p>
            <p v-if="previewItem.type === 'video' && previewItem.meta?.duration">
              🎬 时长: {{ formatDuration(previewItem.meta.duration) }}
            </p>
          </div>

          <!-- Edit note -->
          <div class="preview-actions">
            <input
              v-model="editNote"
              class="input"
              placeholder="添加备注..."
              @keyup.enter="saveNote"
            />
            <button class="btn btn-primary btn-sm" @click="saveNote">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getAllMedia,
  saveMedia,
  deleteMedia,
  batchImport,
  getStorageStats,
  migrateFromLocalStorage
} from '../utils/mediaDB'

// ============ State ============
const mediaList = ref([])
const loading = ref(true)
const previewItem = ref(null)
const editNote = ref('')

// File inputs
const galleryInputRef = ref(null)
const singleInputRef = ref(null)

// Import progress
const importing = ref(false)
const importCurrent = ref(0)
const importTotal = ref(0)
const importFileName = ref('')
const importStats = reactive({ imported: 0, skipped: 0, errors: 0 })

// ============ Computed ============
const importPercent = computed(() =>
  importTotal.value ? Math.round((importCurrent.value / importTotal.value) * 100) : 0
)

const stats = computed(() => {
  const images = mediaList.value.filter(m => m.type === 'image').length
  const videos = mediaList.value.filter(m => m.type === 'video').length
  let totalBytes = 0
  for (const m of mediaList.value) {
    if (m.dataUrl) totalBytes += m.dataUrl.length * 0.75
  }
  return {
    images,
    videos,
    estimatedSizeMB: (totalBytes / (1024 * 1024)).toFixed(1)
  }
})

// ============ Init ============
onMounted(async () => {
  // Try to migrate old localStorage photos
  const migrated = await migrateFromLocalStorage()
  if (migrated > 0) {
    console.log(`Migrated ${migrated} photos from localStorage to IndexedDB`)
  }

  // Load all media
  mediaList.value = await getAllMedia()
  loading.value = false
})

// ============ Gallery Import (bulk from phone gallery) ============
function triggerGalleryImport() {
  galleryInputRef.value?.click()
}

async function onGalleryFilesSelected(e) {
  const files = Array.from(e.target.files)
  e.target.value = ''
  if (!files.length) return

  await startImport(files)
}

// ============ Single Upload ============
function triggerSingleUpload() {
  singleInputRef.value?.click()
}

function onSingleFilesSelected(e) {
  const files = Array.from(e.target.files)
  e.target.value = ''
  if (!files.length) return

  startImport(files)
}

// ============ Drag & Drop ============
function onDrop(e) {
  const files = Array.from(e.dataTransfer.files).filter(
    f => f.type.startsWith('image/') || f.type.startsWith('video/')
  )
  if (files.length) startImport(files)
}

// ============ Import Engine ============
async function startImport(files) {
  importing.value = true
  importCurrent.value = 0
  importTotal.value = files.length
  importFileName.value = ''
  importStats.imported = 0
  importStats.skipped = 0
  importStats.errors = 0

  const result = await batchImport(files, (current, total, fileName, status) => {
    importCurrent.value = current
    importTotal.value = total
    importFileName.value = fileName
    if (status === 'imported') importStats.imported++
    else if (status === 'skipped') importStats.skipped++
    else if (status === 'error') importStats.errors++
  })

  // Refresh media list
  mediaList.value = await getAllMedia()
  importing.value = false
}

// ============ Delete ============
async function removeMedia(id) {
  if (!confirm('确定要删除吗？')) return
  await deleteMedia(id)
  mediaList.value = mediaList.value.filter(m => m.id !== id)
  if (previewItem.value?.id === id) previewItem.value = null
}

// ============ Preview ============
function openPreview(item) {
  previewItem.value = item
  editNote.value = item.note || ''
}

async function saveNote() {
  if (!previewItem.value) return
  previewItem.value.note = editNote.value
  await saveMedia(previewItem.value)
  // Update in list
  const idx = mediaList.value.findIndex(m => m.id === previewItem.value.id)
  if (idx !== -1) mediaList.value[idx] = { ...previewItem.value }
}

// ============ Helpers ============
function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function formatDuration(seconds) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped>
/* ============ Stats Bar ============ */
.stats-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  font-size: 0.8rem;
  color: var(--text-light);
}

/* ============ Import Area ============ */
.import-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

/* Main gallery import button */
.import-main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(252, 228, 236, 0.5), rgba(243, 229, 245, 0.5));
  border: 2px solid rgba(206, 147, 216, 0.3);
  transition: all var(--transition-medium);
}

.import-main:hover {
  border-color: var(--purple-soft);
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.import-icon {
  font-size: 2.2rem;
  flex-shrink: 0;
}

.import-text {
  flex: 1;
}

.import-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.import-hint {
  font-size: 0.78rem;
  color: var(--text-light);
}

.import-arrow {
  font-size: 1.4rem;
  color: var(--purple-soft);
  flex-shrink: 0;
}

/* Secondary upload area */
.upload-area {
  text-align: center;
  padding: 20px;
  cursor: pointer;
  border: 2px dashed rgba(206, 147, 216, 0.25);
  background: rgba(252, 228, 236, 0.15);
  transition: all var(--transition-medium);
}

.upload-area:hover {
  border-color: var(--purple-soft);
  background: rgba(252, 228, 236, 0.3);
}

.upload-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 6px;
}

.upload-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--text-light);
}

/* ============ Photo Grid ============ */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 10px;
}

.photo-card {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
  transition: all var(--transition-medium);
  animation: fadeInUp 0.6s ease-out backwards;
}

.photo-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-strong);
}

.card-media-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.photo-card:hover .photo-img {
  transform: scale(1.06);
}

/* Video badge */
.video-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.65);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  pointer-events: none;
}

.play-icon {
  font-size: 0.6rem;
}

/* Hover overlay */
.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(74, 68, 88, 0.7) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12px;
  opacity: 0;
  transition: opacity var(--transition-medium);
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-note {
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-meta {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.68rem;
  display: flex;
  gap: 8px;
}

.photo-type {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.65rem;
}

/* Delete button */
.photo-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all var(--transition-fast);
  z-index: 2;
}

.photo-card:hover .photo-delete {
  opacity: 1;
}

.photo-delete:hover {
  background: rgba(244, 67, 54, 0.8);
}

/* ============ Import Progress Modal ============ */
.import-progress-modal {
  width: 360px;
  max-width: 90vw;
  padding: 32px 24px;
  text-align: center;
}

.import-progress-modal h3 {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.progress-bar-wrap {
  height: 8px;
  background: rgba(206, 147, 216, 0.15);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--pink), var(--purple-soft));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.progress-file {
  display: block;
  font-size: 0.78rem;
  color: var(--text-light);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.progress-stats {
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: 0.85rem;
  margin-bottom: 12px;
}

.stat-ok { color: #4caf50; }
.stat-skip { color: #ff9800; }
.stat-err { color: #f44336; }

.progress-wait {
  font-size: 0.75rem;
  color: var(--text-light);
}

/* ============ Preview Modal ============ */
.preview-modal {
  padding: 16px;
  max-width: 88vw;
  max-height: 90vh;
}

.preview-img {
  max-width: 82vw;
  max-height: 65vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.preview-video {
  max-width: 82vw;
  max-height: 65vh;
  border-radius: var(--radius-md);
  outline: none;
}

.preview-info {
  margin-top: 14px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.8;
}

.preview-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
}

.preview-actions .input {
  flex: 1;
}

/* ============ Empty State ============ */
.empty-hint {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 6px;
}
</style>
