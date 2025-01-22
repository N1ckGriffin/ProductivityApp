<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <nav class="nav-container">
      <div class="nav-content">
        <div class="nav-links">
          <router-link to="/dashboard">Today</router-link> |
          <router-link to="/dashboard/tasks">Tasks</router-link> |
          <router-link to="/dashboard/projects">Projects</router-link> |
          <router-link to="/dashboard/notes">Notes</router-link>
        </div>
        <div class="profile-section" v-click-outside="closeDropdown">
          <button v-if="!isLoggedIn" @click="goToLogin" class="login-button">
            Login
          </button>
          <div v-else class="profile-dropdown">
            <button @click="toggleDropdown" class="profile-button">
              <img :src="user.picture" alt="Profile" class="profile-image" v-if="user.picture">
              <span v-else class="profile-initial">{{ userInitial }}</span>
            </button>
            <div v-show="showDropdown" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item">View Profile</router-link>
              <button @click="logout" class="dropdown-item">Logout</button>
            </div>
          </div>
        </div>
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
  },
  data() {
    return {
      showDropdown: false,
      isLoggedIn: false,
      user: {
        name: '',
        email: '',
        picture: ''
      }
    }
  },
  computed: {
    userInitial() {
      return this.user.name ? this.user.name.charAt(0).toUpperCase() : '?'
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    closeDropdown() {
      this.showDropdown = false
    },
    goToLogin() {
      this.$router.push('/login')
    },
    logout() {
      // Clear user data and token
      this.isLoggedIn = false
      this.user = { name: '', email: '', picture: '' }
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.closeDropdown()
      this.$router.push('/dashboard')
    }
  },
  mounted() {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      this.isLoggedIn = true
      this.user = JSON.parse(userData)
    }
  },
  directives: {
    clickOutside: {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event)
          }
        }
        document.addEventListener('click', el.clickOutsideEvent)
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
      }
    }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  padding: 4px 8px;
}

nav a.router-link-exact-active {
  color: #42b983;
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

.profile-section {
  position: relative;
}

.login-button, .profile-button {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: #42b983;
  color: white;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-button {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-initial {
  font-size: 18px;
  font-weight: bold;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: #2c3e50;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  font-size: 14px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

button.dropdown-item {
  border-top: 1px solid #eee;
}
</style>