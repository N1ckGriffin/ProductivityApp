<!-- App.vue -->
<template>
  <div class="app">
    <nav class="nav-container">
      <div class="nav-content">
        <router-link to="/">Today</router-link> |
        <router-link to="/tasks">Tasks</router-link> |
        <router-link to="/projects">Projects</router-link> |
        <router-link to="/notes">Notes</router-link>
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
export default {
  name: 'App'
}
</script>

<style>
/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: #f5f5f5;
}

/* Layout containers */
.app {
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

/* Navigation styles */
nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  padding: 4px 8px;
}

nav a.router-link-active {
  color: #42b983;
}

/* Common utility classes */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>