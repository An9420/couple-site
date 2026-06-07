<template>
  <div class="page-container stats-page">
    <h2 class="page-title">📊 恋爱统计</h2>
    <p class="page-subtitle">用数据记录我们的爱情</p>

    <div v-if="stats" class="stats-grid">
      <!-- Big number: total days -->
      <div class="stat-card card stat-big">
        <span class="stat-icon">💕</span>
        <span class="stat-value" ref="daysRef">{{ animatedDays }}</span>
        <span class="stat-label">在一起的天数</span>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">📝</span>
        <span class="stat-value">{{ stats.diaryCount }}</span>
        <span class="stat-label">恋爱日记</span>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">📸</span>
        <span class="stat-value">{{ stats.totalMedia }}</span>
        <span class="stat-label">照片视频</span>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">💪</span>
        <span class="stat-value">{{ stats.checkinRate }}%</span>
        <span class="stat-label">打卡率</span>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">🗺️</span>
        <span class="stat-value">{{ stats.footprintCount }}</span>
        <span class="stat-label">去过的地方</span>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">📋</span>
        <span class="stat-value">{{ stats.bucketDone }}/{{ stats.bucketTotal }}</span>
        <span class="stat-label">完成心愿</span>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">🌟</span>
        <span class="stat-value">{{ stats.firsttimesCount }}</span>
        <span class="stat-label">第一次记录</span>
      </div>

      <div class="stat-card card">
        <span class="stat-icon">🎯</span>
        <span class="stat-value">{{ stats.taskDone }}/{{ stats.taskTotal }}</span>
        <span class="stat-label">完成任务</span>
      </div>
    </div>

    <!-- Mood Chart -->
    <div v-if="stats && stats.moodDistribution && stats.moodDistribution.length" class="mood-chart card">
      <h3 class="section-title">💭 心情分布</h3>
      <div class="mood-bars">
        <div v-for="m in stats.moodDistribution" :key="m.mood" class="mood-bar-row">
          <span class="mbar-emoji">{{ m.mood }}</span>
          <div class="mbar-track">
            <div class="mbar-fill" :style="{ width: moodBarWidth(m.cnt, stats.moodDistribution[0].cnt) + '%' }"></div>
          </div>
          <span class="mbar-count">{{ m.cnt }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="icon">📊</span>
      <p>加载统计数据中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statsApi } from '../utils/api.js'

const stats = ref(null)
const animatedDays = ref(0)

onMounted(async () => {
  try { stats.value = await statsApi.get() } catch (e) { console.warn(e) }
  if (stats.value?.totalDays) {
    animateNumber(stats.value.totalDays, (v) => { animatedDays.value = v })
  }
})

function moodBarWidth(count, max) {
  return max > 0 ? Math.round((count / max) * 100) : 0
}

function animateNumber(target, setter, duration = 1500) {
  const start = performance.now()
  const initial = 0
  function tick(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
    setter(Math.floor(initial + (target - initial) * eased))
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-card { text-align: center; padding: 22px 16px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.stat-big { grid-column: 1 / -1; padding: 28px; background: linear-gradient(135deg, rgba(252,228,236,0.4), rgba(243,229,245,0.4)) !important; }
.stat-icon { font-size: 1.8rem; }
.stat-value { font-size: 1.6rem; font-weight: 700; color: var(--purple); font-family: 'ZCOOL KuaiLe', serif; }
.stat-big .stat-value { font-size: 2.6rem; }
.stat-label { font-size: 0.78rem; color: var(--text-light); }

/* Mood Chart */
.section-title { font-size: 1rem; margin-bottom: 14px; color: var(--text-primary); }
.mood-bars { display: flex; flex-direction: column; gap: 8px; }
.mood-bar-row { display: flex; align-items: center; gap: 10px; }
.mbar-emoji { font-size: 1.3rem; width: 36px; text-align: center; }
.mbar-track { flex: 1; height: 8px; background: rgba(206,147,216,0.1); border-radius: 4px; overflow: hidden; }
.mbar-fill { height: 100%; background: linear-gradient(90deg, var(--pink), var(--purple-soft)); border-radius: 4px; transition: width 1s ease; }
.mbar-count { font-size: 0.85rem; color: var(--text-secondary); width: 24px; text-align: right; }
</style>
