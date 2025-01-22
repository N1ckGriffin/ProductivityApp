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
          <div class="project-header">
            <div class="project-header-content" @click="toggleProject(project._id)">
              <h3>{{ project.name }}</h3>
              <span class="project-summary">
                {{ completedTaskCount(project) }}/{{ project.tasks.length }} tasks 
                • {{ project.notes.length }} notes
              </span>
            </div>
            <div class="project-header-actions">
              <button 
                class="expand-button"
                @click="toggleProject(project._id)"
              >
                {{ project.isExpanded ? '−' : '+' }}
              </button>
              <button 
                @click.stop="deleteProject(project._id)" 
                class="delete-project-btn"
                title="Delete project"
              >×</button>
            </div>
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

    async deleteProject(projectId) {
      if (confirm('Are you sure you want to delete this project? This will also delete all tasks and notes within the project.')) {
        try {
          await projectsApi.deleteProject(projectId)
          this.projects = this.projects.filter(p => p._id !== projectId)
        } catch (error) {
          console.error('Error deleting project:', error)
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
    projectsApi.getProjects()
      .then(projects => {
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

    this.updateNote = debounce(this.updateNote, 1000)
  },
  beforeUnmount() {
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.project-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

.delete-project-btn {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-header:hover .delete-project-btn {
  opacity: 0.6;
}

.delete-project-btn:hover {
  opacity: 1 !important;
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

/* Note Items */
.note-item {
  display: flex;
  align-items: start;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-item:hover {
  background: #f0f0f0;
}

.note-item.active {
  background: #e3f2fd;
}

.note-item-content {
  flex: 1;
  min-width: 0;
}

.note-item h4 {
  margin: 0 0 4px 0;
  font-size: 1.1em;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-date {
  font-size: 0.8em;
  color: #999;
}

/* Note Editor */
.note-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
  height: 100%;
}

.note-textarea {
  flex: 1;
  width: 100%;
  padding: 20px;
  border: none;
  resize: none;
  font-size: 16px;
  line-height: 1.6;
  color: #2c3e50;
  background: white;
  font-family: inherit;
}

.note-textarea:focus {
  outline: none;
}

.editor-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: white;
}

.editor-header h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.last-modified {
  font-size: 0.9em;
  color: #666;
}

.empty-editor-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.1em;
  padding: 20px;
  background: #f9f9f9;
  text-align: center;
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

/* Task Text */
.task-text {
  margin-left: 12px;
  font-size: 1.1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-text.completed {
  text-decoration: line-through;
  color: #999;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: #eee;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s ease;
}

.tab-button.active {
  background: #42b983;
  color: white;
}

/* Delete Button */
.delete-btn {
  background: none;
  border: none;
  color: #ff4444;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.note-item:hover .delete-btn,
.task-item:hover .delete-btn {
  opacity: 0.6;
}

.delete-btn:hover {
  opacity: 1 !important;
}

/* Empty State */
.empty-state {
  text-align: center;
  color: #666;
  padding: 20px;
  background: white;
  border-radius: 8px;
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

  .note-editor {
    margin-top: 16px;
    height: 400px;
  }

  .project-header-actions {
    position: absolute;
    top: 16px;
    right: 16px;
  }
}
</style>