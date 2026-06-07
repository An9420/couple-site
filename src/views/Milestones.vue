<template>
  <div class="page-container milestones-page">
    <h2 class="page-title">🎯 恋爱里程碑</h2>
    <p class="page-subtitle">每一个重要瞬间，都值得铭记</p>

    <!-- Add Milestone -->
    <div class="add-milestone card">
      <div class="add-form-row">
        <input v-model="newTitle" class="input" placeholder="里程碑名称..." />
        <input v-model="newDate" type="date" class="input" />
        <input v-model="newIcon" class="input input-icon" placeholder="🎯" maxlength="2" />
        <button class="btn btn-primary btn-sm" :disabled="!newTitle || !newDate" @click="addMilestone">
          ＋
        </button>
      </div>
    </div>

    <!-- Milestones List -->
    <div v-if="milestones.length" class="milestone-list">
      <div
        v-for="(m, idx) in milestones"
        :key="m.id"
        class="milestone-card card stagger-card"
        :class="{ upcoming: !isPast(m.date) }"
      >
        <div class="ms-icon">{{ m.icon || '🎯' }}</div>
        <div class="ms-info">
          <h4 class="ms-title">{{ m.title }}</h4>
          <p class="ms-date">📅 {{ m.date }}</p>
          <p class="ms-countdown" :class="{ today: isToday(m.date) }">
            <template v-if="isToday(m.date)">
              🎉 就在今天！
            </template>
            <template v-else-if="isPast(m.date)">
              已经过去 <span class="count-num">{{ getPastDays(m.date) }}</span> 天
            </template>
            <template v-else>
              还有 <span class="count-num countdown">{{ getCountdownDays(m.date) }}</span> 天
            </template>
          </p>
          <!-- Progress bar for countdown -->
          <div v-if="!isPast(m.date) && !isToday(m.date)" class="countdown-bar">
            <div class="countdown-fill" :style="{ width: countdownPercent(m.date) + '%' }"></div>
          </div>
        </div>
        <button class="ms-delete" @click="removeMilestone(m.id)">×</button>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <span class="icon">🎯</span>
      <p>还没有里程碑，快添加第一个吧～</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getMilestones, saveMilestone, deleteMilestone } from '../utils/storage'

const milestones = ref([])
const newTitle = ref('')
const newDate = ref('')
const newIcon = ref('🎯')
const now = ref(Date.now())
let timer = null

onMounted(() => {
  milestones.value = getMilestones()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

function addMilestone() {
  if (!newTitle.value.trim() || !newDate.value) return
  milestones.value = saveMilestone({
    title: newTitle.value.trim(),
    date: newDate.value,
    icon: newIcon.value || '🎯'
  })
  newTitle.value = ''
  newDate.value = ''
  newIcon.value = '🎯'
}

function removeMilestone(id) {
  if (confirm('确定要删除这个里程碑吗？')) {
    milestones.value = deleteMilestone(id)
  }
}

function isToday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

function isPast(dateStr) {
  return new Date(dateStr + 'T00:00:00') < new Date()
}

function getPastDays(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'T00:00:00').getTime()
  return Math.floor(diff / 86400000)
}

function getCountdownDays(dateStr) {
  const diff = new Date(dateStr + 'T00:00:00').getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

function countdownPercent(dateStr) {
  // Calculate percentage based on a 100-day window
  const days = getCountdownDays(dateStr)
  return Math.max(1, Math.min(100, 100 - days))
}
</script>

<style scoped>
/* ============ Add Form ============ */
.add-form-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.add-form-row .input {
  flex: 1;
  min-width: 90px;
}

.input-icon {
  flex: 0 0 56px !important;
  min-width: 56px !important;
  text-align: center;
  padding: 14px 8px !important;
}

/* ============ Milestone Cards ============ */
.milestone-list {
  margin-top: 20px;
}

.milestone-card {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  animation: fadeInUp 0.6s ease-out backwards;
}

.milestone-card.upcoming {
  border-left: 3px solid var(--pink);
}

.ms-icon {
  font-size: 2rem;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(252, 228, 236, 0.5);
  border-radius: 50%;
}

.ms-info {
  flex: 1;
  min-width: 0;
}

.ms-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.ms-date {
  font-size: 0.8rem;
  color: var(--text-light);
}

.ms-countdown {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-top: 4px;
  font-weight: 500;
}

.ms-countdown.today {
  color: var(--pink-soft);
  font-weight: 600;
  animation: todayGlow 1.5s ease-in-out infinite;
}

@keyframes todayGlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.count-num {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--purple);
  font-family: 'ZCOOL KuaiLe', serif;
}

.count-num.countdown {
  animation: digitJump 1s ease-in-out infinite;
}

@keyframes digitJump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.countdown-bar {
  height: 3px;
  background: rgba(206, 147, 216, 0.15);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.countdown-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--pink), var(--purple-soft));
  border-radius: 2px;
  transition: width 1s ease;
}

.ms-delete {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.08);
  color: var(--text-light);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all var(--transition-fast);
}

.milestone-card:hover .ms-delete {
  opacity: 1;
}

.ms-delete:hover {
  background: rgba(244, 67, 54, 0.15);
  color: #e53935;
}
</style>
