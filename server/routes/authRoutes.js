import express from 'express';
import crypto from 'crypto';
import { dbManager } from '../db/database.js';

const router = express.Router();

// Helper to create session token
function createToken(userId) {
  return `${userId}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, preferred_sport } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await dbManager.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = dbManager.hashPassword(password, salt);
    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password_hash: hash,
      salt: salt,
      preferred_sport: preferred_sport || 'all',
      role: 'Pro'
    };

    await dbManager.createUser(newUser);

    // Create initial chat session
    const session = await dbManager.createSession({
      user_id: userId,
      title: 'New chat',
      sport: preferred_sport || 'all'
    });

    const token = createToken(userId);

    res.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        preferred_sport: newUser.preferred_sport,
        role: newUser.role
      },
      token,
      initialSessionId: session.id
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await dbManager.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const computedHash = dbManager.hashPassword(password, user.salt);
    if (computedHash !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken(user.id);

    // Get user's latest session or create one
    const sessions = await dbManager.getUserSessions(user.id);
    let activeSessionId = sessions.length > 0 ? sessions[0].id : null;
    if (!activeSessionId) {
      const newSess = await dbManager.createSession({
        user_id: user.id,
        title: 'New chat',
        sport: user.preferred_sport || 'all'
      });
      activeSessionId = newSess.id;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferred_sport: user.preferred_sport,
        role: user.role
      },
      token,
      activeSessionId
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 1-Click Demo Login (Arighna Nandi)
router.post('/demo', async (req, res) => {
  try {
    const demoEmail = 'arighna@sportsai.pro';
    const user = await dbManager.getUserByEmail(demoEmail);
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    const token = createToken(user.id);
    const sessions = await dbManager.getUserSessions(user.id);
    const activeSessionId = sessions.length > 0 ? sessions[0].id : null;

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferred_sport: user.preferred_sport,
        role: user.role
      },
      token,
      activeSessionId
    });
  } catch (err) {
    console.error('[Auth] Demo login error:', err);
    res.status(500).json({ error: 'Server error during demo login' });
  }
});

export default router;
