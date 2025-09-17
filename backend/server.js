import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import assignmentsRoutes from './routes/assignments.js';
import todosRoutes from './routes/todos.js';
import chatRoutes from './routes/chat.js';
import progressRoutes from './routes/progress.js';

// Import database
import database from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
async function initializeDatabase() {
  try {
    await database.connect();
    console.log('📊 Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tutorly API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Tutorly API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/logout': 'Logout user'
      },
      assignments: {
        'GET /api/assignments': 'Get all assignments',
        'POST /api/assignments': 'Create new assignment',
        'PUT /api/assignments/:id': 'Update assignment',
        'DELETE /api/assignments/:id': 'Delete assignment'
      },
      todos: {
        'GET /api/todos': 'Get all todos',
        'POST /api/todos': 'Create new todo',
        'PUT /api/todos/:id': 'Update todo',
        'DELETE /api/todos/:id': 'Delete todo'
      },
      chat: {
        'POST /api/chat/message': 'Send message to AI tutor',
        'GET /api/chat/history': 'Get chat history',
        'DELETE /api/chat/history': 'Clear chat history'
      },
      progress: {
        'GET /api/progress/stats': 'Get progress statistics',
        'GET /api/progress/subjects': 'Get progress by subject',
        'GET /api/progress/activity': 'Get activity data'
      }
    },
    documentation: 'Visit /api for endpoint documentation'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: '/api'
  });
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Tutorly API server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured (using mock responses)'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();