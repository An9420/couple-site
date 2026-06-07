<template>
  <div class="page-container bl-page">
    <h2 class="page-title">📋 心愿清单</h2>
    <p class="page-subtitle">一起完成每一个小心愿</p>

    <div class="bl-progress card" v-if="items.length">
      <div class="bl-stat">
        <span class="bl-stat-num">{{ doneCount }}/{{ items.length }}</span>
        <span class="bl-stat-label">已完成</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" :style="{ width: progressPct + '%' }"></div></div>
    </div>

    <!-- Add -->
    <div class="add-bl card">
      <input v-model="newTitle" class="input" placeholder="写下你们的心愿..." @keyup.enter="addItem" />
      <div class="add-row">
        <select v-model="newCategory" class="input select-input">
          <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.emoji }} {{ c.label }}</option>
        </select>
        <button class="btn btn-primary btn-sm" :disabled="!newTitle.trim()" @click="addItem">＋</button>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="items.length" class="bl-grid">
      <div
        v-for="item in items"
        :key="item.id"
        class="bl-card card stagger-card"
        :class="{ completed: item.completed }"
        @click="toggleItem(item)"
      >
        <div class="bl-cat">{{ categoryEmoji(item.category) }} {{ categoryLabel(item.category) }}</div>
        <p class="bl-title">{{ item.title }}</p>
        <div class="bl-check">{{ item.completed ? '✅' : '⭕' }}</div>
        <button class="bl-del" @click.stop="removeItem(item.id)">×</button>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="icon">📋</span>
      <p>写下你们想一起做的事吧～</p>
    </div>

    <!-- Confetti container -->
    <div class="confetti-wrap" ref="confettiRef"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { bucketApi } from '../utils/api.js'

const items = ref([])
const newTitle = ref('')
const newCategory = ref('romantic')
const confettiRef = ref(null)

const categories = [
  { value: 'travel', label: '旅行', emoji: '✈️' },
  { value: 'food', label: '美食', emoji: '🍽️' },
  { value: 'adventure', label: '冒险', emoji: '🏔️' },
  { value: 'romantic', label: '浪漫', emoji: '💕' },
  { value: 'life', label: '生活', emoji: '🏠' },
  { value: 'other', label: '其他', emoji: '🌟' }
]

function categoryEmoji(v) { return categories.find(c => c.value === v)?.emoji || '🌟' }
function categoryLabel(v) { return categories.find(c => c.value === v)?.label || '其他' }

const doneCount = computed(() => items.value.filter(i => i.completed).length)
const progressPct = computed(() => items.value.length ? Math.round((doneCount.value / items.value.length) * 100) : 0)

onMounted(async () => {
  try { items.value = await bucketApi.list() } catch (e) { console.warn(e) }
})

async function addItem() {
  if (!newTitle.value.trim()) return
  try {
    const item = await bucketApi.create({ title: newTitle.value.trim(), category: newCategory.value })
    items.value.unshift(item)
    newTitle.value = ''
  } catch (e) { alert(e.message) }
}

async function toggleItem(item) {
  const newCompleted = item.completed ? 0 : 1
  try {
    const updated = await bucketApi.update(item.id, { completed: newCompleted })
    const idx = items.value.findIndex(i => i.id === item.id)
    if (idx !== -1) items.value[idx] = updated
    if (newCompleted) spawnConfetti()
  } catch (e) { alert(e.message) }
}

async function removeItem(id) {
  if (!confirm('删除这个心愿？')) return
  try {
    await bucketApi.remove(id)
    items.value = items.value.filter(i => i.id !== id)
  } catch (e) { alert(e.message) }
}

function spawnConfetti() {
  if (!confettiRef.value) return
  const colors = ['#f8bbd0', '#ce93d8', '#ffd54f', '#81c784', '#64b5f6', '#ffab91']
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('span')
    c.className = 'confetti-piece'
    c.style.left = Math.random() * 100 + '%'
    c.style.top = -(Math.random() * 20) + '%'
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    c.style.width = (Math.random() * 8 + 5) + 'px'
    c.style.height = (Math.random() * 14 + 6) + 'px'
    c.style.setProperty('--fall', (Math.random() * 80 + 40) + 'vh')
    c.style.setProperty('--drift', (Math.random() - 0.5) * 160 + 'px')
    c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg')
    c.style.animationDuration = (Math.random() * 2 + 2) + 's'
    c.style.animationDelay = Math.random() * 0.5 + 's'
    confettiRef.value.appendChild(c)
    c.addEventListener('animationend', () => c.remove())
  }
}
</script>

<style scoped>
.bl-progress { padding: 16px 20px; text-align: center; }
.bl-stat-num { font-size: 1.4rem; font-weight: 700; color: var(--purple); }
.bl-stat-label { font-size: 0.78rem; color: var(--text-light); display: block; margin-bottom: 8px; }
.progress-bar { height: 6px; background: rgba(206,147,216,0.15); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--pink), var(--purple-soft)); border-radius: 3px; transition: width 0.5s ease; }

.add-row { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
.select-input { flex: 1; min-width: 80px; padding: 10px 12px; background: rgba(255,255,255,0.7); }

.bl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
@media (max-width: 400px) { .bl-grid { grid-template-columns: 1fr; } }

.bl-card {
  position: relative; padding: 20px 16px; cursor: pointer; text-align: center;
  animation: fadeInUp 0.6s ease-out backwards; min-height: 100px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.bl-card.completed { border: 2px solid rgba(255, 215, 0, 0.4); background: rgba(255, 248, 225, 0.3) !important; }
.bl-card:hover { transform: translateY(-4px); }

.bl-cat { font-size: 0.78rem; color: var(--text-light); margin-bottom: 8px; }
.bl-title { font-size: 0.95rem; color: var(--text-primary); line-height: 1.5; }
.bl-check { font-size: 1.2rem; margin-top: 8px; }

.bl-del {
  position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 50%;
  border: none; background: rgba(0,0,0,0.06); color: var(--text-light); cursor: pointer;
  font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: all var(--transition-fast);
}
.bl-card:hover .bl-del { opacity: 1; }

/* Confetti */
.confetti-wrap { position: fixed; inset: 0; pointer-events: none; z-index: 9998; }
.confetti-piece {
  position: absolute; border-radius: 2px;
  animation: confettiFall ease-out forwards;
}
@keyframes confettiFall {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(var(--fall)) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
}
</style>
