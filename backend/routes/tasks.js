const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks (supports query param for today's tasks)
router.get('/', auth, async (req, res) => {
  try {
    let query = { 
        userId: req.user._id, 
        isProjectTask: { $ne: true }
    };
    
    // If 'today' is specified, filter for today's tasks
    if (req.query.today === 'true') {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

        query.scheduledDate = {
            $gte: today,
            $lt: tomorrow
        };
    }

    const tasks = await Task.find(query).sort({ completed: 1, scheduledDate: 1 });
    
    // Format dates as ISO strings for consistency
    const formattedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      taskObj.scheduledDate = task.scheduledDate.toISOString();
      return taskObj;
    });
    
    res.json(formattedTasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      userId: req.user._id,
      text: req.body.text,
      completed: false,
      scheduledDate: new Date(req.body.scheduledDate),
      created: new Date()
    });

    await task.save();
    
    // Format dates as ISO strings for consistency
    const taskObj = task.toObject();
    taskObj.scheduledDate = task.scheduledDate.toISOString();
    
    res.status(201).json(taskObj);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task' });
  }
});

// Update a task
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update only the fields that are present in the request
    if (req.body.completed !== undefined) {
      task.completed = req.body.completed;
    }
    if (req.body.scheduledDate !== undefined) {
      task.scheduledDate = new Date(req.body.scheduledDate);
    }
    if (req.body.text !== undefined) {
      task.text = req.body.text;
    }

    await task.save();
    
    // Format dates as ISO strings for consistency
    const taskObj = task.toObject();
    taskObj.scheduledDate = task.scheduledDate.toISOString();
    
    res.json(taskObj);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Format dates as ISO strings for consistency
    const taskObj = task.toObject();
    taskObj.scheduledDate = task.scheduledDate.toISOString();
    
    res.json(taskObj);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;