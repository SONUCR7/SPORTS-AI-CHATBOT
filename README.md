# ⚡ SportsAI — Tri-Sport Zero-Hallucination AI Chatbot
> **Domain Focus:** Cricket 🏏, Football ⚽, Badminton 🏸  
> **Key Features:** Zero-Hallucination RAG, 100-Page Knowledge Compendium, LangGraph Pipeline, 3D WebGL UI, PostgreSQL Session Storage.

---

## 🌟 Overview
**SportsAI** is an AI chatbot specifically engineered for sports enthusiasts, tacticians, and analysts. It strictly covers **Cricket**, **Football**, and **Badminton**, preventing hallucinations through:
1. **100-Page Verified Compendium**: A dense 100-page training corpus covering official laws (MCC, IFAB, BWF), tournament histories (1975–2024), legend profiles, and biomechanics.
2. **LangGraph Optimization Engine**: Multi-node state graph orchestrating sports classification, intent routing, hybrid vector retrieval, strict factual synthesis, and anti-hallucination verification.
3. **PostgreSQL Session Storage**: Full relational schema storing user accounts, sessions, messages, and citations in PostgreSQL (with automatic high-speed SQLite fallback when Postgres is not running locally).
4. **Sick and Wow 3D UI**: Interactive Three.js canvas featuring 3D Cricket balls, Footballs, and Badminton Shuttlecocks with real-time rotational physics and mouse parallax.
5. **Atlas & Gemini Inspired Interface**: 
   - Register Page as 1st page with side option to Login (matching Picture 3).
   - Gemini-style minimalist dark theme with history sidebar (matching Pictures 1 & 2).

---

## 🏗️ Architecture

```
User Query
    │
    ▼
[Node 1: Sports Guardrail Classifier]
    ├── If Out-of-Scope ───────────────► [Refusal Node: Polite Tri-Sport Guardrail]
    └── If Cricket/Football/Badminton ──► [Node 2: RAG Hybrid Retriever]
                                               │ (Scans 100-Page Compendium)
                                               ▼
                                         [Node 3: Live Sports Context Enricher]
                                               │
                                               ▼
                                         [Node 4: Grounded LLM Synthesizer]
                                               │ (Gemini / OpenAI / Smart RAG)
                                               ▼
                                         [Node 5: Anti-Hallucination Verifier]
                                               │ (Audits numbers, dates & laws)
                                               ▼
                                         [Node 6: PostgreSQL Session Storage]
                                               │
                                               ▼
                                         Structured Markdown + Exact Citations
```

---

## 📚 100-Page Sports Compendium Breakdown
- **Part I: Cricket (Pages 1 to 34)**:
  - MCC 42 Laws of Cricket, Pitch geometry, Stumps & Ball standards.
  - Law 36 (LBW) 3 Pillars, Umpire's Call & DRS Hawk-Eye ball tracking.
  - Conventional vs Reverse Swing aerodynamics, spin bowling variations (Doosra, Carrom ball, Googly, Flipper).
  - ICC World Cups (1975–2023), T20 World Cups (2007–2024), The Ashes lore (1882–2024), IPL complete almanac.
  - Legend profiles: Sachin Tendulkar (100 centuries), Virat Kohli (50 ODI tons), MS Dhoni, Don Bradman (99.94), Shane Warne, Wasim Akram, Jasprit Bumrah.
- **Part II: Football (Pages 35 to 68)**:
  - IFAB Laws of the Game, Law 11 Offside, Law 12 Fouls & DOGSO, Handball unnatural silhouette.
  - Video Assistant Referee (VAR) protocol & Semi-Automated Offside Technology (SAOT).
  - Tactical systems: 4-3-3 Tiki-Taka, 4-2-3-1 Gegenpressing, 3-5-2 Wing-Back Overloads, Catenaccio to Low Block.
  - Player archetypes: False Nine (Messi, Totti), Regista (Pirlo, Busquets), Inverted Full-backs.
  - FIFA World Cups (1930–2022), UEFA Champions League historic era to 15th Real Madrid title (2024).
  - Legends: Pelé (3 World Cups), Maradona (1986), Messi (8 Ballon d'Ors), Cristiano Ronaldo (890+ goals), Cruyff, Zidane.
- **Part III: Badminton (Pages 69 to 100)**:
  - BWF Official Laws, Court dimensions (13.4m x 6.1m), 21-point rally scoring system & 30-pt deuce cap.
  - Fixed 1.15m service height rule, Faults & Lets, 16 goose feather shuttlecock aerodynamics & high drag deceleration.
  - World record smash speeds: Satwiksairaj Rankireddy (565 km/h Guinness World Record), Tan Boon Heong, Pearly Tan.
  - Tactical formations: Men's Doubles Front-and-Back attack vs Side-by-Side defense.
  - Olympic history (1992–2024), BWF World Championships, Thomas & Uber Cup (India 2022 win), All England Open.
  - Legends: Lin Dan (Super Dan), Lee Chong Wei, 40-match Lin-Lee rivalry, Viktor Axelsen, PV Sindhu, An Se-young, Satwik-Chirag.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd sports-ai-chatbot
npm install
```

### 2. (Optional) Start PostgreSQL Container
If you want to run PostgreSQL with Docker:
```bash
docker compose up -d
```
*(If Docker/PostgreSQL is not started, the application automatically uses the high-speed local database engine so it works immediately without setup!)*

### 3. Start the Server
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!
- **Register / Login Page (1st Page)**: `http://localhost:3000/register`
- **Main Chat Arena**: `http://localhost:3000/chat`
- **1-Click Demo Login**: Click `⚡ 1-Click Demo Login (Arighna Nandi • Sports Pro)`
