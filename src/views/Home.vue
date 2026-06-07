<template>
  <div class="page-container home-page">
    <!-- Couple Header -->
    <div class="hero-section text-center">
      <div class="avatars-row">
        <div class="avatar-wrap">
          <div class="avatar" :style="avatar1Style">
            <span v-if="!couple.avatar1" class="avatar-placeholder">🐰</span>
            <!-- <span v-if="!couple.avatar1" class="avatar-placeholder">
              <img style="width: 250px;height: 250px" src="/public/img/安.jpg" alt="" srcset="">
            </span> -->
          </div>
          <span class="avatar-name">{{ couple.name1 }}</span>
        </div>
        <div class="heart-connector">
          <span class="pulse-heart">💕</span>
        </div>
        <div class="avatar-wrap">
          <div class="avatar" :style="avatar2Style">
            <span v-if="!couple.avatar2" class="avatar-placeholder">🐲</span>
          </div>
          <span class="avatar-name">{{ couple.name2 }}</span>
        </div>
      </div>

      <!-- Love Timer -->
      <div class="love-timer card">
        <p class="timer-label">我们已经在一起</p>
        <div class="timer-digits">
          <div class="digit-block">
            <span class="digit-number" ref="daysRef">{{ displayDays }}</span>
            <span class="digit-unit">天</span>
          </div>
          <span class="digit-sep">:</span>
          <div class="digit-block">
            <span class="digit-number">{{ displayHours }}</span>
            <span class="digit-unit">时</span>
          </div>
          <span class="digit-sep">:</span>
          <div class="digit-block">
            <span class="digit-number">{{ displayMinutes }}</span>
            <span class="digit-unit">分</span>
          </div>
          <span class="digit-sep">:</span>
          <div class="digit-block">
            <span class="digit-number seconds">{{ displaySeconds }}</span>
            <span class="digit-unit">秒</span>
          </div>
        </div>
        <p class="timer-date">From {{ couple.startDate }}</p>
      </div>
    </div>

    <!-- Random Quote -->
    <div class="quote-card card text-center">
      <p class="quote-text text-reveal" :key="quote">{{ quote }}</p>
      <button class="btn btn-ghost btn-sm mt-2" @click="refreshQuote">🔄 换一句</button>
    </div>

    <!-- Quick Links -->
    <div class="quick-links">
      <router-link to="/album" class="quick-link-card card">
        <span class="ql-icon">📷</span>
        <span class="ql-title">时光相册</span>
        <span class="ql-desc">珍藏每一刻</span>
      </router-link>
      <router-link to="/diary" class="quick-link-card card">
        <span class="ql-icon">📝</span>
        <span class="ql-title">恋爱日记</span>
        <span class="ql-desc">记录每一天</span>
      </router-link>
      <router-link to="/milestones" class="quick-link-card card">
        <span class="ql-icon">🎯</span>
        <span class="ql-title">里程碑</span>
        <span class="ql-desc">重要的日子</span>
      </router-link>
      <router-link to="/secret" class="quick-link-card card">
        <span class="ql-icon">💌</span>
        <span class="ql-title">悄悄话</span>
        <span class="ql-desc">只给特别的你</span>
      </router-link>
    </div>

    <!-- Setup Modal -->
    <Teleport to="body">
      <div v-if="showSetup" class="modal-overlay" @click.self="showSetup = false">
        <div class="modal-content setup-modal">
          <h3>💕 设置你们的恋爱信息</h3>
          <div class="setup-form">
            <label>你的昵称</label>
            <input v-model="form.name1" class="input" placeholder="如：小兔子" />
            <label>TA的昵称</label>
            <input v-model="form.name2" class="input" placeholder="如：小熊" />
            <label>在一起的日子</label>
            <input v-model="form.startDate" type="date" class="input" />
            <button class="btn btn-primary mt-3" style="width:100%" @click="saveSetup">💝 保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Setup Button -->
    <div class="text-center mt-3">
      <button class="btn btn-ghost btn-sm" @click="openSetup">⚙️ 编辑恋爱信息</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getCoupleInfo, saveCoupleInfo } from '../utils/storage'

const couple = ref(getCoupleInfo())
const showSetup = ref(false)
const form = ref({ ...couple.value })
const now = ref(Date.now())
let timer = null

