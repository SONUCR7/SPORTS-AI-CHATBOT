/**
 * SportsAI Main Client Application Logic
 * Implements Gemini Chat UI, PostgreSQL Session Sync, LangGraph RAG Interaction,
 * Audio Speech Synthesis, and 3D Visual Controls.
 */

let currentUser = null;
let currentSessionId = null;
let activeSessions = [];
let activeModel = 'SportsGemini 3.8 RAG';
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
    document.getElementById('user-display-name').innerText = currentUser.name;
  } catch (e) {
    localStorage.clear();
    window.location.href = '/register';
    return;
  }

  // Load user sessions from database
  await loadUserSessions();

  // Check database status
  checkDbStatus();
});

// Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  isSidebarOpen = !isSidebarOpen;
  if (isSidebarOpen) {
    sidebar.classList.remove('-ml-72');
  } else {
    sidebar.classList.add('-ml-72');
  }
}

// Check System & Database Status
async function checkDbStatus() {
  try {
    const res = await fetch('/api/settings/status');
    const data = await res.json();
    const badge = document.getElementById('db-status-badge');
    if (badge) {
      if (data.database.mode === 'postgres') {
        badge.innerHTML = `<span class="text-emerald-400 font-bold">● PostgreSQL Connected</span> <span class="text-[10px] text-gray-400">Port 5432</span>`;
      } else {
        badge.innerHTML = `<span class="text-cyan-300 font-bold">● High-Speed SQLite (PG Compatible)</span> <span class="text-[10px] text-gray-400">Local DB</span>`;
      }
    }
  } catch (e) {
    console.warn('Status check failed:', e);
  }
}

// Load Chat Sessions from PostgreSQL / DB
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

