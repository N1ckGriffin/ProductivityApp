<!-- Today.vue -->
<template>
  <div class="today-page">
    <h1>Today's Tasks</h1>
    <div class="subtitle">
      {{ formattedToday }}
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
      
      <div v-else class="task-card">
        <div class="task-header">
          <div class="task-header-content">
            <h3>Today's Progress</h3>
            <span class="task-summary">
              {{ completedTasks }} of {{ todaysTasks.length }} tasks completed
            </span>
          </div>
        </div>

        <div class="task-content">
          <div class="progress-bar">
            <div 
              class="progress" 
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>

          <ul class="task-list">
            <li 
              v-for="task in sortedTasks" 
              :key="task._id" 
              class="task-item"
            >
              <div class="task-item-content">
                <input 
                  type="checkbox" 
                  v-model="task.completed"
                  @change="handleTaskUpdate(task)"
                  class="task-checkbox"
                >
                <span :class="{ 'task-text': true, 'completed': task.completed }">
                  {{ task.text }}
                </span>
              </div>
              <button 
                @click="deleteTask(task._id)" 
                class="delete-button"
              >×</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tasksApi } from '../services/api'
import debounce from 'lodash.debounce'

export default {
  name: 'Today',
  data() {
    return {
      newTask: '',
      todaysTasks: [],
      pendingUpdates: new Set()
    }
  },
  computed: {
    formattedToday() {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    completedTasks() {
      return this.todaysTasks.filter(task => task.completed).length
    },
    progressPercentage() {
      if (this.todaysTasks.length === 0) return 0
      return (this.completedTasks / this.todaysTasks.length) * 100
    },
    sortedTasks() {
      return [...this.todaysTasks].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        return new Date(b.created) - new Date(a.created)
      })
    }
  },
  methods: {
    async addTask() {
      if (this.newTask.trim()) {
        try {
          // Create the task with today's date
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const task = await tasksApi.createTask({
            text: this.newTask,
            scheduledDate: today.toISOString()
          })
          
          this.todaysTasks.push(task)
          this.newTask = ''
        } catch (error) {
          console.error('Error creating task:', error)
        }
      }
    },

    async handleTaskUpdate(task) {
      if (this.pendingUpdates.has(task._id)) return
      
      this.pendingUpdates.add(task._id)
      try {
        await this.debouncedUpdateTask(task)
      } finally {
        this.pendingUpdates.delete(task._id)
      }
    },

    async updateTask(task) {
      try {
        const updatedTask = await tasksApi.updateTask(task._id, {
          completed: task.completed
        })
        
        const index = this.todaysTasks.findIndex(t => t._id === updatedTask._id)
        if (index !== -1) {
          this.todaysTasks.splice(index, 1, updatedTask)
        }
      } catch (error) {
        console.error('Error updating task:', error)
        // Revert the local state if update fails
        const index = this.todaysTasks.findIndex(t => t._id === task._id)
        if (index !== -1) {
          this.todaysTasks[index].completed = !this.todaysTasks[index].completed
        }
      }
    },

    async deleteTask(taskId) {
      try {
        await tasksApi.deleteTask(taskId)
        this.todaysTasks = this.todaysTasks.filter(task => task._id !== taskId)
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    },

    async fetchTodaysTasks() {
      try {
        const tasks = await tasksApi.getTodayTasks()
        this.todaysTasks = tasks
      } catch (error) {
        console.error('Error fetching today\'s tasks:', error)
      }
    }
  },
  created() {
    // Initial fetch of today's tasks
    this.fetchTodaysTasks()

    // Create debounced version of updateTask
    this.debouncedUpdateTask = debounce(this.updateTask, 1000)

    // Set up polling to refresh tasks periodically
    this.pollInterval = setInterval(() => {
      this.fetchTodaysTasks()
    }, 30000) // Refresh every 30 seconds
  },
  beforeUnmount() {
    // Clean up
    if (this.debouncedUpdateTask?.cancel) {
      this.debouncedUpdateTask.cancel()
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  }
}
</script>

<style scoped>
.today-page {
  width: 100%;
  height: calc(100vh - 140px);
  text-align: left;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.task-input {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  width: 100%;
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
  white-space: nowrap;
}

.add-button:hover {
  background-color: #3aa876;
}

.tasks-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 40px 0;
}

.task-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  width: 100%;
  box-sizing: border-box;
}

.task-header-content {
  flex: 1;
  min-width: 0;
}

.task-header h3 {
  margin: 0;
  color: #2c3e50;
}

.task-summary {
  font-size: 0.9em;
  color: #666;
  margin-top: 4px;
  display: block;
}

.task-content {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.progress-bar {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress {
  height: 100%;
  background-color: #42b983;
  transition: width 0.3s ease;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: #f0f0f0;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-item-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.task-checkbox {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}

.task-text {
  font-size: 1.1em;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.task-item:hover .delete-button {
  opacity: 0.6;
}

.delete-button:hover {
  opacity: 1 !important;
}
</style>