const quotes = [
  '你是我所有温柔的理由。',
  '遇见你，是最美丽的意外。 ✨',
  '有你的每一天，都是最好的时光。',
  '世界很大，但我的心很小，只装得下你。',
  '和你在一起的每一秒，都值得被珍藏。 💕',
  '你是我平淡生活里的甜蜜奇迹。',
  '不管多远的路，只要和你一起走，都不觉得累。',
  '你笑起来的时候，整个世界都亮了。 🌸',
  '最好的爱情，是彼此成为更好的人。',
  '我想和你一起，看遍这世界所有的日出日落。',
  '我喜欢你，像风走了八千里，不问归期。',
  '你是我的半截诗，不许别人更改一个字。'
]

const quote = ref(quotes[Math.floor(Math.random() * quotes.length)])

function refreshQuote() {
  let newQ
  do {
    newQ = quotes[Math.floor(Math.random() * quotes.length)]
  } while (newQ === quote.value && quotes.length > 1)
  quote.value = newQ
}

const startDate = computed(() => new Date(couple.value.startDate + 'T00:00:00'))

const diff = computed(() => {
  const ms = now.value - startDate.value.getTime()
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, ms }
})

const displayDays = computed(() => String(diff.value.days))
const displayHours = computed(() => String(diff.value.hours).padStart(2, '0'))
const displayMinutes = computed(() => String(diff.value.minutes).padStart(2, '0'))
const displaySeconds = computed(() => String(diff.value.seconds).padStart(2, '0'))

const avatar1Style = computed(() =>
  couple.value.avatar1 ? { backgroundImage: `url(${couple.value.avatar1})` } : {}
)
const avatar2Style = computed(() =>
  couple.value.avatar2 ? { backgroundImage: `url(${couple.value.avatar2})` } : {}
)

function openSetup() {
  form.value = { ...couple.value }
  showSetup.value = true
}

function saveSetup() {
  couple.value = { ...form.value }
  saveCoupleInfo(couple.value)
  showSetup.value = false
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 200)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.home-page {
  padding-top: 40px;
}

/* ============ Hero ============ */
.avatars-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(206, 147, 216, 0.25);
  border: 3px solid white;
  background-size: cover;
  background-position: center;
  transition: transform var(--transition-medium);
}

.avatar:hover {
  transform: scale(1.08);
}

.avatar-placeholder {
  font-size: 2.2rem;
}

.avatar-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.heart-connector {
  animation: heartPulse 1.5s ease-in-out infinite;
}

@keyframes heartPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}

.pulse-heart {
  font-size: 1.8rem;
}

/* ============ Love Timer ============ */
.love-timer {
  padding: 24px 20px;
  margin-bottom: 16px;
}

.timer-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.timer-digits {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.digit-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.digit-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--purple);
  font-family: 'ZCOOL KuaiLe', 'Noto Serif SC', serif;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.digit-number.seconds {
  color: var(--pink-soft);
  animation: secondPulse 1s ease-in-out infinite;
}

@keyframes secondPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.digit-unit {
  font-size: 0.7rem;
  color: var(--text-light);
  margin-top: 2px;
}

.digit-sep {
  font-size: 1.5rem;
  color: var(--pink);
  font-weight: 300;
  margin-top: -8px;
}

.timer-date {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 12px;
}

/* ============ Quote ============ */
.quote-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-primary);
  font-style: italic;
  letter-spacing: 1px;
}

/* ============ Quick Links ============ */
.quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 20px;
}

.quick-link-card {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 16px;
  cursor: pointer;
}

.quick-link-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.quick-link-card:hover .ql-icon {
  transform: scale(1.15);
}

.ql-icon {
  font-size: 2.2rem;
  margin-bottom: 8px;
  transition: transform var(--transition-medium);
}

.ql-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.ql-desc {
  font-size: 0.75rem;
  color: var(--text-light);
}

/* ============ Setup Modal ============ */
.setup-modal {
  width: 380px;
  max-width: 90vw;
  padding: 32px 28px;
}

.setup-modal h3 {
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-align: center;
  color: var(--text-primary);
}

.setup-form label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 12px 0 6px;
}

.setup-form .input {
  width: 100%;
}
</style>
