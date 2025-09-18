# Tutorly — Elegant AI-Powered Student Dashboard

Tutorly is a lightweight, full‑stack web app that helps students stay organized and improve learning outcomes. It combines a clean, professional UI with a simple Flask API and a local SQLite database. The app features an AI tutor, assignment tracking, a color‑coded calendar with edit-in-place, and a progress tracker that visualizes subject performance.

## Problem We’re Solving
Students juggle many assignments across subjects without a single, easy place to track due dates, see workload at a glance, and monitor personal progress. Many tools are heavy, subscription‑based, or lack a simple “one-page” view that is actionable. Tutorly solves this by:
- Providing a calendar‑first dashboard with color‑coded subjects and quick edit.
- Seeding smart sample data on first login so the experience is useful immediately.
- Saving new or edited assignments to a real database.
- Visualizing subject performance (histograms) to highlight strengths and gaps.
- Offering an optional AI tutor (Gemini) to guide learning rather than give answers.

## Main Features
- **AI Tutor (optional)**
  - Conversational assistant with an educational system prompt.
  - Fallback responses when no API key is set.
- **Assignment Management**
  - Create, update, and delete assignments per student.
  - Fields include title, subject, due date, status, difficulty, and optional score.
- **Calendar View (Dashboard)**
  - Monthly grid with subject‑color coding.
  - Click any day to open a modal and edit items due that day.
  - Quick‑add row to rapidly insert new assignments.
- **Progress Tracker**
  - Per‑subject histograms (50s, 60s, 70s, 80s, 90–100) with averages.
  - Data seeded automatically for new students (about 10 entries/subject).
- **Clean, Professional UI**
  - Black/white core theme; charts and calendar retain subject colors.
  - Modernized login, sticky navbar, refined cards, inputs, and modal polish.

## Tech Stack and Tools
- **Backend**: `Flask` + `flask-cors`, `sqlite3` (standard library)
- **DB**: SQLite (file: `tutorly.db`)
- **HTTP/JSON**: `requests` for AI calls
- **Images**: `Pillow` (only used by the AI image endpoint)
- **Frontend**: HTML/CSS/JavaScript with React 18 (UMD) + Babel Standalone
- **Styling**: Hand‑rolled CSS (professional black/white theme)

Key files:
- `app.py` — Flask app, routes, DB initialization/seed
- `static/index.html` — Single‑page frontend (React components: Auth, ProgressTracker, CalendarView, Assignments, etc.)

## Getting Started
### 1) Prerequisites
- Python 3.9+ recommended

### 2) Install Python dependencies
```bash
pip install Flask flask-cors requests Pillow
```

Optionally create a virtual environment first.

### 3) (Optional) Configure Gemini API key
Create a `.env` file in the project root if you want the AI Tutor online:
```bash
GEMINI_API_KEY=your_api_key_here
PORT=8000
DEBUG=True
```
If no key is provided, Tutorly will use friendly fallback responses for the AI Tutor.

### 4) Run the server
```bash
python app.py
```
By default Tutorly starts on `http://localhost:8000` and serves the frontend from `static/index.html`.

### 5) First login and sample data
On first login for a given `student_id`, the backend will seed:
- ~10 assignments spread over ~30 days across common subjects.
- ~10 performance records per subject (Math, Science, English, History) over the last 60 days.

## How to Use
- **Login** with a name and a student ID (e.g., Name: "Alex Johnson", ID: "S12345").
- **Dashboard** shows a Progress Tracker on top and a Calendar below.
- **Click a date** in the calendar to open the edit modal for items due that day.
- **Quick‑add** to create assignments immediately.
- **Assignments tab** offers a table view for power‑editing.
- **AI Tutor** is available in its tab; set the API key in `.env` for live responses.

## API Overview
Base URL: `http://localhost:8000/api`

- **Health**
  - `GET /api/health` — health check

- **Auth**
  - `POST /api/auth/login` — body: `{ name, studentId }`
    - Creates a user if new
    - Seeds sample assignments and subject performance if none exist

- **Assignments**
  - `GET /api/assignments/<student_id>` — list assignments (latest first)
  - `POST /api/assignments/<student_id>` — create assignment
    - body: `{ title, subject, due, status?, difficulty?, score? }`
  - `PUT /api/assignments/<int:assignment_id>` — update one or more fields
  - `DELETE /api/assignments/<int:assignment_id>` — delete

- **Chat**
  - `GET /api/chat/<student_id>` — list messages
  - `POST /api/chat/<student_id>` — body: `{ sender, text }`
  - `POST /api/chat/<student_id>/ai` — body: `{ message }` (uses Gemini if configured)
  - `POST /api/chat/<student_id>/ai/image` — multipart with `image` and `message` (uses Pillow)

- **Analytics**
  - `GET /api/progress/<student_id>` — aggregates assignment status counts, subject averages, and chat activity
  - `GET /api/performance/<student_id>` — returns time‑series performance grouped by subject:
    ```json
    {
      "Math": [{ "date": "2025-08-15", "score": 84 }, ...],
      "Science": [...],
      "English": [...],
      "History": [...]
    }
    ```

## Database — Intricate Details
SQLite database file: `tutorly.db`. Tables are created in `init_database()` within `app.py` and include:

### 1) `users`
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- **Purpose**: Identify each student by a stable `student_id` with a display `name`.
- **Behavior**: On login, if the user exists, the name is updated if changed.

### 2) `assignments`
```sql
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'Pending',
  difficulty TEXT DEFAULT 'Medium',
  score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users (student_id)
);
```
- **Purpose**: Track all work items for a student.
- **Notable fields**:
  - `due_date` controls calendar placement.
  - `status` and `difficulty` support filtering/analytics.
  - `score` is optional so results can be logged gradually.
- **Seeding**: On first login, about ten assignments are created and distributed across the next ~30 days.

### 3) `chat_messages`
```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users (student_id)
);
```
- **Purpose**: Persist user and AI messages for context‑aware tutoring.
- **Usage**: The latest messages are retrieved to provide AI with short‑term conversation history.

### 4) `subject_performance`
```sql
CREATE TABLE IF NOT EXISTS subject_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users (student_id)
);
```
- **Purpose**: Store time‑series assessment scores per subject to power the dashboard histograms.
- **Seeding**: On first login, ~10 entries per subject across the prior ~60 days with realistic variance.
- **Frontend mapping**: `/api/performance/<student_id>` endpoint groups rows by subject and returns ordered arrays for each subject.

### Data Flow
- On `POST /api/auth/login`, user is ensured, then seeding runs if the student has no assignments/performance.
- Calendar uses `GET /api/assignments/<student_id>` and color‑codes by `subject`.
- Modal actions call `PUT` and `DELETE` to persist edits.
- Progress Tracker uses `GET /api/performance/<student_id>` and computes histograms client‑side.

## Development Notes
- Default port is `8000` (configurable by `PORT`).
- The app serves `static/index.html` at `/`.
- CORS is enabled for all routes to simplify local development.
- If you change table schemas, update `init_database()` in `app.py` accordingly.

## Troubleshooting
- If you see a blank page, hard refresh (Ctrl+Shift+R). Inline Babel/React can cache aggressively.
- If the login page inputs don’t work, ensure the decorative `#auth:before` overlay has `pointer-events: none` (already configured).
- If AI calls fail, verify `GEMINI_API_KEY` in `.env`; app falls back to safe mock tutoring responses.

## License
MIT