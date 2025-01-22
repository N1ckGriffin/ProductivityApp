<!-- Projects.vue -->
<template>
  <div class="projects-page">
    <h1>Projects</h1>
    <div class="subtitle">
      Organize your projects, tasks, and project notes
    </div>

    <div class="input-group">
      <input 
        v-model="newProject" 
        @keyup.enter="addProject" 
        placeholder="Create a new project..."
        class="input-field"
      >
      <button @click="addProject" class="btn btn-primary">Create Project</button>
    </div>

    <div class="projects-container">
      <div v-if="projects.length === 0" class="empty-state">
        <p>No projects yet. Create your first project to get started!</p>
      </div>
      
      <div v-else class="project-list">
        <div 
          v-for="project in projects" 
          :key="project._id" 
          class="project-card"
          :class="{ 'expanded': project.isExpanded }"
        >
          <div class="project-header" @click="toggleProject(project._id)">
            <div class="project-header-content">
              <h3>{{ project.name }}</h3>
              <span class="project-summary">
                {{ completedTaskCount(project) }}/{{ project.tasks.length }} tasks 
                • {{ project.notes.length }} notes
              </span>
            </div>
            <button class="expand-button">
              {{ project.isExpanded ? '−' : '+' }}
            </button>
          </div>

          <div v-if="project.isExpanded" class="project-content">
            <!-- Tabs -->
            <div class="tabs">
              <button 
                @click="project.activeTab = 'tasks'"
                :class="['tab-button', { active: project.activeTab === 'tasks' }]"
              >
                Tasks
              </button>
              <button 
                @click="project.activeTab = 'notes'"
                :class="['tab-button', { active: project.activeTab === 'notes' }]"
              >
                Notes
              </button>
            </div>

            <!-- Tasks Tab -->
            <div v-if="project.activeTab === 'tasks'" class="tab-content">
              <div class="input-group">
                <input 
                  v-model="project.newTask" 
                  @keyup.enter="addTaskToProject(project._id)"
                  placeholder="Add a task to this project..."
                  class="input-field"
                >
                <button 
                  @click="addTaskToProject(project._id)"
                  class="btn btn-primary"
                >Add Task</button>
              </div>

              <div v-if="project.tasks.length === 0" class="empty-state">
                <p>No tasks in this project yet. Add your first task above!</p>
              </div>

              <ul v-else class="task-list">
                <li 
                  v-for="task in sortedTasks(project.tasks)" 
                  :key="task._id"
                  class="task-item"
                >
                  <div class="task-item-content">
                    <input 
                      type="checkbox" 
                      v-model="task.completed"
                      @change="updateTask(project, task)"
                      class="task-checkbox"
                    >
                    <span :class="{ 'task-text': true, 'completed': task.completed }">
                      {{ task.text }}
                    </span>
                  </div>
                  <button 
                    @click="deleteTask(project, task._id)" 
                    class="delete-btn"
                  >×</button>
                </li>
              </ul>
            </div>

            <!-- Notes Tab -->
            <div v-if="project.activeTab === 'notes'" class="tab-content">
              <div class="notes-section">
                <div class="note-list">
                  <!-- Note Creation -->
                  <div class="input-group">
                    <input 
                      v-model="project.newNoteTitle" 
                      @keyup.enter="addNoteToProject(project._id)"
                      placeholder="New note title..."
                      class="input-field"
                    >
                    <button 
                      @click="addNoteToProject(project._id)"
                      class="btn btn-primary"
                    >Add Note</button>
                  </div>

                  <div v-if="project.notes.length === 0" class="empty-state">
                    <p>No notes in this project yet. Create your first note above!</p>
                  </div>

                  <!-- Note List -->
                  <div v-else class="notes-list">
                    <div 
                      v-for="note in sortedNotes(project.notes)" 
                      :key="note._id"
                      :class="['note-item', { active: project.activeNoteId === note._id }]"
                      @click="setActiveNote(project, note._id)"
                    >
                      <div class="note-item-content">
                        <h4>{{ note.title }}</h4>
                        <span class="note-date">{{ formatDate(note.lastModified) }}</span>
                      </div>
                      <button 
                        @click.stop="deleteNote(project, note._id)"
                        class="delete-btn"
                      >×</button>
                    </div>
                  </div>
                </div>

                <!-- Note Editor -->
                <div class="note-editor">
                  <template v-if="getActiveNote(project)">
                    <div class="editor-header">
                      <h4>{{ getActiveNote(project).title }}</h4>
                      <span class="last-modified">
                        Last modified: {{ formatDate(getActiveNote(project).lastModified) }}
                      </span>
                    </div>
                    <textarea
                      v-model="getActiveNote(project).content"
                      @input="updateNote(project)"
                      placeholder="Start writing your note..."
                      class="note-textarea"
                    ></textarea>
                  </template>
                  <div v-else class="empty-editor-state">
                    <p>Select a note from the list or create a new one to begin writing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { projectsApi } from '../services/api'
import debounce from 'lodash.debounce'

