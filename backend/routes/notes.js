const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// Get all notes for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .sort({ lastModified: -1 });  // Sort by most recently modified
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Create a new note
router.post('/', auth, async (req, res) => {
  try {
    const note = new Note({
      userId: req.user._id,
      title: req.body.title,
      content: '',  // Frontend starts with empty content
      created: new Date(),
      lastModified: new Date()
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note' });
  }
});

// Update a note
router.patch('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (req.body.content !== undefined) {
      note.content = req.body.content;
    }
    
    note.lastModified = new Date();
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: 'Error updating note' });
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;