import { createRouter, createWebHistory } from 'vue-router'

import MainView from '@/views/MainView.vue'
const routes = [
  {
    path: '/',
    component: MainView,
    children:
      [
        {
          path: '/',
          component: () => import("@/views/pages/ChatPage.vue"),
          meta: { requiresAuth: true }
        },
        {
          path: "/auth",
          component: () => import("@/views/pages/AuthPage.vue"),
        },
      ]
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');

  // Chuyển về home nếu đã đăng nhập
  if (token && to.path === '/auth') {
    return next('/');
  }

  // Chuyển về auth nếu chưa đăng nhập
  if (to.meta.requiresAuth && !token) {
    return next("/auth");
  }

  return next();
});

export default router
