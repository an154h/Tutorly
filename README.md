# 🎓 Tutorly - AI-Powered Educational Platform

Tutorly is an intelligent tutoring system that combines a modern web interface with Google's Gemini 2.5 Flash AI to provide personalized educational assistance for K-12 and college students.

## ✨ Features

- 🤖 **AI Tutor**: Powered by Gemini 2.5 Flash with educational system prompt
- 📚 **Assignment Management**: Track homework, projects, and deadlines
- 💬 **Intelligent Chat**: Persistent conversation history with context awareness
- 📊 **Progress Analytics**: Monitor learning progress and performance
- 🎯 **Subject-Aware**: Specialized responses for Math, Science, English, and more
- 🛡️ **Educational Focus**: Guides learning rather than providing direct answers

## 🚀 Quick Start

### Prerequisites

- Python 3.7+ installed
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone or download the project:**
```bash
git clone <your-repo-url>
cd Tutorly
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Start the server:**
```bash
python run_server.py
```

4. **Open the frontend:**
   - Visit `http://localhost:5000` in your browser
   - Or open `static/index.html` directly

5. **Configure API:**
   - Click "Show Settings" in the web interface
   - Enter your Gemini API key
   - Backend URL should be `http://localhost:5000/api`

## 📁 Project Structure

```
Tutorly/
├── index.html          # Main frontend entry point
├── static/             # Static frontend assets
│   └── index.html      # Frontend single-page application
├── app.py              # Flask backend with SQLite database
├── run_server.py       # Easy server startup script
├── requirements.txt    # Python dependencies
├── package.json        # Node.js package configuration
├── README.md           # This file
├── .env.example        # Environment variables template
├── .env                # Environment variables (create from .env.example)
├── .gitignore          # Git ignore patterns
└── tutorly.db          # SQLite database (auto-created)
```

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
PORT=5000
DEBUG=True
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/auth/login` | POST | User authentication |
| `/api/assignments/<student_id>` | GET/POST | Assignment management |
| `/api/assignments/<assignment_id>` | PUT/DELETE | Update/delete assignments |
| `/api/chat/<student_id>` | GET/POST | Chat history |
| `/api/chat/<student_id>/ai` | POST | AI conversation |
| `/api/progress/<student_id>` | GET | Learning analytics |

## 🎯 Usage

### For Students:
1. **Login** with your name and student ID
2. **Chat with AI Tutor** - Ask homework questions, get guided explanations
3. **Manage Assignments** - Track due dates, status, and scores
4. **View Progress** - Monitor your learning analytics

### For Developers:
1. **Frontend**: HTML/CSS/JavaScript with modern components
2. **Backend**: Flask API with SQLite database
3. **AI Integration**: Gemini 2.5 Flash with educational system prompt
4. **Database**: Automatic table creation and management
5. **Development**: Use npm scripts for convenience commands

## 🔒 Security & Privacy

- API keys are stored locally in browser
- Student data is stored in local SQLite database
- No data is sent to external services except Gemini API
- CORS enabled for cross-origin requests
- Input validation and error handling

## 🛠️ Development

### Adding New Features:
1. **Frontend**: Edit the components in `static/index.html`
2. **Backend**: Add new routes in `app.py`
3. **Database**: Update table schemas in `init_database()`

### Available npm Scripts:
```bash
npm run start     # Start the development server
npm run server    # Run Flask backend only
npm run dev       # Same as start
npm run setup     # Install dependencies and start server
npm run health    # Test API health endpoint
```

### Customizing AI Behavior:
- Edit `TUTORLY_SYSTEM_PROMPT` in `app.py`
- Modify `MOCK_RESPONSES` for fallback behavior
- Adjust Gemini parameters in `GeminiService`

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Assignments Table
```sql
CREATE TABLE assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending',
    difficulty TEXT DEFAULT 'Medium',
    score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment

### Local Development:
```bash
python run_server.py
```

### Production Deployment:
1. **Heroku**: Use `Procfile` with `web: python app.py`
2. **Vercel**: Deploy as serverless functions
3. **DigitalOcean**: Use App Platform with Python runtime
4. **AWS**: Deploy on EC2 or Lambda

### Environment Variables for Production:
- `GEMINI_API_KEY`: Your Gemini API key
- `PORT`: Server port (default: 5000)
- `DEBUG`: Set to `False` for production
- `DATABASE_URL`: SQLite or PostgreSQL URL

## 🔧 Troubleshooting

### Common Issues:

1. **"API key not configured"**
   - Enter your Gemini API key in the settings panel
   - Verify the key is valid at Google AI Studio

2. **"Server connection failed"**
   - Ensure Flask server is running (`python run_server.py`)
   - Check backend URL in settings (default: `http://localhost:5000/api`)

3. **"Database errors"**
   - Delete `tutorly.db` to reset the database
   - Restart the server to recreate tables

4. **"Import errors"**
   - Run `pip install -r requirements.txt`
   - Ensure Python 3.7+ is installed

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powering the intelligent tutoring
- Flask community for the excellent web framework
- React team for the frontend library
- All contributors and educators who inspired this project

## 📞 Support

- 📧 Email: support@tutorly.example.com
- 💬 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [Wiki](https://github.com/your-repo/wiki)

---

**Happy Learning! 🎓✨**