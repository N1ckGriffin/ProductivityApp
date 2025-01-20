<template>
  <div class="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/tasks">Tasks</router-link> |
      <router-link to="/projects">Projects</router-link> |
      <router-link to="/notes">Notes</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

nav a.router-link-active {
  color: #42b983;
}
</style>