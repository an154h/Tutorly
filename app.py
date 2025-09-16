from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import uuid
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import google.generativeai as genai
import re

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None
    print("Warning: GEMINI_API_KEY not found. Using mock responses.")

# Database connection helper
def get_db_connection():
    conn = sqlite3.connect('tutorly.db')
    conn.row_factory = sqlite3.Row
    return conn

# Tutorly System Prompt for Gemini
TUTORLY_SYSTEM_PROMPT = """You are Tutorly, an expert AI homework tutor designed to help K-12 and college students learn effectively. Your mission is to guide students to understanding rather than simply providing answers.

## Core Teaching Principles:
- **Guide, don't solve**: Break down problems into steps and let students work through them
- **Encourage critical thinking**: Ask follow-up questions to deepen understanding
- **Build confidence**: Use positive, encouraging language and celebrate progress
- **Adapt to level**: Adjust explanations based on the student's apparent grade level
- **Connect concepts**: Help students see how topics relate to real-world applications

## Response Structure:
1. **Acknowledge the question** with enthusiasm
2. **Break down the concept** into digestible steps
3. **Provide guided examples** with clear explanations
4. **Encourage practice** with similar problems
5. **Invite follow-up questions** to ensure understanding

## Subject Expertise:
- **Mathematics**: Algebra, Geometry, Calculus, Statistics, Problem-solving strategies
- **Sciences**: Biology, Chemistry, Physics, Environmental Science, Lab techniques
- **History**: World history, American history, Historical analysis, Timeline connections
- **Literature**: Reading comprehension, Writing techniques, Literary analysis, Grammar
- **General**: Study skills, Research methods, Critical thinking, Test preparation

## Tone and Style:
- Friendly and approachable, like a patient teacher
- Use analogies and real-world examples
- Include relevant emojis sparingly for engagement (1-2 per response)
- Vary response length based on question complexity
- Always end with an invitation for more questions

## Safety Guidelines:
- Never provide direct answers to homework without explanation
- Encourage academic integrity and original thinking
- Redirect inappropriate questions back to educational content
- Maintain appropriate boundaries as an educational assistant

## Response Format:
- Use **bold headers** for main sections
- Include step-by-step breakdowns when applicable
- Provide concrete examples and analogies
- End with encouraging questions to continue learning

## Important Rules:
- NEVER give direct answers to homework problems
- ALWAYS provide step-by-step guidance
- ALWAYS encourage the student to think through the problem
- Keep responses educational and age-appropriate
- If asked about non-academic topics, politely redirect to educational content

Remember: Your goal is to make learning enjoyable and help students develop genuine understanding that will serve them beyond just completing their current assignment.

Respond to the student's question following these guidelines:"""

