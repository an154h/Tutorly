"""
Recompute predicted_score for every question and update the database.
Run from the project root after adding or editing questions:
    python backend/compute_predicted_scores.py
"""
import pathlib
import sys
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(pathlib.Path(__file__).parent.parent / '.env')
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from db import get_db, init_db

init_db()

CURRENT_YEAR = datetime.now().year
RECENCY_WINDOW = 2  # years


def compute():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Fetch all questions with their topic
            cur.execute(
                '''SELECT q.id, q.topic_id, q.marks, q.years_appeared
                   FROM questions q
                   ORDER BY q.topic_id'''
            )
            questions = cur.fetchall()

            if not questions:
                print('No questions found.')
                return

            # Group by topic to calculate per-topic normalisation values
            topics = {}
            for q in questions:
                tid = q['topic_id']
                if tid not in topics:
                    topics[tid] = {'questions': [], 'max_freq': 0, 'max_marks': 0}
                topics[tid]['questions'].append(q)
                freq = len(q['years_appeared']) if q['years_appeared'] else 0
                topics[tid]['max_freq'] = max(topics[tid]['max_freq'], freq)
                topics[tid]['max_marks'] = max(topics[tid]['max_marks'], q['marks'])

            # Compute and update each question
            updated = 0
            for tid, data in topics.items():
                max_freq = data['max_freq'] or 1
                max_marks = data['max_marks'] or 1

                for q in data['questions']:
                    years = q['years_appeared'] or []
                    freq = len(years)

                    # Frequency component (0–1): how often has this appeared vs most frequent in topic
                    frequency_score = freq / max_freq

                    # Recency component (0–1): penalise if appeared in last 2 years
                    # Examiners tend to avoid repeating very recent questions
                    appeared_recently = any(y >= CURRENT_YEAR - RECENCY_WINDOW for y in years)
                    recency_score = 0.5 if appeared_recently else 1.0

                    # Mark weight component (0–1): higher-mark questions are more impactful
                    mark_score = q['marks'] / max_marks

                    predicted = (
                        0.4 * frequency_score +
                        0.3 * recency_score +
                        0.3 * mark_score
                    ) * 100

                    cur.execute(
                        'UPDATE questions SET predicted_score = %s WHERE id = %s',
                        (round(predicted, 2), q['id'])
                    )
                    updated += 1

            conn.commit()
            print(f'Updated predicted_score for {updated} questions.')

            # Print top 5 as a sanity check
            cur.execute(
                '''SELECT q.id, LEFT(q.question_text, 60) AS text,
                          q.predicted_score, t.name AS topic
                   FROM questions q
                   JOIN topics t ON t.id = q.topic_id
                   ORDER BY q.predicted_score DESC
                   LIMIT 5'''
            )
            print('\nTop 5 predicted questions:')
            for row in cur.fetchall():
                print(f"  [{row['predicted_score']:5.1f}] {row['topic']}: {row['text']}...")

    finally:
        conn.close()


if __name__ == '__main__':
    compute()
