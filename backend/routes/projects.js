const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Note = require('../models/Note');

// Get all projects with their tasks and notes
router.get('/', auth, async (req, res) => {
  try {
    // First get all projects
    const projects = await Project.find({ userId: req.user._id });
    
    // For each project, get its tasks and notes
    const projectsWithData = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ 
        projectId: project._id,
        isProjectTask: true 
      }).sort({ completed: 1, created: -1 });
      
      const notes = await Note.find({ 
        projectId: project._id,
        isProjectNote: true 
      }).sort({ lastModified: -1 });

      return {
        ...project.toObject(),
        tasks,
        notes
      };
    }));

    res.json(projectsWithData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Create a new project
router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({
      userId: req.user._id,
      name: req.body.name,
      created: new Date(),
      modified: new Date()
    });

    await project.save();
    res.status(201).json({
      ...project.toObject(),
      tasks: [],
      notes: []
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating project' });
  }
});

// Add task to project
router.post('/:id/tasks', auth, async (req, res) => {
  try {
    // Verify project exists and belongs to user
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      userId: req.user._id,
      text: req.body.text,
      completed: false,
      projectId: project._id,
      isProjectTask: true,
      scheduledDate: new Date(),  // Default to today as per frontend
      created: new Date()
    });

    await task.save();
    project.modified = new Date();
    await project.save();
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task' });
  }
});

// Add note to project
router.post('/:id/notes', auth, async (req, res) => {
  try {
    // Verify project exists and belongs to user
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const note = new Note({
      userId: req.user._id,
      title: req.body.title,
      content: '',  // Frontend starts with empty content
      projectId: project._id,
      isProjectNote: true,
      created: new Date(),
      lastModified: new Date()
    });

    await note.save();
    project.modified = new Date();
    await project.save();
    
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note' });
  }
});

// Update project task
router.patch('/:projectId/tasks/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      projectId: req.params.projectId,
      userId: req.user._id,
      isProjectTask: true
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.completed !== undefined) {
      task.completed = req.body.completed;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task' });
  }
});

// Update project note
router.patch('/:projectId/notes/:noteId', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      projectId: req.params.projectId,
      userId: req.user._id,
      isProjectNote: true
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (req.body.content !== undefined) {
      note.content = req.body.content;
      note.lastModified = new Date();
    }

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error updating note' });
  }
});

// Delete project task
router.delete('/:projectId/tasks/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      projectId: req.params.projectId,
      userId: req.user._id,
      isProjectTask: true
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Delete project note
router.delete('/:projectId/notes/:noteId', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      projectId: req.params.projectId,
      userId: req.user._id,
      isProjectNote: true
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
    try {
      const project = await Project.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
      });
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // Delete associated tasks and notes
      await Task.deleteMany({ projectId: req.params.id });
      await Note.deleteMany({ projectId: req.params.id });
  
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project' });
    }
});

module.exports = router;