# Mock responses for fallback when Gemini is not available
MOCK_RESPONSES = {
    'math': [
        "**Great math question!** 📊\n\n**Let's break this down step by step:**\n\n1. **Identify what we know** - Look at the given information\n2. **Determine what we need to find** - What is the question asking for?\n3. **Choose the right approach** - Which mathematical concept applies here?\n4. **Work through it systematically** - Let's solve it together!\n\nCan you tell me what specific part is confusing you? I'm here to guide you through each step! 🤔",
        
        "**Excellent! I love helping with math problems!** ✨\n\n**Here's my teaching approach:**\n\n**Step 1: Understand the Problem**\n- Read it carefully and identify key information\n- What are we solving for?\n\n**Step 2: Plan Your Strategy**\n- What mathematical concepts can we use?\n- Have you seen similar problems before?\n\n**Step 3: Execute the Plan**\n- Work through each step methodically\n- Check your work as you go\n\nWhat specific area would you like me to focus on? I'm here to help you understand, not just get the answer! 📚"
    ],
    
    'science': [
        "**Fascinating science question!** 🔬\n\n**Let's explore this together:**\n\n**Understanding the Concept:**\n- Let's start with the basic principles involved\n- How does this connect to what you already know?\n\n**Real-World Connection:**\n- Where do you see this happening in everyday life?\n- Why is this concept important?\n\n**Step-by-Step Analysis:**\n- Let's break down the process or problem\n- Each step builds on the previous one\n\nWhat part of this topic interests you most? Science is all about curiosity and discovery! 🌟",
        
        "**Great scientific thinking!** 🧪\n\n**Let's investigate this systematically:**\n\n**Observation:** What do we notice or what's given?\n**Hypothesis:** What do we think might be happening?\n**Analysis:** Let's examine the evidence step by step\n**Conclusion:** What can we learn from this?\n\nScience is like being a detective - we gather clues and piece them together! What specific aspect would you like to explore deeper? 🔍"
    ],
    
    'english': [
        "**Wonderful question about language and literature!** 📚\n\n**Let's develop your understanding:**\n\n**Reading Comprehension:**\n- What is the main idea or theme?\n- What evidence supports this?\n\n**Critical Analysis:**\n- How does the author achieve their purpose?\n- What techniques do they use?\n\n**Your Own Thinking:**\n- What's your interpretation?\n- How does this connect to your experience?\n\nLiterature comes alive when we engage with it personally! What part would you like to explore together? ✍️",
        
        "**Excellent literary thinking!** 📖\n\n**Let's unpack this together:**\n\n**Context Understanding:** What's the background or setting?\n**Textual Evidence:** What specific details support our ideas?\n**Personal Connection:** How does this relate to broader themes?\n**Writing Skills:** How can we express our thoughts clearly?\n\nRemember, there's often more than one valid interpretation! What's your initial thought about this? 💭"
    ],
    
    'general': [
        "**Great question!** 🎯\n\n**Let's work through this systematically:**\n\n**Step 1: Break it Down**\n- What are the key components of this problem?\n- What do we already understand?\n\n**Step 2: Find Connections**\n- How does this relate to things you've learned before?\n- What strategies have worked for similar problems?\n\n**Step 3: Build Understanding**\n- Let's work through this together, step by step\n- I'll guide you, but you'll do the thinking!\n\nWhat part feels most challenging right now? I'm here to help you build confidence! 💪",
        
        "**Fantastic question!** ⭐\n\n**Here's how we'll tackle this:**\n\n**Understanding First:** Let's make sure we grasp the concept\n**Practice Together:** I'll guide you through examples\n**Build Confidence:** You'll try similar problems\n**Connect Ideas:** How does this fit with what you know?\n\nLearning is a journey, and every question gets us closer to understanding! What would help you most right now? 🚀"
    ]
}

def get_ai_response(message, user_context=None):
    """Generate AI response using Gemini or fallback to mock responses"""
    
    if model and GEMINI_API_KEY:
        try:
            # Prepare the full prompt with context
            full_prompt = f"{TUTORLY_SYSTEM_PROMPT}\n\nStudent's question: {message}"
            
            # Add user context if available
            if user_context:
                context_info = f"\nStudent context: Name: {user_context.get('name', 'Unknown')}, ID: {user_context.get('student_id', 'Unknown')}"
                full_prompt += context_info
            
            # Generate response using Gemini
            response = model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=1000,
                    temperature=0.7,
                )
            )
            
            # Clean and format the response
            ai_response = response.text.strip()
            
            # Clean up formatting issues
            ai_response = clean_response_formatting(ai_response)
            
            # Ensure the response follows educational guidelines
            if not ai_response or len(ai_response) < 10:
                raise Exception("Generated response too short")
            
            # Check for inappropriate direct answers (basic safety check)
            if re.search(r'(the answer is|equals|=\s*\d+)', ai_response.lower()):
                ai_response += "\n\n*Remember, I'm here to guide your learning, not give direct answers. Try working through the steps I've outlined!*"
            
            return ai_response
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fall back to mock responses
            return get_mock_response(message)
    else:
        # Use mock responses when Gemini is not available
        return get_mock_response(message)

def clean_response_formatting(text):
    """Clean up the AI response formatting for better display"""
    
    # Remove excessive asterisks while preserving intentional formatting
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        
        # Skip empty lines
        if not line:
            cleaned_lines.append('')
            continue
            
        # Convert headers with multiple asterisks to proper format
        if line.startswith('**') and line.endswith('**') and len(line) > 4:
            # This is a header
            header_text = line.replace('**', '').strip()
            cleaned_lines.append(f"**{header_text}**")
        
        # Handle bullet points that start with asterisks
        elif line.startswith('*') and not line.startswith('**'):
            # This is a bullet point
            bullet_text = line[1:].strip()
            if bullet_text:
                cleaned_lines.append(f"* {bullet_text}")
        
        # Handle lines with excessive asterisks in the middle
        else:
            # Clean up multiple asterisks but preserve single ** for bold
            # Remove patterns like ***text*** or ****text****
            line = re.sub(r'\*{3,}([^*]+)\*{3,}', r'**\1**', line)
            
            # Remove standalone asterisks that aren't part of formatting
            line = re.sub(r'(?<!\*)\*(?!\*|\s)', '', line)
            
            cleaned_lines.append(line)
    
    # Join lines back together
    cleaned_text = '\n'.join(cleaned_lines)
    
    # Final cleanup - remove any remaining odd asterisk patterns
    cleaned_text = re.sub(r'\*{3,}', '**', cleaned_text)
    
    return cleaned_text

