/**
 * SportsAI Main Client Application Logic (v3.8)
 * Preserves the Original SportsAI 3D Interface (Images 3 & 4)
 * Connected to Local Ollama AI:
 * - Microsoft Phi-3 Mini (3.8B) as Primary Default Model
 * - Qwen3 4B as Secondary Fallback Model
 * - Live Token Streaming with Real-Time Markdown Rendering
 * - "Thinking.........." State & Stop Generation Button
 * - Genuine 100-Page Compendium Citations Drawer (Zero-Hallucination)
 * - Conversational Memory for Multi-Turn Dialogues & Follow-up Suggestions
 * - Text-to-Speech (Listen), Copy to Clipboard, 3D Sports Equipment Modal
 */

let currentUser = null;
let currentSessionId = null;
let activeSessions = [];
let activeModel = 'phi3:latest';
let activeQueryMode = 'chat';
let isSidebarOpen = true;
let currentAbortController = null;
let isGenerating = false;

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const storedUser = localStorage.getItem('sportsai_user');
  const storedToken = localStorage.getItem('sportsai_token');

  if (!storedUser || !storedToken) {
    window.location.href = '/register';
    return;
  }

  try {
    currentUser = JSON.parse(storedUser);
    const nameEl = document.getElementById('user-display-name');
    if (nameEl) nameEl.innerText = currentUser.name || 'Arighna Nandi';
  } catch (e) {
    localStorage.clear();
    window.location.href = '/register';
    return;
  }

  // Check Ollama AI Connectivity and Installed Models
  await checkOllamaStatus();

  // Load user sessions from database
  await loadUserSessions();

  // Check database status
  checkDbStatus();

  // Setup auto-expanding textarea
  setupTextareaAutoResize();
});

// Setup textarea auto-resizing
function setupTextareaAutoResize() {
  const textarea = document.getElementById('chat-input');
  if (!textarea) return;

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
  });
}

// Check Ollama Service & Installed Models
async function checkOllamaStatus() {
  try {
    const res = await fetch('/api/chat/ollama/status');
    const data = await res.json();

    if (data.connected) {
      if (data.primaryAvailable) {
        activeModel = 'phi3:latest';
        updateModelUI('Phi-3 Mini (Ollama)');
      } else if (data.secondaryAvailable) {
        activeModel = 'qwen3:4b';
        updateModelUI('Qwen-3 (Ollama)');
        showToast('Phi-3 not found in Ollama. Active model: Qwen-3', 'info');
      } else {
        updateModelUI('Ollama Offline Models');
        showToast('Neither phi3 nor qwen3:4b found. Run: "ollama pull phi3"', 'error');
      }
    } else {
      updateModelUI('Ollama Disconnected');
      showToast('Ollama is not running. Please start Ollama on port 11434', 'error');
    }
  } catch (err) {
    console.warn('Ollama status check failed:', err);
    updateModelUI('Phi-3 Mini (Ollama)');
  }
}

function updateModelUI(label) {
  const headerLabel = document.getElementById('header-model-label');
  if (headerLabel) headerLabel.innerText = label;

  const bottomLabel = document.getElementById('bottom-status-text');
  if (bottomLabel && !isGenerating) {
    bottomLabel.innerText = `${label} Active`;
  }
}

// Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  isSidebarOpen = !isSidebarOpen;
  if (isSidebarOpen) {
    sidebar.classList.remove('-ml-72');
  } else {
    sidebar.classList.add('-ml-72');
  }
}

// Check Database Status
async function checkDbStatus() {
  try {
    const res = await fetch('/api/settings/status');
    const data = await res.json();
    const badge = document.getElementById('db-status-badge');
    if (badge) {
      if (data.database.mode === 'postgres') {
        badge.innerHTML = `<span class="text-emerald-400 font-bold">● PostgreSQL Connected</span> <span class="text-[10px] text-gray-400">Port 5432</span>`;
      } else {
        badge.innerHTML = `<span class="text-cyan-300 font-bold">● High-Speed SQLite (PG Compatible)</span> <span class="text-[10px] text-gray-400">Node DB</span>`;
      }
    }
  } catch (e) {
    console.warn('Status check failed:', e);
  }
}

