import express from 'express';
import { dbManager } from '../db/database.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    database: {
      mode: dbManager.mode,
      statusMessage: dbManager.statusMessage,
      postgresReady: true
    },
    rag: {
      totalPages: 100,
      indexed: true,
      sports: ['Cricket (pp. 1-34)', 'Football (pp. 35-68)', 'Badminton (pp. 69-100)']
    },
    llm: {
      activeProvider: process.env.LLM_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'smart_rag'),
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasGroqKey: !!process.env.GROK_API_KEY
    }
  });
});

router.post('/keys', (req, res) => {
  const { geminiApiKey, openaiApiKey, groqApiKey, huggingfaceApiKey } = req.body;
  if (geminiApiKey) process.env.GEMINI_API_KEY = geminiApiKey.trim();
  if (openaiApiKey) process.env.OPENAI_API_KEY = openaiApiKey.trim();
  if (groqApiKey) process.env.GROK_API_KEY = groqApiKey.trim();
  if (huggingfaceApiKey) {
    process.env.HUGGINGFACE_API_KEY = huggingfaceApiKey.trim();
    process.env.HF_TOKEN = huggingfaceApiKey.trim();
  }

  res.json({ success: true, message: 'API keys updated successfully' });
});

export default router;
