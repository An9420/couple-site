<template>
  <Teleport to="body">
    <!-- Login Modal -->
    <div v-if="visible && mode !== 'change'" class="modal-overlay">
      <div class="modal-content login-modal">
        <div class="login-heart">💕</div>
        <h3>欢迎回到你们的小站</h3>
        <p class="login-desc">输入专属密码，进入甜蜜空间</p>

        <div class="pw-input-wrap">
          <input
            ref="pwInput"
            v-model="password"
            type="password"
            class="input pw-input"
            placeholder="输入密码..."
            @keyup.enter="submit"
          />
          <span class="pw-toggle" @click="showPw = !showPw">{{ showPw ? '🙈' : '👁️' }}</span>
        </div>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button class="btn btn-primary" style="width:100%;margin-top:12px" :disabled="!password || loading" @click="submit">
          <span v-if="loading">⏳ 验证中...</span>
          <span v-else>💕 进入小站</span>
        </button>

        <div class="login-footer">
          <button class="link-btn" @click="mode = 'change'; error = ''; oldPassword = ''; newPassword = ''; newPassword2 = ''">
            🔑 修改密码
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="visible && mode === 'change'" class="modal-overlay">
      <div class="modal-content login-modal">
        <h3>🔑 修改密码</h3>
        <p class="login-desc">设置一个只有你们知道的密码</p>

        <input v-model="oldPassword" type="password" class="input mb-2" placeholder="原密码" />
        <input v-model="newPassword" type="password" class="input mb-2" placeholder="新密码（至少4位）" />
        <input v-model="newPassword2" type="password" class="input mb-2" placeholder="再次输入新密码" @keyup.enter="doChangePassword" />

        <p v-if="changeError" class="login-error">{{ changeError }}</p>
        <p v-if="changeSuccess" class="login-success">{{ changeSuccess }}</p>

        <button class="btn btn-primary" style="width:100%;margin-top:8px"
          :disabled="!oldPassword || !newPassword || newPassword !== newPassword2 || newPassword.length < 4 || loading"
          @click="doChangePassword">
          💾 保存新密码
        </button>

        <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px" @click="mode = 'login'; error = ''; password = ''">
          ← 返回登录
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { authApi } from '../utils/api.js'
import { setToken, isLoggedIn } from '../utils/auth.js'

const emit = defineEmits(['authenticated'])

// State
const visible = ref(false)
const mode = ref('login') // 'login' | 'change'
const password = ref('')
const showPw = ref(false)
const error = ref('')
const loading = ref(false)
const pwInput = ref(null)

// Change password state
const oldPassword = ref('')
const newPassword = ref('')
const newPassword2 = ref('')
const changeError = ref('')
const changeSuccess = ref('')

// Check auth on init — every page load triggers this
async function checkAuth() {
  if (isLoggedIn()) {
    try {
      await authApi.verify()
      emit('authenticated')
      return
    } catch {
      // Token expired in this session, re-login
    }
  }
  visible.value = true
  mode.value = 'login'
  error.value = ''
  password.value = ''

  await nextTick()
  pwInput.value?.focus()
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { token } = await authApi.login(password.value)
    setToken(token)
    visible.value = false
    emit('authenticated')
  } catch (e) {
    error.value = e.message || '密码错误，请重试'
    password.value = ''
    await nextTick()
    pwInput.value?.focus()
  } finally {
    loading.value = false
  }
}

async function doChangePassword() {
  changeError.value = ''
  changeSuccess.value = ''

  if (newPassword.value !== newPassword2.value) {
    changeError.value = '两次输入的密码不一致'
    return
  }
  if (newPassword.value.length < 4) {
    changeError.value = '密码至少需要4位'
    return
  }

  loading.value = true
  try {
    await authApi.changePassword(oldPassword.value, newPassword.value)
    changeSuccess.value = '密码修改成功！请使用新密码登录 💕'
    setTimeout(() => {
      mode.value = 'login'
      changeSuccess.value = ''
      oldPassword.value = ''
      newPassword.value = ''
      newPassword2.value = ''
      password.value = ''
      nextTick(() => pwInput.value?.focus())
    }, 1500)
  } catch (e) {
    changeError.value = e.message || '修改失败'
  } finally {
    loading.value = false
  }
}

// Listen for auth:required event from api.js (401)
function onAuthRequired() {
  checkAuth()
}

onMounted(() => {
  window.addEventListener('auth:required', onAuthRequired)
  checkAuth()
})

defineExpose({ checkAuth })
</script>

<style scoped>
.login-modal {
  width: 360px;
  max-width: 90vw;
  padding: 36px 28px;
  text-align: center;
}

.login-heart {
  font-size: 3rem;
  margin-bottom: 8px;
  animation: heartFloat 2s ease-in-out infinite;
}

@keyframes heartFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.login-modal h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.login-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
}

/* Password input */
.pw-input-wrap {
  position: relative;
}

.pw-input {
  padding-right: 44px !important;
  font-size: 1.05rem;
  text-align: center;
  letter-spacing: 4px;
}

.pw-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
}

.login-error {
  color: #e53935;
  font-size: 0.82rem;
  margin-top: 10px;
  background: rgba(229, 57, 53, 0.06);
  padding: 8px 12px;
  border-radius: 8px;
}

.login-success {
  color: #2e7d32;
  font-size: 0.82rem;
  margin-top: 10px;
  background: rgba(46, 125, 50, 0.06);
  padding: 8px 12px;
  border-radius: 8px;
}

.login-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(206, 147, 216, 0.2);
}

.link-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 0.82rem;
  font-family: inherit;
  transition: color var(--transition-fast);
}

.link-btn:hover {
  color: var(--purple-soft);
}

.mb-2 {
  margin-bottom: 10px;
  display: block;
}
</style>