export default {
  name: 'Projects',
  data() {
    return {
      newProject: '',
      projects: []
    }
  },
  methods: {
    async addProject() {
      if (this.newProject.trim()) {
        try {
          const project = await projectsApi.createProject({
            name: this.newProject
          })
          project.tasks = []
          project.notes = []
          project.newTask = ''
          project.newNoteTitle = ''
          project.isExpanded = true
          project.activeTab = 'tasks'
          project.activeNoteId = null
          this.projects.push(project)
          this.newProject = ''
        } catch (error) {
          console.error('Error creating project:', error)
        }
      }
    },

    toggleProject(projectId) {
      const project = this.projects.find(p => p._id === projectId)
      if (project) {
        project.isExpanded = !project.isExpanded
      }
    },

    async addTaskToProject(projectId) {
      const project = this.projects.find(p => p._id === projectId)
      if (project && project.newTask.trim()) {
        try {
          const task = await projectsApi.addProjectTask(projectId, {
            text: project.newTask
          })
          project.tasks.push(task)
          project.newTask = ''
        } catch (error) {
          console.error('Error creating task:', error)
        }
      }
    },

    async addNoteToProject(projectId) {
      const project = this.projects.find(p => p._id === projectId)
      if (project && project.newNoteTitle.trim()) {
        try {
          const note = await projectsApi.addProjectNote(projectId, {
            title: project.newNoteTitle
          })
          project.notes.push(note)
          project.newNoteTitle = ''
          project.activeNoteId = note._id
        } catch (error) {
          console.error('Error creating note:', error)
        }
      }
    },

    async deleteTask(project, taskId) {
      try {
        await projectsApi.deleteProjectTask(project._id, taskId)
        project.tasks = project.tasks.filter(task => task._id !== taskId)
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    },

    async deleteNote(project, noteId) {
      try {
        await projectsApi.deleteProjectNote(project._id, noteId)
        project.notes = project.notes.filter(note => note._id !== noteId)
        if (project.activeNoteId === noteId) {
          project.activeNoteId = project.notes.length > 0 ? project.notes[0]._id : null
        }
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    },

    setActiveNote(project, noteId) {
      project.activeNoteId = noteId
    },

    getActiveNote(project) {
      return project.notes.find(note => note._id === project.activeNoteId)
    },

    async updateNote(project) {
      const note = this.getActiveNote(project)
      if (note) {
        try {
          const updatedNote = await projectsApi.updateProjectNote(project._id, note._id, {
            content: note.content
          })
          const index = project.notes.findIndex(n => n._id === updatedNote._id)
          if (index !== -1) {
            project.notes[index] = updatedNote
          }
        } catch (error) {
          console.error('Error updating note:', error)
        }
      }
    },

    async updateTask(project, task) {
      try {
        const updatedTask = await projectsApi.updateProjectTask(project._id, task._id, task)
        const index = project.tasks.findIndex(t => t._id === updatedTask._id)
        if (index !== -1) {
          project.tasks[index] = updatedTask
        }
      } catch (error) {
        console.error('Error updating task:', error)
      }
    },

    sortedTasks(tasks) {
      return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        return 0
      })
    },

    sortedNotes(notes) {
      return [...notes].sort((a, b) => {
        return new Date(b.lastModified) - new Date(a.lastModified)
      })
    },

    completedTaskCount(project) {
      return project.tasks.filter(task => task.completed).length
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  created() {
    // Fetch projects when component is created
    projectsApi.getProjects()
      .then(projects => {
        // Add UI state properties to each project
        this.projects = projects.map(project => ({
          ...project,
          newTask: '',
          newNoteTitle: '',
          isExpanded: true,
          activeTab: 'tasks',
          activeNoteId: project.notes.length > 0 ? project.notes[0]._id : null
        }))
      })
      .catch(error => console.error('Error fetching projects:', error))

    // Create debounced version of updateNote
    this.updateNote = debounce(this.updateNote, 1000)
  },
  beforeUnmount() {
    // Cancel any pending debounced calls
    if (this.updateNote.cancel) {
      this.updateNote.cancel()
    }
  }
}
</script>

<style scoped>
/* Layout */
.projects-page {
  composes: page;
}

.projects-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

/* Project Cards */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.project-card {
  composes: card;
  display: flex;
  flex-direction: column;
}

.project-card.expanded {
  width: 100%;
}

/* Project Header */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  width: 100%;
  box-sizing: border-box;
}

.project-header:hover {
  background-color: #f5f5f5;
}

.project-header-content {
  flex: 1;
  min-width: 0;
}

.project-summary {
  font-size: 0.9em;
  color: #666;
  margin-top: 4px;
  display: block;
}

.expand-button {
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Project Content */
.project-content {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

/* Notes Section */
.notes-section {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 300px;
  box-sizing: border-box;
}

.note-list {
  width: 40%;
  min-width: 300px;
  border-right: 1px solid #eee;
  padding-right: 16px;
  overflow-y: auto;
  flex-shrink: 0;
}

/* Task List */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 300px;
  overflow-y: auto;
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

/* Responsive Design */
@media (max-width: 768px) {
  .notes-section {
    flex-direction: column;
  }

  .note-list {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-right: 0;
    padding-bottom: 16px;
  }

  .project-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>