// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'

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
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/auth-success',
    name: 'AuthSuccess',
    component: () => import('../views/AuthSuccess.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router