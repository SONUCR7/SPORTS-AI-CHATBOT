import express from 'express';
import { sportsRagService } from '../rag/sportsRagService.js';
import { liveSportsApi } from '../services/liveSportsApi.js';
import { sportsDataService } from '../services/sportsDataService.js';
import { ollamaService } from '../services/ollamaService.js';

const router = express.Router();

// Get summary of all 100 pages
router.get('/compendium', (req, res) => {
  const pages = sportsRagService.getAllPagesSummary();
  res.json({ totalPages: pages.length, pages });
});

// Get specific page content
router.get('/compendium/page/:num', (req, res) => {
  const pageNum = parseInt(req.params.num, 10);
  const page = sportsRagService.getPage(pageNum);
  if (!page) {
    return res.status(404).json({ error: `Page ${pageNum} not found in compendium` });
  }
  res.json({ page });
});

// Live sports rankings & tournament context feed
router.get('/live', (req, res) => {
  const sport = req.query.sport || 'all';
  const liveData = liveSportsApi.getLiveSportsContext(sport);
  res.json({ sport, liveData });
});

// Full Live Match Center Data (Cricket, Football, Badminton via Unified Real-Time Service)
router.get('/live-matches', async (req, res) => {
  try {
    const data = await sportsDataService.getLiveMatches(req.query.sport || 'all', req.query.refresh === 'true');
    res.json(data);
  } catch (err) {
    console.error('[SportsRoutes] live-matches error:', err);
    res.status(500).json({ error: 'Failed to load live matches' });
  }
});

// Player Matrix & Scouting Analytics Dataset
router.get('/players', (req, res) => {
  try {
    const data = liveSportsApi.getPlayerMatrixData();
    res.json(data);
  } catch (err) {
    console.error('[SportsRoutes] players error:', err);
    res.status(500).json({ error: 'Failed to load player matrix' });
  }
});

// Standings endpoint for Football (Premier League, LaLiga, Bundesliga, UCL)
router.get('/standings/:league?', async (req, res) => {
  try {
    const league = req.params.league || req.query.league || 'epl';
    const data = await sportsDataService.getFootballStandings(league, req.query.refresh === 'true');
    res.json(data);
  } catch (err) {
    console.error('[SportsRoutes] standings error:', err);
    res.status(500).json({ error: 'Failed to load league standings' });
  }
});

// AI Tactical Match Summary via Phi-3 Mini
router.post('/ai-match-summary', async (req, res) => {
  try {
    const { matchData } = req.body;
    if (!matchData) {
      return res.status(400).json({ error: 'matchData is required' });
    }

    const systemPrompt = `You are an elite sports tactical analyst and scouting director.
Given real-time sports match data, generate an analytical, crisp, highly engaging match summary report in clean Markdown format with headers (###), key game-changing tactical moments, and a concluding tactical verdict. Keep it punchy and authoritative.`;

    const userPrompt = `LIVE MATCH DATA:
${JSON.stringify(matchData, null, 2)}

Produce an elite tactical match analysis covering key turning points, individual player performances, and tactical edge.`;

    const completion = await ollamaService.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      preferredModel: 'phi3:latest',
      temperature: 0.3,
      numPredict: 420
    });

    res.json({
      success: true,
      summary: completion.content,
      modelUsed: completion.modelUsed
    });
  } catch (err) {
    console.error('[SportsRoutes] ai-match-summary error:', err);
    res.status(500).json({ error: 'Failed to generate AI match summary: ' + err.message });
  }
});

// AI Head-to-Head Player Scout Verdict via Phi-3 Mini
router.post('/ai-player-scout', async (req, res) => {
  try {
    const { sport, player1, player2, headToHead } = req.body;
    if (!player1 || !player2) {
      return res.status(400).json({ error: 'Both player1 and player2 are required' });
    }

    const systemPrompt = `You are a world-class professional sports scout and data analyst specializing in ${sport || 'sports'}.
Given two elite players' performance stats, attributes, and career achievements, deliver an objective, deep, and nuanced head-to-head scouting report in clean Markdown.
Highlight:
1. Stylistic Differences & Core Strengths
2. Tactical Matchup & Technical Edge
3. High-Pressure / Clutch Performance
4. Final Scout Verdict`;

    const userPrompt = `PLAYER 1 SCOUT PROFILE:
${JSON.stringify(player1, null, 2)}

PLAYER 2 SCOUT PROFILE:
${JSON.stringify(player2, null, 2)}

HEAD-TO-HEAD HISTORY:
${JSON.stringify(headToHead || {}, null, 2)}

Generate the definitive head-to-head tactical scout verdict.`;

    const completion = await ollamaService.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      preferredModel: 'phi3:latest',
      temperature: 0.3,
      numPredict: 450
    });

    res.json({
      success: true,
      verdict: completion.content,
      modelUsed: completion.modelUsed
    });
  } catch (err) {
    console.error('[SportsRoutes] ai-player-scout error:', err);
    res.status(500).json({ error: 'Failed to generate AI scout verdict: ' + err.message });
  }
});

// Full Dashboard Data (Live, Fixtures, Recent Results, Rankings)
router.get('/dashboard-data', async (req, res) => {
  try {
    const data = await sportsDataService.getDashboardData(req.query.refresh === 'true');
    res.json(data);
  } catch (err) {
    console.error('[SportsRoutes] dashboard-data error:', err);
    res.status(500).json({ error: 'Failed to load sports dashboard data' });
  }
});

// Full Tactical Analysis Data (Football formations with 11 nodes, Cricket wagon wheel, Badminton heatzones)
router.get('/tactical-data', (req, res) => {
  try {
    const data = liveSportsApi.getTacticalData();
    res.json(data);
  } catch (err) {
    console.error('[SportsRoutes] tactical-data error:', err);
    res.status(500).json({ error: 'Failed to load sports tactical data' });
  }
});

// AI Tactical Board Breakdown via Phi-3 Mini
router.post('/ai-tactical-report', async (req, res) => {
  try {
    const { sport, formationOrTopic, tacticalDetails } = req.body;
    if (!sport) {
      return res.status(400).json({ error: 'Sport is required' });
    }

    const systemPrompt = `You are a UEFA Pro License tactical coach, ICC master coach, and BWF high-performance director.
Provide an elite, professional tactical analysis of the provided sport, formation, or technical topic in crisp GitHub Flavored Markdown.
Include:
1. Tactical Philosophy & Space Creation
2. Passing / Movement Hubs & Key Transitions
3. Pressing / Defensive Vulnerabilities & Counters
4. Key Player Role Demands
5. Coach's Tactical Verdict`;

    const userPrompt = `SPORT: ${sport.toUpperCase()}
FORMATION / TOPIC: ${formationOrTopic || 'General Analysis'}
TACTICAL DATA & METRICS:
${JSON.stringify(tacticalDetails || {}, null, 2)}

Deliver a high-level masterclass tactical report.`;

    const completion = await ollamaService.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      preferredModel: 'phi3:latest',
      temperature: 0.3,
      numPredict: 450
    });

    res.json({
      success: true,
      report: completion.content,
      modelUsed: completion.modelUsed
    });
  } catch (err) {
    console.error('[SportsRoutes] ai-tactical-report error:', err);
    res.status(500).json({ error: 'Failed to generate tactical report: ' + err.message });
  }
});

export default router;
