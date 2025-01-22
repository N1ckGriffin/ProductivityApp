<!-- src/views/Profile.vue -->
<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-image-container">
          <img v-if="user.picture" :src="user.picture" alt="Profile" class="profile-image">
          <div v-else class="profile-initial">{{ userInitial }}</div>
        </div>
        <h1>{{ user.name }}</h1>
        <p class="email">{{ user.email }}</p>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <h3>Active Tasks</h3>
          <p class="stat-number">12</p>
        </div>
        <div class="stat-card">
          <h3>Projects</h3>
          <p class="stat-number">3</p>
        </div>
        <div class="stat-card">
          <h3>Notes</h3>
          <p class="stat-number">8</p>
        </div>
      </div>

      <div class="actions">
        <button @click="goToDashboard" class="secondary-button">Back to Dashboard</button>
        <button @click="logout" class="logout-button">Logout</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
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
    goToDashboard() {
      this.$router.push('/dashboard')
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  },
  mounted() {
    const userData = localStorage.getItem('user')
    if (userData) {
      this.user = JSON.parse(userData)
    } else {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f5f5f5;
}

.profile-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-image-container {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 60px;
  overflow: hidden;
  background: #42b983;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-initial {
  font-size: 48px;
  font-weight: bold;
  color: white;
}

.profile-header h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.email {
  color: #666;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.actions {
  display: flex;
  gap: 12px;
}

.secondary-button, .logout-button {
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.secondary-button {
  background: white;
  border: 1px solid #42b983;
  color: #42b983;
}

.logout-button {
  background: #ff4444;
  border: none;
  color: white;
}

.secondary-button:hover {
  background: #f5f5f5;
}
</style>