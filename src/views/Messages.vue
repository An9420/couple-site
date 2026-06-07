<template>
  <div class="page-container msg-page">
    <h2 class="page-title">💌 留言板</h2>
    <p class="page-subtitle">写下你想对TA说的话</p>

    <!-- Compose -->
    <div class="compose card">
      <div class="author-pick">
        <button :class="{ active: author === 'person1' }" @click="author = 'person1'">🐰 小安</button>
        <button :class="{ active: author === 'person2' }" @click="author = 'person2'">🐲 小婷子</button>
      </div>
      <textarea v-model="content" class="textarea" rows="3" placeholder="想说什么... 💭" maxlength="1000"></textarea>
      <div class="compose-row">
        <div class="sticker-pick">
          <span class="sticker-label">贴纸:</span>
          <button v-for="s in stickers" :key="s" class="sticker-btn" :class="{ picked: sticker === s }" @click="sticker = sticker === s ? null : s">{{ s }}</button>
        </div>
        <span class="char-count">{{ content.length }}/1000</span>
        <button class="btn btn-primary btn-sm" :disabled="!content.trim()" @click="sendMsg">💌 留言</button>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="msgs.length" class="msg-list">
      <div v-for="m in msgs" :key="m.id" class="msg-card card stagger-card" :class="m.author">
        <div class="msg-head">
          <span class="msg-author">{{ m.author === 'person1' ? '🐰 小安' : '🐲 小婷子' }}</span>
          <span class="msg-time">{{ fmtTime(m.created_at) }}</span>
        </div>
        <p class="msg-content">{{ m.content }}</p>
        <span v-if="m.sticker" class="msg-sticker">{{ m.sticker }}</span>
        <button class="msg-del" @click="removeMsg(m.id)">×</button>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="icon">💌</span>
      <p>还没有留言，开始写第一封吧～</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { msgApi } from '../utils/api.js'

const msgs = ref([])
const author = ref('person1')
const content = ref('')
const sticker = ref(null)
const stickers = ['💕', '🌸', '💝', '✨', '🌹', '🩷', '💌', '🥰', '😘', '🎀']

onMounted(async () => {
  try { msgs.value = await msgApi.list() } catch (e) { console.warn(e) }
})

async function sendMsg() {
  if (!content.value.trim()) return
  try {
    const m = await msgApi.create({ author: author.value, content: content.value.trim(), sticker: sticker.value })
    msgs.value.unshift(m)
    content.value = ''
    sticker.value = null
  } catch (e) { alert(e.message) }
}

async function removeMsg(id) {
  if (!confirm('删除这条留言？')) return
  try {
    await msgApi.remove(id)
    msgs.value = msgs.value.filter(m => m.id !== id)
  } catch (e) { alert(e.message) }
}

function fmtTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
/* Compose */
.author-pick { display: flex; gap: 8px; margin-bottom: 12px; }
.author-pick button {
  padding: 8px 20px; border-radius: 20px; border: 1px solid rgba(206,147,216,0.3);
  background: rgba(255,255,255,0.5); cursor: pointer; font-size: 0.85rem;
  transition: all var(--transition-fast);
}
.author-pick button.active { background: rgba(243, 229, 245, 0.6); border-color: var(--purple-soft); font-weight: 600; }

.compose-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.sticker-pick { display: flex; align-items: center; gap: 4px; flex: 1; flex-wrap: wrap; }
.sticker-label { font-size: 0.78rem; color: var(--text-light); }
.sticker-btn { width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; background: transparent; font-size: 1rem; cursor: pointer; }
.sticker-btn:hover, .sticker-btn.picked { border-color: var(--pink); background: rgba(252,228,236,0.4); }
.char-count { font-size: 0.75rem; color: var(--text-light); }

/* Messages */
.msg-list { margin-top: 20px; }
.msg-card {
  position: relative; padding: 18px 20px; animation: fadeInUp 0.6s ease-out backwards;
}
.msg-card.person1 { border-left: 3px solid var(--pink); }
.msg-card.person2 { border-left: 3px solid var(--purple-soft); }

.msg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.msg-author { font-weight: 600; font-size: 0.9rem; }
.msg-time { font-size: 0.75rem; color: var(--text-light); }
.msg-content { font-size: 0.95rem; line-height: 1.7; color: var(--text-primary); white-space: pre-wrap; }
.msg-sticker { position: absolute; top: 12px; right: 36px; font-size: 1.4rem; }

.msg-del {
  position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; border-radius: 50%;
  border: none; background: rgba(0,0,0,0.06); color: var(--text-light); cursor: pointer;
  font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: all var(--transition-fast);
}
.msg-card:hover .msg-del { opacity: 1; }
</style>
