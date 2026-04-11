from flask import Blueprint, jsonify, g

from db import get_db
from routes.auth import require_auth

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/analytics/<int:student_id>', methods=['GET'])
@require_auth
def get_analytics(student_id):
    if g.student['id'] != student_id:
        return jsonify({'error': 'Forbidden'}), 403

    conn = get_db()
    try:
        with conn.cursor() as cur:

            # Total attempts
            cur.execute(
                'SELECT COUNT(*) AS c FROM attempts WHERE student_id = %s',
                (student_id,)
            )
            total_attempts = cur.fetchone()['c']

            # Completed attempts
            cur.execute(
                'SELECT COUNT(*) AS c FROM attempts WHERE student_id = %s AND completed_at IS NOT NULL',
                (student_id,)
            )
            completed_attempts = cur.fetchone()['c']

            # Average confidence (only rated attempts)
            cur.execute(
                '''SELECT ROUND(AVG(self_rated_confidence)::NUMERIC, 1) AS avg
                   FROM attempts
                   WHERE student_id = %s AND self_rated_confidence IS NOT NULL''',
                (student_id,)
            )
            avg_row = cur.fetchone()
            avg_confidence = float(avg_row['avg']) if avg_row['avg'] is not None else None

            # Attempts per subject
            cur.execute(
                '''SELECT s.name AS subject_name, COUNT(a.id) AS count
                   FROM attempts a
                   JOIN questions q ON q.id = a.question_id
                   JOIN topics   t ON t.id = q.topic_id
                   JOIN subjects s ON s.id = t.subject_id
                   WHERE a.student_id = %s
                   GROUP BY s.name
                   ORDER BY count DESC''',
                (student_id,)
            )
            attempts_by_subject = [
                {'subject_name': r['subject_name'], 'count': r['count']}
                for r in cur.fetchall()
            ]

            # Weak topics (top 5 by total hints)
            cur.execute(
                '''SELECT t.name AS topic_name, SUM(a.hint_count) AS total_hints
                   FROM attempts a
                   JOIN questions q ON q.id = a.question_id
                   JOIN topics   t ON t.id = q.topic_id
                   WHERE a.student_id = %s
                   GROUP BY t.name
                   HAVING SUM(a.hint_count) > 0
                   ORDER BY total_hints DESC
                   LIMIT 5''',
                (student_id,)
            )
            weak_topics = [
                {'topic_name': r['topic_name'], 'total_hints': r['total_hints']}
                for r in cur.fetchall()
            ]

            # Last 5 completed attempts
            cur.execute(
                '''SELECT LEFT(q.question_text, 80) AS question_text,
                          s.name AS subject_name,
                          a.self_rated_confidence,
                          a.completed_at
                   FROM attempts a
                   JOIN questions q ON q.id = a.question_id
                   JOIN topics   t ON t.id = q.topic_id
                   JOIN subjects s ON s.id = t.subject_id
                   WHERE a.student_id = %s AND a.completed_at IS NOT NULL
                   ORDER BY a.completed_at DESC
                   LIMIT 5''',
                (student_id,)
            )
            recent_attempts = []
            for r in cur.fetchall():
                row = dict(r)
                row['completed_at'] = row['completed_at'].isoformat()
                recent_attempts.append(row)

    finally:
        conn.close()

    return jsonify({
        'total_attempts': total_attempts,
        'completed_attempts': completed_attempts,
        'avg_confidence': avg_confidence,
        'attempts_by_subject': attempts_by_subject,
        'weak_topics': weak_topics,
        'recent_attempts': recent_attempts,
    }), 200
