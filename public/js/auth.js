/**
 * SportsAI Authentication Controller
 * Handles 1-Click Demo Login, User Registration, Login, and Session Persistence.
 */

let currentAuthMode = 'register'; // 'register' or 'login'

// Check query params on load
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  if (mode === 'login') {
    switchAuthMode('login');
  } else {
    switchAuthMode('register');
  }

  // Check if already authenticated
  const token = localStorage.getItem('sportsai_token');
  const user = localStorage.getItem('sportsai_user');
  if (token && user && !urlParams.get('force')) {
    // Optional: auto-redirect if session exists
    // window.location.href = '/chat';
  }
});

function switchAuthMode(mode) {
  currentAuthMode = mode;
  const regBtn = document.getElementById('tab-register-btn');
  const loginBtn = document.getElementById('tab-login-btn');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const nameGroup = document.getElementById('field-name-group');
  const sportGroup = document.getElementById('field-sport-group');
  const submitText = document.getElementById('auth-submit-text');
  const dividerText = document.getElementById('divider-text');

  if (mode === 'register') {
    regBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md';
    loginBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition text-gray-400 hover:text-white';
    
    title.innerText = 'Claim Your Sports AI Pass';
    subtitle.innerText = 'Register your official sports credentials to unlock the 100-page verified compendium.';
    nameGroup.style.display = 'block';
    sportGroup.style.display = 'block';
    submitText.innerText = 'Claim Official Sports Pass →';
    dividerText.innerText = 'OR REGISTER WITH EMAIL';
  } else {
    loginBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md';
    regBtn.className = 'py-2.5 text-xs font-bold rounded-xl transition text-gray-400 hover:text-white';
    
    title.innerText = 'Welcome Back';
    subtitle.innerText = 'Sign in with your analyst credentials to resume your sports research.';
    nameGroup.style.display = 'none';
    sportGroup.style.display = 'none';
    submitText.innerText = 'Sign In to SportsAI →';
    dividerText.innerText = 'OR EMAIL LOGIN';
  }
}

function togglePasswordVisibility() {
  const pwd = document.getElementById('auth-password');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value.trim();
  const preferred_sport = document.getElementById('auth-sport').value;
  const submitBtn = document.getElementById('auth-submit-btn');

  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-70');

  try {
    let endpoint = currentAuthMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    let payload = { email, password };
    if (currentAuthMode === 'register') {
      payload.name = name;
      payload.preferred_sport = preferred_sport;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    // Persist session
    localStorage.setItem('sportsai_token', data.token);
    localStorage.setItem('sportsai_user', JSON.stringify(data.user));
    if (data.initialSessionId || data.activeSessionId) {
      localStorage.setItem('sportsai_active_session', data.initialSessionId || data.activeSessionId);
    }

    showToast(`Welcome ${data.user.name}! Redirecting to Arena...`, 'success');
    setTimeout(() => {
      window.location.href = '/chat';
    }, 700);

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-70');
  }
}

async function loginDemoUser() {
  try {
    showToast('Authorizing Pro Analyst demo credentials...', 'info');
    const res = await fetch('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Demo login failed');
    }

    localStorage.setItem('sportsai_token', data.token);
    localStorage.setItem('sportsai_user', JSON.stringify(data.user));
    if (data.activeSessionId) {
      localStorage.setItem('sportsai_active_session', data.activeSessionId);
    }

    showToast('Authenticated as Arighna Nandi (Pro Analyst)!', 'success');
    setTimeout(() => {
      window.location.href = '/chat';
    }, 600);
  } catch (err) {
    showToast(err.message, 'error');
  }
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
