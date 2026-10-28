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
    const sportFilter = ['cricket', 'football', 'badminton'].includes(state.classification.sport)
      ? state.classification.sport
      : null;

    state.ragChunks = sportsRagService.retrieve({
      query: state.query,
      sportFilter,
      topK: 4
    });

    // Step 3: Live Sports Enrichment Node
    const isLiveQuery = /live|current|ranking|standings|upcoming|champion|2024|2025|points table/i.test(state.query);
    if (isLiveQuery) {
      state.liveContext = liveSportsApi.getLiveSportsContext(state.classification.sport);
    }

    // Step 4: Strict Prompt & Grounded Synthesis Node
    const systemPrompt = `You are SportsAI, an authoritative, zero-hallucination sports engine specializing strictly in Cricket, Football, and Badminton.
Your knowledge is grounded directly in an official 100-page Sports Compendium.

CRITICAL INSTRUCTIONS:
1. NEVER hallucinate statistics, rules, or player achievements.
2. Ground all answers firmly in the provided verified compendium passages.
3. Structure your response with markdown headers, comparison tables, bullet points, and exact Page citations.
4. If a statistic is asked that is not in the knowledge base, state the factual bounds rather than guessing.
5. Emphasize tactical acumen, biomechanics, and official laws (MCC for Cricket, IFAB for Football, BWF for Badminton).`;

    const userPrompt = `USER QUERY: "${state.query}"
IDENTIFIED SPORT: ${state.classification.sport.toUpperCase()}

RELEVANT COMPENDIUM RETRIEVALS (100-Page Knowledge Base):
${state.ragChunks.map(c => `[PAGE ${c.pageNumber}: ${c.title} (${c.chapter})]\n${c.content}\nSTATISTICS: ${JSON.stringify(c.stats)}`).join('\n\n')}

${state.liveContext ? `LIVE CONTEXT:\n${JSON.stringify(state.liveContext, null, 2)}` : ''}

Synthesize an authoritative, rich, zero-hallucination response addressing the query.`;

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
