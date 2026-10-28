import express from 'express';
import { dbManager } from '../db/database.js';
import { sportsGraph } from '../langgraph/sportsGraph.js';

const router = express.Router();

/**
 * Generates an intelligent, clean chat title from user query
 * Behaves similarly to Google Gemini, ChatGPT, and Claude
 */
export function generateSmartTitle(query) {
  if (!query || typeof query !== 'string') return 'New chat';

  let cleaned = query.trim();

  // Strip common conversational question starters (case-insensitive)
  const prefixes = [
    /^(can you\s+)?(please\s+)?(tell me\s+(about\s+)?|explain\s+(to me\s+)?|describe\s+|what is\s+(the\s+)?|what are\s+(the\s+)?|who is\s+(the\s+)?|who was\s+(the\s+)?|who has\s+(the\s+)?|who scored\s+(the\s+)?|how does\s+(the\s+)?|how do\s+(the\s+)?|how to\s+|why does\s+|why is\s+|give me\s+(a\s+|the\s+)?|show me\s+(a\s+|the\s+)?|summarize\s+(the\s+)?|details on\s+(the\s+)?|information on\s+(the\s+)?|write about\s+|answer this:\s*|compare\s+)/i,
    /^(what's\s+(the\s+)?|who's\s+(the\s+)?|how's\s+(the\s+)?)/i,
    /^(the\s+)/i
  ];

  for (const p of prefixes) {
    cleaned = cleaned.replace(p, '');
  }

  // Remove surrounding quotes and trailing punctuation
  cleaned = cleaned.replace(/^["'`\s]+|["'`\?\!\.\:\;\,\s]+$/g, '').trim();

  if (!cleaned) {
    cleaned = query.trim().replace(/^["'`\s]+|["'`\?\!\.\:\;\,\s]+$/g, '');
  }

  // Smart capitalization
  const minorWords = new Set(['in', 'the', 'a', 'an', 'and', 'or', 'for', 'of', 'on', 'at', 'to', 'vs', 'by', 'with', 'from']);
  const acronyms = new Set(['ICC', 'FIFA', 'BWF', 'VAR', 'IPL', 'UCL', 'ODI', 'T20', 'FC', 'AI', 'NBA', 'BCCI', 'FA', 'MLS', 'EPL']);

  const words = cleaned.split(/\s+/).filter(Boolean);
  const titleWords = words.map((w, idx) => {
    const upper = w.toUpperCase();
    if (acronyms.has(upper)) return upper;
    const lower = w.toLowerCase();
    if (idx > 0 && minorWords.has(lower)) return lower;
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });

  cleaned = titleWords.join(' ');

  // Truncate cleanly at word boundary (max ~38 chars)
  if (cleaned.length > 38) {
    const cut = cleaned.slice(0, 38);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 18) {
      cleaned = cut.slice(0, lastSpace) + '...';
    } else {
      cleaned = cut + '...';
    }
  }

  return cleaned || 'New chat';
}

// List user sessions
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    // Clean up empty duplicate placeholder sessions
    await dbManager.cleanEmptySessions(userId);
    const sessions = await dbManager.getUserSessions(userId);
    res.json({ sessions });
  } catch (err) {
    console.error('[Chat] Fetch sessions error:', err);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

// Create new session
router.post('/sessions', async (req, res) => {
  try {
    const { userId, title, sport } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    // Clean up any empty sessions with 0 messages before creating
    await dbManager.cleanEmptySessions(userId);

    const session = await dbManager.createSession({
      user_id: userId,
      title: title || 'New chat',
      sport: sport || 'all'
    });
    res.json({ session });
  } catch (err) {
    console.error('[Chat] Create session error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get messages for a session
router.get('/sessions/:id/messages', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const messages = await dbManager.getSessionMessages(sessionId);
    res.json({ messages });
  } catch (err) {
    console.error('[Chat] Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Rename session
router.patch('/sessions/:id/rename', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    await dbManager.updateSessionTitle(sessionId, title.trim());
    res.json({ success: true, title: title.trim() });
  } catch (err) {
    console.error('[Chat] Rename session error:', err);
    res.status(500).json({ error: 'Failed to rename session' });
  }
});

// Delete session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    await dbManager.deleteSession(sessionId);
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    console.error('[Chat] Delete session error:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Send message & execute LangGraph pipeline
router.post('/message', async (req, res) => {
  try {
    const { sessionId, userId, query, llmOptions = {} } = req.body;
    if (!sessionId || !query) {
      return res.status(400).json({ error: 'sessionId and query are required' });
    }

    // 1. Fetch prior history for conversational continuity
    const priorMessages = await dbManager.getSessionMessages(sessionId);

    // 2. Persist user message in DB
    const userMsg = await dbManager.createMessage({
      session_id: sessionId,
      role: 'user',
      content: query.trim(),
      sport: 'query'
    });

    // 3. Execute LangGraph Pipeline
    const graphResponse = await sportsGraph.run({
      query,
      sessionId,
      history: priorMessages,
      llmOptions
    });

    // 4. Persist assistant response in DB
    const assistantMsg = await dbManager.createMessage({
      session_id: sessionId,
      role: 'assistant',
      content: graphResponse.content,
      sport: graphResponse.sport,
      citations: graphResponse.citations || [],
      grounding_score: graphResponse.grounding_score
    });

    // 5. If session is new or has a default title, generate smart title from user query (Gemini/ChatGPT style)
    let sessionTitle = null;
    const currentSession = await dbManager.getSessionById(sessionId);
    const isPlaceholderTitle = !currentSession || 
      currentSession.title === 'New chat' || 
      currentSession.title === 'New Tri-Sport Conversation' || 
      currentSession.title === 'New Sports Session' ||
      currentSession.title === 'Tri-Sport Intelligence Welcome' ||
      currentSession.title.startsWith('New ');

    if (priorMessages.length <= 1 || isPlaceholderTitle) {
      const smartTitle = generateSmartTitle(query);
      await dbManager.updateSessionTitle(sessionId, smartTitle);
      sessionTitle = smartTitle;
    }

    res.json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      sessionTitle,
      verification: graphResponse.verification
    });
  } catch (err) {
    console.error('[Chat] Message pipeline error:', err);
    res.status(500).json({ error: 'Pipeline execution failed: ' + err.message });
  }
});

export default router;
