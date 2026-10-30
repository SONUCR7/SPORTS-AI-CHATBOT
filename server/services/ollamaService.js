/**
 * Ollama Chat & Intelligence Service
 * Implements Microsoft Phi-3 Mini (3.8B) as Primary Model and Qwen3 4B as Secondary Model.
 * Uses official Ollama Chat API (http://localhost:11434/api/chat) with streaming and fallback.
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const PRIMARY_MODEL = process.env.PRIMARY_MODEL || process.env.OLLAMA_MODEL || 'phi3:latest';
const SECONDARY_MODEL = process.env.SECONDARY_MODEL || 'qwen3:4b';

class OllamaService {
  constructor() {
    this.host = OLLAMA_HOST;
    this.primaryModel = PRIMARY_MODEL;
    this.secondaryModel = SECONDARY_MODEL;
    this.installedModels = [];
    this.lastChecked = 0;
  }

  /**
   * Check Ollama connectivity and installed model inventory
   */
  async checkStatus() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${this.host}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        return {
          connected: false,
          error: `Ollama returned HTTP ${res.status}`,
          models: [],
          primaryAvailable: false,
          secondaryAvailable: false,
          activeModel: this.primaryModel
        };
      }

      const data = await res.json();
      const models = (data.models || []).map(m => m.name);
      this.installedModels = models;
      this.lastChecked = Date.now();

      const matchedPrimary = models.find(m => m.includes('phi3') || m.includes('phi-3'));
      const matchedSecondary = models.find(m => m.includes('qwen'));

      const primaryAvailable = !!matchedPrimary;
      const secondaryAvailable = !!matchedSecondary;

      const activeModel = primaryAvailable
        ? (matchedPrimary || this.primaryModel)
        : (secondaryAvailable ? (matchedSecondary || this.secondaryModel) : (models[0] || this.primaryModel));

      return {
        connected: true,
        host: this.host,
        models,
        primaryModel: matchedPrimary || this.primaryModel,
        secondaryModel: matchedSecondary || this.secondaryModel,
        primaryAvailable,
        secondaryAvailable,
        activeModel
      };
    } catch (err) {
      return {
        connected: false,
        error: err.message,
        models: [],
        primaryAvailable: false,
        secondaryAvailable: false,
        activeModel: this.primaryModel
      };
    }
  }

  /**
   * Resolve which model to run, applying the strict priority & fallback policy:
   * 1. Primary: Phi-3 Mini
   * 2. Secondary: Qwen3 4B (if explicitly selected or if Phi-3 is missing/fails)
   */
  async resolveModel(preferredModel) {
    const status = await this.checkStatus();
    if (!status.connected) {
      return {
        model: this.primaryModel,
        fallbackOccurred: false,
        connected: false,
        error: 'Ollama is not running on ' + this.host
      };
    }

    let targetModel = preferredModel || this.primaryModel;

    // Normalize model string
    if (targetModel.includes('phi3') || targetModel === 'primary') {
      const match = status.models.find(m => m.includes('phi3') || m.includes('phi-3'));
      targetModel = match || this.primaryModel;
    } else if (targetModel.includes('qwen') || targetModel === 'secondary') {
      const match = status.models.find(m => m.includes('qwen'));
      targetModel = match || this.secondaryModel;
    }

    // Check availability
    const isTargetAvailable = status.models.some(m => 
      m === targetModel || 
      m.startsWith(targetModel.split(':')[0]) ||
      (targetModel.includes('phi3') && (m.includes('phi3') || m.includes('phi-3'))) ||
      (targetModel.includes('qwen') && m.includes('qwen'))
    );

    if (isTargetAvailable) {
      return { model: targetModel, fallbackOccurred: false, connected: true };
    }

    // If target was Phi-3 and it's missing, but Qwen is available -> fallback to Qwen
    if ((targetModel.includes('phi3') || targetModel === this.primaryModel) && status.secondaryAvailable) {
      const fallbackModel = status.models.find(m => m.includes('qwen')) || this.secondaryModel;
      console.warn(`[Ollama] Primary model ${this.primaryModel} not found. Falling back to secondary model ${fallbackModel}`);
      return {
        model: fallbackModel,
        fallbackOccurred: true,
        fallbackReason: `Phi-3 Mini is not installed. Switched to secondary model: ${fallbackModel}.`,
        connected: true
      };
    }

    // If target was Qwen and it's missing, but Phi-3 is available -> fallback to Phi-3
    if (targetModel.includes('qwen') && status.primaryAvailable) {
      const fallbackModel = status.models.find(m => m.includes('phi3') || m.includes('phi-3')) || this.primaryModel;
      return {
        model: fallbackModel,
        fallbackOccurred: true,
        fallbackReason: `Qwen is not installed. Switched to primary model: ${fallbackModel}.`,
        connected: true
      };
    }

    // Any other installed model in Ollama as universal fallback
    if (status.models.length > 0) {
      const fallbackModel = status.models[0];
      return {
        model: fallbackModel,
        fallbackOccurred: true,
        fallbackReason: `Preferred model is not installed. Using available model: ${fallbackModel}.`,
        connected: true
      };
    }

    // Neither model installed
    return {
      model: targetModel,
      fallbackOccurred: false,
      connected: true,
      error: `Neither ${this.primaryModel} nor ${this.secondaryModel} is installed in Ollama. Run: "ollama pull phi3" or "ollama pull qwen3:4b"`
    };
  }

  /**
   * Execute chat completion via official Ollama /api/chat endpoint
   */
  async chatCompletion({
    messages = [],
    preferredModel = 'phi3:latest',
    signal = null,
    temperature = 0.3,
    numPredict = 360
  }) {
    const resolution = await this.resolveModel(preferredModel);

    if (resolution.error && !resolution.connected) {
      throw new Error(`Ollama offline: ${resolution.error}. Please ensure Ollama is running on ${this.host}.`);
    }

    let activeModel = resolution.model;
    let fallbackOccurred = resolution.fallbackOccurred;
    let fallbackReason = resolution.fallbackReason || null;

    try {
      const response = await fetch(`${this.host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          messages,
          stream: false,
          options: {
            temperature,
            num_predict: numPredict
          }
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Ollama API error (${response.status}): ${await response.text()}`);
      }

      const data = await response.json();
      const content = data.message?.content || '';

      return {
        content: content.trim(),
        modelUsed: activeModel,
        fallbackOccurred,
        fallbackReason
      };
    } catch (primaryErr) {
      // If primary failed and fallback is possible to Qwen
      if (activeModel === this.primaryModel && !signal?.aborted) {
        console.warn(`[Ollama] Error running ${this.primaryModel} (${primaryErr.message}). Attempting fallback to ${this.secondaryModel}...`);
        try {
          const fallbackRes = await fetch(`${this.host}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.secondaryModel,
              messages,
              stream: false,
              options: { temperature, num_predict: numPredict }
            }),
            signal
          });

          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            return {
              content: (fbData.message?.content || '').trim(),
              modelUsed: this.secondaryModel,
              fallbackOccurred: true,
              fallbackReason: `Primary model ${this.primaryModel} failed (${primaryErr.message}). Successfully switched to ${this.secondaryModel}.`
            };
          }
        } catch (fbErr) {
          console.warn(`[Ollama] Secondary fallback also failed: ${fbErr.message}`);
        }
      }

      throw primaryErr;
    }
  }

  /**
   * Streaming chat via official Ollama /api/chat endpoint (stream: true)
   * Calls onChunk(tokenText), onFallback(info), onDone(fullContent)
   */
  async streamChat({
    messages = [],
    preferredModel = 'phi3:latest',
    signal = null,
    temperature = 0.3,
    numPredict = 360,
    onChunk = () => {},
    onFallback = () => {}
  }) {
    const resolution = await this.resolveModel(preferredModel);

    if (resolution.error && !resolution.connected) {
      throw new Error(`Ollama offline: ${resolution.error}. Please ensure Ollama is running.`);
    }

    let activeModel = resolution.model;
    let fallbackOccurred = resolution.fallbackOccurred;

    if (fallbackOccurred) {
      onFallback({
        from: preferredModel,
        to: activeModel,
        reason: resolution.fallbackReason
      });
    }

    let fullText = '';

    const executeStream = async (modelToUse) => {
      const response = await fetch(`${this.host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelToUse,
          messages,
          stream: true,
          options: {
            temperature,
            num_predict: numPredict
          }
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Ollama stream error (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            const token = parsed.message?.content || '';
            if (token) {
              fullText += token;
              onChunk(token);
            }
          } catch (e) {
            // Ignore non-json or partial lines
          }
        }
      }

      return fullText;
    };

    try {
      await executeStream(activeModel);
      return {
        content: fullText.trim(),
        modelUsed: activeModel,
        fallbackOccurred
      };
    } catch (err) {
      // If primary stream failed early and wasn't manually aborted, try Qwen fallback
      if (activeModel === this.primaryModel && !signal?.aborted && fullText.length === 0) {
        console.warn(`[Ollama Stream] Primary failed (${err.message}). Trying fallback to ${this.secondaryModel}...`);
        onFallback({
          from: this.primaryModel,
          to: this.secondaryModel,
          reason: `Primary model ${this.primaryModel} failed. Switched to ${this.secondaryModel}.`
        });
        activeModel = this.secondaryModel;
        fallbackOccurred = true;
        await executeStream(this.secondaryModel);
        return {
          content: fullText.trim(),
          modelUsed: this.secondaryModel,
          fallbackOccurred: true
        };
      }
      throw err;
    }
  }
}

export const ollamaService = new OllamaService();
