import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/zona/:id',
      name: 'zona',
      component: () => import('../views/ZonaView.vue'),
    },
    {
      path: '/meteorologia',
      name: 'meteorologia',
      component: () => import('../views/MeteorologiaView.vue'),
    },
  ],
})

export default router
