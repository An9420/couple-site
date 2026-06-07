// sessionStorage — token 仅在当前浏览器会话有效，关闭浏览器即失效
const TOKEN_KEY = 'couple_token'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}
