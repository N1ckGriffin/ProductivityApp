<template>
    <div class="tasks">
      <h1>Tasks</h1>
      <div class="task-input">
        <input 
          v-model="newTask" 
          @keyup.enter="addTask" 
          placeholder="Add a new task..."
        >
        <button @click="addTask">Add</button>
      </div>
      <ul class="task-list">
        <li v-for="(task, index) in tasks" :key="index">
          <input 
            type="checkbox" 
            v-model="task.completed"
          >
          <span :class="{ completed: task.completed }">
            {{ task.text }}
          </span>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Tasks',
    data() {
      return {
        newTask: '',
        tasks: []
      }
    },
    methods: {
      addTask() {
        if (this.newTask.trim()) {
          this.tasks.push({
            text: this.newTask,
            completed: false
          })
          this.newTask = ''
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .tasks {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .task-input {
    margin: 20px 0;
  }
  
  .task-input input {
    padding: 8px;
    margin-right: 10px;
    width: 300px;
  }
  
  .task-input button {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .task-list {
    list-style: none;
    padding: 0;
  }
  
  .task-list li {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .task-list li span {
    margin-left: 10px;
  }
  
  .completed {
    text-decoration: line-through;
    color: #999;
  }
  </style>