def get_mock_response(message):
    """Generate a mock response based on the message content"""
    import random
    
    message_lower = message.lower()
    
    # Determine subject based on keywords
    if any(word in message_lower for word in ['math', 'algebra', 'geometry', 'calculus', 'equation', 'solve', 'calculate', 'number']):
        responses = MOCK_RESPONSES['math']
    elif any(word in message_lower for word in ['science', 'biology', 'chemistry', 'physics', 'experiment', 'molecule', 'cell']):
        responses = MOCK_RESPONSES['science']
    elif any(word in message_lower for word in ['english', 'essay', 'write', 'literature', 'book', 'story', 'poem', 'grammar']):
        responses = MOCK_RESPONSES['english']
    else:
        responses = MOCK_RESPONSES['general']
    
    return random.choice(responses)

def classify_subject(message):
    """Classify the subject of a message for tracking purposes"""
    message_lower = message.lower()
    
    math_keywords = ['math', 'algebra', 'geometry', 'calculus', 'equation', 'solve', 'calculate', 'number', 'formula', 'graph']
    science_keywords = ['science', 'biology', 'chemistry', 'physics', 'experiment', 'molecule', 'cell', 'atom', 'DNA', 'force']
    english_keywords = ['english', 'essay', 'write', 'literature', 'book', 'story', 'poem', 'grammar', 'reading', 'analysis']
    history_keywords = ['history', 'historical', 'war', 'revolution', 'ancient', 'civilization', 'timeline', 'date', 'period']
    
    if any(word in message_lower for word in math_keywords):
        return 'Math'
    elif any(word in message_lower for word in science_keywords):
        return 'Science'
    elif any(word in message_lower for word in english_keywords):
        return 'English'
    elif any(word in message_lower for word in history_keywords):
        return 'History'
    else:
        return 'Other'

