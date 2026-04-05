# Tutorly

An O-level exam preparation platform for students in Brunei. Students browse predicted past-year questions ranked by a weighted score, interact with a Socratic AI tutor chatbot that guides them without giving answers directly, and track their topic-level performance on a personal dashboard.

## Stack

- **Backend**: Python 3.9+ / Flask, PostgreSQL (psycopg2)
- **Frontend**: React 18 (UMD via CDN), Babel Standalone — no build step
- **AI**: OpenRouter API (`google/gemini-2.0-flash-lite-001`)
- **Infrastructure**: Docker Compose (Postgres + pgAdmin)

## Project Structure

```
Tutorly/
├── backend/
│   ├── app.py                      # Flask app, blueprint registration, health route
│   ├── db.py                       # psycopg2 connection + init_db()
│   ├── schema.sql                  # PostgreSQL schema (7 tables)
│   ├── seed.py                     # Sample data seeder (idempotent)
│   ├── compute_predicted_scores.py # Recomputes predicted_score for all questions
│   ├── routes/
│   │   ├── auth.py                 # Login, /me, require_auth decorator
│   │   ├── questions.py            # Subjects, topics, questions, attempts
│   │   ├── chat.py                 # Chat sessions, messages, AI integration
│   │   └── analytics.py           # Student dashboard stats
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── static/
│       ├── index.html              # React SPA — all components inline
│       ├── logo.png
│       └── favicon.ico
├── docker-compose.yml              # Postgres 15 + pgAdmin
├── run_server.py                   # Entry point
├── PLAN.md
└── CLAUDE.md
```

## Prerequisites

- Python 3.9+
- Docker and Docker Compose

## Setup

### 1. Start the database

```bash
docker compose up -d
```

Postgres runs on `localhost:5432`. pgAdmin is available at `http://localhost:5050` (email: `admin@tutorly.com`, password: `admin`).

### 2. Create a virtual environment and install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Configure environment variables

```bash
cp backend/.env.example .env
```

Edit `.env` at the project root:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENROUTER_API_KEY` | No | OpenRouter API key for live AI responses. Falls back to mock Socratic responses if missing. |
| `PORT` | No | Server port (default: `8000`) |
| `SECRET_KEY` | No | Flask secret key |

### 4. Start the server

```bash
python run_server.py
```

This initialises the database schema on first run. The server starts on `http://localhost:8000`. The frontend is at `http://localhost:8000/static/`.

### 5. Seed sample data

```bash
python backend/seed.py
python backend/compute_predicted_scores.py
```

This inserts 3 subjects, 9 topics, 32 questions, and 3 demo students.

## Demo Credentials

Log in with any of these emails (name field can be anything):

- `demo1@tutorly.com`
- `demo2@tutorly.com`
- `demo3@tutorly.com`

## Adding Questions Manually

Connect to Postgres (via pgAdmin or psql) and insert directly:

```sql
-- Find the topic ID first
SELECT t.id, t.name, s.name AS subject
FROM topics t JOIN subjects s ON s.id = t.subject_id;

-- Insert a question
INSERT INTO questions (topic_id, question_text, marks, difficulty, years_appeared, hint_stages, answer)
VALUES (
    1,
    'Your question text here.',
    4,
    'medium',
    '{2021, 2023}',
    '["First hint", "Second hint", "Third hint"]',
    'The model answer here.'
);
```

After adding questions, recompute predicted scores:

```bash
python backend/compute_predicted_scores.py
```

## Predicted Score Algorithm

Each question is scored 0–100 using three weighted components:

| Component | Weight | Formula |
|---|---|---|
| Frequency | 0.4 | `len(years_appeared) / max_frequency_in_topic` |
| Recency | 0.3 | `0.5` if appeared in last 2 years (examiners avoid repeats), else `1.0` |
| Mark weight | 0.3 | `marks / max_marks_in_topic` |

## API Reference

Base URL: `http://localhost:8000/api`

All protected routes require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | No | `{name, email}` — login or register, returns session token |
| GET | `/auth/me` | Yes | Returns current student |

### Subjects & Topics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/subjects` | No | List all subjects |
| GET | `/subjects/<id>/topics` | No | List topics for a subject |
| GET | `/topics/<id>/questions` | No | List questions ordered by `predicted_score DESC` |
| GET | `/questions/<id>` | No | Full question detail including hints and model answer |

### Attempts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/attempts` | Yes | `{question_id}` — start a new attempt |
| PATCH | `/attempts/<id>` | Yes | Update `completed_at`, `hint_count`, `self_rated_confidence` |

### Chat
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chat/session` | Yes | `{question_id, attempt_id}` — create a chat session |
| GET | `/chat/session/<id>/messages` | Yes | Get all messages for a session |
| POST | `/chat/session/<id>/message` | Yes | `{message}` — send a message and get AI response |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/analytics/<student_id>` | Yes | Dashboard stats for a student |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |

## Database Schema

| Table | Purpose |
|---|---|
| `subjects` | O-level subjects with exam code and icon |
| `topics` | Topics within a subject |
| `questions` | Questions with marks, difficulty, years appeared, hint stages, model answer, predicted score |
| `students` | Students (name + email, no passwords). Session token stored per login. |
| `attempts` | One row per student per question session. Tracks hint count and confidence rating. |
| `chat_sessions` | One chat session per attempt |
| `chat_messages` | Individual messages within a chat session |

## Troubleshooting

- **Blank page on load** — hard refresh (`Ctrl+Shift+R`). Babel Standalone caches aggressively.
- **AI returns mock responses** — check `OPENROUTER_API_KEY` is set in `.env` and the server has been restarted.
- **Port 5432 already in use** — stop your local Postgres: `sudo systemctl stop postgresql`, then `docker compose up -d`.
- **Port conflict on 8000** — set `PORT=8001` in `.env`.