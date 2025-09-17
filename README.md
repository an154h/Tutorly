<<<<<<< Updated upstream
# Tutorly - AI Homework Tutor

A web application that helps K-12 and college students with their homework through an AI chatbot that provides personalized, step-by-step explanations.

## Features

- Multi-subject question processing
- Intelligent question analysis
- Step-by-step solution guidance
- Conversational interface with follow-up questions
- Real-time responses
- Multi-device compatibility
- Student rating system
- Progress tracking

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tutorly
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. **Initialize database**
   ```bash
   python scripts/setup_db.py
   ```

6. **Run the application**
   ```bash
   python app.py
   ```

7. **Access the application**
   Open your browser and go to `http://localhost:5000`

## Project Structure

```
tutorly/
├── README.md              ← This file
├── .env.example           ← Environment template
├── .env                   ← Your environment variables
├── .gitignore             ← Git ignore rules
├── requirements.txt       ← Python dependencies
├── app.py                 ← Flask backend
├── static/
│   └── index.html         ← Frontend
└── scripts/
    └── setup_db.py        ← Database initialization
```

## API Endpoints

- `POST /api/auth/login` - Mock authentication
- `POST /api/chat/send` - Send message to AI tutor
- `GET /api/dashboard` - Get user dashboard data

## Usage

1. Enter your name on the login screen
2. Start asking homework questions
3. Rate the responses to help improve the system
4. View your progress on the dashboard

## Development

- The application uses SQLite for local development
- Mock responses are used for the AI tutor (ready for Gemini 2.5 Flash integration)
- Frontend is built with vanilla HTML/CSS/JavaScript for simplicity

## Future Enhancements

- Integration with Gemini 2.5 Flash API
- Advanced progress analytics
- Subject-specific tutoring modes
- Collaborative features
=======
# 🎓 Tutorly - AI-Powered Educational Platform

**Tutorly** is a comprehensive educational platform that combines AI tutoring with student productivity tools. Built with React, Node.js, and powered by Google's Gemini 2.5 Flash AI.

