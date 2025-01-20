import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Tasks from '../views/Tasks.vue'
import Projects from '../views/Projects.vue'
import Notes from '../views/Notes.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects
  },
  {
    path: '/notes',
    name: 'Notes',
    component: Notes
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router