const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks (supports query param for today's tasks)
router.get('/', auth, async (req, res) => {
  try {
    let query = { userId: req.user._id };
    
    // If 'today' is specified, filter for today's tasks
    if (req.query.today === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      query.scheduledDate = {
        $gte: today,
        $lt: tomorrow
      };
    }

    const tasks = await Task.find(query)
      .sort({ completed: 1, scheduledDate: 1 });
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    // If no scheduled date provided, default to today
    const scheduledDate = req.body.scheduledDate ? 
      new Date(req.body.scheduledDate) : 
      new Date();

    const task = new Task({
      userId: req.user._id,
      text: req.body.text,
      completed: false,
      scheduledDate: scheduledDate,
      created: new Date()
    });

    await task.save();
    res.status(201).json(task);
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
    if (req.body.scheduledDate) {
      task.scheduledDate = new Date(req.body.scheduledDate);
    }
    if (req.body.text) {
      task.text = req.body.text;
    }

    await task.save();
    res.json(task);
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

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;