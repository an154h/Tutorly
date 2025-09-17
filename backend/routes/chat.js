import express from 'express';
import validator from 'validator';
import { ChatMessage } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import geminiService from '../services/geminiService.js';
import database from '../config/database.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Send a message to the AI tutor
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId = null } = req.body;

    // Input validation
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long (maximum 2000 characters)'
      });
    }

    const sanitizedMessage = validator.escape(message.trim());

    // Get recent conversation history for context
    const recentMessages = await ChatMessage.getRecentConversation(req.user.id, 5);
    
    // Format conversation history for Gemini
    const conversationHistory = recentMessages.map(msg => ({
      role: 'user',
      content: msg.message
    })).concat(recentMessages.map(msg => ({
      role: 'assistant', 
      content: msg.response
    }))).slice(-10); // Keep last 10 exchanges

    // Get AI response
    const aiResponse = await geminiService.sendMessage(
      sanitizedMessage,
      conversationHistory,
      req.user.name
    );

    // Save the conversation to database
    await ChatMessage.create({
      userId: req.user.id,
      message: sanitizedMessage,
      response: aiResponse,
      sessionId: sessionId
    });

    res.json({
      success: true,
      data: {
        message: sanitizedMessage,
        response: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message. Please try again.',
      fallback: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or feel free to ask your question differently!"
    });
  }
});

// Get chat history for the user
router.get('/history', async (req, res) => {
  try {
    const { limit = 20, sessionId = null } = req.query;
    
    let messages;
    if (sessionId) {
      messages = await ChatMessage.findBySessionId(sessionId);
    } else {
      messages = await ChatMessage.findByUserId(req.user.id, parseInt(limit));
    }

    res.json({
      success: true,
      data: messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        response: msg.response,
        sessionId: msg.session_id,
        timestamp: msg.created_at
      }))
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history'
    });
  }
});

// Clear chat history
router.delete('/history', async (req, res) => {
  try {
    const { sessionId = null } = req.query;

    let sql, params;
    if (sessionId) {
      sql = 'DELETE FROM chat_messages WHERE user_id = ? AND session_id = ?';
      params = [req.user.id, sessionId];
    } else {
      sql = 'DELETE FROM chat_messages WHERE user_id = ?';
      params = [req.user.id];
    }

    await database.run(sql, params);

    res.json({
      success: true,
      message: sessionId ? 'Session history cleared' : 'Chat history cleared'
    });

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history'
    });
  }
});

export default router;