/**
 * LangGraph / LangChain Multi-Step Sports Intelligence Graph
 * Coordinates Query Routing, RAG Vector Retrieval, Live Data Enrichment,
 * Zero-Hallucination Prompting, and Grounding Verification.
 */

import { classifySportsQuery, generateScopeRefusal } from './sportsClassifier.js';
import { sportsRagService } from '../rag/sportsRagService.js';
import { liveSportsApi } from '../services/liveSportsApi.js';
import { llmService } from '../services/llmService.js';
import { verifyGrounding } from './antiHallucination.js';

export class SportsGraphPipeline {
  constructor() {
    this.name = 'SportsAILangGraphEngine';
  }

  /**
   * Execute the multi-step State Graph
   * @param {Object} input
   * @param {string} input.query - User prompt
   * @param {string} [input.sessionId] - Session ID
   * @param {Array} [input.history] - Prior messages in session
   * @param {string} [input.sportPreference] - Optional user default sport
   * @param {Object} [input.llmOptions] - Provider and API key overrides
   */
  async run({ query, sessionId, history = [], sportPreference = 'all', llmOptions = {} }) {
    // Initial State
    const state = {
      query: query.trim(),
      sessionId,
      history,
      sportPreference,
      classification: null,
      ragChunks: [],
      liveContext: null,
      rawOutput: null,
      verification: null,
      citations: [],
      finalResponse: null
    };

    // Step 1: Sports Scope & Intent Classification Node
    state.classification = classifySportsQuery(state.query);

    // Guardrail Check: If off-topic, short-circuit to refusal
    if (!state.classification.isSports) {
      state.finalResponse = generateScopeRefusal(state.query);
      return state.finalResponse;
    }

    // Greeting Handler
    if (state.classification.sport === 'greeting') {
      state.finalResponse = {
        role: 'assistant',
        sport: 'tri_sports',
        grounding_score: 100,
        citations: [],
        content: `### ✦ Welcome to SportsAI Tri-Sport Intelligence

I am your **Zero-Hallucination Sports Analyst**, trained and grounded on a comprehensive **100-page verified compendium** covering:

- 🏏 **Cricket** (Pages 1–34): MCC Laws, LBW & DRS mechanics, ball aerodynamics, ICC World Cup lore, IPL records, and player matchups (Kohli, Tendulkar, Dhoni, Bradman).
- ⚽ **Football** (Pages 35–68): IFAB Laws, Offside Law 11, VAR protocols, tactical formations (4-3-3 Tiki-Taka, Gegenpressing), UCL archives, and legends (Messi, Ronaldo, Pelé, Maradona).
- 🏸 **Badminton** (Pages 69–100): BWF 1.15m service laws, 21-pt rally scoring, 565 km/h smash aerodynamics, Olympic history, and heroes (Lin Dan, Lee Chong Wei, Axelsen, PV Sindhu, Satwik-Chirag).

**How can I assist your sports query today?** Try asking:
- *"Explain the 3 pillars of LBW in cricket and when Umpire's Call applies"*
- *"Compare Lionel Messi and Cristiano Ronaldo in Champions League goals and titles"*
- *"What is the world record badminton smash speed and who holds it?"*`
      };
      return state.finalResponse;
    }

    // Step 2: RAG Vector & Keyword Retrieval Node
    let sportFilter = ['cricket', 'football', 'badminton'].includes(state.classification.sport)
      ? state.classification.sport
      : null;

    if (state.classification.sport === 'multi_sports') {
      sportFilter = null; // Retrieve across all sports for comparative questions
    }

    state.ragChunks = sportsRagService.retrieve({
      query: state.query,
      sportFilter,
      topK: state.classification.sport === 'multi_sports' ? 6 : 4
    });

    // Step 3: Live Sports Enrichment Node
    const isLiveQuery = /live|current|ranking|standings|upcoming|champion|2024|2025|points table/i.test(state.query);
    if (isLiveQuery) {
      state.liveContext = liveSportsApi.getLiveSportsContext(state.classification.sport);
    }

    // Step 4: Strict Prompt & Grounded Synthesis Node
    const systemPrompt = `You are SportsAI, an elite zero-hallucination sports intelligence engine specializing in Cricket, Football, and Badminton.
You communicate just like ChatGPT: fluent, direct, articulate, and formatted in clean GitHub-style Markdown.

CRITICAL RESPONSE GUIDELINES:
1. DIRECT ANSWER: Answer the user's specific question immediately and conversationally.
2. RICH FORMATTING: Use bold markdown headers (###), clean paragraphs, bullet points, and clean comparison tables when contrasting sports, rules, or players.
3. FACTUAL GROUNDING: Ground all answers firmly in official governing rules (MCC Laws for Cricket, IFAB Laws for Football, BWF Statutes for Badminton) and compendium milestones.
4. NO ROBOTIC TEMPLATES: Never output raw JSON or recite "Domain: Cricket | Chapter:...". Speak naturally like an expert sports analyst.
5. FOLLOW-UP SUGGESTIONS: At the very end of your response, always provide 3-4 clickable topic suggestions formatted exactly like this:
Want to learn more?
↳ [Relevant follow-up topic 1]
↳ [Relevant follow-up topic 2]
↳ [Relevant follow-up topic 3]
I can also provide a ↳ [specialized breakdown or tactical guide].`;

    const userPrompt = `USER QUERY: "${state.query}"
TOPIC/SPORT: ${state.classification.sport.toUpperCase()}

VERIFIED COMPENDIUM KNOWLEDGE BASE:
${state.ragChunks.map(c => `[PAGE ${c.pageNumber}: ${c.title} (${c.chapter})]\n${c.content}\n${c.stats && Object.keys(c.stats).length > 0 ? `STATS: ${JSON.stringify(c.stats)}` : ''}`).join('\n\n')}

${state.liveContext ? `LIVE CONTEXT:\n${JSON.stringify(state.liveContext, null, 2)}` : ''}

Synthesize an engaging, authoritative, zero-hallucination response addressing the query directly.`;

    state.rawOutput = await llmService.generateCompletion({
      systemPrompt,
      userPrompt,
      ragChunks: state.ragChunks,
      sport: state.classification.sport,
      provider: llmOptions.provider,
      apiKey: llmOptions.apiKey,
      model: llmOptions.model
    });

    // Step 5: Anti-Hallucination Verification Node
    state.verification = verifyGrounding({
      content: state.rawOutput,
      ragChunks: state.ragChunks,
      query: state.query
    });

    // Step 6: Citation Synthesis & Final Packaging
    state.citations = state.ragChunks.map(c => ({
      page: c.pageNumber,
      sport: c.sport,
      chapter: c.chapter,
      title: c.title,
      quote: c.content.slice(0, 160) + '...',
      relevanceScore: c.relevanceScore
    }));

    state.finalResponse = {
      role: 'assistant',
      sport: state.classification.sport,
      content: state.rawOutput,
      grounding_score: state.verification.groundingScore,
      citations: state.citations,
      verification: state.verification,
      model_used: llmOptions.model || 'SportsGemini 3.8 RAG'
    };

    return state.finalResponse;
  }
}

export const sportsGraph = new SportsGraphPipeline();