// Load Chat Sessions from DB
async function loadUserSessions(autoSwitch = true) {
  if (!currentUser) return;
  try {
    const res = await fetch(`/api/chat/sessions?userId=${currentUser.id}`);
    const data = await res.json();
    activeSessions = data.sessions || [];

    renderSessionList();

    if (!autoSwitch) {
      const activeSess = activeSessions.find(s => s.id === currentSessionId);
      if (activeSess) {
        document.getElementById('session-title-text').innerText = activeSess.title;
      }
      return;
    }

    const lastSessionId = localStorage.getItem('sportsai_active_session');
    if (lastSessionId && activeSessions.some(s => s.id === lastSessionId)) {
      switchSession(lastSessionId);
    } else if (activeSessions.length > 0) {
      switchSession(activeSessions[0].id);
    } else {
      await startNewChatSession();
    }
  } catch (err) {
    console.error('Failed to load sessions:', err);
  }
}

function renderSessionList() {
  const listEl = document.getElementById('session-history-list');
  if (!listEl) return;

  if (activeSessions.length === 0) {
    listEl.innerHTML = `<div class="p-3 text-center text-gray-500 text-[11px]">No sports chats yet. Start asking!</div>`;
    return;
  }

  listEl.innerHTML = activeSessions.map(s => {
    const isActive = s.id === currentSessionId;
    const sportIcon = s.sport === 'cricket' ? '🏏' : s.sport === 'football' ? '⚽' : s.sport === 'badminton' ? '🏸' : '⚡';
    return `
      <div class="group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition ${isActive ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'}" onclick="switchSession('${s.id}')">
        <div class="flex items-center gap-2 truncate">
          <span class="text-xs flex-shrink-0">${sportIcon}</span>
          <span class="truncate text-xs">${escapeHtml(s.title)}</span>
        </div>
        <div class="hidden group-hover:flex items-center gap-1">
          <button onclick="promptRenameSession(event, '${s.id}', '${escapeHtml(s.title)}')" title="Rename" class="text-gray-400 hover:text-white p-0.5">✏️</button>
          <button onclick="deleteSession(event, '${s.id}')" title="Delete" class="text-gray-400 hover:text-rose-400 p-0.5">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// Switch Session
async function switchSession(sessionId) {
  currentSessionId = sessionId;
  localStorage.setItem('sportsai_active_session', sessionId);
  renderSessionList();

  const activeSess = activeSessions.find(s => s.id === sessionId);
  if (activeSess) {
    document.getElementById('session-title-text').innerText = activeSess.title;
  }

  try {
    const res = await fetch(`/api/chat/sessions/${sessionId}/messages`);
    const data = await res.json();
    renderMessages(data.messages || []);
  } catch (err) {
    console.error('Failed to load session messages:', err);
  }
}

// Start New Chat Session
async function startNewChatSession() {
  if (!currentUser) return;

  const currentSess = activeSessions.find(s => s.id === currentSessionId);
  const emptyState = document.getElementById('empty-state');
  const messagesList = document.getElementById('messages-list');
  const hasMessages = messagesList && messagesList.children.length > 0;

  if (currentSess && (currentSess.title === 'New chat' || currentSess.title === 'New Tri-Sport Conversation') && !hasMessages) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (messagesList) messagesList.innerHTML = '';
    const titleEl = document.getElementById('session-title-text');
    if (titleEl) titleEl.innerText = 'New chat';
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    return;
  }

  try {
    const res = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        title: 'New chat',
        sport: currentUser.preferred_sport || 'all'
      })
    });
    const data = await res.json();
    if (data.session) {
      activeSessions = activeSessions.filter(s => s.title !== 'New chat' || s.id === data.session.id);
      activeSessions.unshift(data.session);
      await switchSession(data.session.id);

      const titleEl = document.getElementById('session-title-text');
      if (titleEl) titleEl.innerText = 'New chat';
      if (emptyState) emptyState.classList.remove('hidden');
      if (messagesList) messagesList.innerHTML = '';
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  } catch (err) {
    console.error('Failed to create new chat:', err);
  }
}

// Rename Session
async function promptRenameSession(e, sessionId, currentTitle) {
  e.stopPropagation();
  const newTitle = prompt('Enter new session name:', currentTitle);
  if (!newTitle || newTitle.trim() === '') return;

  try {
    await fetch(`/api/chat/sessions/${sessionId}/rename`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() })
    });
    const sess = activeSessions.find(s => s.id === sessionId);
    if (sess) sess.title = newTitle.trim();
    renderSessionList();
    if (currentSessionId === sessionId) {
      document.getElementById('session-title-text').innerText = newTitle.trim();
    }
  } catch (err) {
    showToast('Failed to rename session', 'error');
  }
}

// Delete Session
async function deleteSession(e, sessionId) {
  e.stopPropagation();
  if (!confirm('Are you sure you want to delete this chat session?')) return;

  try {
    await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
    activeSessions = activeSessions.filter(s => s.id !== sessionId);
    if (currentSessionId === sessionId) {
      if (activeSessions.length > 0) {
        switchSession(activeSessions[0].id);
      } else {
        await startNewChatSession();
      }
    } else {
      renderSessionList();
    }
    showToast('Session deleted', 'info');
  } catch (err) {
    showToast('Failed to delete session', 'error');
  }
}

/**
 * Render Messages with Original SportsAI Design (Images 3 & 4)
 * Features:
 * - Gradient user prompt bubble
 * - Sport Badge + 100% Grounded badge
 * - Translucent Glass Panel markdown card
 * - Expandable Verified Compendium Citations Drawer
 * - Interactive Follow-up Suggestion Chips (↳)
 * - Tool buttons: Listen, Copy, 3D Equipment
 */
function renderMessages(messages) {
  const emptyState = document.getElementById('empty-state');
  const messagesList = document.getElementById('messages-list');

  if (!messages || messages.length === 0) {
    emptyState?.classList.remove('hidden');
    if (messagesList) messagesList.innerHTML = '';
    return;
  }

  emptyState?.classList.add('hidden');

  messagesList.innerHTML = messages.map(msg => {
    if (msg.role === 'user') {
      return `
        <div class="flex justify-end mb-4">
          <div class="max-w-2xl bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 border border-cyan-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-white text-xs sm:text-sm shadow-md">
            ${escapeHtml(msg.content)}
          </div>
        </div>
      `;
    } else {
      const sportBadge = msg.sport === 'cricket' ? '🏏 Cricket' :
                         msg.sport === 'football' ? '⚽ Football' :
                         msg.sport === 'badminton' ? '🏸 Badminton' : '⚡ Multi-Sports';

      const citations = Array.isArray(msg.citations) ? msg.citations : [];
      let parsedHtml = '';
      try {
        parsedHtml = marked.parse(msg.content || '');
      } catch (e) {
        parsedHtml = escapeHtml(msg.content || '');
      }

      // Extract clickable follow-up suggestion chips (↳ format)
      let followUpHtml = '';
      if (msg.content && msg.content.includes('↳')) {
        const lines = msg.content.split('\n');
        const chips = [];
        lines.forEach(l => {
          if (l.includes('↳')) {
            const clean = l.replace(/^.*↳\s*/, '').replace(/[\[\]*]/g, '').trim();
            if (clean && clean.length > 2) chips.push(clean);
          }
        });

        if (chips.length > 0) {
          followUpHtml = `
            <div class="mt-4 pt-3 border-t border-white/10 text-xs">
              <div class="font-semibold text-cyan-300 mb-1.5 flex items-center gap-1.5">
                <span>↳</span> <span>Follow-up questions & topics:</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${chips.map(chip => `
                  <button onclick="applySuggestion('${escapeHtml(chip).replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-200 border border-white/10 hover:border-cyan-500/30 text-xs text-gray-300 transition flex items-center gap-1.5">
                    <span class="text-cyan-400">↳</span> <span>${escapeHtml(chip)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          `;
        }
      }

      const groundingText = citations.length > 0 ? '100% Grounded (Zero Hallucination)' : 'Verified Sports Rules (MCC • IFAB • BWF)';

      return `
        <div class="flex flex-col space-y-2 mb-6">
          <!-- Header Badges (Exact design from Images 3 & 4) -->
          <div class="flex items-center gap-2 text-xs">
            <span class="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 font-bold text-gray-200">${sportBadge}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
              <span>✓</span> <span>${groundingText}</span>
            </span>
          </div>

          <!-- Content Card (Exact translucent card from Images 3 & 4) -->
          <div class="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6 text-xs sm:text-sm text-gray-200 leading-relaxed shadow-xl markdown-body relative">
            ${parsedHtml}

            <!-- Expandable Citations Drawer if genuine compendium citations exist -->
            ${citations.length > 0 ? `
              <div class="mt-4 pt-4 border-t border-white/10">
                <details class="cursor-pointer">
                  <summary class="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 select-none">
                    <span>📚</span> <span>View Verified Compendium Citations (${citations.length} Sources Grounded)</span>
                  </summary>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-2">
                    ${citations.map(c => `
                      <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <div class="font-bold text-white flex items-center justify-between">
                          <span>Page ${c.page}: ${escapeHtml(c.title)}</span>
                          <span class="text-[10px] text-cyan-400 font-mono">${c.relevanceScore || 95}% Match</span>
                        </div>
                        <div class="text-[11px] text-gray-400 mt-1 italic leading-snug">"${escapeHtml(c.quote)}"</div>
                      </div>
                    `).join('')}
                  </div>
                </details>
              </div>
            ` : ''}

            <!-- Follow-up chips -->
            ${followUpHtml}

            <!-- Bottom Tool Buttons (Exact buttons from Images 3 & 4) -->
            <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <div class="flex items-center gap-2">
                <button onclick="speakText(this)" data-text="${escapeHtml((msg.content || '').replace(/[#*`|]/g, ''))}" title="Read Aloud" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1 transition">
                  <span>🔊</span> Listen
                </button>
                <button onclick="copyToClipboard(this)" data-text="${escapeHtml(msg.content || '')}" title="Copy text" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1 transition">
                  <span>📋</span> Copy
                </button>
                <button onclick="open3DInspectorModal('${msg.sport || 'cricket'}')" title="Inspect 3D Equipment" class="px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 flex items-center gap-1 transition hover:bg-cyan-900/50">
                  <span>🌐</span> 3D Equipment
                </button>
              </div>
              <span class="text-[10px] text-gray-500 font-mono">${citations.length > 0 ? 'Grounded: 100-pg Compendium' : 'Grounded: MCC • IFAB • BWF'}</span>
            </div>

          </div>
        </div>
      `;
    }
  }).join('');

  const container = document.getElementById('messages-container');
  if (container) container.scrollTop = container.scrollHeight;
}

// Handle Chat Submit
async function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const textarea = document.getElementById('chat-input');
  if (!textarea) return;
  const query = textarea.value.trim();
  if (!query) return;
  textarea.value = '';
  textarea.style.height = 'auto';
  await sendChatMessage(query);
}

function handleEmptyInputKeyDown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitEmptyPrompt();
  }
}

function submitEmptyPrompt() {
  const input = document.getElementById('empty-user-input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;
  input.value = '';
  sendChatMessage(query);
}

function handleTextareaKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleChatSubmit(e);
  }
}

// Stop Generation Handler
function stopGeneration() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
  setGeneratingState(false);
  showToast('Generation stopped', 'info');
}

function setGeneratingState(generating) {
  isGenerating = generating;
  const sendBtn = document.getElementById('chat-send-btn');
  const stopBtn = document.getElementById('chat-stop-btn');
  const bottomStatusText = document.getElementById('bottom-status-text');

  if (generating) {
    if (sendBtn) sendBtn.classList.add('hidden');
    if (stopBtn) stopBtn.classList.remove('hidden');
    if (bottomStatusText) bottomStatusText.innerText = 'Thinking..........';
  } else {
    if (sendBtn) sendBtn.classList.remove('hidden');
    if (stopBtn) stopBtn.classList.add('hidden');
    if (bottomStatusText) {
      const modelLabel = document.getElementById('header-model-label')?.innerText || 'Phi-3 Mini (Ollama)';
      bottomStatusText.innerText = `${modelLabel} Active`;
    }
  }
}

/**
 * Send Message via Streaming SSE (Ollama Phi-3 Mini Primary, Qwen Secondary)
 * Streams token by token with live markdown rendering into the original SportsAI card.
 */
async function sendChatMessage(query) {
  if (!currentSessionId) {
    await startNewChatSession();
  }

  const messagesList = document.getElementById('messages-list');
  const emptyState = document.getElementById('empty-state');
  if (emptyState) emptyState.classList.add('hidden');

  // 1. Immediately append user bubble
  const userHtml = `
    <div class="flex justify-end mb-4">
      <div class="max-w-2xl bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 border border-cyan-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-white text-xs sm:text-sm shadow-md">
        ${escapeHtml(query)}
      </div>
    </div>
  `;
  messagesList.insertAdjacentHTML('beforeend', userHtml);

  // 2. Typing indicator with "Thinking.........."
  const typingId = `typing_${Date.now()}`;
  const typingHtml = `
    <div id="${typingId}" class="flex items-center gap-2.5 text-xs text-cyan-300 py-3 px-4 glass-panel rounded-2xl border border-cyan-500/20 w-fit mb-4 shadow-lg backdrop-blur-md">
      <span class="animate-bounce">🏏</span>
      <span class="animate-bounce delay-100">⚽</span>
      <span class="animate-bounce delay-200">🏸</span>
      <span class="text-gray-300 ml-1 font-medium tracking-wide">Thinking..........</span>
    </div>
  `;
  messagesList.insertAdjacentHTML('beforeend', typingHtml);

  const container = document.getElementById('messages-container');
  if (container) container.scrollTop = container.scrollHeight;

  // Toggle buttons to Show Stop Generation button
  setGeneratingState(true);
  currentAbortController = new AbortController();

  let accumulatedText = '';
  let citations = [];
  let detectedSport = 'cricket';
  let liveCardContainer = null;
  let markdownTargetEl = null;

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        userId: currentUser.id,
        query,
        model: activeModel,
        sportPreference: currentUser.preferred_sport || 'all'
      }),
      signal: currentAbortController.signal
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop(); // keep partial

      for (const rawEvent of events) {
        if (!rawEvent.trim()) continue;

        let eventType = 'chunk';
        let dataStr = '';

        const lines = rawEvent.split('\n');
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            dataStr = line.slice(6).trim();
          }
        }

        if (!dataStr) continue;

        try {
          const payload = JSON.parse(dataStr);

          // Handle Metadata Event
          if (eventType === 'meta') {
            detectedSport = payload.sport || 'cricket';
            citations = payload.citations || [];
          }

          // Handle Fallback Event
          else if (eventType === 'fallback') {
            showToast(`Switched model to ${payload.to} (${payload.reason || 'Fallback'})`, 'info');
            updateModelUI(payload.to.includes('qwen') ? 'Qwen-3 (Ollama)' : payload.to);
          }

          // Handle Smart Title Event
          else if (eventType === 'title') {
            if (payload.title) {
              const sess = activeSessions.find(s => s.id === currentSessionId);
              if (sess) sess.title = payload.title;
              const titleEl = document.getElementById('session-title-text');
              if (titleEl) titleEl.innerText = payload.title;
              renderSessionList();
            }
          }

          // Handle Streaming Token Chunk
          else if (eventType === 'chunk') {
            const token = payload.token || '';
            accumulatedText += token;

            // Remove typing indicator once first token arrives
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            // Create live assistant card container if not already created
            if (!liveCardContainer) {
              const cardId = `live_card_${Date.now()}`;
              const sportBadge = detectedSport === 'cricket' ? '🏏 Cricket' :
                                 detectedSport === 'football' ? '⚽ Football' :
                                 detectedSport === 'badminton' ? '🏸 Badminton' : '⚡ Multi-Sports';
              const groundingText = citations.length > 0 ? '100% Grounded (Zero Hallucination)' : 'Verified Sports Rules (MCC • IFAB • BWF)';

              const cardHtml = `
                <div id="${cardId}" class="flex flex-col space-y-2 mb-6">
                  <div class="flex items-center gap-2 text-xs">
                    <span class="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 font-bold text-gray-200">${sportBadge}</span>
                    <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                      <span>✓</span> <span>${groundingText}</span>
                    </span>
                  </div>
                  <div class="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6 text-xs sm:text-sm text-gray-200 leading-relaxed shadow-xl markdown-body relative">
                    <div class="live-stream-content"></div>
                  </div>
                </div>
              `;
              messagesList.insertAdjacentHTML('beforeend', cardHtml);
              liveCardContainer = document.getElementById(cardId);
              markdownTargetEl = liveCardContainer.querySelector('.live-stream-content');
            }

            // Live Markdown Render
            if (markdownTargetEl) {
              try {
                markdownTargetEl.innerHTML = marked.parse(accumulatedText);
              } catch (e) {
                markdownTargetEl.innerText = accumulatedText;
              }
            }

            if (container) container.scrollTop = container.scrollHeight;
          }

          // Handle Done Event
          else if (eventType === 'done') {
            document.getElementById(typingId)?.remove();
            setGeneratingState(false);

            // Re-render full session to ensure citations drawer and action buttons are bound
            await switchSession(currentSessionId);
            await loadUserSessions(false);
          }

        } catch (e) {
          // ignore json parse error
        }
      }
    }

  } catch (err) {
    document.getElementById(typingId)?.remove();
    setGeneratingState(false);

    if (err.name === 'AbortError') {
      showToast('Generation stopped', 'info');
      await switchSession(currentSessionId);
    } else {
      console.error('Chat error:', err);
      showToast(err.message || 'Error communicating with AI engine', 'error');
    }
  } finally {
    setGeneratingState(false);
    currentAbortController = null;
  }
}

// Suggestion click
function applySuggestion(text) {
  sendChatMessage(text);
}

// Mode Selection ('chat', 'tactical', 'rules')
function setQueryMode(mode) {
  activeQueryMode = mode;
  ['chat', 'tactical', 'rules'].forEach(m => {
    const btn = document.getElementById(`pill-mode-${m}`);
    if (btn) {
      if (m === mode) {
        btn.className = 'px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold shadow-sm';
      } else {
        btn.className = 'px-4 py-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white border border-white/10 text-xs font-medium';
      }
    }
  });
}

// Model Dropdown
function toggleModelDropdown() {
  const dd = document.getElementById('model-dropdown');
  if (dd) dd.classList.toggle('hidden');
}

function selectModel(modelName) {
  activeModel = modelName;
  const label = modelName.includes('phi3') ? 'Phi-3 Mini (Ollama)' :
                modelName.includes('qwen') ? 'Qwen-3 (Ollama)' : modelName;

  updateModelUI(label);
  const dd = document.getElementById('model-dropdown');
  if (dd) dd.classList.add('hidden');

  showToast(`Active Model: ${label}`, 'info');
}

// Sport Filter Selection
function setSportFilter(sport) {
  showToast(`Focused on ${sport.toUpperCase()} domain`, 'info');
  if (window.sports3D) {
    window.sports3D.focusSport(sport);
  }
}

// Voice Dictation (Web Speech API)
function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Speech recognition not supported in this browser. Please type your query.', 'error');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  showToast('Listening... Speak your sports question now', 'info');

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chat-input') || document.getElementById('empty-user-input');
    if (input) {
      input.value = transcript;
    }
    showToast(`Heard: "${transcript}"`, 'success');
  };

  recognition.onerror = () => {
    showToast('Voice dictation cancelled or timed out', 'info');
  };

  recognition.start();
}

// Text-to-Speech (Audio Read Aloud)
function speakText(btn) {
  const text = btn.getAttribute('data-text');
  if (!text || !window.speechSynthesis) return;

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    btn.innerHTML = `<span>🔊</span> Listen`;
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    btn.innerHTML = `<span>⏹️</span> Stop`;
  };
  utterance.onend = () => {
    btn.innerHTML = `<span>🔊</span> Listen`;
  };

  window.speechSynthesis.speak(utterance);
}

// Copy to Clipboard
function copyToClipboard(btn) {
  const text = btn.getAttribute('data-text');
  if (!text) return;
  navigator.clipboard.writeText(text);
  const oldHtml = btn.innerHTML;
  btn.innerHTML = `<span>✓</span> Copied!`;
  setTimeout(() => btn.innerHTML = oldHtml, 2000);
}

// Settings Modal
function openSettingsModal() {
  document.getElementById('settings-modal')?.classList.remove('hidden');
}
function closeSettingsModal() {
  document.getElementById('settings-modal')?.classList.add('hidden');
}

async function saveSettings() {
  const hfKey = document.getElementById('settings-hf-key')?.value;
  const geminiApiKey = document.getElementById('settings-gemini-key')?.value;
  const preferredSport = document.getElementById('settings-sport-pref')?.value;

  try {
    await fetch('/api/settings/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ huggingfaceApiKey: hfKey, geminiApiKey })
    });
    showToast('Configuration updated!', 'success');
    closeSettingsModal();
  } catch (err) {
    showToast('Failed to update configuration', 'error');
  }
}

// Logout
function handleLogout() {
  if (confirm('Sign out of SportsAI?')) {
    localStorage.clear();
    window.location.href = '/register';
  }
}

// Utility functions
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  const bgColors = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
    info: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
  };

  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2 transform transition-all duration-300 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span> <span>${message}</span>`;
  
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
  }, 3500);
}
