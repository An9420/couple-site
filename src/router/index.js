import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '💕 恋爱主页' }
  },
  {
    path: '/album',
    name: 'Album',
    component: () => import('../views/Album.vue'),
    meta: { title: '📷 时光相册' }
  },
  {
    path: '/diary',
    name: 'Diary',
    component: () => import('../views/Diary.vue'),
    meta: { title: '📝 恋爱日记' }
  },
  {
    path: '/milestones',
    name: 'Milestones',
    component: () => import('../views/Milestones.vue'),
    meta: { title: '🎯 恋爱里程碑' }
  },
  {
    path: '/secret',
    name: 'Secret',
    component: () => import('../views/Secret.vue'),
    meta: { title: '💌 悄悄话' }
  },
  // === New pages ===
  {
    path: '/checkin',
    name: 'Checkin',
    component: () => import('../views/Checkin.vue'),
    meta: { title: '💪 每日打卡' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue'),
    meta: { title: '🎯 情侣任务' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/Messages.vue'),
    meta: { title: '💌 留言板' }
  },
  {
    path: '/footprints',
    name: 'Footprints',
    component: () => import('../views/Footprints.vue'),
    meta: { title: '🗺️ 我们的足迹' }
  },
  {
    path: '/bucketlist',
    name: 'BucketList',
    component: () => import('../views/BucketList.vue'),
    meta: { title: '📋 心愿清单' }
  },
  {
    path: '/firsttimes',
    name: 'FirstTimes',
    component: () => import('../views/FirstTimes.vue'),
    meta: { title: '🌟 第一次记录' }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/Stats.vue'),
    meta: { title: '📊 恋爱统计' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title || '💕 我们的恋爱小站'

  // Track navigation for easter eggs
  import('../utils/eastereggs.js').then(mod => {
    mod.trackNavigation(to.path)
  })
})

export default router
