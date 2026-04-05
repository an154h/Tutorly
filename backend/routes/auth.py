import uuid
from functools import wraps

from flask import Blueprint, request, jsonify, g

from db import get_db

auth_bp = Blueprint('auth', __name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _student_row_to_dict(row):
    return {
        'id': row['id'],
        'name': row['name'],
        'email': row['email'],
        'session_token': row['session_token'],
    }


# ---------------------------------------------------------------------------
# Middleware decorator
# ---------------------------------------------------------------------------

def require_auth(f):
    """Decorator that validates Bearer token and sets g.student."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        token = auth_header[len('Bearer '):]
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    'SELECT id, name, email, session_token FROM students WHERE session_token = %s',
                    (token,)
                )
                student = cur.fetchone()
        finally:
            conn.close()
        if not student:
            return jsonify({'error': 'Unauthorized'}), 401
        g.student = dict(student)
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()

    if not name or not email:
        return jsonify({'error': 'name and email are required'}), 400

    token = str(uuid.uuid4())
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Upsert: if email exists update name + token, else insert
            cur.execute(
                '''INSERT INTO students (name, email, session_token)
                   VALUES (%s, %s, %s)
                   ON CONFLICT (email) DO UPDATE
                       SET name = EXCLUDED.name,
                           session_token = EXCLUDED.session_token
                   RETURNING id, name, email, session_token''',
                (name, email, token)
            )
            student = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    return jsonify(_student_row_to_dict(student)), 200


@auth_bp.route('/auth/me', methods=['GET'])
@require_auth
def me():
    return jsonify(g.student), 200
