import { createRouter, createWebHistory } from 'vue-router'

import MainView from '@/views/MainView.vue'
const routes = [
  {
    path: '/:slug?',
    component: MainView,
    children:
      [
        {
          path: '/:slug?',
          component: () => import("@/views/pages/ChatPage.vue"),
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
export default router