![Tutorly Preview](https://via.placeholder.com/800x400/2563eb/ffffff?text=Tutorly+Educational+Platform)

## ✨ Features

- 🤖 **AI Tutor**: Intelligent homework help with educational guidance
- 📝 **Assignment Manager**: Track and organize school assignments
- ✅ **Todo Lists**: Manage daily tasks and study goals
- 📅 **Calendar Integration**: Plan study sessions and deadlines
- 📊 **Progress Analytics**: Monitor learning progress and streaks
- 🌙 **Dark Mode**: Easy on the eyes for late-night studying
- 🔐 **User Authentication**: Secure login and data persistence

## 🏗️ Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** authentication
- **Google Gemini 2.5 Flash** API

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ 
- **npm** or **yarn**
- **Git**
- **Google Gemini API Key** (optional - app works with mock responses)

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/your-username/tutorly-react.git
cd tutorly-react

# Install frontend dependencies
npm install
```

### 2. Backend Setup
```bash
# Create backend directory and files
mkdir -p backend/{config,models,routes,services,middleware,scripts,data}
cd backend

# Initialize backend
npm init -y

# Install backend dependencies
npm install express cors helmet dotenv sqlite3 bcryptjs jsonwebtoken express-rate-limit validator morgan nodemon

# Update package.json
npm pkg set type="module"
npm pkg set scripts.dev="nodemon server.js"
npm pkg set scripts.start="node server.js"
npm pkg set scripts.init-db="node scripts/initDatabase.js"
```

### 3. Create Backend Files
Create these files in the `backend/` directory:

**📁 backend/.env**
```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/tutorly.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
GEMINI_API_KEY=your-gemini-api-key-here
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> **Note**: Copy all backend files from the project artifacts (server.js, config/, models/, routes/, etc.)

### 4. Frontend Environment
Create **📁 .env** in project root:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your-gemini-api-key-here
VITE_DEV_MODE=true
```

### 5. Initialize Database
```bash
cd backend
node scripts/initDatabase.js
```

### 6. Start the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
# From project root
npm run dev
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

## 🔑 Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` files

> **💡 Note**: The app works without an API key using educational mock responses!

## 📁 Project Structure

```
Tutorly-React/
├── 📁 frontend/
│   ├── 📁 public/
│   │   ├── index.html
│   │   └── vite.svg
│   ├── 📁 src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── styles.css
│   │   ├── 📁 config/
│   │   │   └── api.js
│   │   ├── 📁 services/
│   │   │   └── apiServices.js
│   │   └── 📁 assets/
│   ├── 📁 components/
│   │   ├── Auth.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Chatbot.jsx
│   │   ├── Assignments.jsx
│   │   ├── TodoList.jsx
│   │   ├── Calendar.jsx
│   │   └── Progress.jsx
│   ├── package.json
│   └── vite.config.js
├── 📁 backend/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── 📁 config/
│   │   └── database.js
│   ├── 📁 models/
│   │   └── index.js
│   ├── 📁 routes/
│   │   ├── auth.js
│   │   ├── assignments.js
│   │   ├── todos.js
│   │   ├── chat.js
│   │   └── progress.js
│   ├── 📁 services/
│   │   └── geminiService.js
│   ├── 📁 middleware/
│   │   └── auth.js
│   ├── 📁 scripts/
│   │   └── initDatabase.js
│   └── 📁 data/
│       └── tutorly.db
└── README.md
```

## 🎯 How to Use

### 1. **Login/Register**
- Enter your name and student ID
- No password required for quick demo
- Data is stored locally and persists

### 2. **AI Tutor Chat**
- Click "AI Tutor" in navigation
- Use quick action buttons or type custom questions
- Get step-by-step educational guidance
- Chat history is automatically saved

### 3. **Manage Assignments**
- Go to Dashboard → Assignments tab
- Add assignments with due dates and difficulty
- Track progress with status updates
- Filter by subject or status

### 4. **Todo Lists**
- Switch to Todo tab in AI Tutor page
- Add daily tasks and study goals
- Mark items complete when finished
- Search and filter your todos

### 5. **View Progress**
- Dashboard → Progress tab
- See completion rates and streaks
- Track performance by subject
- Monitor learning activity

## 🛠️ Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev          # Start with nodemon (auto-reload)
npm run start        # Start production server
npm run init-db      # Initialize/reset database
```

### Adding New Features

1. **Backend API**: Add routes in `backend/routes/`
2. **Database**: Update models in `backend/models/`
3. **Frontend**: Add components in `components/`
4. **Services**: Update API calls in `src/services/`

## 🔧 Troubleshooting

### Common Issues

**❌ Backend won't start**
```bash
cd backend
npm install
node --version  # Check Node.js 16+
```

**❌ Database errors**
```bash
cd backend
rm -rf data/
mkdir data
node scripts/initDatabase.js
```

**❌ CORS errors**
- Check `FRONTEND_URL` in backend `.env`
- Ensure frontend runs on port 5173
- Restart both servers

**❌ API calls failing**
```bash
# Test backend health
curl http://localhost:3001/health

# Check if backend is running
lsof -i :3001
```

**❌ No AI responses**
- App works without Gemini API key
- Check backend logs for errors
- Verify API key format in `.env`

### Debug Mode

Enable detailed logging:
```env
# backend/.env
NODE_ENV=development

# .env (frontend)
VITE_DEV_MODE=true
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables in hosting platform

### Backend (Railway/Heroku)
1. Push backend folder to Git
2. Set environment variables
3. Configure start script: `npm start`

### Database
- Development: SQLite (included)
- Production: Consider PostgreSQL or MySQL

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 API Documentation

### Authentication
```bash
POST /api/auth/login     # Login/register user
POST /api/auth/logout    # Logout user
```

### Assignments
```bash
GET    /api/assignments           # Get all assignments
POST   /api/assignments           # Create assignment
PUT    /api/assignments/:id       # Update assignment
DELETE /api/assignments/:id       # Delete assignment
GET    /api/assignments/status/:status    # Filter by status
```

### Chat
```bash
POST /api/chat/message    # Send message to AI
GET  /api/chat/history    # Get chat history
```

### Full API docs available at: http://localhost:3001/api

## 🧪 Testing

```bash
# Test backend health
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","studentId":"12345"}'

# Run frontend
npm run dev
# Visit http://localhost:5173
```

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Express.js](https://expressjs.com/) for the backend API

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/tutorly-react/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/tutorly-react/discussions)
- 📧 **Email**: support@tutorly.com

---

**Happy Learning! 🎓✨**

Made with ❤️ for students everywhere
>>>>>>> Stashed changes
