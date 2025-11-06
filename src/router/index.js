import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'

const routes = [
  // 1. 精确路径放前面
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },

  // 2. 业务首页
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'), // ← 新建的布局壳
    meta: { requiresAuth: true }
  },

    {
    path: '/glb',
    name: 'glb',
    component: () => import('@/views/glb.vue'), // ← 新建的布局壳
    meta: { requiresAuth: true }
  },

      {
    path: '/robotcontrol',
    name: 'robotcontrol',
    component: () => import('@/views/robotcontrol.vue'), // ← 新建的布局壳
    meta: { requiresAuth: true }
  },
  // 3. 真正的 404 通配，只能放最后
  // 如果暂时不想做 404 页，可以先不写这一条
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: '404',
  //   component: () => import('@/views/404.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// router.beforeEach((to, from, next) => {
//   const hasToken = getToken()
//   if (to.meta?.requiresAuth && !hasToken) {
//     next('/login')
//   } else if (to.path === '/login' && hasToken) {
//     next('/')
//   } else {
//     next()
//   }
// })

export default router