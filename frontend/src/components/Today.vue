<!-- Today.vue -->
<template>
  <div class="today-page">
    <h1>Today's Tasks</h1>
    <div class="subtitle">
      {{ formattedToday }}
    </div>

    <div class="input-group">
      <input 
        v-model="newTask" 
        @keyup.enter="addTask" 
        placeholder="Add a task for today..."
        class="input-field"
      >
      <button @click="addTask" class="btn btn-primary">Add Task</button>
    </div>

    <div class="tasks-container">
      <div v-if="todaysTasks.length === 0" class="empty-state">
        <p>No tasks for today yet. Start fresh by adding some tasks above!</p>
      </div>
      
      <div v-else class="task-card">
        <div class="card-header">
          <div class="header-content">
            <h3>Today's Progress</h3>
            <span class="task-summary">
              {{ completedTasks }} of {{ todaysTasks.length }} tasks completed
            </span>
          </div>
        </div>

        <div class="card-content">
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress" 
                :style="{ width: progressPercentage + '%' }"
                role="progressbar"
                :aria-valuenow="progressPercentage"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <span class="progress-text">{{ progressPercentage }}% complete</span>
          </div>

          <ul class="task-items">
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
                  :aria-label="'Mark ' + task.text + ' as ' + (task.completed ? 'incomplete' : 'complete')"
                >
                <span :class="{ 'task-text': true, 'completed': task.completed }">
                  {{ task.text }}
                </span>
              </div>
              <button 
                @click="deleteTask(task._id)" 
                class="delete-btn"
                :aria-label="'Delete task: ' + task.text"
              >×</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import taskStore from '../stores/TaskStore'

export default {
  name: 'Today',
  setup() {
    const newTask = ref('')
    
    const todaysTasks = computed(() => taskStore.getTodaysTasks.value)
    
    const formattedToday = computed(() => {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const completedTasks = computed(() => {
      return todaysTasks.value.filter(task => task.completed).length
    })

    const progressPercentage = computed(() => {
      if (todaysTasks.value.length === 0) return 0
      return Math.round((completedTasks.value / todaysTasks.value.length) * 100)
    })

    const sortedTasks = computed(() => {
      return [...todaysTasks.value].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        return new Date(b.created) - new Date(a.created)
      })
    })

    const addTask = async () => {
      if (newTask.value.trim()) {
        try {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          await taskStore.addTask({
            text: newTask.value,
            scheduledDate: today.toISOString()
          })
          
          newTask.value = ''
        } catch (error) {
          console.error('Error creating task:', error)
        }
      }
    }

    const handleTaskUpdate = async (task) => {
      try {
        await taskStore.updateTask(task._id, {
          completed: task.completed
        })
      } catch (error) {
        console.error('Error updating task:', error)
        task.completed = !task.completed // Revert on error
      }
    }

    const deleteTask = async (taskId) => {
      try {
        await taskStore.deleteTask(taskId)
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }

    return {
      newTask,
      todaysTasks,
      formattedToday,
      completedTasks,
      progressPercentage,
      sortedTasks,
      addTask,
      handleTaskUpdate,
      deleteTask
    }
  }
}
</script>

<style scoped>
/* Layout */
.today-page {
  width: 100%;
  height: calc(100vh - 140px);
  text-align: left;
}

.tasks-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: calc(100% - 140px);
  overflow-y: auto;
}

/* Task Card */
.task-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  overflow: hidden;
}

/* Card Header */
.card-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.header-content h3 {
  margin: 0;
  color: #2c3e50;
}

.task-summary {
  font-size: 0.9em;
  color: #666;
  margin-top: 4px;
  display: block;
}

/* Card Content */
.card-content {
  padding: 20px;
}

/* Progress Bar */
.progress-container {
  margin-bottom: 24px;
}

.progress-bar {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress {
  height: 100%;
  background-color: #42b983;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.9em;
  color: #666;
}

/* Task Items */
.task-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background-color: #f5f5f5;
}

.task-item-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.task-text {
  font-size: 1.1em;
  margin-left: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s, text-decoration 0.2s;
}

.task-text.completed {
  text-decoration: line-through;
  color: #999;
}

/* Enhanced Animation */
@keyframes taskComplete {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.task-checkbox:checked {
  animation: taskComplete 0.3s ease-in-out;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: #666;
}

/* Responsive Design */
@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }

  .task-item {
    padding: 16px;
  }

  .delete-btn {
    opacity: 0.6;
  }
}

/* Print styles */
@media print {
  .tasks-container {
    height: auto;
    overflow: visible;
    background: none;
    padding: 0;
  }

  .task-card {
    box-shadow: none;
    border: 1px solid #eee;
  }

  .delete-btn,
  .input-group {
    display: none;
  }

  .task-text.completed {
    color: #666;
  }
}

/* High Contrast Mode */
@media (forced-colors: active) {
  .progress {
    background-color: Highlight;
  }

  .task-text.completed {
    color: GrayText;
  }
}
</style>