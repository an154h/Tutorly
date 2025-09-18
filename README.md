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
