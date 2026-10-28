import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbManager } from './db/database.js';
import { sportsRagService } from './rag/sportsRagService.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import sportsRoutes from './routes/sportsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/settings', settingsRoutes);

// Page Routing
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

app.get('/login', (req, res) => {
  res.redirect('/register?mode=login');
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Root route: Serve register.html as 1st page if requested, or index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

// Startup sequence
async function startServer() {
  try {
    console.log('⚡ Initializing SportsAI Zero-Hallucination Intelligence System...');
    await dbManager.initialize();
    await sportsRagService.initialize();

    let targetPort = parseInt(process.env.PORT || '3000', 10);

    function tryListen(p) {
      const server = app.listen(p, () => {
        console.log(`\n======================================================`);
        console.log(`🏆 SportsAI Chatbot Live at http://localhost:${p}`);
        console.log(`📖 100-Page Sports Compendium Indexed & Active`);
        console.log(`💾 Database: ${dbManager.mode.toUpperCase()} (${dbManager.statusMessage})`);
        console.log(`🌐 Register Page (1st page): http://localhost:${p}/register`);
        console.log(`💬 Gemini-Style Chat Arena: http://localhost:${p}/chat`);
        console.log(`======================================================\n`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Server] Port ${p} in use, attempting port ${p + 1}...`);
          tryListen(p + 1);
        } else {
          console.error('[Server] Fatal listen error:', err);
        }
      });
    }

    tryListen(targetPort);
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
