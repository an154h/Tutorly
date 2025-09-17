import database from '../config/database.js';

const createTables = async () => {
  try {
    await database.connect();

    // Users table
    await database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        student_id TEXT UNIQUE NOT NULL,
        password TEXT,
        created_at TEXT NOT NULL,
        last_login TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Assignments table
    await database.run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        score INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Todos table
    await database.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Chat messages table
    await database.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        session_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await database.run(`CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments (user_id)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments (due_date)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments (status)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos (user_id)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages (user_id)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages (session_id)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_users_student_id ON users (student_id)`);

    console.log('✅ Database tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating database tables:', error);
  } finally {
    await database.close();
  }
};

// Run the initialization
createTables();