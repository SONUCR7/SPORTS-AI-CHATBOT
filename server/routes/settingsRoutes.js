import express from 'express';
import fs from 'fs';
import path from 'path';
import { dbManager } from '../db/database.js';

const router = express.Router();

function updateEnvFile(key, value) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    }
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
    fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
  } catch (e) {
    console.warn(`[Settings] Failed to write ${key} to .env:`, e.message);
  }
}

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
    },
    liveSports: {
      hasFootballKey: !!process.env.FOOTBALL_DATA_API_KEY,
      hasCricbuzzKey: !!(process.env.CRICBUZZ_API_KEY || process.env.RAPIDAPI_KEY || process.env.CRICAPI_KEY),
      hasBadmintonKey: !!(process.env.BADMINTON_API_KEY || process.env.RAPIDAPI_KEY)
    }
  });
});

router.post('/keys', (req, res) => {
  const {
    geminiApiKey,
    openaiApiKey,
    groqApiKey,
    footballDataApiKey,
    cricbuzzApiKey,
    cricApiKey,
    badmintonApiKey,
    rapidApiKey
  } = req.body;

  if (geminiApiKey) {
    process.env.GEMINI_API_KEY = geminiApiKey.trim();
    updateEnvFile('GEMINI_API_KEY', geminiApiKey.trim());
  }
  if (openaiApiKey) {
    process.env.OPENAI_API_KEY = openaiApiKey.trim();
    updateEnvFile('OPENAI_API_KEY', openaiApiKey.trim());
  }
  if (groqApiKey) {
    process.env.GROK_API_KEY = groqApiKey.trim();
    updateEnvFile('GROK_API_KEY', groqApiKey.trim());
  }
  if (footballDataApiKey) {
    process.env.FOOTBALL_DATA_API_KEY = footballDataApiKey.trim();
    updateEnvFile('FOOTBALL_DATA_API_KEY', footballDataApiKey.trim());
  }
  if (cricbuzzApiKey) {
    process.env.CRICBUZZ_API_KEY = cricbuzzApiKey.trim();
    updateEnvFile('CRICBUZZ_API_KEY', cricbuzzApiKey.trim());
  }
  if (cricApiKey) {
    process.env.CRICAPI_KEY = cricApiKey.trim();
    updateEnvFile('CRICAPI_KEY', cricApiKey.trim());
  }
  if (badmintonApiKey) {
    process.env.BADMINTON_API_KEY = badmintonApiKey.trim();
    updateEnvFile('BADMINTON_API_KEY', badmintonApiKey.trim());
  }
  if (rapidApiKey) {
    process.env.RAPIDAPI_KEY = rapidApiKey.trim();
    updateEnvFile('RAPIDAPI_KEY', rapidApiKey.trim());
  }

  res.json({
    success: true,
    message: 'Configuration and Live Sports API keys updated successfully',
    liveSports: {
      hasFootballKey: !!process.env.FOOTBALL_DATA_API_KEY,
      hasCricbuzzKey: !!(process.env.CRICBUZZ_API_KEY || process.env.RAPIDAPI_KEY || process.env.CRICAPI_KEY),
      hasBadmintonKey: !!(process.env.BADMINTON_API_KEY || process.env.RAPIDAPI_KEY)
    }
  });
});

export default router;
