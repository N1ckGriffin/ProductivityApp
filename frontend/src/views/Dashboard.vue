<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <nav class="nav-container">
      <div class="nav-content">
        <router-link to="/dashboard">Today</router-link> |
        <router-link to="/dashboard/tasks">Tasks</router-link> |
        <router-link to="/dashboard/projects">Projects</router-link> |
        <router-link to="/dashboard/notes">Notes</router-link>
      </div>
    </nav>
    <main class="main-container">
      <div class="main-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import Today from '../components/Today.vue'
import Tasks from '../components/Tasks.vue'
import Projects from '../components/Projects.vue'
import Notes from '../components/Notes.vue'

export default {
  name: 'Dashboard',
  components: {
    Today,
    Tasks,
    Projects,
    Notes
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-container {
  background: white;
  padding: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.main-container {
  flex: 1;
  padding: 20px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  padding: 4px 8px;
}

nav a.router-link-active {
  color: #42b983;
}
</style>