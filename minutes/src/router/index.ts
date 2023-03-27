import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: 'minutes',
    },
    {
      path: '/minutes',
      name: 'minutes',
      component: () => import('../components/MinutesComponent.vue')
    }
  ]
})

export default router
