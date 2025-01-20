<!-- Notes.vue -->
<template>
    <div class="notes-container">
      <!-- Sidebar -->
      <div class="notes-sidebar">
        <div class="new-note">
          <input 
            v-model="newNoteTitle" 
            @keyup.enter="createNote"
            placeholder="New note title..."
          >
          <button @click="createNote">Create Note</button>
        </div>
        
        <div class="notes-list">
          <div 
            v-for="note in notes" 
            :key="note.id"
            :class="['note-item', { active: activeNote === note.id }]"
            @click="setActiveNote(note.id)"
          >
            <div class="note-item-header">
              <h3>{{ note.title }}</h3>
              <button 
                class="delete-btn"
                @click.stop="deleteNote(note.id)"
              >×</button>
            </div>
            <p class="note-date">
              {{ new Date(note.lastModified).toLocaleDateString() }}
            </p>
          </div>
        </div>
      </div>
  
      <!-- Note Editor -->
      <div class="note-editor">
        <template v-if="currentNote">
          <h2>{{ currentNote.title }}</h2>
          <textarea
            v-model="currentNote.content"
            @input="updateNote"
            placeholder="Start writing your note..."
          ></textarea>
        </template>
        <div v-else class="empty-state">
          Select or create a note to begin
        </div>
      </div>
    </div>
  </template>
  
  <script>
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
        return this.notes.find(note => note.id === this.activeNote)
      }
    },
    methods: {
      createNote() {
        if (this.newNoteTitle.trim()) {
          const newNote = {
            id: Date.now(),
            title: this.newNoteTitle,
            content: '',
            lastModified: new Date().toISOString()
          }
          this.notes.push(newNote)
          this.newNoteTitle = ''
          this.activeNote = newNote.id
        }
      },
      setActiveNote(noteId) {
        this.activeNote = noteId
      },
      updateNote() {
        if (this.currentNote) {
          this.currentNote.lastModified = new Date().toISOString()
        }
      },
      deleteNote(noteId) {
        this.notes = this.notes.filter(note => note.id !== noteId)
        if (this.activeNote === noteId) {
          this.activeNote = null
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .notes-container {
    display: flex;
    height: 100vh;
  }
  
  .notes-sidebar {
    width: 300px;
    border-right: 1px solid #eee;
    background-color: #f5f5f5;
    padding: 20px;
  }
  
  .new-note {
    margin-bottom: 20px;
  }
  
  .new-note input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
  }
  
  .notes-list {
    overflow-y: auto;
  }
  
  .note-item {
    padding: 10px;
    margin-bottom: 10px;
    background: white;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .note-item.active {
    background-color: #e3f2fd;
  }
  
  .note-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .note-date {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }
  
  .delete-btn {
    background: none;
    border: none;
    color: #ff4444;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
  }
  
  .note-editor {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  
  .note-editor textarea {
    flex: 1;
    width: 100%;
    padding: 15px;
    margin-top: 20px;
    border: 1px solid #eee;
    border-radius: 4px;
    resize: none;
    font-size: 16px;
    line-height: 1.5;
  }
  
  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 18px;
  }
  
  button {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  }
  
  button:hover {
    background-color: #3aa876;
  }
  </style>