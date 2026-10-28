/**
 * SportsAI Main Client Application Logic (v3.0)
 * 3D Interactive Cyber-Sports Arena with ChatGPT-like Intelligence:
 * - Real-time Three.js 3D sports objects (bat, ball, football, shuttlecock with hover physics)
 * - Ollama Phi-3 Mini (3.8B) local LLM integration + LangGraph RAG reasoning
 * - Dynamic session auto-naming in PostgreSQL / SQLite
 * - Interactive ChatGPT follow-up suggestion chips (↳)
 * - Message action controls (Like, Dislike, Copy, Read Aloud, 3D Inspect, Grounding Verification)
 */

let currentUser = null;
let currentSessionId = null;
let activeSessions = [];
let activeModel = 'phi3:latest';
let activeQueryMode = 'chat';
let isSidebarOpen = true;

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

    // Determine active session
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

// Render Session History in Sidebar
function renderSessionList() {
  const listEl = document.getElementById('session-history-list');
  if (!listEl) return;

  if (activeSessions.length === 0) {
    listEl.innerHTML = `<div class="p-3 text-center text-gray-500 text-[11px]">No saved sports chats yet.</div>`;
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

  // Fetch messages from DB
  try {
    const res = await fetch(`/api/chat/sessions/${sessionId}/messages`);
    const data = await res.json();
    renderMessages(data.messages || []);
  } catch (err) {
    console.error('Failed to fetch session messages:', err);
  }
}

// Start New Chat Session (ChatGPT / Gemini Style)
async function startNewChatSession() {
  if (!currentUser) return;

  const currentSess = activeSessions.find(s => s.id === currentSessionId);
  const emptyState = document.getElementById('empty-state');
  const messagesList = document.getElementById('messages-list');
  const hasMessages = messagesList && messagesList.children.length > 0;

  // If already on an empty "New chat", keep and focus it without creating duplicates
  if (currentSess && (currentSess.title === 'New chat' || currentSess.title === 'New Tri-Sport Conversation') && !hasMessages) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (messagesList) messagesList.innerHTML = '';
    const titleEl = document.getElementById('session-title-text');
    if (titleEl) titleEl.innerText = 'New chat';
    const input = document.getElementById('chat-input') || document.getElementById('empty-user-input');
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
      const input = document.getElementById('chat-input') || document.getElementById('empty-user-input');
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

// Render Messages in 3D Arena with ChatGPT Features
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
      // User Message (Right-aligned user bubble)
      return `
        <div class="flex justify-end mb-4">
          <div class="user-bubble">
            ${escapeHtml(msg.content)}
          </div>
        </div>
      `;
    } else {
      // Assistant Message (Translucent cyber-card with full markdown & ChatGPT actions)
      let content = msg.content || '';
      
      // Parse markdown
      let parsedHtml = '';
      try {
        parsedHtml = marked.parse(content);
      } catch (e) {
        parsedHtml = escapeHtml(content);
      }

      const sportIcon = msg.sport === 'cricket' ? '🏏' : msg.sport === 'football' ? '⚽' : msg.sport === 'badminton' ? '🏸' : '⚡';
      const groundingScore = msg.grounding_score || 95;

      // Check for follow-up suggestions (↳ format)
      let followUpHtml = '';
      if (content.includes('↳')) {
        const lines = content.split('\n');
        const chips = [];
        lines.forEach(l => {
          if (l.includes('↳')) {
            const clean = l.replace(/^.*↳\s*/, '').replace(/[\[\]*]/g, '').trim();
            if (clean && clean.length > 2) {
              chips.push(clean);
            }
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
                  <button onclick="applySuggestion('${escapeHtml(chip).replace(/'/g, "\\'")}')" class="suggestion-chip">
                    <span>↳</span> <span>${escapeHtml(chip)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          `;
        }
      }

      return `
        <div class="flex flex-col mb-4">
          <div class="assistant-card">
            <!-- Header Bar -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 via-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs shadow-md">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/></svg>
                </div>
                <span class="font-bold text-xs text-white">SportsAI</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">Ollama Phi-3</span>
                <span class="text-xs">${sportIcon}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>${groundingScore}% Grounded</span>
                </span>
              </div>
            </div>

            <!-- Markdown Content -->
            <div class="markdown-body">
              ${parsedHtml}
            </div>

            <!-- Follow-up chips -->
            ${followUpHtml}

            <!-- ChatGPT Action Bar -->
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
              <div class="flex items-center gap-1">
                <button onclick="handleFeedback(this, 'like')" title="Helpful" class="msg-action-btn">
                  <span>👍</span>
                </button>
                <button onclick="handleFeedback(this, 'dislike')" title="Not helpful" class="msg-action-btn">
                  <span>👎</span>
                </button>
                <button onclick="copyToClipboard(this)" data-text="${escapeHtml(content)}" title="Copy response" class="msg-action-btn">
                  <span>📋</span> <span>Copy</span>
                </button>
                <button onclick="speakText(this)" data-text="${escapeHtml(content.replace(/[#*`|]/g, ''))}" title="Read aloud" class="msg-action-btn">
                  <span>🔊</span> <span>Listen</span>
                </button>
                <button onclick="open3DInspectorModal('${msg.sport || 'cricket'}')" title="Inspect in 3D" class="msg-action-btn text-cyan-400">
                  <span>🌐</span> <span>3D View</span>
                </button>
              </div>

              <button onclick="openCompendiumModal()" title="View 100-page verified RAG citations" class="text-[11px] text-cyan-400/80 hover:text-cyan-300 transition flex items-center gap-1">
                <span>📖</span> <span>Compendium Verified</span>
              </button>
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

// Send Message via LangGraph + Ollama Phi-3 Pipeline
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
      <div class="user-bubble">
        ${escapeHtml(query)}
      </div>
    </div>
  `;
  messagesList.insertAdjacentHTML('beforeend', userHtml);

  // 2. Typing indicator with animated sports icons
  const typingId = `typing_${Date.now()}`;
  const typingHtml = `
    <div id="${typingId}" class="flex items-center gap-2.5 text-xs text-cyan-300 py-3 px-4 glass-panel rounded-2xl border border-cyan-500/20 w-fit mb-4">
      <span class="animate-bounce">🏏</span>
      <span class="animate-bounce delay-100">⚽</span>
      <span class="animate-bounce delay-200">🏸</span>
      <span class="text-gray-300 ml-1">Ollama Phi-3 + LangGraph verifying with 100-page sports compendium...</span>
    </div>
  `;
  messagesList.insertAdjacentHTML('beforeend', typingHtml);

  const container = document.getElementById('messages-container');
  if (container) container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        userId: currentUser.id,
        query,
        llmOptions: {
          provider: 'ollama',
          model: activeModel
        }
      })
    });

    const data = await res.json();
    document.getElementById(typingId)?.remove();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to process message');
    }

    // Dynamic smart title update (Gemini / ChatGPT / Claude style)
    if (data.sessionTitle) {
      const sess = activeSessions.find(s => s.id === currentSessionId);
      if (sess) {
        sess.title = data.sessionTitle;
      }
      const titleEl = document.getElementById('session-title-text');
      if (titleEl) {
        titleEl.innerText = data.sessionTitle;
      }
      renderSessionList();
    }

    // Refresh entire session from DB to render formatted response & action controls
    await switchSession(currentSessionId);
    await loadUserSessions(false);

  } catch (err) {
    document.getElementById(typingId)?.remove();
    showToast(err.message, 'error');
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
  const label = modelName.includes('phi3') ? 'Ollama (Phi-3)' :
                modelName.includes('qwen') ? 'Ollama (Qwen-3)' :
                modelName.includes('Gemini') ? 'Gemini 1.5' :
                modelName.includes('Hugging') ? 'SportsLLM' : modelName;

  const headerLabel = document.getElementById('header-model-label');
  if (headerLabel) headerLabel.innerText = label;

  const dd = document.getElementById('model-dropdown');
  if (dd) dd.classList.add('hidden');

  showToast(`Active Intelligence: ${label}`, 'info');
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
    btn.innerHTML = `<span>🔊</span> <span>Listen</span>`;
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    btn.innerHTML = `<span>⏹️</span> <span>Stop</span>`;
  };
  utterance.onend = () => {
    btn.innerHTML = `<span>🔊</span> <span>Listen</span>`;
  };

  window.speechSynthesis.speak(utterance);
}

// Copy to Clipboard
function copyToClipboard(btn) {
  const text = btn.getAttribute('data-text');
  if (!text) return;
  navigator.clipboard.writeText(text);
  const oldHtml = btn.innerHTML;
  btn.innerHTML = `<span>✓</span> <span>Copied!</span>`;
  setTimeout(() => btn.innerHTML = oldHtml, 2000);
}

// Thumbs feedback
function handleFeedback(btn, type) {
  btn.classList.add('text-cyan-400');
  showToast(type === 'like' ? 'Thank you for your feedback!' : 'Feedback logged for model tuning.', 'info');
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
  const provider = document.getElementById('settings-provider')?.value || 'ollama';

  try {
    await fetch('/api/settings/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ huggingfaceApiKey: hfKey, geminiApiKey, provider })
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
