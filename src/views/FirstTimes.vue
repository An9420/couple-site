<template>
  <div class="page-container ft-page">
    <h2 class="page-title">🌟 第一次记录</h2>
    <p class="page-subtitle">每一个第一次，都是独一无二的回忆</p>

    <!-- Add -->
    <div class="add-ft card">
      <div class="icon-pick">
        <button v-for="ico in icons" :key="ico" class="icon-btn" :class="{ picked: newIcon === ico }" @click="newIcon = ico">{{ ico }}</button>
      </div>
      <input v-model="newTitle" class="input" placeholder="第一次做什么？" />
      <div class="add-row">
        <input v-model="newDate" type="date" class="input" />
        <input v-model="newNote" class="input" placeholder="备注（可选）" />
      </div>
      <button class="btn btn-primary btn-sm mt-2" :disabled="!newTitle || !newDate" @click="addFirst">🌟 记录</button>
    </div>

    <!-- Timeline -->
    <div v-if="items.length" class="timeline">
      <div class="tl-line"></div>
      <div v-for="(item, idx) in items" :key="item.id" class="tl-item" :class="{ left: idx % 2 === 0, right: idx % 2 === 1 }">
        <div class="tl-dot">{{ item.icon }}</div>
        <div class="tl-card card stagger-card">
          <span class="tl-icon">{{ item.icon }}</span>
          <h4 class="tl-title">{{ item.title }}</h4>
          <p class="tl-date">📅 {{ item.event_date }}</p>
          <p v-if="item.note" class="tl-note">{{ item.note }}</p>
          <button class="tl-del" @click.stop="removeItem(item.id)">×</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="icon">🌟</span>
      <p>还没有第一次记录，快添加吧～</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { firsttimeApi } from '../utils/api.js'

const items = ref([])
const newTitle = ref('')
const newDate = ref('')
const newNote = ref('')
const newIcon = ref('🌟')
const icons = ['🌟', '💫', '✨', '💝', '💋', '🎉', '🔥', '💗', '🎀', '🌈']

onMounted(async () => {
  try { items.value = await firsttimeApi.list() } catch (e) { console.warn(e) }
})

async function addFirst() {
  if (!newTitle.value.trim() || !newDate.value) return
  try {
    const item = await firsttimeApi.create({
      title: newTitle.value.trim(),
      event_date: newDate.value,
      note: newNote.value,
      icon: newIcon.value
    })
    items.value.unshift(item)
    newTitle.value = ''
    newDate.value = ''
    newNote.value = ''
    newIcon.value = '🌟'
  } catch (e) { alert(e.message) }
}

async function removeItem(id) {
  if (!confirm('删除这条记录？')) return
  try {
    await firsttimeApi.remove(id)
    items.value = items.value.filter(i => i.id !== id)
  } catch (e) { alert(e.message) }
}
</script>

<style scoped>
.icon-pick { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; }
.icon-btn { width: 36px; height: 36px; border-radius: 50%; border: 2px solid transparent; background: transparent; font-size: 1.1rem; cursor: pointer; }
.icon-btn:hover, .icon-btn.picked { border-color: var(--purple-soft); background: rgba(243,229,245,0.4); }

.add-row { display: flex; gap: 8px; margin: 8px 0; }
.mt-2 { margin-top: 8px; }

/* Timeline */
.timeline { position: relative; margin-top: 24px; padding: 0; }
.tl-line {
  position: absolute; left: 50%; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(to bottom, var(--pink), var(--purple-soft));
  transform: translateX(-50%);
}

.tl-item { position: relative; margin-bottom: 20px; width: 100%; display: flex; }
.tl-item.left { justify-content: flex-start; padding-right: 52%; }
.tl-item.right { justify-content: flex-end; padding-left: 52%; }

@media (max-width: 500px) {
  .tl-line { left: 20px; }
  .tl-item.left, .tl-item.right { justify-content: flex-start; padding-right: 0; padding-left: 48px; }
}

.tl-dot {
  position: absolute; left: 50%; top: 20px; transform: translate(-50%, -50%);
  width: 36px; height: 36px; border-radius: 50%; background: white;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 4px rgba(206,147,216,0.2); z-index: 1; font-size: 1rem;
}
@media (max-width: 500px) { .tl-dot { left: 20px; } }

.tl-card { flex: 1; position: relative; padding: 18px 20px; animation: fadeInUp 0.6s ease-out backwards; }
.tl-icon { font-size: 1.5rem; }
.tl-title { font-size: 1rem; font-weight: 600; margin: 6px 0 4px; }
.tl-date { font-size: 0.78rem; color: var(--text-light); }
.tl-note { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }

.tl-del {
  position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; border-radius: 50%;
  border: none; background: rgba(0,0,0,0.06); color: var(--text-light); cursor: pointer;
  font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: all var(--transition-fast);
}
.tl-card:hover .tl-del { opacity: 1; }
</style>
