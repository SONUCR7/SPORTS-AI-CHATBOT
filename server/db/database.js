/**
 * SportsAI Database Manager
 * Supports PostgreSQL as primary database for user sessions and chat history.
 * Seamlessly falls back to local SQLite engine (using Node.js 24 native node:sqlite)
 * when PostgreSQL server is not locally running, ensuring zero crashes out of the box!
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class DatabaseManager {
  constructor() {
    this.mode = 'initializing'; // 'postgres' or 'sqlite'
    this.pgPool = null;
    this.sqliteDb = null;
    this.statusMessage = '';
  }

  async initialize() {
    const postgresUrl = process.env.DATABASE_URL || 'postgresql://sportsai:sportsaipassword@localhost:5432/sportsai_db';

    // Try connecting to PostgreSQL first
    try {
      // Dynamic import of pg if available
      const pgModule = await import('pg').catch(() => null);
      if (pgModule && pgModule.default) {
        const { Pool } = pgModule.default;
        const pool = new Pool({
          connectionString: postgresUrl,
          connectionTimeoutMillis: 2000
        });

        // Test connection
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();

        this.pgPool = pool;
        this.mode = 'postgres';
        this.statusMessage = `Connected to PostgreSQL at ${postgresUrl.replace(/:[^:]*@/, ':****@')}`;
        console.log(`[Database] 🚀 ${this.statusMessage}`);
        await this._initPostgresTables();
        await this._seedDemoUser();
        return;
      }
    } catch (err) {
      // PostgreSQL not reachable or pg driver not compiled
      console.log(`[Database] ℹ️ PostgreSQL not active on localhost:5432 (${err.message.split('\n')[0]}).`);
    }

    // High-speed fallback using Node 24 native node:sqlite
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const sqlitePath = path.join(DATA_DIR, 'sportsai.sqlite');
      this.sqliteDb = new DatabaseSync(sqlitePath);
      this.mode = 'sqlite';
      this.statusMessage = 'Active via Node SQLite Engine (PostgreSQL Schema Compatible)';
      console.log(`[Database] 📦 Using Local Database at ${sqlitePath}`);
      await this._initSqliteTables();
      await this._seedDemoUser();
    } catch (sqliteErr) {
      console.error('[Database] Critical error initializing SQLite fallback:', sqliteErr);
      throw sqliteErr;
    }
  }

  async _initPostgresTables() {
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        preferred_sport VARCHAR(32) DEFAULT 'all',
        role VARCHAR(32) DEFAULT 'pro',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        sport VARCHAR(32) DEFAULT 'all',
        is_pinned INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(64) PRIMARY KEY,
        session_id VARCHAR(64) REFERENCES sessions(id) ON DELETE CASCADE,
        role VARCHAR(16) NOT NULL,
        content TEXT NOT NULL,
        sport VARCHAR(32) DEFAULT 'sports',
        citations TEXT,
        grounding_score NUMERIC DEFAULT 100,
        is_pinned INTEGER DEFAULT 0,
        feedback TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS compendium_chunks (
        id VARCHAR(64) PRIMARY KEY,
        page_number INTEGER NOT NULL,
        sport VARCHAR(32) NOT NULL,
        chapter VARCHAR(128) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        keywords TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.pgPool.query(schemaSql);

    // Apply incremental migrations safely
    try { await this.pgPool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_pinned INTEGER DEFAULT 0;`); } catch(e){}
    try { await this.pgPool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS feedback TEXT;`); } catch(e){}
    try { await this.pgPool.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_pinned INTEGER DEFAULT 0;`); } catch(e){}
  }

  async _initSqliteTables() {
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        preferred_sport TEXT DEFAULT 'all',
        role TEXT DEFAULT 'pro',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        sport TEXT DEFAULT 'all',
        is_pinned INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        sport TEXT DEFAULT 'sports',
        citations TEXT,
        grounding_score REAL DEFAULT 100,
        is_pinned INTEGER DEFAULT 0,
        feedback TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS compendium_chunks (
        id TEXT PRIMARY KEY,
        page_number INTEGER NOT NULL,
        sport TEXT NOT NULL,
        chapter TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        keywords TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Apply incremental migrations safely
    try { this.sqliteDb.exec(`ALTER TABLE messages ADD COLUMN is_pinned INTEGER DEFAULT 0;`); } catch(e){}
    try { this.sqliteDb.exec(`ALTER TABLE messages ADD COLUMN feedback TEXT;`); } catch(e){}
    try { this.sqliteDb.exec(`ALTER TABLE sessions ADD COLUMN is_pinned INTEGER DEFAULT 0;`); } catch(e){}
  }

  hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  async _seedDemoUser() {
    const demoEmail = 'arighna@sportsai.pro';
    const existing = await this.getUserByEmail(demoEmail);
    if (!existing) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = this.hashPassword('sports123', salt);
      const user = {
        id: 'usr_demo_arighna',
        name: 'Arighna Nandi',
        email: demoEmail,
        password_hash: hash,
        salt: salt,
        preferred_sport: 'all',
        role: 'Pro Analyst'
      };
      await this.createUser(user);

      // Seed starter sessions
      const initialSessions = [
        {
          id: 'sess_cricket_1',
          user_id: user.id,
          title: 'Virat Kohli vs Sachin Tendulkar ODI Stats',
          sport: 'cricket',
          updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'sess_football_1',
          user_id: user.id,
          title: 'Offside Rule & VAR edge cases in UCL',
          sport: 'football',
          updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: 'sess_badminton_1',
          user_id: user.id,
          title: 'Viktor Axelsen Smash Technique & BWF Rankings',
          sport: 'badminton',
          updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        {
          id: 'sess_cricket_2',
          user_id: user.id,
          title: 'IPL 2024 Final & T20 World Cup Records',
          sport: 'cricket',
          updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];

      for (const s of initialSessions) {
        await this.createSession(s);
      }

      // Add starter messages for the first session
      await this.createMessage({
        id: 'msg_1',
        session_id: 'sess_cricket_1',
        role: 'user',
        content: 'Compare Virat Kohli and Sachin Tendulkar in ODI cricket including centuries and chases.',
        sport: 'cricket',
        citations: '[]',
        grounding_score: 100
      });

      await this.createMessage({
        id: 'msg_2',
        session_id: 'sess_cricket_1',
        role: 'assistant',
        content: `### 🏏 Virat Kohli vs Sachin Tendulkar: Verified ODI Comparison Matrix

Both icons stand at the pinnacle of One Day International cricket with distinct eras, match conditions, and milestones:

| Metric | Sachin Tendulkar | Virat Kohli |
| :--- | :--- | :--- |
| **ODI Matches** | 463 | 295+ |
| **ODI Runs** | 18,426 (All-Time Record) | 13,906+ |
| **ODI Centuries** | 49 | **50 (World Record)** |
| **ODI Average** | 44.83 | **58.18** |
| **Batting Strike Rate** | 86.23 | **93.54** |
| **Centuries in Successful Chases** | 14 | **27 (World Record)** |
| **Average in Successful Chases** | 55.45 | **88.75** |
| **ICC CWC Trophies** | 1 (2011) | 1 (2011) |

#### 🔑 Key Tactical Insights:
1. **The 50-Century Milestone**: Virat Kohli broke Sachin Tendulkar's long-standing record of 49 ODI centuries during the 2023 ICC Cricket World Cup semi-final against New Zealand at Wankhede Stadium.
2. **Era Context**: Sachin faced premier reverse-swing bowling attacks (Wasim Akram, Glenn McGrath, Allan Donald, Curtly Ambrose) with single-ball rules and higher boundary rope distances, whereas Kohli mastered the two new-ball white Kookaburra format with modern powerplay rules.`,
        sport: 'cricket',
        citations: JSON.stringify([
          { page: 18, title: 'Sachin Tendulkar Career Record & Milestones', quote: 'Sachin Tendulkar amassed 18,426 ODI runs and 49 ODI centuries over a 24-year career.' },
          { page: 19, title: 'Virat Kohli Chase Master & Century Breakdown', quote: 'Kohli eclipsed Tendulkar with 50 ODI centuries, averaging 88.75 in successful run chases.' }
        ]),
        grounding_score: 100
      });
    }
  }

  // User Operations
  async createUser(user) {
    if (this.mode === 'postgres') {
      const sql = `
        INSERT INTO users (id, name, email, password_hash, salt, preferred_sport, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const res = await this.pgPool.query(sql, [
        user.id, user.name, user.email, user.password_hash, user.salt, user.preferred_sport || 'all', user.role || 'pro'
      ]);
      return res.rows[0];
    } else {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO users (id, name, email, password_hash, salt, preferred_sport, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(user.id, user.name, user.email, user.password_hash, user.salt, user.preferred_sport || 'all', user.role || 'pro');
      return user;
    }
  }

  async getUserByEmail(email) {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
      return res.rows[0] || null;
    } else {
      const stmt = this.sqliteDb.prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
      return stmt.get(email) || null;
    }
  }

  async getUserById(id) {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      return res.rows[0] || null;
    } else {
      const stmt = this.sqliteDb.prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
      return stmt.get(id) || null;
    }
  }

  // Session Operations
  async createSession(session) {
    const id = session.id || `sess_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const updatedAt = session.updated_at || new Date().toISOString();
    if (this.mode === 'postgres') {
      const sql = `
        INSERT INTO sessions (id, user_id, title, sport, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const res = await this.pgPool.query(sql, [id, session.user_id, session.title, session.sport || 'all', updatedAt]);
      return res.rows[0];
    } else {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO sessions (id, user_id, title, sport, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(id, session.user_id, session.title, session.sport || 'all', updatedAt);
      return { id, user_id: session.user_id, title: session.title, sport: session.sport || 'all', updated_at: updatedAt };
    }
  }

  async getUserSessions(userId) {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
      return res.rows;
    } else {
      const stmt = this.sqliteDb.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC');
      return stmt.all(userId);
    }
  }

  async getSessionById(id) {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query('SELECT * FROM sessions WHERE id = $1 LIMIT 1', [id]);
      return res.rows[0] || null;
    } else {
      const stmt = this.sqliteDb.prepare('SELECT * FROM sessions WHERE id = ? LIMIT 1');
      return stmt.get(id) || null;
    }
  }

  async cleanEmptySessions(userId, keepSessionId = null) {
    try {
      const keep = keepSessionId || null;
      if (this.mode === 'postgres') {
        const sql = `
          DELETE FROM sessions 
          WHERE user_id = $1 
            AND title IN ('New chat', 'New Tri-Sport Conversation', 'New Sports Session', 'Tri-Sport Intelligence Welcome')
            AND ($2::text IS NULL OR id != $2)
            AND id NOT IN (SELECT DISTINCT session_id FROM messages);
        `;
        await this.pgPool.query(sql, [userId, keep]);
      } else {
        const emptySessions = this.sqliteDb.prepare(`
          SELECT s.id 
          FROM sessions s 
          WHERE s.user_id = ? 
            AND s.title IN ('New chat', 'New Tri-Sport Conversation', 'New Sports Session', 'Tri-Sport Intelligence Welcome')
            AND (? IS NULL OR s.id != ?)
            AND s.id NOT IN (SELECT DISTINCT session_id FROM messages)
        `).all(userId, keep, keep);

        if (emptySessions && emptySessions.length > 0) {
          const delStmt = this.sqliteDb.prepare('DELETE FROM sessions WHERE id = ?');
          for (const s of emptySessions) {
            delStmt.run(s.id);
          }
        }
      }
    } catch (err) {
      console.warn('[Database] Clean empty sessions warning:', err.message);
    }
  }

  async updateSessionTitle(sessionId, title) {
    const now = new Date().toISOString();
    if (this.mode === 'postgres') {
      await this.pgPool.query('UPDATE sessions SET title = $1, updated_at = $2 WHERE id = $3', [title, now, sessionId]);
    } else {
      const stmt = this.sqliteDb.prepare('UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?');
      stmt.run(title, now, sessionId);
    }
  }

  async deleteSession(sessionId) {
    if (this.mode === 'postgres') {
      await this.pgPool.query('DELETE FROM messages WHERE session_id = $1', [sessionId]);
      await this.pgPool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    } else {
      this.sqliteDb.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
      this.sqliteDb.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    }
  }

  // Message Operations
  async createMessage(msg) {
    const id = msg.id || `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const citationsStr = typeof msg.citations === 'string' ? msg.citations : JSON.stringify(msg.citations || []);
    const grounding = msg.grounding_score !== undefined ? msg.grounding_score : 100;
    const isPinned = msg.is_pinned ? 1 : 0;
    const feedback = msg.feedback || null;

    if (this.mode === 'postgres') {
      const sql = `
        INSERT INTO messages (id, session_id, role, content, sport, citations, grounding_score, is_pinned, feedback)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const res = await this.pgPool.query(sql, [id, msg.session_id, msg.role, msg.content, msg.sport || 'sports', citationsStr, grounding, isPinned, feedback]);
      // Update session timestamp
      await this.pgPool.query('UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [msg.session_id]);
      return res.rows[0];
    } else {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO messages (id, session_id, role, content, sport, citations, grounding_score, is_pinned, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, msg.session_id, msg.role, msg.content, msg.sport || 'sports', citationsStr, grounding, isPinned, feedback);
      this.sqliteDb.prepare('UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(msg.session_id);
      return { id, ...msg, citations: citationsStr, grounding_score: grounding, is_pinned: isPinned, feedback };
    }
  }

  async getSessionMessages(sessionId) {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query('SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC', [sessionId]);
      return res.rows.map(m => ({ ...m, citations: JSON.parse(m.citations || '[]') }));
    } else {
      const stmt = this.sqliteDb.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC');
      const rows = stmt.all(sessionId);
      return rows.map(m => ({ ...m, citations: JSON.parse(m.citations || '[]') }));
    }
  }

  async togglePinMessage(messageId) {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query(`
        UPDATE messages 
        SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END 
        WHERE id = $1 
        RETURNING *;
      `, [messageId]);
      return res.rows[0];
    } else {
      const current = this.sqliteDb.prepare('SELECT is_pinned FROM messages WHERE id = ?').get(messageId);
      const newStatus = (current?.is_pinned === 1) ? 0 : 1;
      this.sqliteDb.prepare('UPDATE messages SET is_pinned = ? WHERE id = ?').run(newStatus, messageId);
      return { id: messageId, is_pinned: newStatus };
    }
  }

  async setMessageFeedback(messageId, feedback) {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query('UPDATE messages SET feedback = $1 WHERE id = $2 RETURNING *', [feedback, messageId]);
      return res.rows[0];
    } else {
      this.sqliteDb.prepare('UPDATE messages SET feedback = ? WHERE id = ?').run(feedback, messageId);
      return { id: messageId, feedback };
    }
  }

  async clearSessionMessages(sessionId) {
    if (this.mode === 'postgres') {
      await this.pgPool.query('DELETE FROM messages WHERE session_id = $1', [sessionId]);
    } else {
      this.sqliteDb.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
    }
  }

  async searchUserSessions(userId, query) {
    const q = `%${query.trim().toLowerCase()}%`;
    if (this.mode === 'postgres') {
      const sql = `
        SELECT DISTINCT s.* 
        FROM sessions s
        LEFT JOIN messages m ON m.session_id = s.id
        WHERE s.user_id = $1 AND (
          LOWER(s.title) LIKE $2 OR 
          LOWER(m.content) LIKE $2
        )
        ORDER BY s.updated_at DESC
        LIMIT 20;
      `;
      const res = await this.pgPool.query(sql, [userId, q]);
      return res.rows;
    } else {
      const stmt = this.sqliteDb.prepare(`
        SELECT DISTINCT s.* 
        FROM sessions s
        LEFT JOIN messages m ON m.session_id = s.id
        WHERE s.user_id = ? AND (
          LOWER(s.title) LIKE ? OR 
          LOWER(m.content) LIKE ?
        )
        ORDER BY s.updated_at DESC
        LIMIT 20
      `);
      return stmt.all(userId, q, q);
    }
  }

  async togglePinSession(sessionId) {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query(`
        UPDATE sessions 
        SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END 
        WHERE id = $1 
        RETURNING *;
      `, [sessionId]);
      return res.rows[0];
    } else {
      const current = this.sqliteDb.prepare('SELECT is_pinned FROM sessions WHERE id = ?').get(sessionId);
      const newStatus = (current?.is_pinned === 1) ? 0 : 1;
      this.sqliteDb.prepare('UPDATE sessions SET is_pinned = ? WHERE id = ?').run(newStatus, sessionId);
      return { id: sessionId, is_pinned: newStatus };
    }
  }

  // Knowledge Base Chunks Operations
  async storeCompendiumChunks(chunks) {
    if (this.mode === 'postgres') {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');
        for (const c of chunks) {
          const sql = `
            INSERT INTO compendium_chunks (id, page_number, sport, chapter, title, content, keywords)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;
          `;
          await client.query(sql, [c.id, c.page_number, c.sport, c.chapter, c.title, c.content, c.keywords]);
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else {
      const stmt = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO compendium_chunks (id, page_number, sport, chapter, title, content, keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      this.sqliteDb.exec('BEGIN TRANSACTION');
      for (const c of chunks) {
        stmt.run(c.id, c.page_number, c.sport, c.chapter, c.title, c.content, c.keywords);
      }
      this.sqliteDb.exec('COMMIT');
    }
  }

  async getAllCompendiumChunks() {
    if (this.mode === 'postgres') {
      const res = await this.pgPool.query('SELECT * FROM compendium_chunks ORDER BY page_number ASC');
      return res.rows;
    } else {
      const stmt = this.sqliteDb.prepare('SELECT * FROM compendium_chunks ORDER BY page_number ASC');
      return stmt.all();
    }
  }
}

export const dbManager = new DatabaseManager();
