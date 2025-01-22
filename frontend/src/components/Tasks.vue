<!-- Tasks.vue -->
<template>
  <div class="tasks-page">
    <h1>Tasks</h1>
    <div class="subtitle">
      Keep track of everything you need to do
    </div>

    <div class="task-input">
      <input 
        v-model="newTask.text" 
        @keyup.enter="addTask" 
        placeholder="Add a new task..."
        class="task-input-field"
      >
      <input 
        type="date"
        v-model="newTask.scheduledDate"
        class="date-input"
        :min="today"
      >
      <button @click="addTask" class="add-button">Add Task</button>
    </div>

    <div class="tasks-container">
      <div v-if="tasks.length === 0" class="empty-state">
        <p>No tasks yet. Create your first task to get started!</p>
      </div>
      
      <div v-else class="task-list">
        <div 
          v-for="(group, date) in groupedTasks" 
          :key="date" 
          class="task-card"
        >
          <div class="task-header">
            <div class="task-header-content">
              <h3>{{ formatGroupDate(date) }}</h3>
              <span class="task-summary">
                {{ completedTasksInGroup(group) }}/{{ group.length }} tasks completed
              </span>
            </div>
          </div>

          <div class="task-content">
            <ul class="task-items">
              <li 
                v-for="task in sortedTasks(group)" 
                :key="task._id" 
                class="task-item"
              >
                <div class="task-item-content">
                  <input 
                    type="checkbox" 
                    v-model="task.completed"
                    @change="updateTask(task)"
                    class="task-checkbox"
                  >
                  <span :class="{ 'task-text': true, 'completed': task.completed }">
                    {{ task.text }}
                  </span>
                </div>
                <div class="task-actions">
                  <input 
                    type="date"
                    v-model="task.scheduledDate"
                    class="date-input"
                    :min="today"
                    @change="updateTask(task)"
                  >
                  <button 
                    @click="deleteTask(task._id)" 
                    class="delete-button"
                  >×</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tasksApi } from '../services/api'
import debounce from 'lodash.debounce'

export default {
  name: 'Tasks',
  data() {
    return {
      newTask: {
        text: '',
        scheduledDate: new Date().toISOString().split('T')[0]
      },
      tasks: []
    }
  },
  computed: {
    today() {
      return new Date().toISOString().split('T')[0]
    },
    groupedTasks() {
      const groups = {}
      
      const sortedTasks = [...this.tasks].sort((a, b) => {
        if (a.scheduledDate !== b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate)
        }
        return 0
      })

      sortedTasks.forEach(task => {
        if (!groups[task.scheduledDate]) {
          groups[task.scheduledDate] = []
        }
        groups[task.scheduledDate].push(task)
      })

      return groups
    }
  },
  methods: {
    async addTask() {
      if (this.newTask.text.trim()) {
        try {
          const task = await tasksApi.createTask({
            text: this.newTask.text,
            scheduledDate: this.newTask.scheduledDate,
          })
          this.tasks.push(task)
          this.newTask.text = ''
        } catch (error) {
          console.error('Error creating task:', error)
        }
      }
    },
    async updateTask(task) {
      try {
        const updatedTask = await tasksApi.updateTask(task._id, task)
        const index = this.tasks.findIndex(t => t._id === updatedTask._id)
        if (index !== -1) {
          this.tasks[index] = updatedTask
        }
      } catch (error) {
        console.error('Error updating task:', error)
      }
    },
    async deleteTask(taskId) {
      try {
        await tasksApi.deleteTask(taskId)
        this.tasks = this.tasks.filter(task => task._id !== taskId)
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    },
    formatGroupDate(date) {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      
      if (date === today) return 'Today'
      if (date === tomorrow) return 'Tomorrow'
      
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    },
    completedTasksInGroup(tasks) {
      return tasks.filter(task => task.completed).length
    },
    sortedTasks(tasks) {
      return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        return 0
      })
    }
  },
  created() {
    // Fetch tasks when component is created
    tasksApi.getTasks()
      .then(tasks => {
        this.tasks = tasks
      })
      .catch(error => console.error('Error fetching tasks:', error))

    // Create debounced version of updateTask to prevent too many API calls
    this.updateTask = debounce(this.updateTask, 1000)
  },
  beforeUnmount() {
    // Cancel any pending debounced calls
    if (this.updateTask.cancel) {
      this.updateTask.cancel()
    }
  }
}
</script>

<style scoped>
.tasks-page {
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

.date-input {
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 6px;
  font-size: 1em;
  color: #666;
  width: 150px;
  flex-shrink: 0;
}

.task-input-field:focus,
.date-input:focus {
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
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

.task-items {
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

.task-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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