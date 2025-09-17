import express from 'express';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { User } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register/Login (simplified - in production you'd want separate endpoints)
router.post('/login', async (req, res) => {
  try {
    const { name, studentId, password } = req.body;

    // Input validation
    if (!name || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Name and Student ID are required'
      });
    }

    // Sanitize inputs
    const sanitizedName = validator.escape(name.trim());
    const sanitizedStudentId = validator.escape(studentId.trim());

    // Check if user exists
    let user = await User.findByStudentId(sanitizedStudentId);

    if (user) {
      // User exists - verify password if provided, otherwise simple login
      if (password && user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }
      }
      
      // Update last login
      await User.updateLastLogin(user.id);
    } else {
      // Create new user (for development simplicity)
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      user = await User.create({
        name: sanitizedName,
        studentId: sanitizedStudentId,
        password: hashedPassword
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        studentId: user.student_id
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register endpoint (separate from login)
router.post('/register', async (req, res) => {
  try {
    const { name, studentId, password } = req.body;

    // Input validation
    if (!name || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Name and Student ID are required'
      });
    }

    const sanitizedName = validator.escape(name.trim());
    const sanitizedStudentId = validator.escape(studentId.trim());

    // Check if user already exists
    const existingUser = await User.findByStudentId(sanitizedStudentId);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Student ID already registered'
      });
    }

    // Create new user
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const user = await User.create({
      name: sanitizedName,
      studentId: sanitizedStudentId,
      password: hashedPassword
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        studentId: user.student_id
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;