<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link
        v-for="item in mainItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>

      <!-- More button -->
      <button class="nav-item more-btn" :class="{ active: showMore }" @click="showMore = !showMore">
        <span class="nav-icon">⋯</span>
        <span class="nav-label">更多</span>
      </button>
    </div>

    <!-- More menu overlay -->
    <Teleport to="body">
      <div v-if="showMore" class="more-overlay" @click.self="showMore = false">
        <div class="more-menu">
          <h4 class="more-title">✨ 更多功能</h4>
          <div class="more-grid">
            <router-link
              v-for="item in moreItems"
              :key="item.path"
              :to="item.path"
              class="more-item"
              @click="showMore = false"
            >
              <span class="more-icon">{{ item.icon }}</span>
              <span class="more-label">{{ item.label }}</span>
              <span class="more-desc">{{ item.desc }}</span>
            </router-link>
          </div>
          <button class="more-close btn btn-ghost btn-sm" @click="showMore = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showMore = ref(false)

const mainItems = [
  { path: '/', label: '主页', icon: '🏠' },
  { path: '/album', label: '相册', icon: '📷' },
  { path: '/checkin', label: '打卡', icon: '💪' },
  { path: '/messages', label: '互动', icon: '💕' }
]

const moreItems = [
  { path: '/diary', label: '日记', icon: '📝', desc: '每日心情' },
  { path: '/milestones', label: '里程碑', icon: '🎯', desc: '重要日子' },
  { path: '/tasks', label: '任务', icon: '✅', desc: '情侣任务' },
  { path: '/bucketlist', label: '心愿', icon: '📋', desc: '愿望清单' },
  { path: '/footprints', label: '足迹', icon: '🗺️', desc: '去过的地方' },
  { path: '/firsttimes', label: '第一次', icon: '🌟', desc: '珍贵记忆' },
  { path: '/stats', label: '统计', icon: '📊', desc: '恋爱数据' },
  { path: '/secret', label: '悄悄话', icon: '💌', desc: '私密空间' }
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.navbar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  padding: 8px 16px 12px; pointer-events: none;
}

.navbar-inner {
  max-width: 650px; margin: 0 auto; display: flex; justify-content: space-around;
  align-items: center; background: rgba(255,255,255,0.82);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-radius: 24px; padding: 8px 6px;
  box-shadow: 0 2px 20px rgba(171,71,188,0.1);
  border: 1px solid rgba(252,228,236,0.6); pointer-events: auto;
}

.nav-item, .more-btn {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 6px 10px; border-radius: 16px; text-decoration: none;
  color: var(--text-secondary); transition: all var(--transition-medium);
  position: relative; -webkit-tap-highlight-color: transparent;
  background: none; border: none; cursor: pointer; font-family: inherit;
}

.nav-item:hover, .more-btn:hover { color: var(--purple); }

.nav-item.active, .more-btn.active {
  color: var(--purple); background: rgba(243,229,245,0.6);
}

.nav-item.active::before {
  content: ''; position: absolute; top: -2px; width: 20px; height: 3px;
  background: linear-gradient(90deg, var(--pink), var(--purple-soft)); border-radius: 2px;
}

.nav-icon { font-size: 1.3rem; line-height: 1; transition: transform var(--transition-fast); }
.nav-item:hover .nav-icon, .nav-item.active .nav-icon { transform: translateY(-2px) scale(1.1); }

.nav-label { font-size: 0.65rem; font-weight: 500; letter-spacing: 0.3px; }

/* More Menu */
.more-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(74,68,88,0.4); backdrop-filter: blur(6px);
  display: flex; align-items: flex-end; justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.more-menu {
  background: white; border-radius: 28px 28px 0 0;
  padding: 24px 20px 36px; max-width: 500px; width: 100%;
  max-height: 70vh; overflow-y: auto;
  box-shadow: 0 -4px 30px rgba(0,0,0,0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.more-title { text-align: center; font-size: 1rem; color: var(--text-primary); margin-bottom: 20px; }

.more-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }

.more-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 16px 10px; border-radius: var(--radius-md);
  background: rgba(252,228,236,0.2); text-decoration: none;
  transition: all var(--transition-medium);
}
.more-item:hover { background: rgba(252,228,236,0.4); transform: translateY(-2px); }

.more-icon { font-size: 1.8rem; }
.more-label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.more-desc { font-size: 0.7rem; color: var(--text-light); }

.more-close { display: block; margin: 0 auto; }
</style>
