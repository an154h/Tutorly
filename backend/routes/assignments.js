import express from 'express';
import validator from 'validator';
import { Assignment } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all assignments for the authenticated user
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.findByUserId(req.user.id);
    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments'
    });
  }
});

// Create a new assignment
router.post('/', async (req, res) => {
  try {
    const { title, subject, dueDate, status = 'Pending', difficulty = 'Medium', score = null } = req.body;

    // Input validation
    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, and due date are required'
      });
    }

    // Validate due date
    if (!validator.isISO8601(dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format'
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      userId: req.user.id,
      title: validator.escape(title.trim()),
      subject: validator.escape(subject.trim()),
      dueDate: dueDate,
      status: ['Pending', 'In Progress', 'Completed', 'Overdue'].includes(status) ? status : 'Pending',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
      score: score && !isNaN(score) ? parseInt(score) : null
    };

    const assignment = await Assignment.create(sanitizedData);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment'
    });
  }
});

// Get a specific assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignmentId = req.params.id;

    // Validate ID is numeric
    if (!assignmentId || isNaN(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID'
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment || assignment.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });

  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignment'
    });
  }
});

// Update an assignment
router.put('/:id', async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const updates = req.body;

    // Validate ID is numeric
    if (!assignmentId || isNaN(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID'
      });
    }

    // Verify assignment belongs to user
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Validate and sanitize updates
    const allowedUpdates = ['title', 'subject', 'due_date', 'status', 'difficulty', 'score'];
    const sanitizedUpdates = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        if (key === 'title' || key === 'subject') {
          if (value && value.toString().trim().length > 0) {
            sanitizedUpdates[key] = validator.escape(value.toString().trim());
          }
        } else if (key === 'due_date') {
          if (value && validator.isISO8601(value)) {
            sanitizedUpdates[key] = value;
          }
        } else if (key === 'status') {
          if (['Pending', 'In Progress', 'Completed', 'Overdue'].includes(value)) {
            sanitizedUpdates[key] = value;
          }
        } else if (key === 'difficulty') {
          if (['Easy', 'Medium', 'Hard'].includes(value)) {
            sanitizedUpdates[key] = value;
          }
        } else if (key === 'score') {
          sanitizedUpdates[key] = value === null ? null : (!isNaN(value) ? parseInt(value) : assignment.score);
        }
      }
    }

    // Handle alternate field names from frontend
    if (updates.dueDate && !sanitizedUpdates.due_date) {
      if (validator.isISO8601(updates.dueDate)) {
        sanitizedUpdates.due_date = updates.dueDate;
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    const updatedAssignment = await Assignment.update(assignmentId, sanitizedUpdates);

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: updatedAssignment
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment'
    });
  }
});

// Delete an assignment
router.delete('/:id', async (req, res) => {
  try {
    const assignmentId = req.params.id;

    // Validate ID is numeric
    if (!assignmentId || isNaN(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID'
      });
    }

    // Verify assignment belongs to user
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const deleted = await Assignment.delete(assignmentId);

    if (deleted) {
      res.json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment'
    });
  }
});

// Bulk update assignments (useful for status changes)
router.patch('/bulk', async (req, res) => {
  try {
    const { ids, updates } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assignment IDs are required'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates are required'
      });
    }

    // Validate all IDs are numeric
    const numericIds = ids.filter(id => !isNaN(id));
    if (numericIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: 'All assignment IDs must be numeric'
      });
    }

    // Verify all assignments belong to user
    const assignments = await Promise.all(
      numericIds.map(id => Assignment.findById(id))
    );

    const validAssignments = assignments.filter(
      assignment => assignment && assignment.user_id === req.user.id
    );

    if (validAssignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid assignments found'
      });
    }

    // Sanitize updates (similar to single update)
    const allowedUpdates = ['status', 'difficulty'];
    const sanitizedUpdates = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        if (key === 'status' && ['Pending', 'In Progress', 'Completed', 'Overdue'].includes(value)) {
          sanitizedUpdates[key] = value;
        } else if (key === 'difficulty' && ['Easy', 'Medium', 'Hard'].includes(value)) {
          sanitizedUpdates[key] = value;
        }
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    // Update all valid assignments
    const updatePromises = validAssignments.map(assignment =>
      Assignment.update(assignment.id, sanitizedUpdates)
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `${validAssignments.length} assignment(s) updated successfully`,
      updatedCount: validAssignments.length
    });

  } catch (error) {
    console.error('Bulk update assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignments'
    });
  }
});

// Get assignments by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Overdue'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const assignments = await Assignment.findByUserId(req.user.id);
    const filteredAssignments = assignments.filter(assignment => assignment.status === status);

    res.json({
      success: true,
      data: filteredAssignments,
      count: filteredAssignments.length
    });

  } catch (error) {
    console.error('Get assignments by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments'
    });
  }
});

// Get assignments by subject
router.get('/subject/:subject', async (req, res) => {
  try {
    const { subject } = req.params;

    if (!subject || subject.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    const assignments = await Assignment.findByUserId(req.user.id);
    const filteredAssignments = assignments.filter(
      assignment => assignment.subject.toLowerCase() === subject.toLowerCase()
    );

    res.json({
      success: true,
      data: filteredAssignments,
      count: filteredAssignments.length
    });

  } catch (error) {
    console.error('Get assignments by subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments'
    });
  }
});

export default router;