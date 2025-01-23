# Productivity App

A full-stack productivity application built with Vue.js and Node.js that helps users manage tasks, projects, and notes.

## Features

- **Authentication**: Google OAuth integration for secure user authentication
- **Task Management**:
  - Create, update, and delete tasks
  - Schedule tasks for specific dates
  - Mark tasks as complete
  - View today's tasks separately
- **Project Management**:
  - Create and organize projects
  - Add tasks and notes to projects
  - Track project progress
- **Note Taking**:
  - Create and edit notes with real-time saving
  - Organize notes within projects
  - Standalone notes support

## Tech Stack

### Frontend
- Vue.js 3
- Vue Router for navigation
- Custom state management
- Vite as the build tool

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- Passport.js with Google OAuth

## Prerequisites

- Node.js >= 18.0.0
- MongoDB instance
- Google OAuth credentials

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Running the Application

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend server:
```bash
cd frontend
npm start
```

### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend server:
```bash
cd backend
npm start
```

## Project Structure

### Backend Structure
```
backend/
├── middleware/     # Authentication middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── .env.example   # Environment variables template
└── server.js      # Main application file
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/    # Vue components
│   ├── views/         # Page components
│   ├── services/      # API services
│   ├── stores/        # State management
│   ├── router/        # Vue Router configuration
│   └── styles/        # Global styles
├── .env.example      # Environment variables template
└── vite.config.js    # Vite configuration
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:id/tasks` - Add task to project
- `POST /api/projects/:id/notes` - Add note to project

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a note
- `PATCH /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
