<!-- Tasks.vue -->
<template>
  <div class="tasks-page">
    <h1>All Tasks</h1>
    <div class="subtitle">
      Keep track of everything you need to do
    </div>

    <div class="task-input-container">
      <div class="task-input">
        <input 
          v-model="newTask.text" 
          @keyup.enter="addTask" 
          placeholder="Add a new task to your list..."
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
    </div>

    <div class="tasks-container">
      <div v-if="tasks.length === 0" class="empty-state">
        <p>Your task list is empty. Add some tasks to get started!</p>
      </div>
      
      <div v-else>
        <div v-for="(group, date) in groupedTasks" :key="date" class="task-group">
          <h3 class="group-header">
            {{ formatGroupDate(date) }}
          </h3>

          <ul class="task-list">
            <li v-for="task in group" :key="task.id" class="task-item">
              <div class="task-content">
                <input 
                  type="checkbox" 
                  v-model="task.completed"
                  class="task-checkbox"
                >
                <div class="task-details">
                  <span :class="{ 'task-text': true, 'completed': task.completed }">
                    {{ task.text }}
                  </span>
                </div>
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
                  @click="deleteTask(task.id)" 
                  class="delete-button"
                >×</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      
      // Sort tasks by date and completion status
      const sortedTasks = [...this.tasks].sort((a, b) => {
        if (a.scheduledDate !== b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate)
        }
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        return 0
      })

      // Group tasks by date
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
    addTask() {
      if (this.newTask.text.trim()) {
        this.tasks.push({
          id: Date.now(),
          text: this.newTask.text,
          completed: false,
          created: new Date(),
          scheduledDate: this.newTask.scheduledDate
        })
        this.newTask.text = ''
        // Keep the date as is for consecutive tasks
      }
    },
    deleteTask(taskId) {
      this.tasks = this.tasks.filter(task => task.id !== taskId)
    },
    updateTask(task) {
      // This method can be expanded for additional update functionality
      const index = this.tasks.findIndex(t => t.id === task.id)
      if (index !== -1) {
        this.tasks[index] = { ...task }
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
    }
  }
}
</script>

<style scoped>
.tasks-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.task-input-container {
  margin-bottom: 30px;
}

.task-input {
  display: flex;
  gap: 10px;
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

.task-group {
  margin-bottom: 24px;
}

.group-header {
  color: #2c3e50;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #eee;
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

.task-details {
  flex: 1;
}

.task-text {
  font-size: 1.1em;
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
  opacity: 0.6;
}

.delete-button:hover {
  opacity: 1;
}
</style>