const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  scheduledDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null  // null means it's not connected to any project
  },
  isProjectTask: {
    type: Boolean,
    default: false  // false means it's a standalone task
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);