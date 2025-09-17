import database from '../config/database.js';

export class User {
  static async create({ name, studentId, password }) {
    const sql = `
      INSERT INTO users (name, student_id, password, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    const result = await database.run(sql, [name, studentId, password]);
    return { id: result.id, name, studentId };
  }

  static async findByStudentId(studentId) {
    const sql = `SELECT * FROM users WHERE student_id = ?`;
    return await database.get(sql, [studentId]);
  }

  static async findById(id) {
    const sql = `SELECT * FROM users WHERE id = ?`;
    return await database.get(sql, [id]);
  }

  static async updateLastLogin(id) {
    const sql = `UPDATE users SET last_login = datetime('now') WHERE id = ?`;
    await database.run(sql, [id]);
  }
}

export class Assignment {
  static async create({ userId, title, subject, dueDate, status = 'Pending', difficulty = 'Medium', score = null }) {
    const sql = `
      INSERT INTO assignments (user_id, title, subject, due_date, status, difficulty, score, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    const result = await database.run(sql, [userId, title, subject, dueDate, status, difficulty, score]);
    return { id: result.id, userId, title, subject, dueDate, status, difficulty, score };
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT * FROM assignments 
      WHERE user_id = ? 
      ORDER BY due_date ASC, created_at DESC
    `;
    return await database.all(sql, [userId]);
  }

  static async update(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE assignments SET ${fields}, updated_at = datetime('now') WHERE id = ?`;
    await database.run(sql, [...values, id]);
    return { id, ...updates };
  }

  static async delete(id) {
    const sql = `DELETE FROM assignments WHERE id = ?`;
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async findById(id) {
    const sql = `SELECT * FROM assignments WHERE id = ?`;
    return await database.get(sql, [id]);
  }
}

export class Todo {
  static async create({ userId, text, done = false }) {
    const sql = `
      INSERT INTO todos (user_id, text, done, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    const result = await database.run(sql, [userId, text, done]);
    return { id: result.id, userId, text, done };
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT * FROM todos 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    return await database.all(sql, [userId]);
  }

  static async update(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE todos SET ${fields}, updated_at = datetime('now') WHERE id = ?`;
    await database.run(sql, [...values, id]);
    return { id, ...updates };
  }

  static async delete(id) {
    const sql = `DELETE FROM todos WHERE id = ?`;
    const result = await database.run(sql, [id]);
    return result.changes > 0;
  }

  static async findById(id) {
    const sql = `SELECT * FROM todos WHERE id = ?`;
    return await database.get(sql, [id]);
  }
}

export class ChatMessage {
  static async create({ userId, message, response, sessionId = null }) {
    const sql = `
      INSERT INTO chat_messages (user_id, message, response, session_id, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    const result = await database.run(sql, [userId, message, response, sessionId]);
    return { id: result.id, userId, message, response, sessionId };
  }

  static async findByUserId(userId, limit = 50) {
    const sql = `
      SELECT * FROM chat_messages 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    return await database.all(sql, [userId, limit]);
  }

  static async findBySessionId(sessionId) {
    const sql = `
      SELECT * FROM chat_messages 
      WHERE session_id = ? 
      ORDER BY created_at ASC
    `;
    return await database.all(sql, [sessionId]);
  }

  static async getRecentConversation(userId, limit = 10) {
    const sql = `
      SELECT message, response, created_at 
      FROM chat_messages 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    const messages = await database.all(sql, [userId, limit]);
    return messages.reverse(); // Return in chronological order
  }
}