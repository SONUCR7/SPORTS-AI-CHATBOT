import express from 'express';
import { sportsRagService } from '../rag/sportsRagService.js';
import { liveSportsApi } from '../services/liveSportsApi.js';

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

// Live sports intelligence feed
router.get('/live', (req, res) => {
  const sport = req.query.sport || 'all';
  const liveData = liveSportsApi.getLiveSportsContext(sport);
  res.json({ sport, liveData });
});

export default router;
