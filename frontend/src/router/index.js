import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    children: [
      {
        path: '',
        name: 'Today',
        component: () => import('../components/Today.vue')
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('../components/Tasks.vue')
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../components/Projects.vue')
      },
      {
        path: 'notes',
        name: 'Notes',
        component: () => import('../components/Notes.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router