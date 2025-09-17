import express from 'express';
import { Assignment, Todo } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import database from '../config/database.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get progress statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get assignment statistics
    const assignmentStats = await database.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) as overdue
      FROM assignments 
      WHERE user_id = ?
    `, [userId]);

    // Get todo statistics
    const todoStats = await database.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN done = 0 THEN 1 ELSE 0 END) as pending
      FROM todos 
      WHERE user_id = ?
    `, [userId]);

    // Get recent activity (assignments created/updated in last 7 days)
    const recentActivity = await database.get(`
      SELECT COUNT(*) as recentAssignments
      FROM assignments 
      WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
    `, [userId]);

    // Calculate learning streak (days with activity)
    const streakData = await database.all(`
      SELECT DATE(created_at) as activity_date
      FROM (
        SELECT created_at FROM assignments WHERE user_id = ?
        UNION
        SELECT created_at FROM todos WHERE user_id = ?
        UNION 
        SELECT created_at FROM chat_messages WHERE user_id = ?
      )
      GROUP BY DATE(created_at)
      ORDER BY activity_date DESC
      LIMIT 30
    `, [userId, userId, userId]);

    // Calculate current streak
    let currentStreak = 0;
    
    for (let i = 0; i < streakData.length; i++) {
      const activityDate = streakData[i].activity_date.split(' ')[0];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (activityDate === expectedDateStr) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.json({
      success: true,
      data: {
        assignments: {
          total: assignmentStats.total || 0,
          completed: assignmentStats.completed || 0,
          inProgress: assignmentStats.inProgress || 0,
          pending: assignmentStats.pending || 0,
          overdue: assignmentStats.overdue || 0
        },
        todos: {
          total: todoStats.total || 0,
          completed: todoStats.completed || 0,
          pending: todoStats.pending || 0
        },
        activity: {
          recentAssignments: recentActivity.recentAssignments || 0,
          currentStreak: currentStreak
        },
        overview: {
          totalTasks: (assignmentStats.total || 0) + (todoStats.total || 0),
          completedTasks: (assignmentStats.completed || 0) + (todoStats.completed || 0),
          completionRate: ((assignmentStats.completed || 0) + (todoStats.completed || 0)) / 
                         Math.max(((assignmentStats.total || 0) + (todoStats.total || 0)), 1) * 100
        }
      }
    });

  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress statistics'
    });
  }
});

// Get progress by subject
router.get('/subjects', async (req, res) => {
  try {
    const userId = req.user.id;

    const subjectProgress = await database.all(`
      SELECT 
        subject,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        AVG(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as averageScore
      FROM assignments 
      WHERE user_id = ?
      GROUP BY subject
      ORDER BY subject
    `, [userId]);

    const formattedProgress = subjectProgress.map(subject => ({
      subject: subject.subject,
      total: subject.total,
      completed: subject.completed,
      progress: Math.round((subject.completed / subject.total) * 100),
      averageScore: subject.averageScore ? Math.round(subject.averageScore) : null
    }));

    res.json({
      success: true,
      data: formattedProgress
    });

  } catch (error) {
    console.error('Get subject progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subject progress'
    });
  }
});

// Get weekly activity chart data
router.get('/activity', async (req, res) => {
  try {
    const userId = req.user.id;
    const { weeks = 4 } = req.query;

    const activityData = await database.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as activities
      FROM (
        SELECT created_at FROM assignments WHERE user_id = ? AND created_at >= datetime('now', '-${weeks * 7} days')
        UNION ALL
        SELECT created_at FROM todos WHERE user_id = ? AND created_at >= datetime('now', '-${weeks * 7} days')
        UNION ALL
        SELECT created_at FROM chat_messages WHERE user_id = ? AND created_at >= datetime('now', '-${weeks * 7} days')
      )
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [userId, userId, userId]);

    res.json({
      success: true,
      data: activityData.map(day => ({
        date: day.date,
        activities: day.activities
      }))
    });

  } catch (error) {
    console.error('Get activity data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity data'
    });
  }
});

export default router;