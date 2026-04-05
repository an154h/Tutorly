import os
import json

from flask import Blueprint, request, jsonify, g

from db import get_db
from routes.auth import require_auth

chat_bp = Blueprint('chat', __name__)


# ---------------------------------------------------------------------------
# System prompt builder (also used by Phase 4 tests)
# ---------------------------------------------------------------------------

def build_system_prompt(question, topic, subject, hint_count):
    """Build the Socratic tutor system prompt for a given question context."""
    hint_stages = question.get('hint_stages') or []
    if isinstance(hint_stages, str):
        hint_stages = json.loads(hint_stages)

    hints_text = ''
    if hint_stages:
        hints_text = '\n\nAvailable hint stages for this question:\n'
        for i, h in enumerate(hint_stages, 1):
            hints_text += f'  Stage {i}: {h}\n'
        hints_text += (
            f'\nThe student has already used {hint_count} hint(s). '
            f'If they ask for another hint, deliver stage {hint_count + 1}. '
            f'If all {len(hint_stages)} stages are exhausted, say: '
            '"You\'ve used all the hints — try to put it together!"'
        )
    else:
        hints_text = '\n\nThere are no pre-written hints for this question. If the student asks for a hint, offer a gentle nudge without revealing the answer.'

    return f"""You are an encouraging AI tutor helping a 15–16 year old O-level student in Brunei prepare for their Cambridge examinations.

Subject: {subject['name']} ({subject.get('code', '')})
Topic: {topic['name']}
Question ({question['marks']} mark{'s' if question['marks'] != 1 else ''}):
{question['question_text']}
{hints_text}

YOUR RULES — follow these strictly at all times:

1. NEVER reveal the full answer under any circumstance, no matter how many times the student asks.
2. Always encourage the student to attempt the question themselves before offering guidance.
3. Use the Socratic method: respond to the student's answers with follow-up questions that guide their thinking.
4. When the student asks for a hint (e.g. "hint", "help", "clue"), deliver the next hint stage as listed above. Do not skip stages.
5. When the student shows correct reasoning, acknowledge it warmly and prompt them towards the next step.
6. Keep your language simple, positive, and age-appropriate. Avoid jargon unless it is examinable terminology.
7. If the student goes off-topic, gently and briefly redirect them back to the question.
8. When the student appears to have the complete correct answer, congratulate them enthusiastically and ask them to explain their reasoning in their own words to solidify their understanding.
9. Keep responses concise — no more than 3–4 sentences unless the student specifically needs more guidance.
"""


# ---------------------------------------------------------------------------
# Mock fallback (used when Gemini is unavailable)
# ---------------------------------------------------------------------------

def _mock_response(topic_name):
    return (
        f"That's a good start! Think carefully about what you know about {topic_name}. "
        "What do you think happens next? Try to reason through it step by step — "
        "you're closer than you think!"
    )


# ---------------------------------------------------------------------------
# OpenRouter call
# ---------------------------------------------------------------------------

def _call_gemini(system_prompt, history, user_message):
    """Call OpenRouter API. Returns response text or None on failure."""
    api_key = os.environ.get('OPENROUTER_API_KEY', '').strip()
    if not api_key:
        return None
    try:
        from openai import OpenAI
        client = OpenAI(
            api_key=api_key,
            base_url='https://openrouter.ai/api/v1',
        )
        messages = [{'role': 'system', 'content': system_prompt}]
        for msg in history:
            messages.append({'role': msg['role'], 'content': msg['content']})
        messages.append({'role': 'user', 'content': user_message})
        response = client.chat.completions.create(
            model='google/gemini-2.0-flash-lite-001',
            messages=messages,
        )
        return response.choices[0].message.content
    except Exception as e:
        first_line = str(e).split('\n')[0]
        print(f'OpenRouter error ({type(e).__name__}): {first_line}')
        return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@chat_bp.route('/chat/session', methods=['POST'])
