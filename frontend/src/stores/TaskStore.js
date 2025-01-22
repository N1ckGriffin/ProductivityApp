// src/stores/TaskStore.js
import { computed, ref } from 'vue'
import { tasksApi } from '../services/api'

// Create a reactive store
export const useTaskStore = () => {
  const tasks = ref([])
  const isLoading = ref(false)

  const fetchTasks = async () => {
    isLoading.value = true
    try {
      const fetchedTasks = await tasksApi.getTasks()
      tasks.value = fetchedTasks.map(task => ({
        ...task,
        scheduledDate: new Date(task.scheduledDate).toISOString()
      }))
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      isLoading.value = false
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      const updatedTask = await tasksApi.updateTask(taskId, updates)
      const index = tasks.value.findIndex(t => t._id === taskId)
      if (index !== -1) {
        tasks.value[index] = {
          ...updatedTask,
          scheduledDate: new Date(updatedTask.scheduledDate).toISOString()
        }
      }
      return updatedTask
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const addTask = async (taskData) => {
    try {
      const newTask = await tasksApi.createTask(taskData)
      tasks.value.push({
        ...newTask,
        scheduledDate: new Date(newTask.scheduledDate).toISOString()
      })
      return newTask
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await tasksApi.deleteTask(taskId)
      tasks.value = tasks.value.filter(task => task._id !== taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  // Computed functions
  const getTodaysTasks = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    return tasks.value.filter(task => {
      const taskDateStr = new Date(task.scheduledDate).toISOString().split('T')[0]
      return taskDateStr === todayStr
    })
  })

  // Initial fetch
  fetchTasks()

  return {
    tasks,
    isLoading,
    fetchTasks,
    updateTask,
    addTask,
    deleteTask,
    getTodaysTasks
  }
}

// Create a singleton instance
const taskStore = useTaskStore()
export default taskStore