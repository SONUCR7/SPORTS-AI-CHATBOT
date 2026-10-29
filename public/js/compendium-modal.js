/**
 * Compendium Modal, 3D Object Inspector, and Live Data Viewers
 */

let allCompendiumPages = [];
let inspectorScene = null;
let inspectorRenderer = null;
let inspectorCamera = null;
let inspectorMesh = null;

// ==========================================
// 1. 100-PAGE COMPENDIUM MODAL
// ==========================================
async function openCompendiumModal() {
  const modal = document.getElementById('compendium-modal');
  modal.classList.remove('hidden');

  if (allCompendiumPages.length === 0) {
    try {
      const res = await fetch('/api/sports/compendium');
      const data = await res.json();
      allCompendiumPages = data.pages || [];
      renderCompendiumIndex();
      if (allCompendiumPages.length > 0) {
        loadCompendiumPage(1);
      }
    } catch (err) {
      console.error('Failed to load compendium:', err);
    }
  }
}

function closeCompendiumModal() {
  document.getElementById('compendium-modal').classList.add('hidden');
}

function renderCompendiumIndex() {
  const listEl = document.getElementById('compendium-index-list');
  if (!listEl) return;

  listEl.innerHTML = allCompendiumPages.map(p => {
    const sportIcon = p.sport === 'cricket' ? '🏏' : p.sport === 'football' ? '⚽' : '🏸';
    return `
      <div onclick="loadCompendiumPage(${p.page})" class="p-2.5 rounded-xl cursor-pointer hover:bg-white/5 border border-transparent hover:border-white/10 transition">
        <div class="flex items-center gap-1.5 font-bold text-gray-200">
          <span>${sportIcon}</span>
          <span>Page ${p.page}: ${escapeHtml(p.title)}</span>
        </div>
        <div class="text-[10px] text-gray-400 truncate mt-0.5">${escapeHtml(p.chapter)}</div>
      </div>
    `;
  }).join('');
}

