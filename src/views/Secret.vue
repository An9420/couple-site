<template>
  <div class="page-container secret-page">
    <h2 class="page-title">💌 悄悄话</h2>
    <p class="page-subtitle">藏在花瓣里的小秘密，只给你看</p>

    <!-- Current Secret -->
    <div class="secret-display card" @click="nextSecret">
      <div class="secret-inner">
        <span class="secret-quote">"</span>
        <p class="secret-text" :key="currentSecret">{{ currentSecret }}</p>
        <span class="secret-quote end">"</span>
      </div>
      <p class="secret-hint">点击卡片换一句 💕</p>
    </div>

    <!-- Add Secret -->
    <div class="add-secret card">
      <textarea
        v-model="newSecret"
        class="textarea"
        rows="3"
        placeholder="写下你想对TA说的悄悄话... 💭"
      ></textarea>
      <div class="secret-actions">
        <span class="char-count">{{ newSecret.length }}/200</span>
        <button
          class="btn btn-primary btn-sm"
          :disabled="!newSecret.trim()"
          @click="addNewSecret"
        >
          🌸 放入花瓣
        </button>
      </div>
    </div>

    <!-- All Secrets -->
    <div v-if="secrets.length > 1" class="all-secrets">
      <h3 class="section-title">🌸 所有悄悄话</h3>
      <div
        v-for="(s, idx) in secrets"
        :key="idx"
        class="secret-item card stagger-card"
        @click="currentSecret = s; scrollToTop()"
      >
        <span class="si-icon">💌</span>
        <p class="si-text">{{ s }}</p>
      </div>
    </div>

    <!-- Petal Canvas -->
    <canvas ref="petalCanvasRef" class="petal-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getSecrets, addSecret } from '../utils/storage'

const secrets = ref([])
const currentSecret = ref('')
const newSecret = ref('')
const petalCanvasRef = ref(null)

let animFrame = null
let petals = []

onMounted(() => {
  secrets.value = getSecrets()
  currentSecret.value = secrets.value[Math.floor(Math.random() * secrets.value.length)] || '你是我的全世界 💕'
  initPetals()
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})

function nextSecret() {
  let newS
  do {
    newS = secrets.value[Math.floor(Math.random() * secrets.value.length)]
  } while (newS === currentSecret.value && secrets.value.length > 1)
  currentSecret.value = newS
}

function addNewSecret() {
  if (!newSecret.value.trim()) return
  secrets.value = addSecret(newSecret.value.trim().slice(0, 200))
  currentSecret.value = newSecret.value.trim()
  newSecret.value = ''
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ============ Petal Animation ============
function initPetals() {
  const canvas = petalCanvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let width = canvas.width = window.innerWidth
  let height = canvas.height = window.innerHeight

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  })

  // Create petals
  const petalCount = 25
  for (let i = 0; i < petalCount; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height * -1,
      size: Math.random() * 14 + 6,
      speedY: Math.random() * 0.6 + 0.3,
      speedX: Math.random() * 0.3 - 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.4 + 0.2,
      color: Math.random() > 0.5 ? '#f8bbd0' : '#e1bee7'
    })
  }

  function drawPetal(petal) {
    ctx.save()
    ctx.translate(petal.x, petal.y)
    ctx.rotate(petal.rotation)
    ctx.globalAlpha = petal.opacity
    ctx.fillStyle = petal.color
    ctx.beginPath()
    // Draw a simple petal shape
    ctx.ellipse(0, 0, petal.size, petal.size * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
    // Add a subtle line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, -petal.size * 0.4)
    ctx.lineTo(0, petal.size * 0.4)
    ctx.stroke()
    ctx.restore()
  }

  function animate() {
    ctx.clearRect(0, 0, width, height)

    for (const petal of petals) {
      petal.y += petal.speedY
      petal.x += petal.speedX + Math.sin(petal.y * 0.01) * 0.2
      petal.rotation += petal.rotSpeed

      // Reset when off screen
      if (petal.y > height + 20) {
        petal.y = -20
        petal.x = Math.random() * width
      }
      if (petal.x > width + 20) petal.x = -20
      if (petal.x < -20) petal.x = width + 20

      drawPetal(petal)
    }

    animFrame = requestAnimationFrame(animate)
  }

  animate()
}
</script>

<style scoped>
/* ============ Secret Canvas ============ */
.petal-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.secret-page {
  position: relative;
  z-index: 1;
}

/* ============ Secret Display ============ */
.secret-display {
  text-align: center;
  padding: 40px 28px;
  cursor: pointer;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.secret-display::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(252, 228, 236, 0.4) 0%, transparent 70%);
  pointer-events: none;
}

.secret-inner {
  position: relative;
  z-index: 1;
}

.secret-quote {
  font-size: 3rem;
  color: var(--pink);
  font-family: Georgia, serif;
  line-height: 0.5;
  opacity: 0.6;
}

.secret-quote.end {
  display: block;
  text-align: right;
  margin-top: 4px;
}

.secret-text {
  font-size: 1.2rem;
  line-height: 2;
  color: var(--text-primary);
  padding: 8px 20px;
  letter-spacing: 1px;
  animation: textReveal 1s ease-out;
}

.secret-hint {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 12px;
  position: relative;
  z-index: 1;
}

/* ============ Add Secret ============ */
.add-secret {
  margin-top: 20px;
}

.secret-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.char-count {
  font-size: 0.78rem;
  color: var(--text-light);
}

/* ============ All Secrets ============ */
.all-secrets {
  margin-top: 28px;
}

.section-title {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 14px;
  font-weight: 500;
}

.secret-item {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  animation: fadeInUp 0.6s ease-out backwards;
  padding: 18px 20px;
}

.secret-item:hover {
  background: rgba(252, 228, 236, 0.3);
}

.si-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.si-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
