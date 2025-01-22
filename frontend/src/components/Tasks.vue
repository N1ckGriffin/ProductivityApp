<!-- Tasks.vue -->
<template>
  <div class="tasks-page">
    <h1>Tasks</h1>
    <div class="subtitle">
      Keep track of everything you need to do
    </div>

    <div class="input-group">
      <input 
        v-model="newTask.text" 
        @keyup.enter="addTask" 
        placeholder="Add a new task..."
        class="input-field"
      >
      <input 
        type="date"
        v-model="newTask.scheduledDate"
        class="input-date"
        :min="today"
      >
      <button @click="addTask" class="btn btn-primary">Add Task</button>
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
          <div class="card-header">
            <div class="header-content">
              <h3>{{ formatGroupDate(date) }}</h3>
              <span class="task-summary">
                {{ completedTasksInGroup(group) }}/{{ group.length }} tasks completed
              </span>
            </div>
          </div>

          <div class="card-content">
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
                    @change="handleTaskUpdate(task)"
                    class="task-checkbox"
                  >
                  <span :class="{ 'task-text': true, 'completed': task.completed }">
                    {{ task.text }}
                  </span>
                </div>
                <div class="task-actions">
                  <input 
                    type="date"
                    :value="formatDateForInput(task.scheduledDate)"
                    @input="handleDateChange($event, task)"
                    class="input-date"
                    :min="today"
                  >
                  <button 
                    @click="deleteTask(task._id)" 
                    class="delete-btn"
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
import { ref, computed } from 'vue'
import taskStore from '../stores/TaskStore'

export default {
  name: 'Tasks',
  setup() {
    // Local state for new task form
    const newTask = ref({
      text: '',
      scheduledDate: new Date().toISOString().split('T')[0]
    })

    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })

    const groupedTasks = computed(() => {
      const groups = {}
      
      const sortedTasks = [...taskStore.tasks.value].sort((a, b) => {
        const dateA = new Date(a.scheduledDate)
        const dateB = new Date(b.scheduledDate)
        return dateA - dateB
      })

      sortedTasks.forEach(task => {
        const dateKey = new Date(task.scheduledDate).toISOString().split('T')[0]
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(task)
      })

      return groups
    })

    // Methods
    const addTask = async () => {
      if (newTask.value.text.trim()) {
        try {
          await taskStore.addTask({
            text: newTask.value.text,
            scheduledDate: new Date(newTask.value.scheduledDate).toISOString()
          })
          
          // Reset form
          newTask.value.text = ''
          newTask.value.scheduledDate = new Date().toISOString().split('T')[0]
        } catch (error) {
          console.error('Error creating task:', error)
        }
      }
    }

    const handleTaskUpdate = async (task) => {
      try {
        await taskStore.updateTask(task._id, {
          completed: task.completed,
          scheduledDate: new Date(task.scheduledDate).toISOString()
        })
      } catch (error) {
        console.error('Error updating task:', error)
        task.completed = !task.completed // Revert on error
      }
    }

    const handleDateChange = async (event, task) => {
      const newDate = event.target.value
      try {
        await taskStore.updateTask(task._id, {
          scheduledDate: new Date(newDate).toISOString()
        })
      } catch (error) {
        console.error('Error updating task date:', error)
      }
    }

    const formatDateForInput = (date) => {
      return new Date(date).toISOString().split('T')[0]
    }

    const formatGroupDate = (date) => {
      const todayDate = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      
      if (date === todayDate) return 'Today'
      if (date === tomorrow) return 'Tomorrow'
      
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    }

    const completedTasksInGroup = (tasks) => {
      return tasks.filter(task => task.completed).length
    }

    const sortedTasks = (tasks) => {
      return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        return 0
      })
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
      today,
      tasks: computed(() => taskStore.tasks.value),
      groupedTasks,
      addTask,
      handleTaskUpdate,
      handleDateChange,
      formatDateForInput,
      formatGroupDate,
      completedTasksInGroup,
      sortedTasks,
      deleteTask,
      isLoading: computed(() => taskStore.isLoading)
    }
  }
}
</script>

<style scoped>
/* Layout */
.tasks-page {
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

/* Task Cards */
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
  overflow: hidden;
}

/* Card Header */
.card-header {
  padding: 16px;
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
}

.task-text.completed {
  text-decoration: line-through;
  color: #999;
}

/* Task Actions */
.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  opacity: 0;
}

.task-item:hover .delete-btn {
  opacity: 0.6;
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

  .input-date {
    width: 100%;
  }

  .task-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .task-actions {
    justify-content: space-between;
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
  }

  .task-card {
    break-inside: avoid;
    margin-bottom: 20px;
  }

  .delete-btn,
  .input-group {
    display: none;
  }
}
</style>