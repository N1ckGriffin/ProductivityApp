<template>
  <div>Processing authentication...</div>
</template>

<script>
import taskStore from '../stores/TaskStore'

export default {
  name: 'AuthSuccess',
  created() {
        const token = this.$route.query.token;
        if (token) {
            console.log('Token received:', token); // Add this
            localStorage.setItem('token', token);
            this.fetchUserInfo(token);
        }
    },
  methods: {
    async fetchUserInfo(token) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem('user', JSON.stringify(userData));
          await taskStore.fetchTasks();
          this.$router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        this.$router.push('/login');
      }
    }
  }
}
</script>