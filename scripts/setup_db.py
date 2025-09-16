#!/usr/bin/env python3
"""
Database setup script for Tutorly
Creates the necessary tables and indexes for the application
"""

import sqlite3
import os
from datetime import datetime

def create_database():
    """Create the SQLite database and all necessary tables"""
    
    # Connect to database (creates file if it doesn't exist)
    conn = sqlite3.connect('tutorly.db')
    cursor = conn.cursor()
    
    print("Creating Tutorly database...")
    
    # Create users table with student_id
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            student_id TEXT UNIQUE NOT NULL,
            email TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create sessions table for authentication
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create chats table for storing conversations
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            message TEXT NOT NULL,
            response TEXT,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            subject TEXT,
            difficulty_level TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create user_progress table for tracking learning
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            subject TEXT NOT NULL,
            topic TEXT,
            skill_level INTEGER DEFAULT 1,
            questions_asked INTEGER DEFAULT 0,
            correct_responses INTEGER DEFAULT 0,
            last_activity TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create feedback table for system improvement
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            chat_id TEXT,
            feedback_type TEXT NOT NULL,
            feedback_text TEXT,
            rating INTEGER,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (chat_id) REFERENCES chats (id)
        )
    ''')
    
    # Create ai_metrics table for tracking AI performance
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_metrics (
            id TEXT PRIMARY KEY,
            chat_id TEXT NOT NULL,
            response_time_ms INTEGER,
            token_count INTEGER,
            model_version TEXT,
            error_occurred BOOLEAN DEFAULT FALSE,
            error_message TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (chat_id) REFERENCES chats (id)
        )
    ''')
    
    # Create indexes for better query performance
    print("Creating indexes...")
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_student_id ON users (student_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats (user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats (created_at)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_subject ON chats (subject)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_progress_subject ON user_progress (subject)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback (user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_ai_metrics_chat_id ON ai_metrics (chat_id)')
    
    # Insert sample data for testing (optional)
    print("Adding sample data...")
    
    # Sample user with student ID
    sample_user_id = "sample-user-123"
    sample_student_id = "STU001"
    cursor.execute('''
        INSERT OR IGNORE INTO users (id, name, student_id, created_at) 
        VALUES (?, ?, ?, ?)
    ''', (sample_user_id, "Test Student", sample_student_id, datetime.now().isoformat()))
    
    # Sample chat
    cursor.execute('''
        INSERT OR IGNORE INTO chats (id, user_id, message, response, rating, subject, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        "sample-chat-123",
        sample_user_id,
        "Can you help me with algebra?",
        "Of course! I'd love to help you with algebra. What specific topic are you working on?",
        5,
        "Math",
        datetime.now().isoformat()
    ))
    
    # Sample progress tracking
    cursor.execute('''
        INSERT OR IGNORE INTO user_progress (id, user_id, subject, topic, questions_asked, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        "sample-progress-123",
        sample_user_id,
        "Math",
        "Algebra",
        1,
        datetime.now().isoformat()
    ))
    
    # Sample AI metrics
    cursor.execute('''
        INSERT OR IGNORE INTO ai_metrics (id, chat_id, response_time_ms, model_version, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        "sample-metrics-123",
        "sample-chat-123",
        1500,
        "gemini-1.5-flash",
        datetime.now().isoformat()
    ))
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("✅ Database created successfully!")
    print("📊 Tables created:")
    print("   - users (user profiles with student IDs)")
    print("   - sessions (authentication)")
    print("   - chats (conversations)")
    print("   - user_progress (learning tracking)")
    print("   - feedback (system improvement)")
    print("   - ai_metrics (AI performance tracking)")
    print()
    print("🎯 Sample data added for testing")
    print("🚀 Ready to run the application!")

def verify_database():
    """Verify that the database was created correctly"""
    try:
        conn = sqlite3.connect('tutorly.db')
        cursor = conn.cursor()
        
        # Check if all tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        expected_tables = ['users', 'sessions', 'chats', 'user_progress', 'feedback', 'ai_metrics']
        
        print("\n🔍 Database verification:")
        for table in expected_tables:
            if table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"   ✅ {table} table exists ({count} rows)")
            else:
                print(f"   ❌ {table} table missing")
        
        # Check student_id column in users table
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'student_id' in columns:
            print("   ✅ student_id column exists in users table")
        else:
            print("   ❌ student_id column missing in users table")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database verification failed: {e}")
        return False

if __name__ == "__main__":
    # Check if database already exists
    if os.path.exists('tutorly.db'):
        response = input("Database already exists. Recreate it? (y/N): ")
        if response.lower() != 'y':
            print("Database setup cancelled.")
            exit(0)
        else:
            os.remove('tutorly.db')
            print("Existing database removed.")
    
    # Create the database
    create_database()
    
    # Verify it was created correctly
    verify_database()
    
    print("\n🎉 Database setup complete! You can now run the application with:")
    print("   python app.py")
    print("\n💡 Don't forget to:")
    print("   1. Set your GEMINI_API_KEY in the .env file")
    print("   2. Copy .env.example to .env if you haven't already")