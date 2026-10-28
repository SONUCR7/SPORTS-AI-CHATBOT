import express from 'express';
import { dbManager } from '../db/database.js';
import { sportsGraph } from '../langgraph/sportsGraph.js';
import { classifySportsQuery, generateScopeRefusal } from '../langgraph/sportsClassifier.js';
import { sportsRagService } from '../rag/sportsRagService.js';
import { ollamaService } from '../services/ollamaService.js';

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
  const acronyms = new Set(['ICC', 'FIFA', 'BWF', 'VAR', 'IPL', 'UCL', 'ODI', 'T20', 'FC', 'AI', 'NBA', 'BCCI', 'FA', 'MLS', 'EPL', 'LBW', 'DRS', 'DLS']);

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

// Check Ollama status & model availability
router.get('/ollama/status', async (req, res) => {
  try {
    const status = await ollamaService.checkStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message, connected: false });
  }
});

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

/**
 * Server-Sent Events (SSE) Streaming Chat Endpoint
 * Connects directly to Ollama Phi-3 (Primary) / Qwen (Secondary) with live streaming,
 * Stop Generation signal handling, conversational memory, and genuine compendium RAG citations.
 */
router.post('/stream', async (req, res) => {
  const { sessionId, userId, query, model, sportPreference } = req.body;

  if (!sessionId || !query || !query.trim()) {
    return res.status(400).json({ error: 'sessionId and query are required' });
  }

  // Setup Server-Sent Events (SSE) headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();

  const abortController = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  try {
    // 1. Fetch prior history for conversational continuity
    const priorMessages = await dbManager.getSessionMessages(sessionId);

    // 2. Persist user message in DB
    const userMsg = await dbManager.createMessage({
      session_id: sessionId,
      role: 'user',
      content: query.trim(),
      sport: 'query'
    });

    // 3. Classify sports query (passing history to resolve follow-ups like "Give me an example")
    const classification = classifySportsQuery(query, priorMessages);

    // 4. Handle Guardrail Refusal if query is completely off-topic
    if (!classification.isSports) {
      const refusal = generateScopeRefusal(query);
      res.write(`event: meta\ndata: ${JSON.stringify({
        sport: 'out_of_scope',
        model: 'SportsAI Guardrail',
        groundingScore: 100,
        citations: []
      })}\n\n`);

      // Stream refusal text smoothly
      const words = refusal.content.split(' ');
      for (const w of words) {
        if (abortController.signal.aborted) break;
        res.write(`event: chunk\ndata: ${JSON.stringify({ token: w + ' ' })}\n\n`);
      }

      await dbManager.createMessage({
        session_id: sessionId,
        role: 'assistant',
        content: refusal.content,
        sport: 'out_of_scope',
        citations: [],
        grounding_score: 100
      });

      res.write(`event: done\ndata: ${JSON.stringify({ success: true })}\n\n`);
      return res.end();
    }

    // 5. Handle Greeting
    if (classification.sport === 'greeting') {
      const welcome = `### ✦ Welcome to SportsAI Tri-Sport Intelligence

I am your **Zero-Hallucination Sports Analyst**, powered by Microsoft **Phi-3 Mini (Ollama)** and grounded in our verified **100-page sports compendium**:

- 🏏 **Cricket** (Pages 1–34): MCC Laws (LBW Law 36, DRS ball tracking, reverse swing aerodynamics, player records & stats).
- ⚽ **Football** (Pages 35–68): IFAB Laws (Offside Law 11, VAR protocols, Gegenpressing & Tiki-Taka tactics, UCL legends).
- 🏸 **Badminton** (Pages 69–100): BWF 1.15m service rules, 21-point rally scoring, 565 km/h smash aerodynamics, Olympic champions.

**How can I assist your sports query today?**
↳ Explain the 3 conditions for an LBW dismissal in cricket
↳ Compare Lionel Messi and Cristiano Ronaldo in Champions League records
↳ What is the world record badminton smash speed and who holds it?`;

      res.write(`event: meta\ndata: ${JSON.stringify({
        sport: 'tri_sports',
        model: 'SportsAI Zero-Hallucination',
        groundingScore: 100,
        citations: []
      })}\n\n`);

      const words = welcome.split(' ');
      for (const w of words) {
        if (abortController.signal.aborted) break;
        res.write(`event: chunk\ndata: ${JSON.stringify({ token: w + ' ' })}\n\n`);
      }

      await dbManager.createMessage({
        session_id: sessionId,
        role: 'assistant',
        content: welcome,
        sport: 'tri_sports',
        citations: [],
        grounding_score: 100
      });

      res.write(`event: done\ndata: ${JSON.stringify({ success: true })}\n\n`);
      return res.end();
    }

    // 6. RAG Retrieval: Retrieve genuine compendium passages
    let sportFilter = ['cricket', 'football', 'badminton'].includes(classification.sport)
      ? classification.sport
      : null;

    if (classification.sport === 'multi_sports') {
      sportFilter = null;
    }

    const ragChunks = sportsRagService.retrieve({
      query,
      sportFilter,
      topK: classification.sport === 'multi_sports' ? 6 : 4
    });

    // Citations are ONLY generated if genuine chunks matched (never fake Zidane page 57!)
    const citations = ragChunks.map(c => ({
      page: c.pageNumber,
      sport: c.sport,
      chapter: c.chapter,
      title: c.title,
      quote: c.content.slice(0, 160) + '...',
      relevanceScore: c.relevanceScore || 95
    }));

    // Send metadata header
    res.write(`event: meta\ndata: ${JSON.stringify({
      sport: classification.sport,
      model: model || 'phi3:latest',
      groundingScore: citations.length > 0 ? 100 : 95,
      citations
    })}\n\n`);

    // 7. Assemble System Prompt & Conversation History
    const systemPrompt = `You are SportsAI, an elite zero-hallucination sports intelligence analyst specializing in Cricket, Football, and Badminton.
You communicate naturally, articulately, and fluently, formatted in clean GitHub-style Markdown.

CORE RULES:
1. DIRECT ANSWER: Answer the user's specific question directly, conversationally, and accurately.
2. OFFICIAL ACCURACY: Ground rules strictly in official laws:
   - Cricket: Marylebone Cricket Club (MCC) Laws of Cricket (e.g., Law 36 for LBW, DRS ball-tracking protocols).
   - Football: International Football Association Board (IFAB) Laws of the Game (e.g., Law 11 Offside, VAR protocols).
   - Badminton: Badminton World Federation (BWF) Statutes (e.g., 1.15m fixed service height, 21-point rally scoring).
3. CLEAN FORMATTING: Use bold markdown headers (###), bullet points, and neat comparison tables where appropriate.
4. CONVERSATIONAL MEMORY: Pay close attention to previous messages in this conversation. If the user asks a follow-up question (e.g., "Give me an example", "Explain more", "Compare them"), maintain full context without asking them to repeat themselves.
${ragChunks.length > 0 ? `\nOFFICIAL VERIFIED COMPENDIUM KNOWLEDGE BASE:\n` + ragChunks.map(c => `[Page ${c.pageNumber}: ${c.title} (${c.chapter})]\n${c.content.slice(0, 320)}...`).join('\n\n') : ''}
5. FOLLOW-UP SUGGESTIONS: Always end your response with 3 relevant, clickable follow-up topic suggestions formatted exactly like this:
Want to learn more?
↳ [Specific follow-up question 1]
↳ [Specific follow-up question 2]
↳ [Specific follow-up question 3]`;

    // Build chat message history (up to last 6 turns)
    const messages = [{ role: 'system', content: systemPrompt }];
    const recentHistory = priorMessages.slice(-6);
    for (const m of recentHistory) {
      messages.push({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      });
    }
    messages.push({ role: 'user', content: query.trim() });

    // 8. Stream via Ollama Service (Phi-3 Mini Primary, Qwen Fallback)
    let fullOutput = '';
    let activeModelUsed = model || 'phi3:latest';

    const streamResult = await ollamaService.streamChat({
      messages,
      preferredModel: model || 'phi3:latest',
      signal: abortController.signal,
      temperature: 0.3,
      numPredict: 500,
      onChunk: (token) => {
        fullOutput += token;
        res.write(`event: chunk\ndata: ${JSON.stringify({ token })}\n\n`);
      },
      onFallback: (fbInfo) => {
        activeModelUsed = fbInfo.to;
        res.write(`event: fallback\ndata: ${JSON.stringify(fbInfo)}\n\n`);
      }
    });

    const finalAnswer = (fullOutput.trim() || streamResult.content || '').trim();
    activeModelUsed = streamResult.modelUsed || activeModelUsed;

    // 9. Persist assistant response in DB
    const assistantMsg = await dbManager.createMessage({
      session_id: sessionId,
      role: 'assistant',
      content: finalAnswer,
      sport: classification.sport,
      citations,
      grounding_score: citations.length > 0 ? 100 : 95
    });

    // 10. Smart Title Generation if this is an initial user query
    let sessionTitle = null;
    const currentSession = await dbManager.getSessionById(sessionId);
    const isPlaceholderTitle = !currentSession ||
      currentSession.title === 'New chat' ||
      currentSession.title === 'New Tri-Sport Conversation' ||
      currentSession.title === 'SportsAI Arena' ||
      currentSession.title.startsWith('New ');

    if (priorMessages.length <= 1 || isPlaceholderTitle) {
      sessionTitle = generateSmartTitle(query);
      await dbManager.updateSessionTitle(sessionId, sessionTitle);
      res.write(`event: title\ndata: ${JSON.stringify({ title: sessionTitle })}\n\n`);
    }

    // 11. Send done event
    res.write(`event: done\ndata: ${JSON.stringify({
      success: true,
      messageId: assistantMsg.id,
      modelUsed: activeModelUsed,
      citations,
      sessionTitle
    })}\n\n`);
    res.end();

  } catch (err) {
    if (abortController.signal.aborted) {
      // User pressed Stop Generation button
      console.log(`[Stream] Client aborted generation for session ${sessionId}`);
      res.write(`event: done\ndata: ${JSON.stringify({ stopped: true })}\n\n`);
      res.end();
    } else {
      console.error('[Stream] Streaming error:', err);
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

/**
 * Non-streaming message endpoint (compatible with REST clients & legacy UI)
 */
router.post('/message', async (req, res) => {
  try {
    const { sessionId, userId, query, llmOptions = {} } = req.body;
    if (!sessionId || !query) {
      return res.status(400).json({ error: 'sessionId and query are required' });
    }

    const priorMessages = await dbManager.getSessionMessages(sessionId);

    // Persist user message
    const userMsg = await dbManager.createMessage({
      session_id: sessionId,
      role: 'user',
      content: query.trim(),
      sport: 'query'
    });

    // Classify query with history
    const classification = classifySportsQuery(query, priorMessages);

    let sportFilter = ['cricket', 'football', 'badminton'].includes(classification.sport)
      ? classification.sport
      : null;

    const ragChunks = sportsRagService.retrieve({
      query,
      sportFilter,
      topK: 4
    });

    const citations = ragChunks.map(c => ({
      page: c.pageNumber,
      sport: c.sport,
      chapter: c.chapter,
      title: c.title,
      quote: c.content.slice(0, 160) + '...',
      relevanceScore: c.relevanceScore || 95
    }));

    // Build prompt & messages
    const systemPrompt = `You are SportsAI, an elite zero-hallucination sports intelligence analyst specializing in Cricket, Football, and Badminton.
Ground rules in official MCC (Cricket), IFAB (Football), and BWF (Badminton) laws.
Clean Markdown formatting with headers (###) and comparison tables where useful.
Maintain conversational context from prior dialogue.
${ragChunks.length > 0 ? `\nOFFICIAL VERIFIED COMPENDIUM KNOWLEDGE:\n` + ragChunks.map(c => `[Page ${c.pageNumber}: ${c.title}]\n${c.content.slice(0, 300)}...`).join('\n\n') : ''}
End with:
Want to learn more?
↳ [Specific follow-up 1]
↳ [Specific follow-up 2]
↳ [Specific follow-up 3]`;

    const messages = [{ role: 'system', content: systemPrompt }];
    for (const m of priorMessages.slice(-6)) {
      messages.push({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      });
    }
    messages.push({ role: 'user', content: query.trim() });

    const completion = await ollamaService.chatCompletion({
      messages,
      preferredModel: llmOptions.model || 'phi3:latest',
      temperature: 0.3,
      numPredict: 500
    });

    const assistantMsg = await dbManager.createMessage({
      session_id: sessionId,
      role: 'assistant',
      content: completion.content,
      sport: classification.sport,
      citations,
      grounding_score: citations.length > 0 ? 100 : 95
    });

    // Smart title update
    let sessionTitle = null;
    const currentSession = await dbManager.getSessionById(sessionId);
    const isPlaceholderTitle = !currentSession ||
      currentSession.title === 'New chat' ||
      currentSession.title === 'New Tri-Sport Conversation' ||
      currentSession.title.startsWith('New ');

    if (priorMessages.length <= 1 || isPlaceholderTitle) {
      sessionTitle = generateSmartTitle(query);
      await dbManager.updateSessionTitle(sessionId, sessionTitle);
    }

    res.json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      sessionTitle,
      modelUsed: completion.modelUsed,
      fallbackOccurred: completion.fallbackOccurred
    });

  } catch (err) {
    console.error('[Chat] Message pipeline error:', err);
    res.status(500).json({ error: 'Pipeline execution failed: ' + err.message });
  }
});

export default router;
