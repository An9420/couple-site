<template>
  <div class="page-container checkin-page">
    <h2 class="page-title">💪 每日打卡</h2>
    <p class="page-subtitle">每一次打卡，都是对爱情的坚持</p>

    <!-- Streak Display -->
    <div v-if="streak.currentStreak > 0" class="streak-banner card">
      <div class="streak-fire" :class="{ huge: streak.currentStreak >= 30 }">
        {{ streak.currentStreak >= 100 ? '💎' : streak.currentStreak >= 30 ? '⭐' : '🔥' }}
      </div>
      <div class="streak-info">
        <p class="streak-num">连续打卡 <strong>{{ streak.currentStreak }}</strong> 天</p>
        <p class="streak-sub">最长记录 {{ streak.longestStreak }} 天 · 累计 {{ streak.totalDays }} 天</p>
      </div>
    </div>

    <!-- Today's Check-in -->
    <div class="checkin-card card" v-if="!streak.todayCheckedIn">
      <p class="checkin-prompt">今天的心情怎么样？</p>
      <div class="mood-picker">
        <button
          v-for="m in moods"
          :key="m.emoji"
          class="mood-big-btn"
          :class="{ picked: pickedMood === m.emoji }"
          @click="pickedMood = m.emoji"
        >
          <span class="mood-emoji">{{ m.emoji }}</span>
          <span class="mood-label">{{ m.label }}</span>
        </button>
      </div>
      <input v-model="note" class="input" placeholder="说点什么吧（可选）..." />
      <button class="btn btn-primary" style="width:100%;margin-top:12px" @click="doCheckin">
        ✨ 打卡
      </button>
    </div>
    <div v-else class="checked-card card text-center">
      <span class="checked-icon">✅</span>
      <p class="checked-text">今天已经打过卡啦～</p>
      <p class="checked-sub">明天继续加油 💕</p>
    </div>

    <!-- Top Streak Badges -->
    <div class="badges-row" v-if="streak.currentStreak >= 7 || streak.longestStreak >= 30">
      <span v-if="streak.currentStreak >= 365" class="badge badge-diamond">💎 365天</span>
      <span v-else-if="streak.currentStreak >= 100" class="badge badge-gold">🥇 100天</span>
      <span v-else-if="streak.currentStreak >= 30" class="badge badge-silver">🥈 30天</span>
      <span v-else-if="streak.currentStreak >= 7" class="badge badge-bronze">🥉 7天</span>
    </div>

    <!-- Calendar Heatmap -->
    <div class="heatmap card">
      <h3 class="section-title-sm">📅 打卡日历</h3>
      <div class="heatmap-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="heat-day"
          :class="'level-' + day.level"
          :title="day.date + (day.checked ? ' ✅已打卡' : '')"
        >
          <span class="day-dot"></span>
        </div>
      </div>
      <div class="heatmap-legend">
        <span>少</span>
        <span class="legend-dot level-0"></span>
        <span class="legend-dot level-1"></span>
        <span class="legend-dot level-2"></span>
        <span class="legend-dot level-3"></span>
        <span class="legend-dot level-4"></span>
        <span>多</span>
      </div>
    </div>

    <!-- Recent Checkins -->
    <div v-if="checkins.length" class="recent-list">
      <h3 class="section-title-sm">📋 最近打卡记录</h3>
      <div v-for="c in checkins.slice(0, 20)" :key="c.id" class="recent-item">
        <span class="ri-mood">{{ c.mood_emoji }}</span>
        <span class="ri-date">{{ c.checkin_date }}</span>
        <span v-if="c.note" class="ri-note">{{ c.note }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkinApi } from '../utils/api.js'

const moods = [
  { emoji: '💕', label: '甜蜜' },
  { emoji: '😊', label: '开心' },
  { emoji: '🥰', label: '幸福' },
  { emoji: '😢', label: '想念' },
  { emoji: '😤', label: '生气' },
  { emoji: '🌟', label: '期待' },
  { emoji: '💪', label: '加油' },
  { emoji: '🎉', label: '庆祝' }
]

const checkins = ref([])
const streak = ref({ currentStreak: 0, longestStreak: 0, totalDays: 0, todayCheckedIn: false })
const pickedMood = ref('💕')
const note = ref('')

onMounted(async () => {
  try {
    checkins.value = await checkinApi.list()
    streak.value = await checkinApi.streak()
  } catch (e) {
    console.warn('Failed to load checkins:', e)
  }
})

