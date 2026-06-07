<template>
  <div class="page-container tasks-page">
    <h2 class="page-title">🎯 情侣任务</h2>
    <p class="page-subtitle">一起完成，一起成长</p>

    <!-- Progress -->
    <div class="task-progress card" v-if="tasks.length">
      <div class="progress-text">已完成 {{ doneCount }}/{{ tasks.length }} 个任务</div>
      <div class="progress-bar"><div class="progress-fill" :style="{ width: progressPct + '%' }"></div></div>
    </div>

    <!-- Add Task -->
    <div class="add-task card">
      <input v-model="newTitle" class="input" placeholder="新任务..." @keyup.enter="addTask" />
      <div class="add-row">
        <select v-model="newAssignee" class="input select-input">
          <option value="both">👫 一起</option>
          <option value="person1">🐰 小安</option>
          <option value="person2">🐲 小婷子</option>
        </select>
        <button class="btn btn-primary btn-sm" :disabled="!newTitle.trim()" @click="addTask">＋ 添加</button>
      </div>
    </div>

    <!-- Pending Tasks -->
    <div v-if="pendingTasks.length" class="task-section">
      <h3 class="section-label">📋 待完成</h3>
      <div v-for="t in pendingTasks" :key="t.id" class="task-card card stagger-card" @click="completeTask(t)">
        <span class="task-check">○</span>
        <div class="task-info">
          <span class="task-title">{{ t.title }}</span>
          <span class="task-tag">{{ assigneeLabel(t.assigned_to) }}</span>
        </div>
      </div>
    </div>

    <!-- Done Tasks -->
    <div v-if="doneTasks.length" class="task-section">
      <h3 class="section-label">✅ 已完成</h3>
      <div v-for="t in doneTasks" :key="t.id" class="task-card card done">
        <span class="task-check done">✓</span>
        <div class="task-info">
          <span class="task-title done-text">{{ t.title }}</span>
          <span class="task-tag">{{ assigneeLabel(t.assigned_to) }}</span>
        </div>
        <button class="task-delete" @click.stop="removeTask(t.id)">×</button>
      </div>
    </div>

    <div v-if="!tasks.length" class="empty-state">
      <span class="icon">🎯</span>
      <p>还没有任务，一起添加第一个吧～</p>
    </div>

    <!-- Completion burst container -->
    <div class="complete-burst" ref="burstRef"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { taskApi } from '../utils/api.js'

const tasks = ref([])
const newTitle = ref('')
const newAssignee = ref('both')
const burstRef = ref(null)

onMounted(async () => {
  try { tasks.value = await taskApi.list() } catch (e) { console.warn(e) }
})

const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'))
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done'))
const doneCount = computed(() => doneTasks.value.length)
const progressPct = computed(() => tasks.value.length ? Math.round((doneCount.value / tasks.value.length) * 100) : 0)

function assigneeLabel(a) {
  return { both: '👫', person1: '🐰', person2: '🐲' }[a] || '👫'
}

async function addTask() {
  if (!newTitle.value.trim()) return
  try {
    const task = await taskApi.create({ title: newTitle.value.trim(), assigned_to: newAssignee.value })
    tasks.value.unshift(task)
    newTitle.value = ''
  } catch (e) { alert(e.message) }
}

async function completeTask(task) {
  try {
    const updated = await taskApi.update(task.id, { status: 'done' })
    const idx = tasks.value.findIndex(t => t.id === task.id)
    if (idx !== -1) tasks.value[idx] = updated
    spawnCompleteBurst()
  } catch (e) { alert(e.message) }
}

async function removeTask(id) {
  try {
    await taskApi.remove(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch (e) { alert(e.message) }
}

function spawnCompleteBurst() {
  if (!burstRef.value) return
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('span')
    s.textContent = ['✨', '🌟', '💚', '✅'][Math.floor(Math.random() * 4)]
    s.className = 'burst-star'
    s.style.left = (40 + Math.random() * 20) + '%'
    s.style.top = (30 + Math.random() * 10) + '%'
    s.style.setProperty('--sx', (Math.random() - 0.5) * 150 + 'px')
    s.style.setProperty('--sy', -(Math.random() * 80 + 40) + 'px')
    s.style.fontSize = (Math.random() * 16 + 14) + 'px'
    s.style.animationDuration = (Math.random() * 0.6 + 0.8) + 's'
    burstRef.value.appendChild(s)
    s.addEventListener('animationend', () => s.remove())
  }
}
</script>

<style scoped>
.task-progress { padding: 16px 20px; }
.progress-text { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }
.progress-bar { height: 6px; background: rgba(206, 147, 216, 0.15); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--pink), var(--purple-soft)); border-radius: 3px; transition: width 0.5s ease; }

.add-row { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
.select-input { flex: 1; min-width: 80px; padding: 10px 12px; background: rgba(255,255,255,0.7); }

.section-label { font-size: 0.95rem; color: var(--text-primary); margin: 20px 0 10px; }

.task-card {
  display: flex; align-items: center; gap: 14px; padding: 14px 18px;
  cursor: pointer; animation: fadeInUp 0.6s ease-out backwards;
}
.task-card:hover { transform: translateY(-2px); }
.task-card.done { opacity: 0.7; cursor: default; }
.task-card.done:hover { transform: none; }

.task-check { font-size: 1.4rem; color: var(--text-light); transition: all var(--transition-fast); }
.task-check.done { color: #4caf50; }
.task-info { flex: 1; display: flex; align-items: center; gap: 10px; }
.task-title { font-size: 0.95rem; color: var(--text-primary); }
.task-title.done-text { text-decoration: line-through; color: var(--text-light); }
.task-tag { font-size: 0.8rem; padding: 2px 8px; border-radius: 10px; background: rgba(252, 228, 236, 0.4); }

.task-delete {
  width: 24px; height: 24px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.08); color: var(--text-light); cursor: pointer;
  font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: all var(--transition-fast);
}
.task-card:hover .task-delete { opacity: 1; }
.task-delete:hover { background: rgba(244, 67, 54, 0.15); color: #e53935; }

/* Burst */
.complete-burst { position: fixed; inset: 0; pointer-events: none; z-index: 9998; }
.burst-star {
  position: absolute; pointer-events: none;
  animation: taskBurst ease-out forwards;
}
@keyframes taskBurst {
  0% { transform: translate(0,0) scale(0.3); opacity: 1; }
  100% { transform: translate(var(--sx), var(--sy)) scale(1.3); opacity: 0; }
}
</style>
