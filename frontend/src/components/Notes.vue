<!-- Notes.vue -->
<template>
  <div class="notes-page">
    <h1>Notes</h1>
    <div class="subtitle">
      Create and organize your thoughts
    </div>

    <div class="notes-container">
      <!-- Sidebar -->
      <div class="notes-sidebar">
        <div class="note-input">
          <input 
            v-model="newNoteTitle" 
            @keyup.enter="createNote"
            placeholder="Create a new note..."
            class="note-input-field"
          >
          <button @click="createNote" class="add-button">Create Note</button>
        </div>
        
        <div v-if="notes.length === 0" class="empty-sidebar-state">
          <p>No notes yet. Create your first note to get started!</p>
        </div>

        <div v-else class="notes-list">
          <div 
            v-for="note in sortedNotes" 
            :key="note._id"
            :class="['note-item', { active: activeNote === note._id }]"
            @click="setActiveNote(note._id)"
          >
            <div class="note-item-content">
              <h3>{{ note.title }}</h3>
              <span class="note-date">{{ formatDate(note.lastModified) }}</span>
            </div>
            <button 
              class="delete-button"
              @click.stop="deleteNote(note._id)"
            >×</button>
          </div>
        </div>
      </div>

      <!-- Note Editor -->
      <div class="note-editor">
        <template v-if="currentNote">
          <div class="editor-header">
            <h2>{{ currentNote.title }}</h2>
            <span class="last-modified">
              Last modified: {{ formatDate(currentNote.lastModified) }}
            </span>
          </div>
          <textarea
            v-model="currentNote.content"
            @input="updateNote"
            placeholder="Start writing your note..."
            class="note-textarea"
          ></textarea>
        </template>
        <div v-else class="empty-editor-state">
          <p>Select a note from the sidebar or create a new one to begin writing</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { notesApi } from '../services/api'
import debounce from 'lodash.debounce'

export default {
  name: 'Notes',
  data() {
    return {
      notes: [],
      activeNote: null,
      newNoteTitle: ''
    }
  },
  computed: {
    currentNote() {
      return this.notes.find(note => note._id === this.activeNote)
    },
    sortedNotes() {
      return [...this.notes].sort((a, b) => {
        return new Date(b.lastModified) - new Date(a.lastModified)
      })
    }
  },
  methods: {
    async createNote() {
      if (this.newNoteTitle.trim()) {
        try {
          const newNote = await notesApi.createNote({
            title: this.newNoteTitle
          })
          this.notes.push(newNote)
          this.newNoteTitle = ''
          this.activeNote = newNote._id
        } catch (error) {
          console.error('Error creating note:', error)
        }
      }
    },
    async updateNote() {
      if (this.currentNote) {
        try {
          const updatedNote = await notesApi.updateNote(this.currentNote._id, {
            content: this.currentNote.content
          })
          const index = this.notes.findIndex(n => n._id === updatedNote._id)
          if (index !== -1) {
            this.notes[index] = updatedNote
          }
        } catch (error) {
          console.error('Error updating note:', error)
        }
      }
    },
    setActiveNote(noteId) {
      this.activeNote = noteId
    },
    async deleteNote(noteId) {
      try {
        await notesApi.deleteNote(noteId)
        this.notes = this.notes.filter(note => note._id !== noteId)
        if (this.activeNote === noteId) {
          this.activeNote = this.notes.length > 0 ? this.notes[0]._id : null
        }
      } catch (error) {
        console.error('Error deleting note:', error)
      }
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
    // Fetch notes when component is created
    notesApi.getNotes()
      .then(notes => {
        this.notes = notes
        if (notes.length > 0) {
          this.activeNote = notes[0]._id
        }
      })
      .catch(error => console.error('Error fetching notes:', error))

    // Create debounced version of updateNote to prevent too many API calls
    this.updateNote = debounce(this.updateNote, 2000)
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
.notes-page {
  width: 100%;
  height: calc(100vh - 140px);
  text-align: left;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.notes-container {
  display: flex;
  height: calc(100% - 100px);
  width: 100%;
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notes-sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  border-radius: 8px 0 0 8px;
  flex-shrink: 0;
}

.note-input {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.note-input-field {
  width: 100%;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 6px;
  font-size: 1em;
  margin-bottom: 10px;
}

.note-input-field:focus {
  outline: none;
  border-color: #42b983;
}

.empty-sidebar-state {
  padding: 20px;
  text-align: center;
  color: #666;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

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

.note-item h3 {
  margin: 0 0 4px 0;
  font-size: 1.1em;
  color: #2c3e50;
}

.note-metadata {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.note-preview {
  font-size: 0.9em;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-date {
  font-size: 0.8em;
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

.note-item:hover .delete-button {
  opacity: 0.6;
}

.delete-button:hover {
  opacity: 1 !important;
}

.note-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0 8px 8px 0;
  overflow: hidden;
}

.editor-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.editor-header h2 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.last-modified {
  font-size: 0.9em;
  color: #666;
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
}

.note-textarea:focus {
  outline: none;
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

.add-button {
  padding: 12px 24px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  width: 100%;
}

.add-button:hover {
  background-color: #3aa876;
}
</style>