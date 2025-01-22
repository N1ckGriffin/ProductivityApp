<!-- src/views/Login.vue -->
<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Welcome Back</h1>
      <p class="subtitle">Sign in to continue to your dashboard</p>
      
      <button @click="loginWithGoogle" class="google-button">
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="google-icon">
        Sign in with Google
      </button>
      
      <p class="back-link">
        <router-link to="/dashboard">← Back to Dashboard</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  methods: {
    loginWithGoogle() {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    },
    
    handleAuthMessage(event) {
      // Verify the origin of the message
      if (event.origin !== import.meta.env.VITE_API_URL) return;

      const { token, user } = event.data;
      
      if (token && user) {
        // Store the authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Close the popup and navigate
        event.source.close();
        this.$router.push('/dashboard');
      }
    }
  },
  unmounted() {
    // Clean up event listener
    window.removeEventListener('message', this.handleAuthMessage);
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f5f5f5;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.subtitle {
  color: #666;
  margin-bottom: 32px;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.google-button:hover {
  background: #f5f5f5;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.back-link {
  margin-top: 24px;
}

.back-link a {
  color: #666;
  text-decoration: none;
}

.back-link a:hover {
  color: #42b983;
}
</style>