async function loadCompendiumPage(pageNum) {
  const contentEl = document.getElementById('compendium-page-content');
  contentEl.innerHTML = `<div class="p-4 text-center text-cyan-400">Loading Page ${pageNum}...</div>`;

  try {
    const res = await fetch(`/api/sports/compendium/page/${pageNum}`);
    const data = await res.json();
    const p = data.page;

    const sportIcon = p.sport === 'cricket' ? '🏏 Cricket' : p.sport === 'football' ? '⚽ Football' : '🏸 Badminton';

    contentEl.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider">${sportIcon}</span>
            <h2 class="text-xl font-extrabold text-white mt-1">[Page ${p.page}] ${escapeHtml(p.title)}</h2>
            <div class="text-xs text-gray-400">${escapeHtml(p.chapter)}</div>
          </div>
          <button onclick="applySuggestion('Explain in depth: ${escapeHtml(p.title)} (Page ${p.page})'); closeCompendiumModal();" class="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition">
            Ask AI About Page →
          </button>
        </div>

        ${p.stats && Object.keys(p.stats).length > 0 ? `
          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <div class="text-xs font-bold text-cyan-300 mb-2">📊 Official Statistical Benchmarks</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              ${Object.entries(p.stats).map(([k, v]) => `
                <div><span class="text-gray-400 capitalize">${k.replace(/_/g, ' ')}:</span> <span class="text-white font-mono font-semibold">${Array.isArray(v) ? v.join(', ') : v}</span></div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="text-xs text-gray-200 leading-relaxed space-y-3 font-normal">
          <p>${escapeHtml(p.content)}</p>
        </div>

        <div class="pt-3 border-t border-white/10 text-[11px] text-gray-400">
          <span class="font-semibold text-gray-300">Keywords:</span> ${p.keywords.join(', ')}
        </div>
      </div>
    `;
  } catch (err) {
    contentEl.innerHTML = `<div class="p-4 text-center text-rose-400">Error loading page content.</div>`;
  }
}

// ==========================================
// 2. 3D SPORTS EQUIPMENT INSPECTOR
// ==========================================
function open3DInspectorModal(sport = 'cricket') {
  const modal = document.getElementById('inspector-modal');
  modal.classList.remove('hidden');
  initInspectorCanvas();
  inspectSportObject(sport);
}

function close3DInspectorModal() {
  document.getElementById('inspector-modal').classList.add('hidden');
}

function initInspectorCanvas() {
  const container = document.getElementById('inspector-canvas-box');
  if (!container || inspectorRenderer) return;

  const width = container.clientWidth || 450;
  const height = container.clientHeight || 256;

  inspectorScene = new THREE.Scene();
  inspectorCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  inspectorCamera.position.z = 7;

  inspectorRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  inspectorRenderer.setSize(width, height);
  container.innerHTML = '';
  container.appendChild(inspectorRenderer.domElement);

  const amb = new THREE.AmbientLight(0xffffff, 0.9);
  inspectorScene.add(amb);

  const dir1 = new THREE.DirectionalLight(0x00f2fe, 2.0);
  dir1.position.set(5, 5, 5);
  inspectorScene.add(dir1);

  const dir2 = new THREE.DirectionalLight(0xa855f7, 1.8);
  dir2.position.set(-5, -5, 5);
  inspectorScene.add(dir2);

  animateInspector();
}

function inspectSportObject(sport) {
  if (!inspectorScene) return;
  if (inspectorMesh) {
    inspectorScene.remove(inspectorMesh);
    inspectorMesh = null;
  }

  const titleEl = document.getElementById('inspector-title');
  const descEl = document.getElementById('inspector-desc');

  if (sport === 'cricket') {
    titleEl.innerText = '🏏 3D English Willow Cricket Bat & Match Ball';
    descEl.innerText = 'Grade-1 English Willow blade with cane rubber grip + MCC 156g 6-row seam match ball.';
    
    const group = new THREE.Group();

    // 3D Bat
    const bladeGeo = new THREE.BoxGeometry(1.2, 3.8, 0.35, 4, 12, 4);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xfaedcd, roughness: 0.35, metalness: 0.05 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(-0.8, -0.4, 0);
    group.add(blade);

    const handleGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.8, 16);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(-0.8, 2.3, 0);
    group.add(handle);

    // 3D Cricket Ball
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.22, metalness: 0.18 })
    );
    sphere.position.set(1.2, 0.4, 0.3);
    const seam = new THREE.Mesh(
      new THREE.TorusGeometry(1.11, 0.05, 12, 64),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    seam.rotation.x = Math.PI / 2;
    sphere.add(seam);
    group.add(sphere);

    inspectorScene.add(group);
    inspectorMesh = group;

  } else if (sport === 'football') {
    titleEl.innerText = '⚽ 3D Football (IFAB FIFA Quality Pro)';
    descEl.innerText = '68-70cm circumference, 410-450g. Aerodynamic stitched panels for Magnus curve dip.';

    const group = new THREE.Group();
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.12 })
    );
    // Wireframe pentagon / icosahedron overlay for 32-panel FIFA look
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.815, 1),
      new THREE.MeshBasicMaterial({ color: 0x0f172a, wireframe: true, wireframeLinewidth: 2 })
    );
    group.add(sphere);
    group.add(wire);
    inspectorScene.add(group);
    inspectorMesh = group;

  } else if (sport === 'badminton') {
    titleEl.innerText = '🏸 3D Shuttlecock (BWF Law 2 Specification)';
    descEl.innerText = '16 goose feathers in natural cork base. Smashed up to 565 km/h with high deceleration.';

    const group = new THREE.Group();
    const cork = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
    );
    cork.rotation.x = Math.PI;

    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 0.7, 2.4, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    skirt.position.y = 1.2;

    group.add(cork);
    group.add(skirt);
    group.rotation.x = 0.5;
    inspectorScene.add(group);
    inspectorMesh = group;
  }
}

function animateInspector() {
  requestAnimationFrame(animateInspector);
  if (inspectorMesh) {
    inspectorMesh.rotation.y += 0.015;
    inspectorMesh.rotation.x += 0.008;
  }
  if (inspectorRenderer && inspectorScene && inspectorCamera) {
    inspectorRenderer.render(inspectorScene, inspectorCamera);
  }
}

// ==========================================
// 3. LIVE MATCH CENTER
// ==========================================
let liveMatchesCache = null;
let activeLiveSport = 'cricket';

async function openLiveFeedModal() {
  const modal = document.getElementById('live-match-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  if (!liveMatchesCache) {
    await fetchLiveMatches();
  } else {
    renderLiveMatches();
  }
}

function closeLiveFeedModal() {
  const modal = document.getElementById('live-match-modal');
  modal?.classList.add('hidden');
}

async function fetchLiveMatches() {
  const contentEl = document.getElementById('live-match-content');
  if (contentEl) contentEl.innerHTML = `<div class="p-8 text-center text-cyan-400">Fetching live sport feeds...</div>`;

  try {
    const res = await fetch('/api/sports/live-matches');
    const data = await res.json();
    liveMatchesCache = data;
    renderLiveMatches();
  } catch (err) {
    console.error('Failed to load live matches:', err);
    if (contentEl) contentEl.innerHTML = `<div class="p-8 text-center text-rose-400">Failed to connect to live sports data provider.</div>`;
  }
}

async function refreshLiveMatches() {
  await fetchLiveMatches();
  showToast('Live scores and events updated', 'info');
}

function switchLiveSportTab(sport) {
  activeLiveSport = sport;
  ['cricket', 'football', 'badminton'].forEach(s => {
    const tab = document.getElementById(`live-tab-${s}`);
    if (tab) {
      if (s === sport) {
        tab.className = `px-4 py-2 border-b-2 ${
          s === 'cricket' ? 'border-red-500 text-red-300' :
          s === 'football' ? 'border-emerald-500 text-emerald-300' :
          'border-indigo-500 text-indigo-300'
        } text-xs font-bold flex items-center gap-1.5 transition`;
      } else {
        tab.className = 'px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition';
      }
    }
  });
  renderLiveMatches();
}

function renderLiveMatches() {
  const contentEl = document.getElementById('live-match-content');
  if (!contentEl || !liveMatchesCache) return;

  const matches = liveMatchesCache.matches?.[activeLiveSport] || [];

  if (matches.length === 0) {
    contentEl.innerHTML = `<div class="p-8 text-center text-gray-400 text-xs">No active matches found for this sport.</div>`;
    return;
  }

  contentEl.innerHTML = matches.map(m => {
    if (activeLiveSport === 'cricket') {
      return renderCricketMatchCard(m);
    } else if (activeLiveSport === 'football') {
      return renderFootballMatchCard(m);
    } else {
      return renderBadmintonMatchCard(m);
    }
  }).join('');
}

function renderCricketMatchCard(m) {
  const recentBallsHtml = (m.recentBalls || []).map(b => {
    const cls = b === 'W' ? 'ball-chip-wicket' :
                b === '6' ? 'ball-chip-six' :
                b === '4' ? 'ball-chip-boundary' :
                b === '•' ? 'ball-chip-dot' : 'ball-chip-run';
    return `<span class="ball-chip ${cls}">${b}</span>`;
  }).join('');

  return `
    <div class="glass-panel rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
      <!-- Match Header -->
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span class="text-[10px] font-bold text-red-400 uppercase tracking-wider">🏏 ${escapeHtml(m.series)}</span>
          <div class="text-[11px] text-gray-400">${escapeHtml(m.venue)}</div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span> ${escapeHtml(m.status)}
        </span>
      </div>

      <!-- Scoreboard Display -->
      <div class="grid grid-cols-2 gap-4 bg-black/30 p-3.5 rounded-xl border border-white/5">
        <div>
          <div class="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <span>${m.teamA.flag}</span> <span>${escapeHtml(m.teamA.name)}</span>
          </div>
          <div class="text-lg font-black text-white mt-0.5">${escapeHtml(m.teamA.score)} <span class="text-xs font-normal text-gray-400">(${m.teamA.overs} ov)</span></div>
        </div>
        <div>
          <div class="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <span>${m.teamB.flag}</span> <span>${escapeHtml(m.teamB.name)}</span>
          </div>
          <div class="text-lg font-black text-white mt-0.5">${escapeHtml(m.teamB.score)} <span class="text-xs font-normal text-gray-400">(${m.teamB.overs} ov)</span></div>
        </div>
      </div>

      <div class="text-xs font-medium text-cyan-300">
        ⚡ ${escapeHtml(m.situation)}
      </div>

      <!-- Active Batters -->
      ${m.activeBatters ? `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="text-gray-400 border-b border-white/5 text-[11px]">
                <th class="py-1">Batter</th>
                <th class="py-1 text-right">R</th>
                <th class="py-1 text-right">B</th>
                <th class="py-1 text-right">4s</th>
                <th class="py-1 text-right">6s</th>
                <th class="py-1 text-right">SR</th>
              </tr>
            </thead>
            <tbody>
              ${m.activeBatters.map(b => `
                <tr class="border-b border-white/5 text-gray-200">
                  <td class="py-1.5 font-semibold text-white">${escapeHtml(b.name)}*</td>
                  <td class="py-1.5 text-right font-mono font-bold text-cyan-300">${b.runs}</td>
                  <td class="py-1.5 text-right font-mono text-gray-400">${b.balls}</td>
                  <td class="py-1.5 text-right font-mono text-gray-400">${b.fours}</td>
                  <td class="py-1.5 text-right font-mono text-gray-400">${b.sixes}</td>
                  <td class="py-1.5 text-right font-mono text-gray-300">${b.sr}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Recent Balls -->
      <div class="flex items-center justify-between pt-2 border-t border-white/5">
        <span class="text-[11px] text-gray-400 font-semibold">Recent Overs:</span>
        <div class="flex items-center gap-1">
          ${recentBallsHtml}
        </div>
      </div>

      <!-- AI Summary Action -->
      <div class="pt-3 border-t border-white/10 flex items-center justify-between">
        <button onclick="generateAIMatchSummary('${m.id}')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20">
          <span>✨</span> Generate AI Tactical Report (Phi-3)
        </button>
        <span class="text-[10px] text-gray-500">Live ICC Ball-by-Ball Feed</span>
      </div>

      <!-- Container for generated AI match summary -->
      <div id="ai-summary-${m.id}" class="hidden mt-3 p-4 rounded-xl bg-black/50 border border-cyan-500/30 text-xs markdown-body"></div>
    </div>
  `;
}

function renderFootballMatchCard(m) {
  const eventsHtml = (m.events || []).map(e => `
    <div class="flex items-center gap-2 text-xs">
      <span class="font-mono text-cyan-400 font-bold">${e.min}</span>
      <span>${e.type === 'goal' ? '⚽' : '🟨'}</span>
      <span class="font-semibold text-white">${escapeHtml(e.player)}</span>
      <span class="text-[11px] text-gray-400">(${escapeHtml(e.detail)})</span>
    </div>
  `).join('');

  return `
    <div class="glass-panel rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
      <!-- Match Header -->
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">⚽ ${escapeHtml(m.league)}</span>
          <div class="text-[11px] text-gray-400">${escapeHtml(m.venue)}</div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ${escapeHtml(m.status)}
        </span>
      </div>

      <!-- Scoreboard Display -->
      <div class="flex items-center justify-around bg-black/30 p-4 rounded-xl border border-white/5">
        <div class="text-center">
          <div class="text-2xl">${m.teamA.flag}</div>
          <div class="text-xs font-bold text-white mt-1">${escapeHtml(m.teamA.name)}</div>
        </div>
        <div class="text-center px-4">
          <div class="text-3xl font-black text-white font-mono">${m.teamA.score} - ${m.teamB.score}</div>
          ${m.aggregate ? `<div class="text-[10px] text-gray-400 font-mono mt-0.5">${escapeHtml(m.aggregate)}</div>` : ''}
        </div>
        <div class="text-center">
          <div class="text-2xl">${m.teamB.flag}</div>
          <div class="text-xs font-bold text-white mt-1">${escapeHtml(m.teamB.name)}</div>
        </div>
      </div>

      <!-- Match Stats Comparison -->
      ${m.stats ? `
        <div class="space-y-2 pt-1 text-xs">
          <div>
            <div class="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>${m.stats.possession[0]}% Possession</span>
              <span>${m.stats.possession[1]}% Possession</span>
            </div>
            <div class="w-full bg-white/10 h-1.5 rounded-full flex overflow-hidden">
              <div class="bg-cyan-400 h-1.5" style="width: ${m.stats.possession[0]}%"></div>
              <div class="bg-purple-500 h-1.5" style="width: ${m.stats.possession[1]}%"></div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-300 py-1 border-b border-white/5">
            <span>xG: <strong class="text-white">${m.stats.xG[0]}</strong></span>
            <span class="text-gray-400">Expected Goals</span>
            <span>xG: <strong class="text-white">${m.stats.xG[1]}</strong></span>
          </div>
          <div class="flex justify-between text-xs text-gray-300 py-1 border-b border-white/5">
            <span>Shots (On Target): <strong class="text-white">${m.stats.shots[0]} (${m.stats.shotsOnTarget[0]})</strong></span>
            <span>Shots (On Target): <strong class="text-white">${m.stats.shots[1]} (${m.stats.shotsOnTarget[1]})</strong></span>
          </div>
        </div>
      ` : ''}

      <!-- Match Events Timeline -->
      <div class="space-y-1.5 pt-2 border-t border-white/5">
        <div class="text-[11px] font-bold text-gray-400 mb-1">Match Events Timeline:</div>
        ${eventsHtml}
      </div>

      <!-- AI Summary Action -->
      <div class="pt-3 border-t border-white/10 flex items-center justify-between">
        <button onclick="generateAIMatchSummary('${m.id}')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
          <span>✨</span> Generate AI Tactical Report (Phi-3)
        </button>
        <span class="text-[10px] text-gray-500">Live Opta/UEFA Live Data</span>
      </div>

      <!-- Container for generated AI match summary -->
      <div id="ai-summary-${m.id}" class="hidden mt-3 p-4 rounded-xl bg-black/50 border border-emerald-500/30 text-xs markdown-body"></div>
    </div>
  `;
}

function renderBadmintonMatchCard(m) {
  return `
    <div class="glass-panel rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
      <!-- Match Header -->
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">🏸 ${escapeHtml(m.tournament)}</span>
          <div class="text-[11px] text-gray-400">${escapeHtml(m.venue)}</div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span> ${escapeHtml(m.status)}
        </span>
      </div>

      <!-- Scoreboard Display -->
      <div class="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
        <div>
          <div class="flex items-center gap-1.5">
            <span>${m.playerA.flag}</span>
            <span class="text-xs font-bold text-white">${escapeHtml(m.playerA.name)}</span>
            <span class="text-[10px] text-indigo-300 font-mono">(#${m.playerA.rank})</span>
          </div>
          <div class="text-sm font-bold text-cyan-300 mt-1 font-mono">
            Games: ${m.playerA.gameScores.join(' - ')}
          </div>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span>${m.playerB.flag}</span>
            <span class="text-xs font-bold text-white">${escapeHtml(m.playerB.name)}</span>
            <span class="text-[10px] text-indigo-300 font-mono">(#${m.playerB.rank})</span>
          </div>
          <div class="text-sm font-bold text-purple-300 mt-1 font-mono">
            Games: ${m.playerB.gameScores.join(' - ')}
          </div>
        </div>
      </div>

      <div class="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 font-semibold">
        🏸 Current Score: ${escapeHtml(m.currentScore)}
      </div>

      <!-- Key Badminton Metrics -->
      ${m.stats ? `
        <div class="grid grid-cols-2 gap-2 text-xs pt-1">
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <span class="text-gray-400">Longest Rally:</span> <strong class="text-white">${m.stats.longestRally}</strong>
          </div>
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <span class="text-gray-400">Fastest Smash:</span> <strong class="text-cyan-300">${m.stats.fastestSmash}</strong>
          </div>
        </div>
      ` : ''}

      <!-- AI Summary Action -->
      <div class="pt-3 border-t border-white/10 flex items-center justify-between">
        <button onclick="generateAIMatchSummary('${m.id}')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
          <span>✨</span> Generate AI Tactical Report (Phi-3)
        </button>
        <span class="text-[10px] text-gray-500">Live BWF World Tour Feed</span>
      </div>

      <!-- Container for generated AI match summary -->
      <div id="ai-summary-${m.id}" class="hidden mt-3 p-4 rounded-xl bg-black/50 border border-indigo-500/30 text-xs markdown-body"></div>
    </div>
  `;
}

async function generateAIMatchSummary(matchId) {
  const container = document.getElementById(`ai-summary-${matchId}`);
  if (!container || !liveMatchesCache) return;

  const allMatches = [
    ...(liveMatchesCache.matches?.cricket || []),
    ...(liveMatchesCache.matches?.football || []),
    ...(liveMatchesCache.matches?.badminton || [])
  ];

  const match = allMatches.find(m => m.id === matchId);
  if (!match) return;

  container.classList.remove('hidden');
  container.innerHTML = `<div class="p-4 text-center text-cyan-300 animate-pulse">⚡ Phi-3 Mini is generating real-time match analysis report...</div>`;

  try {
    const res = await fetch('/api/sports/ai-match-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchData: match })
    });

    const data = await res.json();
    if (data.summary) {
      container.innerHTML = `
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <span class="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
            <span>✨</span> <span>Phi-3 Mini Tactical Match Intelligence Report</span>
          </span>
          <span class="text-[10px] text-gray-400 font-mono">Model: ${data.modelUsed || 'phi3:latest'}</span>
        </div>
        ${formatMarkdownForRender(data.summary)}
      `;
    } else {
      container.innerHTML = `<div class="p-3 text-rose-400">Failed to generate summary: ${data.error || 'Unknown error'}</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div class="p-3 text-rose-400">Error communicating with AI engine: ${err.message}</div>`;
  }
}

// ==========================================
// 4. PLAYER MATRIX & HEAD-TO-HEAD SCOUTING
// ==========================================
let playerMatrixCache = null;
let activeMatrixSport = 'cricket';
let activePlayer1Key = 'virat_kohli';
let activePlayer2Key = 'babar_azam';

async function openPlayerMatrixModal() {
  const modal = document.getElementById('player-matrix-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  if (!playerMatrixCache) {
    await fetchPlayerMatrixData();
  } else {
    renderPlayerMatrix();
  }
}

function closePlayerMatrixModal() {
  const modal = document.getElementById('player-matrix-modal');
  modal?.classList.add('hidden');
}

async function fetchPlayerMatrixData() {
  const contentEl = document.getElementById('player-matrix-content');
  if (contentEl) contentEl.innerHTML = `<div class="p-8 text-center text-cyan-400">Loading scouting matrix dataset...</div>`;

  try {
    const res = await fetch('/api/sports/players');
    const data = await res.json();
    playerMatrixCache = data;
    renderPlayerMatrix();
  } catch (err) {
    console.error('Failed to load player matrix:', err);
    if (contentEl) contentEl.innerHTML = `<div class="p-8 text-center text-rose-400">Failed to load scouting dataset.</div>`;
  }
}

function selectPresetComparison(presetId) {
  if (!playerMatrixCache) {
    openPlayerMatrixModal().then(() => selectPresetComparison(presetId));
    return;
  }

  const presetMap = {
    'kohli_vs_babar': { sport: 'cricket', p1: 'virat_kohli', p2: 'babar_azam' },
    'bumrah_vs_afridi': { sport: 'cricket', p1: 'jasprit_bumrah', p2: 'shaheen_afridi' },
    'haaland_vs_mbappe': { sport: 'football', p1: 'erling_haaland', p2: 'kylian_mbappe' },
    'messi_vs_ronaldo': { sport: 'football', p1: 'lionel_messi', p2: 'cristiano_ronaldo' },
    'axelsen_vs_ginting': { sport: 'badminton', p1: 'viktor_axelsen', p2: 'anthony_ginting' }
  };

  const choice = presetMap[presetId] || presetMap['kohli_vs_babar'];
  activeMatrixSport = choice.sport;
  activePlayer1Key = choice.p1;
  activePlayer2Key = choice.p2;

  openPlayerMatrixModal();
  renderPlayerMatrix();
}

function switchMatrixSport(sport) {
  activeMatrixSport = sport;
  const sportData = playerMatrixCache?.sports?.[sport];
  const playerKeys = Object.keys(sportData?.players || {});

  if (playerKeys.length >= 2) {
    activePlayer1Key = playerKeys[0];
    activePlayer2Key = playerKeys[1];
  }

  renderPlayerMatrix();
}

function updateMatrixPlayer(slot, key) {
  if (slot === 1) activePlayer1Key = key;
  if (slot === 2) activePlayer2Key = key;
  renderPlayerMatrix();
}

function renderPlayerMatrix() {
  const contentEl = document.getElementById('player-matrix-content');
  if (!contentEl || !playerMatrixCache) return;

  const sportData = playerMatrixCache.sports?.[activeMatrixSport];
  if (!sportData) return;

  const p1 = sportData.players[activePlayer1Key] || Object.values(sportData.players)[0];
  const p2 = sportData.players[activePlayer2Key] || Object.values(sportData.players)[1];
  const metrics = sportData.metrics || [];
  const allPlayers = Object.values(sportData.players);

  // SVG Radar Chart HTML
  const radarSvg = generateRadarSvg(p1, p2, metrics);

  contentEl.innerHTML = `
    <!-- Sport Switcher Tabs -->
    <div class="flex items-center justify-between pb-3 border-b border-white/10">
      <div class="flex items-center gap-2">
        <button onclick="switchMatrixSport('cricket')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeMatrixSport === 'cricket' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-white/5 text-gray-400 hover:text-white'}">
          🏏 Cricket Scouting
        </button>
        <button onclick="switchMatrixSport('football')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeMatrixSport === 'football' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-gray-400 hover:text-white'}">
          ⚽ Football Scouting
        </button>
        <button onclick="switchMatrixSport('badminton')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeMatrixSport === 'badminton' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-white/5 text-gray-400 hover:text-white'}">
          🏸 Badminton Scouting
        </button>
      </div>
      <span class="text-[10px] text-gray-500 font-mono">Tri-Sport Analytics Engine</span>
    </div>

    <!-- Dropdowns for Player A & Player B -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
        <span class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Player 1 (Cyan):
        </span>
        <select onchange="updateMatrixPlayer(1, this.value)" class="bg-[#121826] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-200 focus:outline-none">
          ${allPlayers.map(pl => `
            <option value="${pl.id}" ${pl.id === p1.id ? 'selected' : ''}>${pl.flag} ${pl.name} (${pl.country})</option>
          `).join('')}
        </select>
      </div>

      <div class="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
        <span class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Player 2 (Purple):
        </span>
        <select onchange="updateMatrixPlayer(2, this.value)" class="bg-[#121826] border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-purple-200 focus:outline-none">
          ${allPlayers.map(pl => `
            <option value="${pl.id}" ${pl.id === p2.id ? 'selected' : ''}>${pl.flag} ${pl.name} (${pl.country})</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- Side-by-Side Player Profiles + Center Radar Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
      
      <!-- Player 1 Card -->
      <div class="glass-panel rounded-2xl border border-cyan-500/30 p-5 space-y-3.5 shadow-xl">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl shadow-inner">
            ${p1.flag}
          </div>
          <div>
            <h4 class="text-base font-bold text-white">${escapeHtml(p1.name)}</h4>
            <div class="text-[11px] text-cyan-300">${escapeHtml(p1.role)}</div>
          </div>
        </div>

        <p class="text-xs text-gray-300 italic leading-snug">"${escapeHtml(p1.bio)}"</p>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-2 text-xs bg-black/30 p-3 rounded-xl border border-white/5">
          <div><span class="text-gray-400">Matches:</span> <strong class="text-white">${p1.matches}</strong></div>
          <div><span class="text-gray-400">${activeMatrixSport === 'football' ? 'Goals/Assists' : 'Runs/Career'}:</span> <strong class="text-cyan-300">${p1.goals || p1.runs || p1.points || 'Elite'}</strong></div>
          <div><span class="text-gray-400">Avg / Ratio:</span> <strong class="text-white">${p1.avg || p1.winRate || '—'}</strong></div>
          <div><span class="text-gray-400">Peak Rating:</span> <strong class="text-cyan-300">${p1.strikeRate || p1.titles || '98.5'}</strong></div>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-1">
          ${(p1.badges || []).map(b => `
            <span class="text-[10px] px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-200 border border-cyan-500/20">${escapeHtml(b)}</span>
          `).join('')}
        </div>
      </div>

      <!-- Center 6-Axis Interactive Radar Chart -->
      <div class="glass-panel rounded-2xl border border-white/10 p-4 flex flex-col items-center justify-center relative shadow-xl">
        <div class="text-xs font-bold text-gray-300 mb-2 flex items-center gap-3">
          <span class="flex items-center gap-1 text-cyan-300">● ${escapeHtml(p1.name)}</span>
          <span class="text-gray-500">vs</span>
          <span class="flex items-center gap-1 text-purple-300">● ${escapeHtml(p2.name)}</span>
        </div>
        ${radarSvg}
        <div class="text-[10px] text-gray-500 mt-2 font-mono">6-Dimensional Scouting Comparison</div>
      </div>

      <!-- Player 2 Card -->
      <div class="glass-panel rounded-2xl border border-purple-500/30 p-5 space-y-3.5 shadow-xl">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner">
            ${p2.flag}
          </div>
          <div>
            <h4 class="text-base font-bold text-white">${escapeHtml(p2.name)}</h4>
            <div class="text-[11px] text-purple-300">${escapeHtml(p2.role)}</div>
          </div>
        </div>

        <p class="text-xs text-gray-300 italic leading-snug">"${escapeHtml(p2.bio)}"</p>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-2 text-xs bg-black/30 p-3 rounded-xl border border-white/5">
          <div><span class="text-gray-400">Matches:</span> <strong class="text-white">${p2.matches}</strong></div>
          <div><span class="text-gray-400">${activeMatrixSport === 'football' ? 'Goals/Assists' : 'Runs/Career'}:</span> <strong class="text-purple-300">${p2.goals || p2.runs || p2.points || 'Elite'}</strong></div>
          <div><span class="text-gray-400">Avg / Ratio:</span> <strong class="text-white">${p2.avg || p2.winRate || '—'}</strong></div>
          <div><span class="text-gray-400">Peak Rating:</span> <strong class="text-purple-300">${p2.strikeRate || p2.titles || '96.8'}</strong></div>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-1">
          ${(p2.badges || []).map(b => `
            <span class="text-[10px] px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-200 border border-purple-500/20">${escapeHtml(b)}</span>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- Comparative Metric Bars -->
    <div class="glass-panel rounded-2xl border border-white/10 p-5 space-y-3 shadow-xl">
      <div class="text-xs font-bold text-white flex items-center justify-between border-b border-white/10 pb-2">
        <span>Head-to-Head Metric Advantage</span>
        <span class="text-[10px] text-gray-400">Normalized Scale (0 - 100)</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-2">
        ${metrics.map((m, idx) => {
          const v1 = p1.radar[idx] || 50;
          const v2 = p2.radar[idx] || 50;
          const advantage = v1 > v2 ? `${p1.name} (+${v1 - v2})` : v2 > v1 ? `${p2.name} (+${v2 - v1})` : 'Level';
          return `
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-gray-300">
                <span class="font-semibold text-cyan-300">${v1}</span>
                <span class="text-[11px] text-gray-400">${escapeHtml(m)} (${advantage})</span>
                <span class="font-semibold text-purple-300">${v2}</span>
              </div>
              <div class="w-full bg-white/10 h-2 rounded-full flex overflow-hidden">
                <div class="bg-cyan-400 h-2 rounded-l-full" style="width: ${(v1 / (v1 + v2)) * 100}%"></div>
                <div class="bg-purple-500 h-2 rounded-r-full" style="width: ${(v2 / (v1 + v2)) * 100}%"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- AI Scout Verdict Generator Button -->
    <div class="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-indigo-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <span>✨</span> AI Head-to-Head Tactical Scout Verdict
        </h4>
        <p class="text-xs text-gray-400">Run Microsoft Phi-3 Mini to compare technical mastery, clutch pressure, and final scout verdict.</p>
      </div>

      <button onclick="generateAIScoutVerdict()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-black font-bold text-xs transition shadow-lg shadow-cyan-500/25 whitespace-nowrap">
        Run AI Scout Verdict (Phi-3) →
      </button>
    </div>

    <!-- AI Scout Verdict Container -->
    <div id="ai-scout-verdict-box" class="hidden glass-panel rounded-2xl border border-cyan-500/40 p-6 text-xs text-gray-200 markdown-body shadow-2xl">
      <!-- Injected via JS -->
    </div>
  `;
}

function generateRadarSvg(p1, p2, metrics) {
  const width = 360;
  const height = 310;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = 95;
  const total = metrics.length || 6;

  // Concentric polygon grids (20, 40, 60, 80, 100)
  let gridSvg = '';
  [0.2, 0.4, 0.6, 0.8, 1.0].forEach(level => {
    const pts = [];
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * (maxR * level);
      const y = cy + Math.sin(angle) * (maxR * level);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    gridSvg += `<polygon points="${pts.join(' ')}" class="radar-grid-line" />`;
  });

  // Radial Axis Lines & Labels
  let spokesSvg = '';
  let labelsSvg = '';
  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * maxR;
    const y = cy + Math.sin(angle) * maxR;
    spokesSvg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="radar-axis-line" />`;

    const lx = cx + Math.cos(angle) * (maxR + 24);
    const ly = cy + Math.sin(angle) * (maxR + 14);
    const anchor = Math.abs(Math.cos(angle)) < 0.25 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
    labelsSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" fill="#cbd5e1" font-size="9" font-weight="600">${metrics[i]}</text>`;
  }

  // Player 1 Polygon (Cyan)
  const p1Pts = [];
  let p1Dots = '';
  (p1.radar || []).forEach((val, i) => {
    const norm = Math.max(10, Math.min(100, val)) / 100;
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * (maxR * norm);
    const y = cy + Math.sin(angle) * (maxR * norm);
    p1Pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    p1Dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" class="radar-dot-p1"><title>${p1.name} - ${metrics[i]}: ${val}</title></circle>`;
  });
  const p1Poly = `<polygon points="${p1Pts.join(' ')}" class="radar-poly-p1" />`;

  // Player 2 Polygon (Purple)
  const p2Pts = [];
  let p2Dots = '';
  (p2.radar || []).forEach((val, i) => {
    const norm = Math.max(10, Math.min(100, val)) / 100;
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * (maxR * norm);
    const y = cy + Math.sin(angle) * (maxR * norm);
    p2Pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    p2Dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" class="radar-dot-p2"><title>${p2.name} - ${metrics[i]}: ${val}</title></circle>`;
  });
  const p2Poly = `<polygon points="${p2Pts.join(' ')}" class="radar-poly-p2" />`;

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto max-w-[340px] select-none overflow-visible">
      ${gridSvg}
      ${spokesSvg}
      ${p1Poly}
      ${p2Poly}
      ${p1Dots}
      ${p2Dots}
      ${labelsSvg}
    </svg>
  `;
}

async function generateAIScoutVerdict() {
  const verdictBox = document.getElementById('ai-scout-verdict-box');
  if (!verdictBox || !playerMatrixCache) return;

  const sportData = playerMatrixCache.sports?.[activeMatrixSport];
  const p1 = sportData?.players?.[activePlayer1Key];
  const p2 = sportData?.players?.[activePlayer2Key];

  if (!p1 || !p2) return;

  verdictBox.classList.remove('hidden');
  verdictBox.innerHTML = `<div class="p-4 text-center text-cyan-300 animate-pulse">⚡ Phi-3 Mini is compiling elite head-to-head scouting verdict...</div>`;

  try {
    const res = await fetch('/api/sports/ai-player-scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport: activeMatrixSport,
        player1: p1,
        player2: p2,
        headToHead: sportData.headToHead || {}
      })
    });

    const data = await res.json();
    if (data.verdict) {
      verdictBox.innerHTML = `
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <span class="text-xs font-bold text-cyan-300 flex items-center gap-2">
            <span>✨</span> <span>Definitive Head-to-Head Scout Report: ${p1.name} vs ${p2.name}</span>
          </span>
          <span class="text-[10px] text-gray-400 font-mono">Model: ${data.modelUsed || 'phi3:latest'}</span>
        </div>
        ${formatMarkdownForRender(data.verdict)}
      `;
    } else {
      verdictBox.innerHTML = `<div class="p-3 text-rose-400">Failed to generate scout verdict: ${data.error || 'Unknown error'}</div>`;
    }
  } catch (err) {
    verdictBox.innerHTML = `<div class="p-3 text-rose-400">Error generating scout report: ${err.message}</div>`;
  }
}
