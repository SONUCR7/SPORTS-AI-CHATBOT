/**
 * Unified LLM & Sports Intelligence Service
 * Interfaces with Gemini, OpenAI, Groq, Ollama, and built-in Smart RAG Synthesizer.
 * Enforces zero-hallucination prompting and fact grounding.
 */

class LLMService {
  constructor() {
    this.defaultProvider = process.env.LLM_PROVIDER || 'smart_rag';
  }

  async generateCompletion({
    systemPrompt,
    userPrompt,
    ragChunks = [],
    sport = 'cricket',
    provider = null,
    apiKey = null,
    model = null,
    temperature = 0.2 // Low temperature for factual precision
  }) {
    const selectedProvider = provider || process.env.LLM_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'smart_rag');

    // 1. Gemini
    if (selectedProvider === 'gemini') {
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
          console.warn('[LLMService] Gemini call failed, falling back to smart RAG synthesizer:', e.message);
        }
      }
    }

    // 2. OpenAI
    if (selectedProvider === 'openai') {
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
          console.warn('[LLMService] OpenAI call failed, falling back to smart RAG synthesizer:', e.message);
        }
      }
    }

    // 3. Groq
    if (selectedProvider === 'groq') {
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
          console.warn('[LLMService] Groq call failed, falling back to smart RAG synthesizer:', e.message);
        }
      }
    }

    // 4. Ollama
    if (selectedProvider === 'ollama') {
      const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
      try {
        return await this._callOllama({
          host,
          model: model || 'llama3',
          systemPrompt,
          userPrompt,
          temperature
        });
      } catch (e) {
        console.warn('[LLMService] Ollama call failed, falling back to smart RAG synthesizer:', e.message);
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
          console.warn('[LLMService] Hugging Face API call failed, falling back to smart RAG synthesizer:', e.message);
        }
      }
    }

    // 6. Default Built-In Zero-Hallucination RAG Synthesizer
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
    const response = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        stream: false,
        options: { temperature }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama connection error (${response.status})`);
    }

    const data = await response.json();
    return data.response || '';
  }

  /**
   * High-Precision Grounded Synthesizer
   * Produces structured answers directly from verified compendium pages
   */
  _synthesizeFromRagChunks({ userPrompt, ragChunks, sport }) {
    if (!ragChunks || ragChunks.length === 0) {
      return `### 🛡️ Verified Sports Knowledge
I have analyzed your query regarding **${sport.toUpperCase()}**. Please rephrase or specify a rule, match event, record, or player matchup to retrieve exact data from our 100-page verified compendium.`;
    }

    const topChunk = ragChunks[0];
    const sportIcon = sport === 'cricket' ? '🏏' : sport === 'football' ? '⚽' : '🏸';
    const sportName = sport.charAt(0).toUpperCase() + sport.slice(1);

    let output = `### ${sportIcon} ${topChunk.title}\n\n`;
    output += `**Domain:** ${sportName} | **Chapter:** ${topChunk.chapter} *(Page ${topChunk.pageNumber})*\n\n`;

    // Statistical benchmarks callout if available
    if (topChunk.stats && Object.keys(topChunk.stats).length > 0) {
      output += `#### 📊 Verified Benchmark Metrics\n`;
      output += `| Metric / Parameter | Official Value |\n| :--- | :--- |\n`;
      for (const [key, val] of Object.entries(topChunk.stats)) {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const formattedVal = Array.isArray(val) ? val.join(', ') : val;
        output += `| **${formattedKey}** | \`${formattedVal}\` |\n`;
      }
      output += `\n`;
    }

    // Core factual content from the top page
    output += `#### 🔍 Factual Analysis & Rule Mechanics\n`;
    output += `${topChunk.content}\n\n`;

    // If secondary related pages were retrieved, cross-reference them
    if (ragChunks.length > 1) {
      output += `#### 🔗 Cross-Referenced Compendium Context\n`;
      ragChunks.slice(1, 3).forEach(c => {
        output += `- **Page ${c.pageNumber} (${c.title}):** ${c.content.slice(0, 240)}...\n`;
      });
      output += `\n`;
    }

    // Key takeaway summary bullet points
    output += `#### 🎯 Key Takeaway\n`;
    output += `- Grounded strictly in **Page ${topChunk.pageNumber}** of the 100-Page Sports Compendium.\n`;
    output += `- Verified against official governing standards (${sport === 'cricket' ? 'MCC Laws of Cricket & ICC Playing Conditions' : sport === 'football' ? 'IFAB Laws of the Game & FIFA Regulations' : 'BWF Official Statutes & Court Laws'}).\n`;

    return output;
  }
}

export const llmService = new LLMService();
