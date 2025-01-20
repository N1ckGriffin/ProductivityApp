<!-- Projects.vue -->
<template>
    <div class="projects">
      <h1>Projects</h1>
      
      <!-- Add Project Form -->
      <div class="project-input">
        <input 
          v-model="newProject" 
          @keyup.enter="addProject" 
          placeholder="Add a new project..."
        >
        <button @click="addProject">Add Project</button>
      </div>
  
      <!-- Projects List -->
      <div class="project-list">
        <div v-for="project in projects" :key="project.id" class="project-card">
          <div class="project-header" @click="toggleProject(project.id)">
            <h3>{{ project.name }}</h3>
            <span>{{ project.isExpanded ? '▼' : '▶' }}</span>
          </div>
  
          <!-- Project Tasks -->
          <div v-if="project.isExpanded" class="project-tasks">
            <div class="task-input">
              <input 
                v-model="project.newTask" 
                @keyup.enter="addTaskToProject(project.id)"
                placeholder="Add a task to this project..."
              >
              <button @click="addTaskToProject(project.id)">Add Task</button>
            </div>
  
            <ul class="task-list">
              <li v-for="task in project.tasks" :key="task.id">
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
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Projects',
    data() {
      return {
        newProject: '',
        projects: []
      }
    },
    methods: {
      addProject() {
        if (this.newProject.trim()) {
          this.projects.push({
            id: Date.now(),
            name: this.newProject,
            tasks: [],
            newTask: '',
            isExpanded: false
          })
          this.newProject = ''
        }
      },
      toggleProject(projectId) {
        const project = this.projects.find(p => p.id === projectId)
        if (project) {
          project.isExpanded = !project.isExpanded
        }
      },
      addTaskToProject(projectId) {
        const project = this.projects.find(p => p.id === projectId)
        if (project && project.newTask.trim()) {
          project.tasks.push({
            id: Date.now(),
            text: project.newTask,
            completed: false
          })
          project.newTask = ''
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .projects {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .project-input {
    margin: 20px 0;
  }
  
  .project-input input {
    padding: 8px;
    margin-right: 10px;
    width: 300px;
  }
  
  .project-card {
    margin: 10px 0;
    border: 1px solid #eee;
    border-radius: 4px;
  }
  
  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    background-color: #f5f5f5;
  }
  
  .project-tasks {
    padding: 10px;
  }
  
  .task-input {
    margin: 10px 0;
  }
  
  .task-list {
    list-style: none;
    padding: 0;
  }
  
  .task-list li {
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #eee;
  }
  
  .task-list li span {
    margin-left: 10px;
  }
  
  .completed {
    text-decoration: line-through;
    color: #999;
  }
  
  button {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #3aa876;
  }
  </style>