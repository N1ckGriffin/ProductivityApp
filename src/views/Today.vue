<!-- Today.vue -->
<template>
  <div class="daily-tasks">
    <h1>Today's Tasks</h1>
    <div class="date-header">
      {{ today }}
    </div>

    <div class="task-input">
      <input 
        v-model="newTask" 
        @keyup.enter="addTask" 
        placeholder="Add a task for today..."
        class="task-input-field"
      >
      <button @click="addTask" class="add-button">Add Task</button>
    </div>

    <div class="tasks-container">
      <div v-if="todaysTasks.length === 0" class="empty-state">
        <p>No tasks for today yet. Start fresh by adding some tasks above!</p>
      </div>
      
      <div v-else class="tasks-summary">
        <p>{{ completedTasks }} of {{ todaysTasks.length }} tasks completed</p>
        <div class="progress-bar">
          <div 
            class="progress" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <ul class="task-list">
        <li v-for="task in todaysTasks" :key="task.id" class="task-item">
          <div class="task-content">
            <input 
              type="checkbox" 
              v-model="task.completed"
              class="task-checkbox"
            >
            <span :class="{ 'task-text': true, 'completed': task.completed }">
              {{ task.text }}
            </span>
          </div>
          <button 
            @click="deleteTask(task.id)" 
            class="delete-button"
          >×</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Today',
  data() {
    return {
      newTask: '',
      todaysTasks: [],
      today: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  computed: {
    completedTasks() {
      return this.todaysTasks.filter(task => task.completed).length
    },
    progressPercentage() {
      if (this.todaysTasks.length === 0) return 0
      return (this.completedTasks / this.todaysTasks.length) * 100
    }
  },
  methods: {
    addTask() {
      if (this.newTask.trim()) {
        this.todaysTasks.push({
          id: Date.now(),
          text: this.newTask,
          completed: false,
          created: new Date()
        })
        this.newTask = ''
      }
    },
    deleteTask(taskId) {
      this.todaysTasks = this.todaysTasks.filter(task => task.id !== taskId)
    }
  }
}
</script>

<style scoped>
.daily-tasks {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
}

.date-header {
  color: #666;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.task-input {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.task-input-field {
  flex: 1;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 6px;
  font-size: 1em;
}

.task-input-field:focus {
  outline: none;
  border-color: #42b983;
}

.add-button {
  padding: 12px 24px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
}

.add-button:hover {
  background-color: #3aa876;
}

.tasks-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 40px 0;
}

.tasks-summary {
  margin-bottom: 20px;
  color: #666;
}

.progress-bar {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.progress {
  height: 100%;
  background-color: #42b983;
  transition: width 0.3s ease;
}

.task-list {
  list-style: none;
  padding: 0;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.task-checkbox {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-text {
  font-size: 1.1em;
}

.task-text.completed {
  text-decoration: line-through;
  color: #999;
}

.delete-button {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  opacity: 0.6;
}

.delete-button:hover {
  opacity: 1;
}
</style>