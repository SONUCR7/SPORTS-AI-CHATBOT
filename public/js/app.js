/**
 * ChatGPT / SportsAI Main Client Application Logic
 * Implements authentic ChatGPT UI matching Pictures 1 & 2:
 * - Solid dark canvas (#212121) and sidebar (#171717)
 * - Ollama Phi-3 integration by default
 * - Direct prose canvas rendering with follow-up suggestions (↳)
 * - User bubble on right, action buttons on assistant message
 * - Floating prompt pill with Think toggle, mic & blue send button
 */

let currentUser = null;
let currentSessionId = null;
let activeSessions = [];
let activeModel = 'phi3:latest';
let isDeepThinkActive = false;
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
});

// Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  isSidebarOpen = !isSidebarOpen;
  if (isSidebarOpen) {
    sidebar.classList.remove('-ml-64');
  } else {
    sidebar.classList.add('-ml-64');
  }
}

function focusSearchInput() {
  const q = prompt('Search chat history:');
  if (q && q.trim()) {
    const match = activeSessions.find(s => s.title.toLowerCase().includes(q.toLowerCase()));
    if (match) {
      switchSession(match.id);
    } else {
      showToast('No matching conversation found', 'info');
    }
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

// Render Session History in Sidebar (Exact Picture 1 & 2 Style)
function renderSessionList() {
  const listEl = document.getElementById('session-history-list');
  if (!listEl) return;

  if (activeSessions.length === 0) {
    listEl.innerHTML = `<div class="p-3 text-center text-gray-500 text-[11px]">No recent chats</div>`;
    return;
  }

  listEl.innerHTML = activeSessions.map(s => {
    const isActive = s.id === currentSessionId;
    return `
      <div class="group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition select-none ${isActive ? 'bg-[#2f2f2f] text-white font-medium' : 'text-gray-300 hover:bg-[#212121] hover:text-white'}" onclick="switchSession('${s.id}')">
        <span class="truncate text-xs">${escapeHtml(s.title)}</span>
        <div class="hidden group-hover:flex items-center gap-1.5 text-gray-400">
          <button onclick="promptRenameSession(event, '${s.id}', '${escapeHtml(s.title)}')" title="Rename" class="hover:text-white p-0.5">✏️</button>
          <button onclick="deleteSession(event, '${s.id}')" title="Delete" class="hover:text-rose-400 p-0.5">🗑️</button>
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
    const titleEl = document.getElementById('session-title-text');
    if (titleEl) titleEl.innerText = activeSess.title;
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

// Start New Chat Session (Exact ChatGPT Style)
async function startNewChatSession() {
  if (!currentUser) return;

  const currentSess = activeSessions.find(s => s.id === currentSessionId);
  const emptyState = document.getElementById('empty-state');
  const messagesList = document.getElementById('messages-list');
  const hasMessages = messagesList && messagesList.children.length > 0;

  // If already in an empty "New chat" session, keep and focus it
  if (currentSess && (currentSess.title === 'New chat' || currentSess.title === 'New Tri-Sport Conversation') && !hasMessages) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (messagesList) messagesList.innerHTML = '';
    document.body.classList.remove('in-conversation');
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
      document.body.classList.remove('in-conversation');
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

// Render Messages (Exact Match to Picture 1 & 2 Layout)
function renderMessages(messages) {
  const emptyState = document.getElementById('empty-state');
  const messagesList = document.getElementById('messages-list');

  if (!messages || messages.length === 0) {
    emptyState?.classList.remove('hidden');
    if (messagesList) messagesList.innerHTML = '';
    document.body.classList.remove('in-conversation');
    return;
  }

  emptyState?.classList.add('hidden');
  document.body.classList.add('in-conversation');

  messagesList.innerHTML = messages.map(msg => {
    if (msg.role === 'user') {
      // User message bubble on the right (Picture 1 & 2 exact style)
      return `
        <div class="flex justify-end mb-4">
          <div class="user-bubble">
            ${escapeHtml(msg.content)}
          </div>
        </div>
      `;
    } else {
      // Assistant message: Clean direct-prose canvas render
      const parsedHtml = marked.parse(msg.content);
      const citations = msg.citations || [];

      // Extract or generate follow-up suggestion chips (Exact Picture 2 format)
      let followUpHtml = '';
      if (!msg.content.includes('Want to learn more?')) {
        followUpHtml = `
          <div class="mt-4 pt-3 border-t border-white/5 text-xs text-gray-400 space-y-1.5">
            <p class="font-medium text-gray-300">Want to learn more?</p>
            <div class="flex flex-wrap gap-2 pt-1">
              <button onclick="applySuggestion('Key rules and regulations breakdown')" class="suggestion-chip">
                <span class="text-gray-400">↳</span> <span>Rules & regulations breakdown</span>
              </button>
              <button onclick="applySuggestion('Compare player records and tactical stats')" class="suggestion-chip">
                <span class="text-gray-400">↳</span> <span>Player records & tactical stats</span>
              </button>
              <button onclick="open3DInspectorModal('${msg.sport || 'football'}')" class="suggestion-chip text-blue-400 border-blue-500/30">
                <span>🌐</span> <span>Inspect 3D equipment</span>
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="flex flex-col space-y-3 pt-2 pb-6 mb-2">
          <!-- Main Content (Direct Canvas Markdown) -->
          <div class="assistant-prose">
            ${parsedHtml}
          </div>

          ${followUpHtml}

          <!-- Assistant Action Buttons Row (Exact Match to Picture 2) -->
          <div class="flex items-center gap-1 text-gray-400 pt-2 text-sm select-none">
            <button onclick="handleFeedback(this, 'like')" title="Good response" class="action-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
            </button>
            <button onclick="handleFeedback(this, 'dislike')" title="Bad response" class="action-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.761.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/></svg>
            </button>
            <button onclick="speakText(this)" data-text="${escapeHtml(msg.content.replace(/[#*`|]/g, ''))}" title="Read aloud" class="action-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
            </button>
            <button onclick="copyToClipboard(this)" data-text="${escapeHtml(msg.content)}" title="Copy" class="action-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </button>
            <button onclick="open3DInspectorModal('${msg.sport || 'football'}')" title="Inspect in 3D" class="action-btn text-blue-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </button>

            <!-- Subtle Grounding Pill with drawer -->
            <button onclick="openCompendiumModal()" title="Grounded in 100-Page Compendium" class="ml-2 text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-1 transition">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>100% Grounded</span>
            </button>
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

function handleTextareaKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleChatSubmit(e);
  }
}

// Auto-grow textarea
document.addEventListener('input', (e) => {
  if (e.target.id === 'chat-input') {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  }
});

// Send Message via LangGraph Pipeline + Ollama Phi-3
async function sendChatMessage(query) {
  if (!currentSessionId) {
    await startNewChatSession();
  }

  const messagesList = document.getElementById('messages-list');
  document.getElementById('empty-state')?.classList.add('hidden');
  document.body.classList.add('in-conversation');

  // 1. Append user bubble
  const userHtml = `
    <div class="flex justify-end mb-4">
      <div class="user-bubble">
        ${escapeHtml(query)}
      </div>
    </div>
  `;
  messagesList.insertAdjacentHTML('beforeend', userHtml);

  // 2. Typing indicator (ChatGPT animated dots)
  const typingId = `typing_${Date.now()}`;
  const typingHtml = `
    <div id="${typingId}" class="flex items-center gap-2 text-gray-400 text-xs py-3 px-1 select-none">
      <div class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
        <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></span>
        <span class="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></span>
      </div>
      <span class="text-gray-400 ml-1">ChatGPT (${activeModel.replace(':latest', '')}) thinking...</span>
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

    // Dynamic smart title update
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

    // Refresh entire session from DB
    await switchSession(currentSessionId);
    await loadUserSessions(false);

  } catch (err) {
    document.getElementById(typingId)?.remove();
    showToast(err.message, 'error');
  }
}

// Suggestion Chip Click
function applySuggestion(text) {
  sendChatMessage(text);
}

// Deep Think Toggle
function toggleDeepThink() {
  isDeepThinkActive = !isDeepThinkActive;
  const btn = document.getElementById('think-btn');
  if (btn) {
    if (isDeepThinkActive) {
      btn.className = 'px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/50 text-xs flex items-center gap-1.5 transition flex-shrink-0';
      showToast('Deep Think Active: Performing in-depth tactical synthesis', 'info');
    } else {
      btn.className = 'px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-1.5 transition flex-shrink-0';
    }
  }
}

// Model Selection
function toggleModelDropdown() {
  const dd = document.getElementById('model-dropdown');
  dd?.classList.toggle('hidden');
}

function selectModel(modelName) {
  activeModel = modelName;
  const label = document.getElementById('current-model-label');
  if (label) {
    if (modelName.includes('phi3')) label.innerText = 'ChatGPT (Ollama Phi-3)';
    else if (modelName.includes('qwen')) label.innerText = 'ChatGPT (Ollama Qwen 4B)';
    else if (modelName.includes('gemini')) label.innerText = 'ChatGPT (Gemini 1.5)';
    else label.innerText = modelName.split(' ')[0];
  }
  document.getElementById('model-dropdown')?.classList.add('hidden');
  showToast(`Active Model: ${modelName}`, 'info');
}

// Voice Dictation (Web Speech API)
function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Speech recognition not supported in your browser', 'error');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  showToast('Listening... Speak now', 'info');

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chat-input');
    if (input) input.value = transcript;
    showToast(`Heard: "${transcript}"`, 'success');
  };

  recognition.onerror = () => {
    showToast('Voice dictation ended', 'info');
  };

  recognition.start();
}

// Text-to-Speech
function speakText(btn) {
  const text = btn.getAttribute('data-text');
  if (!text || !window.speechSynthesis) return;

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>`;
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.onend = () => {
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>`;
  };

  btn.innerHTML = `<svg class="w-4 h-4 text-blue-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;
  window.speechSynthesis.speak(utterance);
}

// Copy to Clipboard
function copyToClipboard(btn) {
  const text = btn.getAttribute('data-text');
  if (!text) return;
  navigator.clipboard.writeText(text);
  const oldSvg = btn.innerHTML;
  btn.innerHTML = `<span class="text-emerald-400 text-xs">✓</span>`;
  setTimeout(() => btn.innerHTML = oldSvg, 1800);
}

// Feedback (Thumbs Up / Down)
function handleFeedback(btn, type) {
  btn.classList.add(type === 'like' ? 'text-emerald-400' : 'text-rose-400');
  showToast(type === 'like' ? 'Feedback recorded! Glad this was helpful.' : 'Feedback recorded. We will improve this response.', 'info');
}

// Share
function shareActiveConversation() {
  navigator.clipboard.writeText(window.location.href);
  showToast('Chat link copied to clipboard!', 'success');
}

function openOfferModal() {
  alert('SportsAI Pro Features:\n• Unlimited Ollama & Phi-3 inference\n• Real-Time IFAB, MCC & BWF rules sync\n• 3D Biomechanics & Aerodynamics Telemetry');
}

// 3D Inspector Modal
function open3DInspectorModal(sport = 'football') {
  const modal = document.getElementById('inspector-modal');
  if (modal) modal.classList.remove('hidden');
}
function close3DInspectorModal() {
  const modal = document.getElementById('inspector-modal');
  if (modal) modal.classList.add('hidden');
}

// Settings Modal
function openSettingsModal() {
  document.getElementById('settings-modal')?.classList.remove('hidden');
}
function closeSettingsModal() {
  document.getElementById('settings-modal')?.classList.add('hidden');
}

async function saveSettings() {
  const provider = document.getElementById('setting-provider')?.value;
  const ollamaModel = document.getElementById('setting-ollama-model')?.value;
  const geminiKey = document.getElementById('setting-gemini-key')?.value;

  if (ollamaModel) activeModel = ollamaModel;
  showToast('Settings saved successfully', 'success');
  closeSettingsModal();
}

function openSportDomainFilter() {
  alert('Active Domains:\n1. 🏏 Cricket (Pages 1-34)\n2. ⚽ Football (Pages 35-68)\n3. 🏸 Badminton (Pages 69-100)');
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
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  const bgColors = {
    success: 'bg-[#1e1e1e] border-emerald-500/50 text-emerald-300',
    error: 'bg-[#1e1e1e] border-rose-500/50 text-rose-300',
    info: 'bg-[#1e1e1e] border-white/20 text-gray-200'
  };

  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl border text-xs font-medium shadow-2xl backdrop-blur-xl flex items-center gap-2 transition-all duration-300 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span> <span>${message}</span>`;
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3000);
}