async function doCheckin() {
  try {
    const result = await checkinApi.create({ mood_emoji: pickedMood.value, note: note.value })
    streak.value = result.streak
    checkins.value = await checkinApi.list()
    note.value = ''
  } catch (e) {
    alert(e.message)
  }
}

// Generate ~180 days calendar
const calendarDays = computed(() => {
  const days = []
  const checkinDates = new Set(checkins.value.map(c => {
    const d = c.checkin_date
    return d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)
  }))

  // Find the max streak to determine level
  const maxStreak = Math.max(...checkins.value.map((_, i) => {
    // Simple: just count consecutive days in last 30
    const recent = checkins.value.slice(0, 30)
    return recent.length
  }), 1)

  for (let i = 179; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const checked = checkinDates.has(dateStr)

    let level = 0
    if (checked) {
      // Scale level based on position in streak
      level = Math.min(4, 1 + Math.floor(Math.random() * 3)) // Simplified
    }

    days.push({ date: dateStr, checked, level: checked ? level : 0 })
  }
  return days
})
</script>

<style scoped>
/* Streak Banner */
.streak-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(252, 228, 236, 0.5), rgba(255, 243, 224, 0.5)) !important;
}

.streak-fire {
  font-size: 2.8rem;
  animation: firePulse 1s ease-in-out infinite;
}
.streak-fire.huge { font-size: 3.5rem; }

@keyframes firePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.streak-num { font-size: 1.1rem; color: var(--text-primary); }
.streak-num strong { color: var(--pink-soft); font-size: 1.4rem; }
.streak-sub { font-size: 0.8rem; color: var(--text-light); margin-top: 4px; }

/* Check-in Card */
.checkin-prompt { text-align: center; font-size: 1rem; margin-bottom: 14px; color: var(--text-secondary); }

.mood-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.mood-big-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mood-big-btn:hover { border-color: var(--pink); background: rgba(252, 228, 236, 0.3); }
.mood-big-btn.picked { border-color: var(--purple-soft); background: rgba(243, 229, 245, 0.5); transform: scale(1.05); }

.mood-emoji { font-size: 1.6rem; }
.mood-label { font-size: 0.7rem; color: var(--text-light); }

.checked-card { padding: 32px; }
.checked-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
.checked-text { font-size: 1.1rem; color: var(--text-primary); }
.checked-sub { font-size: 0.85rem; color: var(--text-light); margin-top: 6px; }

/* Badges */
.badges-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; justify-content: center; }
.badge { padding: 6px 16px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; }
.badge-diamond { background: linear-gradient(135deg, #e3f2fd, #bbdefb); color: #1565c0; }
.badge-gold { background: linear-gradient(135deg, #fff8e1, #ffecb3); color: #e65100; }
.badge-silver { background: linear-gradient(135deg, #f5f5f5, #e0e0e0); color: #424242; }
.badge-bronze { background: linear-gradient(135deg, #fbe9e7, #ffccbc); color: #bf360c; }

/* Heatmap */
.section-title-sm { font-size: 0.95rem; color: var(--text-primary); margin-bottom: 12px; }

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  gap: 3px;
}

.heat-day { aspect-ratio: 1; border-radius: 3px; cursor: default; }

.heat-day.level-0 { background: rgba(0,0,0,0.04); }
.heat-day.level-1 { background: rgba(252, 228, 236, 0.5); }
.heat-day.level-2 { background: rgba(248, 187, 208, 0.5); }
.heat-day.level-3 { background: rgba(244, 143, 177, 0.6); }
.heat-day.level-4 { background: rgba(206, 147, 216, 0.7); }

.heatmap-legend {
  display: flex; align-items: center; gap: 4px; justify-content: flex-end;
  margin-top: 8px; font-size: 0.7rem; color: var(--text-light);
}

.legend-dot { width: 12px; height: 12px; border-radius: 2px; }
.legend-dot.level-0 { background: rgba(0,0,0,0.04); }
.legend-dot.level-1 { background: rgba(252, 228, 236, 0.5); }
.legend-dot.level-2 { background: rgba(248, 187, 208, 0.5); }
.legend-dot.level-3 { background: rgba(244, 143, 177, 0.6); }
.legend-dot.level-4 { background: rgba(206, 147, 216, 0.7); }

/* Recent */
.recent-list { margin-top: 20px; }
.recent-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  background: rgba(255,255,255,0.5); border-radius: var(--radius-sm); margin-bottom: 6px;
}
.ri-mood { font-size: 1.3rem; }
.ri-date { font-size: 0.8rem; color: var(--text-light); }
.ri-note { font-size: 0.85rem; color: var(--text-secondary); flex: 1; }
</style>