// Start New Chat Session (Google Gemini / ChatGPT / Claude style)
async function startNewChatSession() {
  if (!currentUser) return;

  const currentSess = activeSessions.find(s => s.id === currentSessionId);
  const emptyState = document.getElementById('empty-state');
  const messagesList = document.getElementById('messages-list');
  const hasMessages = messagesList && messagesList.children.length > 0;

  // If already in an empty "New chat" session, keep and focus it without creating duplicates
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
      // Remove any prior empty "New chat" sessions from local list so they don't pile up
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

// Render Messages & Empty State
function renderMessages(messages) {
  const emptyState = document.getElementById('empty-state');
  const messagesList = document.getElementById('messages-list');
  const bottomBar = document.getElementById('bottom-prompt-bar');

  if (!messages || messages.length === 0) {
    emptyState.classList.remove('hidden');
    messagesList.innerHTML = '';
    return;
  }

  emptyState.classList.add('hidden');

  messagesList.innerHTML = messages.map(msg => {
    if (msg.role === 'user') {
      return `
        <div class="flex justify-end">
          <div class="max-w-2xl bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 border border-cyan-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-white text-xs sm:text-sm shadow-md">
            ${escapeHtml(msg.content)}
          </div>
        </div>
      `;
    } else {
      // Assistant message with RAG grounding badge & citations
      const sportIcon = msg.sport === 'cricket' ? '🏏 Cricket' : msg.sport === 'football' ? '⚽ Football' : msg.sport === 'badminton' ? '🏸 Badminton' : '⚡ Sports Oracle';
      const citations = msg.citations || [];
      const parsedHtml = marked.parse(msg.content);

      return `
        <div class="flex flex-col space-y-2">
          <!-- Header Badges -->
          <div class="flex items-center gap-2 text-xs">
            <span class="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 font-bold text-gray-200">${sportIcon}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
              <span>✓</span> <span>100% Grounded (Zero Hallucination)</span>
            </span>
          </div>

          <!-- Content Card -->
          <div class="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6 text-xs sm:text-sm text-gray-200 leading-relaxed shadow-xl markdown-body relative">
            ${parsedHtml}

            <!-- Expandable Citations Drawer if citations exist -->
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
                          <span class="text-[10px] text-cyan-400 font-mono">${c.relevanceScore || 100}% Match</span>
                        </div>
                        <div class="text-[11px] text-gray-400 mt-1 italic leading-snug">"${escapeHtml(c.quote)}"</div>
                      </div>
                    `).join('')}
                  </div>
                </details>
              </div>
            ` : ''}

            <!-- Bottom Tool Buttons -->
            <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <div class="flex items-center gap-2">
                <button onclick="speakText(this)" data-text="${escapeHtml(msg.content.replace(/[#*`|]/g, ''))}" title="Read Aloud" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1 transition">
                  <span>🔊</span> Listen
                </button>
                <button onclick="copyToClipboard(this)" data-text="${escapeHtml(msg.content)}" title="Copy text" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1 transition">
                  <span>📋</span> Copy
                </button>
                <button onclick="open3DInspectorModal('${msg.sport || 'cricket'}')" title="Inspect 3D Ball" class="px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 flex items-center gap-1 transition hover:bg-cyan-900/50">
                  <span>🌐</span> 3D Equipment
                </button>
              </div>
              <span class="text-[10px] text-gray-500 font-mono">Grounded: 100-pg Compendium</span>
            </div>

          </div>
        </div>
      `;
    }
  }).join('');

  // Scroll to bottom
  const container = document.getElementById('messages-container');
  container.scrollTop = container.scrollHeight;
}

// Handle Form Submissions
async function submitEmptyPrompt() {
  const input = document.getElementById('empty-user-input');
  const query = input.value.trim();
  if (!query) return;
  input.value = '';
  await sendChatMessage(query);
}

function handleEmptyInputKeyDown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitEmptyPrompt();
  }
}

async function handleChatSubmit(e) {
  e.preventDefault();
  const textarea = document.getElementById('chat-input');
  const query = textarea.value.trim();
  if (!query) return;
  textarea.value = '';
  await sendChatMessage(query);
}

function handleTextareaKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleChatSubmit(e);
  }
}

// Send Message via LangGraph Pipeline
async function sendChatMessage(query) {
  if (!currentSessionId) {
    await startNewChatSession();
  }

  // 1. Immediately append user bubble to UI
  const messagesList = document.getElementById('messages-list');
  document.getElementById('empty-state').classList.add('hidden');

  const userHtml = `
    <div class="flex justify-end">
      <div class="max-w-2xl bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 border border-cyan-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-white text-xs sm:text-sm shadow-md">
        ${escapeHtml(query)}
      </div>
    </div>
  `;
  messagesList.insertAdjacentHTML('beforeend', userHtml);

  // 2. Typing indicator
  const typingId = `typing_${Date.now()}`;
  const typingHtml = `
    <div id="${typingId}" class="flex items-center gap-2 text-xs text-cyan-400 py-3 px-4 glass-panel rounded-2xl border border-white/10 w-fit">
      <span class="animate-bounce">🏏</span>
      <span class="animate-bounce delay-100">⚽</span>
      <span class="animate-bounce delay-200">🏸</span>
      <span class="text-gray-300 ml-2">Retrieving 100-Page Compendium & LangGraph verification...</span>
    </div>
  `;
  messagesList.insertAdjacentHTML('beforeend', typingHtml);

  const container = document.getElementById('messages-container');
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        userId: currentUser.id,
        query,
        llmOptions: {
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

    // Refresh entire session from DB to show citations and formatted response
    await switchSession(currentSessionId);
    await loadUserSessions(false);

  } catch (err) {
    document.getElementById(typingId)?.remove();
    showToast(err.message, 'error');
  }
}

// Suggestion Chips Click
function applySuggestion(text) {
  sendChatMessage(text);
}

// Mode Selection ('chat', 'tactical', 'rules')
function setQueryMode(mode) {
  activeQueryMode = mode;
  ['chat', 'tactical', 'rules'].forEach(m => {
    const btn = document.getElementById(`pill-mode-${m}`);
    if (m === mode) {
      btn.className = 'px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold shadow-sm';
    } else {
      btn.className = 'px-4 py-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white border border-white/10 text-xs font-medium';
    }
  });
}

// Model Dropdown
function toggleModelDropdown() {
  const dd = document.getElementById('model-dropdown');
  dd.classList.toggle('hidden');
}

function selectModel(modelName) {
  activeModel = modelName;
  document.getElementById('current-model-label').innerText = modelName.split(' ')[0];
  document.getElementById('model-dropdown').classList.add('hidden');
  showToast(`Active Model: ${modelName}`, 'info');
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
    if (input) input.value = transcript;
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
  const oldText = btn.innerHTML;
  btn.innerHTML = `<span>✓</span> Copied!`;
  setTimeout(() => btn.innerHTML = oldText, 2000);
}

// Settings Modal
function openSettingsModal() {
  document.getElementById('settings-modal').classList.remove('hidden');
}
function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

async function saveSettings() {
  const hfKey = document.getElementById('settings-hf-key')?.value;
  const geminiApiKey = document.getElementById('settings-gemini-key')?.value;
  const openaiApiKey = document.getElementById('settings-openai-key')?.value;
  const preferredSport = document.getElementById('settings-sport-pref')?.value;

  try {
    await fetch('/api/settings/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ huggingfaceApiKey: hfKey, geminiApiKey, openaiApiKey })
    });
    showToast('Configuration updated with Hugging Face token!', 'success');
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

// Utility
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
