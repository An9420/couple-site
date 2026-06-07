<template>
  <div class="app-wrapper">
    <!-- Floating Hearts Background -->
    <div class="floating-hearts-bg" ref="heartsBgRef"></div>

    <!-- Main Content -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Navigation (only when authenticated) -->
    <NavBar v-if="authed" />

    <!-- Heart Burst Container -->
    <div class="heart-bursts" ref="burstContainerRef"></div>

    <!-- Login Modal -->
    <LoginModal @authenticated="authed = true" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import NavBar from './components/NavBar.vue'
import LoginModal from './components/LoginModal.vue'

const authed = ref(false)

const heartsBgRef = ref(null)
const burstContainerRef = ref(null)

// ============ Floating hearts in background ============
function createFloatingHeart() {
  if (!heartsBgRef.value) return
  const heart = document.createElement('span')
  heart.textContent = ['💕', '💗', '💖', '💝', '🩷', '✨'][Math.floor(Math.random() * 6)]
  heart.className = 'float-heart'
  heart.style.left = Math.random() * 100 + '%'
  heart.style.fontSize = (Math.random() * 18 + 10) + 'px'
  heart.style.animationDuration = (Math.random() * 8 + 8) + 's'
  heart.style.animationDelay = Math.random() * 4 + 's'
  heart.style.opacity = Math.random() * 0.4 + 0.15
  heartsBgRef.value.appendChild(heart)

  heart.addEventListener('animationend', () => {
    heart.remove()
  })
}

// ============ Click heart burst ============
function createBurst(x, y) {
  if (!burstContainerRef.value) return
  const colors = ['#f8bbd0', '#ce93d8', '#f48fb1', '#e1bee7', '#fce4ec', '#d1c4e9']
  const symbols = ['💕', '💗', '💖', '✨', '💝', '🩷', '🌸', '💜']

  for (let i = 0; i < 14; i++) {
    const particle = document.createElement('span')
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)]
    particle.className = 'burst-particle'
    particle.style.left = x + 'px'
    particle.style.top = y + 'px'
    particle.style.fontSize = (Math.random() * 20 + 12) + 'px'

    const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5
    const distance = Math.random() * 90 + 40
    const dx = Math.cos(angle) * distance
    const dy = Math.sin(angle) * distance

    particle.style.setProperty('--dx', dx + 'px')
    particle.style.setProperty('--dy', dy + 'px')
    particle.style.animationDuration = (Math.random() * 0.6 + 0.8) + 's'

    burstContainerRef.value.appendChild(particle)

    particle.addEventListener('animationend', () => {
      particle.remove()
    })
  }
}

function onPageClick(e) {
  createBurst(e.clientX, e.clientY)
}

onMounted(() => {
  // Start floating hearts
  setInterval(createFloatingHeart, 1800)
  for (let i = 0; i < 6; i++) {
    setTimeout(createFloatingHeart, i * 400)
  }

  // Click listener
  document.addEventListener('click', onPageClick)
})
</script>

<style>
/* ============ App Layout ============ */
.app-wrapper {
  min-height: 100vh;
  position: relative;
}

.main-content {
  padding-bottom: 90px;
}

/* ============ Page Transition ============ */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ============ Floating Hearts BG ============ */
.floating-hearts-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.float-heart {
  position: absolute;
  bottom: -40px;
  animation: floatUp linear forwards;
  pointer-events: none;
  user-select: none;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(-110vh) translateX(30px) rotate(30deg);
    opacity: 0;
  }
}

/* ============ Heart Burst ============ */
.heart-bursts {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

.burst-particle {
  position: absolute;
  pointer-events: none;
  user-select: none;
  animation: burstOut ease-out forwards;
}

@keyframes burstOut {
  0% {
    transform: translate(0, 0) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx), var(--dy)) scale(1.2);
    opacity: 0;
  }
}
</style>
