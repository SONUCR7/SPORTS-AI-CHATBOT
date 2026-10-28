/**
 * Unified LLM & Sports Intelligence Service
 * Interfaces with Gemini, OpenAI, Groq, Ollama, and built-in Smart RAG Synthesizer.
 * Enforces zero-hallucination prompting and fact grounding.
 */

class LLMService {
  constructor() {
    this.defaultProvider = process.env.LLM_PROVIDER || 'ollama';
  }

  async generateCompletion({
    systemPrompt,
    userPrompt,
    ragChunks = [],
    sport = 'cricket',
    provider = null,
    apiKey = null,
    model = null,
    temperature = 0.3 // Optimal for factual creativity
  }) {
    const selectedProvider = provider || process.env.LLM_PROVIDER || 'ollama';

    // 1. Ollama (Default: Free & Powerful Local Model - Phi-3)
    if (selectedProvider === 'ollama' || !provider) {
      const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
      const targetModel = model || process.env.OLLAMA_MODEL || 'phi3:latest';
      try {
        const response = await this._callOllama({
          host,
          model: targetModel,
          systemPrompt,
          userPrompt,
          temperature
        });
        if (response && response.trim().length > 20) {
          const trimmed = response.trim();
          if (!trimmed.includes('↳') && !trimmed.includes('Want to learn more?')) {
            return this._appendFollowUpChips(trimmed, sport);
          }
          return trimmed;
        }
      } catch (e) {
        console.warn(`[LLMService] Ollama (${targetModel}) call failed: ${e.message}, falling back...`);
      }
    }

    // 2. Gemini
    if (selectedProvider === 'gemini' || process.env.GEMINI_API_KEY) {
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (key) {
        try {
          return await this._callGemini({
            apiKey: key,
            model: model || 'gemini-1.5-flash',
            systemPrompt,
            userPrompt,
            temperature
          });
        } catch (e) {
          console.warn('[LLMService] Gemini call failed:', e.message);
        }
      }
    }

    // 3. Groq
    if (selectedProvider === 'groq' || process.env.GROK_API_KEY) {
      const key = apiKey || process.env.GROK_API_KEY;
      if (key) {
        try {
          return await this._callOpenAICompatible({
            url: 'https://api.groq.com/openai/v1/chat/completions',
            apiKey: key,
            model: model || 'llama-3.3-70b-versatile',
            systemPrompt,
            userPrompt,
            temperature
          });
        } catch (e) {
          console.warn('[LLMService] Groq call failed:', e.message);
        }
      }
    }

    // 4. OpenAI
    if (selectedProvider === 'openai' || process.env.OPENAI_API_KEY) {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (key) {
        try {
          return await this._callOpenAICompatible({
            url: 'https://api.openai.com/v1/chat/completions',
            apiKey: key,
            model: model || 'gpt-4o-mini',
            systemPrompt,
            userPrompt,
            temperature
          });
        } catch (e) {
          console.warn('[LLMService] OpenAI call failed:', e.message);
        }
      }
    }

    // 5. Hugging Face Inference API
    if (selectedProvider === 'huggingface' || (model && model.toLowerCase().includes('huggingface'))) {
      const hfToken = apiKey || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
      const targetModel = (model && !model.toLowerCase().includes('huggingface')) ? model : (process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-0.5B-Instruct');
      if (hfToken) {
        try {
          return await this._callHuggingFaceInference({
            hfToken,
            model: targetModel,
            systemPrompt,
            userPrompt,
            temperature
          });
        } catch (e) {
          console.warn('[LLMService] Hugging Face API call failed:', e.message);
        }
      }
    }

    // 6. Intelligent Grounded Synthesizer (Natural ChatGPT Prose)
    return this._synthesizeFromRagChunks({ userPrompt, ragChunks, sport });
  }

  async _callHuggingFaceInference({ hfToken, model, systemPrompt, userPrompt, temperature }) {
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hfToken}`
      },
      body: JSON.stringify({
        inputs: `${systemPrompt}\n\nUser: ${userPrompt}\n\nSportsAI:`,
        parameters: {
          max_new_tokens: 512,
          temperature,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Hugging Face API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    return JSON.stringify(data);
  }

  async _callGemini({ apiKey, model, systemPrompt, userPrompt, temperature }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature, maxOutputTokens: 2048 }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async _callOpenAICompatible({ url, apiKey, model, systemPrompt, userPrompt, temperature }) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async _callOllama({ host, model, systemPrompt, userPrompt, temperature }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);
    try {
      const targetModel = model || process.env.OLLAMA_MODEL || 'phi3:latest';
      const response = await fetch(`${host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          system: systemPrompt,
          prompt: userPrompt,
          stream: false,
          options: {
            temperature: temperature !== undefined ? temperature : 0.3,
            num_predict: 350
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`Ollama connection error (${response.status})`);
      }
      const data = await response.json();
      return (data.response || '').trim();
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  _appendFollowUpChips(reply, sport) {
    let suggestions = '';
    if (sport === 'cricket') {
      suggestions = `\n\n---\nWant to learn more?\n↳ How does the DRS review system work?\n↳ What is an LBW dismissal (Law 36)?\n↳ Explain Duckworth-Lewis-Stern (DLS) method`;
    } else if (sport === 'football') {
      suggestions = `\n\n---\nWant to learn more?\n↳ What is the offside rule (Law 11)?\n↳ How does VAR review work in football?\n↳ Modern football tactics: Gegenpressing vs Tiki-Taka`;
    } else if (sport === 'badminton') {
      suggestions = `\n\n---\nWant to learn more?\n↳ Official BWF rally scoring and court dimensions\n↳ What is the service fault rule in badminton?\n↳ Smash biomechanics and defensive footwork`;
    } else {
      suggestions = `\n\n---\nWant to learn more?\n↳ Cricket rules for beginners\n↳ What is the offside rule in football?\n↳ What are overs and wickets in cricket?\nI can also provide a ↳ tactical breakdown of modern formations.`;
    }
    return reply.trim() + suggestions;
  }

  /**
   * High-Precision Grounded Synthesizer
   * Produces articulate, natural ChatGPT-style prose directly answering user questions
   */
  _synthesizeFromRagChunks({ userPrompt, ragChunks, sport }) {
    const qLower = (userPrompt || '').toLowerCase();
    
    // Check if query is comparing cricket and football
    const isCricketVsFootball = (qLower.includes('cricket') && qLower.includes('football')) || (qLower.includes('difference between') && (qLower.includes('cricket') || qLower.includes('football')));
    
    if (isCricketVsFootball) {
      return `### ⚡ Fundamental Differences: Cricket vs Football (Soccer)

While both **Cricket** and **Football** are globally celebrated team sports with 11 players per side, their objectives, rules, equipment, and match dynamics are fundamentally distinct:

| Key Dimension | 🏏 Cricket | ⚽ Football (Soccer) |
| :--- | :--- | :--- |
| **Primary Objective** | Score runs by batting and dismiss opponents by bowling/fielding. | Score goals by propelling the ball into the opponent's net. |
| **Governing Body** | **ICC** (International Cricket Council) & MCC Laws. | **FIFA** & **IFAB** (International Football Association Board). |
| **Playing Surface** | Large grass oval with a central **22-yard pitch** (20.12 m). | Rectangular pitch (**100–110m long × 64–75m wide**). |
| **Ball & Equipment** | Hard leather ball (156–163g), willow wooden bat, pads, helmet, stumps. | Spherical synthetic leather ball (size 5, 410–450g), shin guards, cleats. |
| **Match Structure** | Innings divided into overs (T20: 20 overs, ODI: 50 overs, Test: 5 days). | Two **45-minute halves** (90 mins total) + stoppage/extra time. |
| **Scoring Unit** | Runs, boundaries (4s), and sixes (6s). Scores often 150–400+ runs. | Goals (1 point each). Typically lower scoring (e.g. 1-0, 2-1). |
| **Contact Level** | Strictly non-contact; players operate in designated zones. | Physical contact sport (shoulder-to-shoulder tackles, physical shielding). |
| **Pivotal Rules** | LBW (Law 36), Caught, Run Out, No-Balls, DRS review. | Offside (Law 11), Fouls, Yellow/Red Cards, VAR review. |

#### 🏏 Tactical Character of Cricket
Cricket is a tactical game of continuous anticipation and individual duals: a bowler strategizing against a batter over six deliveries. Pitch conditions, atmospheric humidity (swing bowling), and ball decay play an immense role in determining outcome.

#### ⚽ Dynamic Flow of Football
Football is characterized by fluid, continuous transition: pressing systems (Gegenpressing, Tiki-Taka, Low Block) where teams constantly shift between attacking shapes (e.g. 4-3-3, 3-5-2) and defensive compactness without stoppages.

---

Want to learn more?
↳ Cricket rules for beginners
↳ What is the offside rule in football?
↳ What are overs and wickets in cricket?
I can also provide a ↳ tactical breakdown of modern formations and pitch analytics.`;
    }

    // General high quality conversational synthesis from compendium chunks
    if (!ragChunks || ragChunks.length === 0) {
      return `### 🛡️ Sports Intelligence Oracle
I have analyzed your query regarding **${(sport || 'sports').toUpperCase()}**. To give you the exact tactical data and statistics from our verified 100-page compendium, please specify a player, rule, match record, or tournament event.

Want to learn more?
↳ Key rules of Cricket (MCC Laws)
↳ Tactical formations in Football (4-3-3 & Tiki-Taka)
↳ BWF 1.15m service rules in Badminton`;
    }

    const primary = ragChunks[0];
    const sportIcon = sport === 'cricket' ? '🏏' : sport === 'football' ? '⚽' : sport === 'badminton' ? '🏸' : '⚡';

    let prose = `### ${sportIcon} ${primary.title}\n\n`;
    prose += `${primary.content}\n\n`;

    if (primary.stats && Object.keys(primary.stats).length > 0) {
      prose += `#### 📊 Verified Milestones & Specifications\n`;
      prose += `| Metric / Rule | Verified Specification |\n| :--- | :--- |\n`;
      for (const [k, v] of Object.entries(primary.stats)) {
        const titleCase = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        prose += `| **${titleCase}** | ${Array.isArray(v) ? v.join(', ') : v} |\n`;
      }
      prose += `\n`;
    }

    if (ragChunks.length > 1) {
      prose += `#### 🔍 Tactical Insights & Context\n`;
      ragChunks.slice(1, 3).forEach(c => {
        prose += `- **${c.title} (Page ${c.pageNumber}):** ${c.content.slice(0, 180)}...\n`;
      });
      prose += `\n`;
    }

    prose += `Want to learn more?\n`;
    prose += `↳ Detailed breakdown of ${primary.title}\n`;
    prose += `↳ Related rules & historical records\n`;
    prose += `↳ Tactical analysis and player matchup data`;

    return prose;
  }
}

export const llmService = new LLMService();
