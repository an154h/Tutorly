from flask import Blueprint, jsonify, request

from db import get_db
from routes.auth import require_auth

questions_bp = Blueprint('questions', __name__)


# ---------------------------------------------------------------------------
# Subjects
# ---------------------------------------------------------------------------

@questions_bp.route('/subjects', methods=['GET'])
def get_subjects():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name, code, icon FROM subjects ORDER BY name')
            subjects = [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()
    return jsonify(subjects), 200


# ---------------------------------------------------------------------------
# Topics
# ---------------------------------------------------------------------------

@questions_bp.route('/subjects/<int:subject_id>/topics', methods=['GET'])
def get_topics(subject_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Check the subject actually exists before claiming "no topics"
            cur.execute('SELECT id FROM subjects WHERE id = %s', (subject_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Subject not found'}), 404
            cur.execute(
                'SELECT id, name FROM topics WHERE subject_id = %s ORDER BY id',
                (subject_id,)
            )
            topics = [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()
    return jsonify(topics), 200


# ---------------------------------------------------------------------------
# Questions list (truncated for card view)
# ---------------------------------------------------------------------------

@questions_bp.route('/topics/<int:topic_id>/questions', methods=['GET'])
def get_questions(topic_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT id FROM topics WHERE id = %s''',
                (topic_id,)
            )
            if not cur.fetchone():
                return jsonify({'error': 'Topic not found'}), 404

            cur.execute(
                '''SELECT
                       q.id,
                       CASE
                           WHEN q.parent_id IS NOT NULL THEN LEFT(p.question_text, 120)
                           ELSE LEFT(q.question_text, 120)
                       END AS question_text,
                       q.marks,
                       q.difficulty,
                       q.years_appeared,
                       q.predicted_score,
                       q.label,
                       (
                           SELECT COUNT(*)
                           FROM questions c
                           WHERE c.parent_id = q.parent_id
                             AND q.parent_id IS NOT NULL
                       ) AS part_count
                   FROM questions q
                   LEFT JOIN questions p ON p.id = q.parent_id
                   WHERE q.topic_id = %s
                     AND (
                         -- standalone: no parent, no children
                         (q.parent_id IS NULL AND NOT EXISTS (
                             SELECT 1 FROM questions c WHERE c.parent_id = q.id
                         ))
                         OR
                         -- first child of a group (label = 'a')
                         q.label = 'a'
                     )
                   ORDER BY q.predicted_score DESC''',
                (topic_id,)
            )
            questions = [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()
    return jsonify(questions), 200


# ---------------------------------------------------------------------------
# Single question (full detail)
# ---------------------------------------------------------------------------

@questions_bp.route('/questions/<int:question_id>', methods=['GET'])
def get_question(question_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''SELECT q.id, q.question_text, q.passage, q.figures, q.marks,
                          q.difficulty, q.years_appeared, q.predicted_score,
                          q.hint_stages, q.answer,
                          q.parent_id, q.label,
                          t.id   AS topic_id,
                          t.name AS topic_name,
                          s.id   AS subject_id,
                          s.name AS subject_name
                   FROM questions q
                   JOIN topics   t ON t.id = q.topic_id
                   JOIN subjects s ON s.id = t.subject_id
                   WHERE q.id = %s''',
                (question_id,)
            )
            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Question not found'}), 404

            result = dict(row)

            # If this is a child question, fetch parent context and siblings
            if result['parent_id']:
                cur.execute(
                    '''SELECT id, question_text, figures
                       FROM questions
                       WHERE id = %s''',
                    (result['parent_id'],)
                )
                parent_row = cur.fetchone()
                result['parent'] = dict(parent_row) if parent_row else None

                cur.execute(
                    '''SELECT id, label, marks
                       FROM questions
                       WHERE parent_id = %s
                       ORDER BY label ASC''',
                    (result['parent_id'],)
                )
                result['siblings'] = [dict(r) for r in cur.fetchall()]
            else:
                result['parent'] = None
                result['siblings'] = None

    finally:
        conn.close()

    return jsonify(result), 200


# ---------------------------------------------------------------------------
# Attempts
# ---------------------------------------------------------------------------

@questions_bp.route('/attempts', methods=['POST'])
@require_auth
def create_attempt():
    from flask import g
    data = request.get_json(silent=True) or {}
    question_id = data.get('question_id')
    if not question_id:
        return jsonify({'error': 'question_id is required'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Validate the question exists
            cur.execute('SELECT id FROM questions WHERE id = %s', (question_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Question not found'}), 404

            # Return existing uncompleted attempt instead of creating a duplicate
            cur.execute(
                '''SELECT id, student_id, question_id, started_at
                   FROM attempts
                   WHERE student_id = %s AND question_id = %s AND completed_at IS NULL
                   ORDER BY started_at DESC
                   LIMIT 1''',
                (g.student['id'], question_id)
            )
            existing = cur.fetchone()
            if existing:
                result = dict(existing)
                result['started_at'] = result['started_at'].isoformat()
                return jsonify(result), 200

            cur.execute(
                '''INSERT INTO attempts (student_id, question_id)
                   VALUES (%s, %s)
                   RETURNING id, student_id, question_id, started_at''',
                (g.student['id'], question_id)
            )
            attempt = dict(cur.fetchone())
            attempt['started_at'] = attempt['started_at'].isoformat()
        conn.commit()
    finally:
        conn.close()
    return jsonify(attempt), 201


@questions_bp.route('/attempts/<int:attempt_id>', methods=['PATCH'])
@require_auth
def update_attempt(attempt_id):
    from flask import g
    data = request.get_json(silent=True) or {}

    allowed = {'completed_at', 'hint_count', 'self_rated_confidence'}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        return jsonify({'error': 'No valid fields to update'}), 400

    set_clause = ', '.join(f'{k} = %s' for k in updates)
    values = list(updates.values()) + [attempt_id, g.student['id']]

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f'''UPDATE attempts SET {set_clause}
                    WHERE id = %s AND student_id = %s
                    RETURNING id, student_id, question_id,
                              started_at, completed_at,
                              hint_count, self_rated_confidence''',
                values
            )
            row = cur.fetchone()
        conn.commit()
    finally:
        conn.close()

    if not row:
        return jsonify({'error': 'Attempt not found'}), 404

    result = dict(row)
    if result.get('started_at'):
        result['started_at'] = result['started_at'].isoformat()
    if result.get('completed_at'):
        result['completed_at'] = result['completed_at'].isoformat()
    return jsonify(result), 200
