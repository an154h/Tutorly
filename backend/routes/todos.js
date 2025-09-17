import express from 'express';
import validator from 'validator';
import { Todo } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all todos for the authenticated user
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.findByUserId(req.user.id);
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve todos'
    });
  }
});

// Create a new todo
router.post('/', async (req, res) => {
  try {
    const { text, done = false } = req.body;

    // Input validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Todo text is required'
      });
    }

    const sanitizedData = {
      userId: req.user.id,
      text: validator.escape(text.trim()),
      done: Boolean(done)
    };

    const todo = await Todo.create(sanitizedData);

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo
    });

  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create todo'
    });
  }
});

// Update a todo
router.put('/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    const updates = req.body;

    // Verify todo belongs to user
    const todo = await Todo.findById(todoId);
    if (!todo || todo.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    // Validate and sanitize updates
    const allowedUpdates = ['text', 'done'];
    const sanitizedUpdates = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        if (key === 'text') {
          if (value.toString().trim().length > 0) {
            sanitizedUpdates[key] = validator.escape(value.toString().trim());
          }
        } else if (key === 'done') {
          sanitizedUpdates[key] = Boolean(value);
        }
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    const updatedTodo = await Todo.update(todoId, sanitizedUpdates);

    res.json({
      success: true,
      message: 'Todo updated successfully',
      data: updatedTodo
    });

  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update todo'
    });
  }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const todoId = req.params.id;

    // Verify todo belongs to user
    const todo = await Todo.findById(todoId);
    if (!todo || todo.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    const deleted = await Todo.delete(todoId);

    if (deleted) {
      res.json({
        success: true,
        message: 'Todo deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete todo'
    });
  }
});

export default router;