@require_auth
def create_session():
    data = request.get_json(silent=True) or {}
    question_id = data.get('question_id')
    attempt_id = data.get('attempt_id')
    if not question_id or not attempt_id:
        return jsonify({'error': 'question_id and attempt_id are required'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                '''INSERT INTO chat_sessions (student_id, question_id, attempt_id)
                   VALUES (%s, %s, %s)
                   RETURNING id, student_id, question_id, attempt_id, created_at''',
                (g.student['id'], question_id, attempt_id)
            )
            session = dict(cur.fetchone())
            session['created_at'] = session['created_at'].isoformat()
        conn.commit()
    finally:
        conn.close()
    return jsonify(session), 201


@chat_bp.route('/chat/session/<int:session_id>/messages', methods=['GET'])
@require_auth
def get_messages(session_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Verify session belongs to this student
            cur.execute(
                'SELECT id FROM chat_sessions WHERE id = %s AND student_id = %s',
                (session_id, g.student['id'])
            )
            if not cur.fetchone():
                return jsonify({'error': 'Session not found'}), 404
            cur.execute(
                '''SELECT id, role, content, created_at
                   FROM chat_messages
                   WHERE session_id = %s
                   ORDER BY created_at ASC''',
                (session_id,)
            )
            messages = []
            for row in cur.fetchall():
                m = dict(row)
                m['created_at'] = m['created_at'].isoformat()
                messages.append(m)
    finally:
        conn.close()
    return jsonify(messages), 200


@chat_bp.route('/chat/session/<int:session_id>/message', methods=['POST'])
@require_auth
def send_message(session_id):
    data = request.get_json(silent=True) or {}
    user_message = (data.get('message') or '').strip()
    if not user_message:
        return jsonify({'error': 'message is required'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Verify session belongs to this student and fetch attempt_id
            cur.execute(
                '''SELECT cs.id, cs.attempt_id, cs.question_id
                   FROM chat_sessions cs
                   WHERE cs.id = %s AND cs.student_id = %s''',
                (session_id, g.student['id'])
            )
            session = cur.fetchone()
            if not session:
                return jsonify({'error': 'Session not found'}), 404

            question_id = session['question_id']
            attempt_id = session['attempt_id']

            # Save user message
            cur.execute(
                '''INSERT INTO chat_messages (session_id, role, content)
                   VALUES (%s, 'user', %s)''',
                (session_id, user_message)
            )

            # Fetch question + topic + subject for system prompt
            cur.execute(
                '''SELECT q.id, q.question_text, q.marks, q.hint_stages,
                          t.name AS topic_name,
                          s.name AS subject_name, s.code AS subject_code
                   FROM questions q
                   JOIN topics   t ON t.id = q.topic_id
                   JOIN subjects s ON s.id = t.subject_id
                   WHERE q.id = %s''',
                (question_id,)
            )
            qrow = dict(cur.fetchone())
            question = {
                'question_text': qrow['question_text'],
                'marks': qrow['marks'],
                'hint_stages': qrow['hint_stages'],
            }
            topic = {'name': qrow['topic_name']}
            subject = {'name': qrow['subject_name'], 'code': qrow['subject_code']}

            # Fetch conversation history (excluding the message just saved)
            cur.execute(
                '''SELECT role, content FROM chat_messages
                   WHERE session_id = %s
                   ORDER BY created_at ASC''',
                (session_id,)
            )
            history = [dict(r) for r in cur.fetchall()]
            # Remove the last entry (the user message we just inserted) — Gemini gets it as new_message
            if history and history[-1]['role'] == 'user':
                history = history[:-1]

            # Fetch current hint count
            cur.execute(
                'SELECT hint_count FROM attempts WHERE id = %s',
                (attempt_id,)
            )
            attempt_row = cur.fetchone()
            hint_count = attempt_row['hint_count'] if attempt_row else 0

            # Build system prompt and call Gemini
            system_prompt = build_system_prompt(question, topic, subject, hint_count)
            ai_text = _call_gemini(system_prompt, history, user_message)
            if ai_text is None:
                ai_text = _mock_response(qrow['topic_name'])

            # Save AI response
            cur.execute(
                '''INSERT INTO chat_messages (session_id, role, content)
                   VALUES (%s, 'assistant', %s)''',
                (session_id, ai_text)
            )

            # Increment hint_count if user asked for a hint
            if 'hint' in user_message.lower():
                cur.execute(
                    'UPDATE attempts SET hint_count = hint_count + 1 WHERE id = %s',
                    (attempt_id,)
                )

        conn.commit()
    finally:
        conn.close()

    return jsonify({'role': 'assistant', 'content': ai_text}), 200
