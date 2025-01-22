// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL;

// Helper function to handle API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

export const tasksApi = {
  // Get all tasks
  getTasks: () => apiCall('/api/tasks'),
  
  // Get today's tasks
  getTodayTasks: () => apiCall('/api/tasks?today=true'),
  
  // Create a task
  createTask: (task) => apiCall('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task)
  }),
  
  // Update a task
  updateTask: (taskId, updates) => apiCall(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  
  // Delete a task
  deleteTask: (taskId) => apiCall(`/api/tasks/${taskId}`, {
    method: 'DELETE'
  })
};

export const notesApi = {
  // Get all notes
  getNotes: () => apiCall('/api/notes'),
  
  // Create a note
  createNote: (note) => apiCall('/api/notes', {
    method: 'POST',
    body: JSON.stringify(note)
  }),
  
  // Update a note
  updateNote: (noteId, updates) => apiCall(`/api/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  
  // Delete a note
  deleteNote: (noteId) => apiCall(`/api/notes/${noteId}`, {
    method: 'DELETE'
  })
};

export const projectsApi = {
  // Get all projects
  getProjects: () => apiCall('/api/projects'),
  
  // Create a project
  createProject: (project) => apiCall('/api/projects', {
    method: 'POST',
    body: JSON.stringify(project)
  }),
  
  // Add task to project
  addProjectTask: (projectId, task) => apiCall(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task)
  }),
  
  // Add note to project
  addProjectNote: (projectId, note) => apiCall(`/api/projects/${projectId}/notes`, {
    method: 'POST',
    body: JSON.stringify(note)
  }),
  
  // Update project task
  updateProjectTask: (projectId, taskId, updates) => apiCall(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  
  // Update project note
  updateProjectNote: (projectId, noteId, updates) => apiCall(`/api/projects/${projectId}/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  
  // Delete project task
  deleteProjectTask: (projectId, taskId) => apiCall(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE'
  }),
  
  // Delete project note
  deleteProjectNote: (projectId, noteId) => apiCall(`/api/projects/${projectId}/notes/${noteId}`, {
    method: 'DELETE'
  }),
  
  // Delete project
  deleteProject: (projectId) => apiCall(`/api/projects/${projectId}`, {
    method: 'DELETE'
  })
};