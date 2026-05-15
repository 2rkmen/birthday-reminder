import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage, meta: { title: 'Главная' } },
  { path: '/add', name: 'add', component: () => import('../views/AddContact.vue'), meta: { title: 'Добавить' } },
  { path: '/add/:id', name: 'edit', component: () => import('../views/AddContact.vue'), meta: { title: 'Редактировать' } },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsPage.vue'), meta: { title: 'Настройки' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
