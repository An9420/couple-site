<template>
  <div class="page-container diary-page">
    <h2 class="page-title">📝 恋爱日记</h2>
    <p class="page-subtitle">每个字都是温柔的告白</p>

    <!-- Write Area -->
    <div class="write-card card">
      <div class="mood-selector">
        <span class="mood-label">今天的心情</span>
        <div class="mood-options">
          <button
            v-for="m in moods"
            :key="m.emoji"
            class="mood-btn"
            :class="{ picked: pickedMood === m.emoji }"
            @click="pickedMood = m.emoji"
            :title="m.label"
          >{{ m.emoji }}</button>
        </div>
      </div>
      <textarea
        v-model="newEntry"
        class="textarea"
        rows="4"
        placeholder="今天想写点什么... 💭"
        @keydown.ctrl.enter="addDiary"
      ></textarea>
      <div class="write-actions">
        <span class="char-count">{{ newEntry.length }}/500</span>
        <button
          class="btn btn-primary"
          :disabled="!newEntry.trim()"
          @click="addDiary"
        >
          ✨ 记录此刻
        </button>
      </div>
    </div>

    <!-- Diary List -->
    <div v-if="diaries.length" class="diary-list">
      <div
        v-for="(diary, idx) in diaries"
        :key="diary.id"
        class="diary-card card stagger-card"
      >
        <div class="diary-header">
          <span class="diary-mood">{{ diary.mood }}</span>
          <span class="diary-time">{{ formatTime(diary.createdAt) }}</span>
        </div>
        <p class="diary-content">{{ diary.content }}</p>
        <button class="diary-delete btn btn-ghost btn-sm" @click="removeDiary(diary.id)">
          🗑️ 删除
        </button>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <span class="icon">📝</span>
      <p>开始写第一封恋爱日记吧～</p>
    </div>

    <!-- Star burst container for new diary animation -->
    <div class="star-container" ref="starContainerRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { diaryApi } from '../utils/api.js'

const moods = [
  { emoji: '💕', label: '甜蜜' },
  { emoji: '😊', label: '开心' },
  { emoji: '🥰', label: '幸福' },
  { emoji: '😢', label: '想念' },
  { emoji: '😤', label: '生气' },
  { emoji: '🌟', label: '期待' },
  { emoji: '💭', label: '思绪' },
  { emoji: '💪', label: '加油' }
]

const diaries = ref([])
const newEntry = ref('')
const pickedMood = ref('💕')
const starContainerRef = ref(null)

onMounted(async () => {
  try {
    const data = await diaryApi.list()
    diaries.value = data.items || []
  } catch (e) { console.warn('加载日记失败') }
})

async function addDiary() {
  if (!newEntry.value.trim()) return
  try {
    const created = await diaryApi.create({
      content: newEntry.value.trim().slice(0, 500),
      mood: pickedMood.value
    })
    diaries.value.unshift(created)
    newEntry.value = ''
    pickedMood.value = '💕'
    spawnStars()
  } catch (e) { alert('保存失败: ' + e.message) }
}

async function removeDiary(id) {
  if (!confirm('确定要删除这篇日记吗？')) return
  try {
    await diaryApi.remove(id)
    diaries.value = diaries.value.filter(d => d.id !== id)
  } catch (e) { alert('删除失败: ' + e.message) }
}

function formatTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 172800000) return '昨天'
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function spawnStars() {
  if (!starContainerRef.value) return
  const symbols = ['✨', '⭐', '💫', '🌟', '💖', '💕', '🩷']

  for (let i = 0; i < 16; i++) {
    const star = document.createElement('span')
    star.textContent = symbols[Math.floor(Math.random() * symbols.length)]
    star.className = 'star-particle'
    star.style.left = (30 + Math.random() * 40) + '%'
    star.style.top = (20 + Math.random() * 20) + '%'
    star.style.fontSize = (Math.random() * 20 + 14) + 'px'
    star.style.setProperty('--sx', (Math.random() - 0.5) * 200 + 'px')
    star.style.setProperty('--sy', -(Math.random() * 120 + 60) + 'px')
    star.style.animationDuration = (Math.random() * 0.8 + 1) + 's'
    star.style.animationDelay = Math.random() * 0.3 + 's'

    starContainerRef.value.appendChild(star)
    star.addEventListener('animationend', () => star.remove())
  }
}
</script>

<style scoped>
/* ============ Write Card ============ */
.mood-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.mood-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.mood-options {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.mood-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mood-btn:hover {
  background: rgba(252, 228, 236, 0.5);
  transform: scale(1.15);
}

.mood-btn.picked {
  border-color: var(--purple-soft);
  background: rgba(243, 229, 245, 0.6);
  transform: scale(1.2);
}

.write-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.char-count {
  font-size: 0.78rem;
  color: var(--text-light);
}

/* ============ Diary Cards ============ */
.diary-list {
  margin-top: 20px;
}

.diary-card {
  animation: fadeInUp 0.6s ease-out backwards;
  position: relative;
}

.diary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.diary-mood {
  font-size: 1.5rem;
}

.diary-time {
  font-size: 0.78rem;
  color: var(--text-light);
}

.diary-content {
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.diary-delete {
  margin-top: 12px;
  opacity: 0;
  transition: opacity var(--transition-medium);
}

.diary-card:hover .diary-delete {
  opacity: 1;
}

/* ============ Star Animation ============ */
.star-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
}

.star-particle {
  position: absolute;
  pointer-events: none;
  user-select: none;
  animation: starBurst ease-out forwards;
}

@keyframes starBurst {
  0% {
    transform: translate(0, 0) scale(0.3) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--sx), var(--sy)) scale(1.2) rotate(180deg);
    opacity: 0;
  }
}
</style>