# Routes
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user_name = data.get('name', '').strip()
        student_id = data.get('student_id', '').strip()
        
        if not user_name:
            return jsonify({'error': 'Name is required'}), 400
            
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
        
        # Create session token
        session_token = str(uuid.uuid4())
        
        # Store user session in database
        conn = get_db_connection()
        
        # Check if user exists, create if not
        existing_user = conn.execute(
            'SELECT id FROM users WHERE student_id = ?', (student_id,)
        ).fetchone()
        
        if existing_user:
            user_id = existing_user['id']
            # Update name in case it changed
            conn.execute(
                'UPDATE users SET name = ?, updated_at = ? WHERE id = ?',
                (user_name, datetime.now().isoformat(), user_id)
            )
        else:
            user_id = str(uuid.uuid4())
            conn.execute(
                'INSERT INTO users (id, name, student_id, created_at) VALUES (?, ?, ?, ?)',
                (user_id, user_name, student_id, datetime.now().isoformat())
            )
        
        # Create session
        conn.execute(
            'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
            (
                session_token,
                user_id,
                datetime.now().isoformat(),
                (datetime.now() + timedelta(days=7)).isoformat()
            )
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'token': session_token,
            'user': {'name': user_name, 'student_id': student_id}
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/send', methods=['POST'])
def send_message():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        session_token = data.get('token')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not session_token:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Verify session and get user info
        conn = get_db_connection()
        session = conn.execute(
            'SELECT s.user_id, u.name, u.student_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?',
            (session_token, datetime.now().isoformat())
        ).fetchone()
        
        if not session:
            conn.close()
            return jsonify({'error': 'Invalid or expired session'}), 401
        
        user_id = session['user_id']
        user_context = {
            'name': session['name'],
            'student_id': session['student_id']
        }
        
        # Classify the subject for tracking
        subject = classify_subject(message)
        
        # Store user message
        chat_id = str(uuid.uuid4())
        conn.execute(
            'INSERT INTO chats (id, user_id, message, subject, created_at) VALUES (?, ?, ?, ?, ?)',
            (chat_id, user_id, message, subject, datetime.now().isoformat())
        )
        
        # Generate AI response using Gemini or mock
        ai_response = get_ai_response(message, user_context)
        
        # Update with AI response
        conn.execute(
            'UPDATE chats SET response = ? WHERE id = ?',
            (ai_response, chat_id)
        )
        
        # Update user progress
        progress = conn.execute(
            'SELECT * FROM user_progress WHERE user_id = ? AND subject = ?',
            (user_id, subject)
        ).fetchone()
        
        if progress:
            conn.execute(
                'UPDATE user_progress SET questions_asked = questions_asked + 1, last_activity = ?, updated_at = ? WHERE user_id = ? AND subject = ?',
                (datetime.now().isoformat(), datetime.now().isoformat(), user_id, subject)
            )
        else:
            progress_id = str(uuid.uuid4())
            conn.execute(
                'INSERT INTO user_progress (id, user_id, subject, questions_asked, last_activity, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                (progress_id, user_id, subject, 1, datetime.now().isoformat(), datetime.now().isoformat())
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'chatId': chat_id,
            'subject': subject
        })
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat/rate', methods=['POST'])
def rate_response():
    try:
        data = request.get_json()
        chat_id = data.get('chatId')
        rating = data.get('rating')
        session_token = data.get('token')
        
        if not all([chat_id, rating, session_token]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if rating not in [1, 2, 3, 4, 5]:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Verify session and update rating
        conn = get_db_connection()
        session = conn.execute(
            'SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?',
            (session_token, datetime.now().isoformat())
        ).fetchone()
        
        if not session:
            conn.close()
            return jsonify({'error': 'Invalid or expired session'}), 401
        
        # Update chat rating
        result = conn.execute(
            'UPDATE chats SET rating = ? WHERE id = ? AND user_id = ?',
            (rating, chat_id, session['user_id'])
        )
        
        if result.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Chat not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not session_token:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_db_connection()
        session = conn.execute(
            'SELECT s.user_id, u.name, u.student_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?',
            (session_token, datetime.now().isoformat())
        ).fetchone()
        
        if not session:
            conn.close()
            return jsonify({'error': 'Invalid or expired session'}), 401
        
        user_id = session['user_id']
        
        # Get user stats
        stats = conn.execute('''
            SELECT 
                COUNT(*) as total_questions,
                AVG(rating) as avg_rating,
                COUNT(CASE WHEN created_at >= ? THEN 1 END) as questions_today
            FROM chats 
            WHERE user_id = ?
        ''', (datetime.now().date().isoformat(), user_id)).fetchone()
        
        # Get recent chats
        recent_chats = conn.execute('''
            SELECT message, response, rating, subject, created_at
            FROM chats 
            WHERE user_id = ?
            ORDER BY created_at DESC 
            LIMIT 10
        ''', (user_id,)).fetchall()
        
        # Get subject breakdown
        subject_stats = conn.execute('''
            SELECT subject, COUNT(*) as count
            FROM chats 
            WHERE user_id = ?
            GROUP BY subject
        ''', (user_id,)).fetchall()
        
        subjects = {
            'Math': 0,
            'Science': 0,
            'English': 0,
            'History': 0,
            'Other': 0
        }
        
        for stat in subject_stats:
            if stat['subject'] in subjects:
                subjects[stat['subject']] = stat['count']
        
        # Get learning streaks and progress
        progress_data = conn.execute('''
            SELECT subject, questions_asked, skill_level, last_activity
            FROM user_progress
            WHERE user_id = ?
        ''', (user_id,)).fetchall()
        
        conn.close()
        
        return jsonify({
            'user': {
                'name': session['name'],
                'student_id': session['student_id']
            },
            'stats': {
                'totalQuestions': stats['total_questions'] or 0,
                'avgRating': round(stats['avg_rating'] or 0, 1),
                'questionsToday': stats['questions_today'] or 0,
                'subjectBreakdown': subjects
            },
            'recentChats': [
                {
                    'message': chat['message'],
                    'response': chat['response'][:100] + '...' if len(chat['response']) > 100 else chat['response'],
                    'rating': chat['rating'],
                    'subject': chat['subject'],
                    'createdAt': chat['created_at']
                }
                for chat in recent_chats
            ],
            'progress': [
                {
                    'subject': prog['subject'],
                    'questionsAsked': prog['questions_asked'],
                    'skillLevel': prog['skill_level'],
                    'lastActivity': prog['last_activity']
                }
                for prog in progress_data
            ]
        })
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API status"""
    gemini_status = "connected" if (model and GEMINI_API_KEY) else "using_mock_responses"
    
    return jsonify({
        'status': 'healthy',
        'gemini_status': gemini_status,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print(f"Starting Tutorly server on port {port}")
    print(f"Gemini AI: {'Enabled' if (model and GEMINI_API_KEY) else 'Disabled (using mock responses)'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)