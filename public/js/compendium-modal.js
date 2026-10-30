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

async function fetchLiveMatches(force = false) {
  const contentEl = document.getElementById('live-match-content');
  if (contentEl && !liveMatchesCache) contentEl.innerHTML = `<div class="p-8 text-center text-cyan-400">Fetching live sport feeds from Cricbuzz & football-data.org...</div>`;

  try {
    const res = await fetch(`/api/sports/live-matches${force ? '?refresh=true' : ''}`);
    const data = await res.json();
    liveMatchesCache = data;
    renderDashboardCurrentView();
  } catch (err) {
    console.error('Failed to load live matches:', err);
    if (contentEl) contentEl.innerHTML = `<div class="p-8 text-center text-rose-400">Failed to connect to live sports data provider.</div>`;
  }
}

async function refreshLiveMatches() {
  const contentEl = document.getElementById('live-match-content');
  if (contentEl) contentEl.innerHTML = `<div class="p-8 text-center text-cyan-400 animate-pulse">Syncing real-time match data from Cricbuzz & football-data.org...</div>`;
  await fetchLiveMatches(true);
  showToast('Live scores and sports API data synchronized', 'success');
}

let dashboardDataCache = null;
let activeDashboardView = 'live'; // 'live' | 'fixtures' | 'results' | 'rankings'

function switchDashboardView(view) {
  activeDashboardView = view;
  ['live', 'fixtures', 'results', 'rankings'].forEach(v => {
    const btn = document.getElementById(`dash-view-${v}`);
    if (btn) {
      if (v === view) {
        btn.className = 'px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold transition whitespace-nowrap';
      } else {
        btn.className = 'px-3 py-1 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 transition whitespace-nowrap';
      }
    }
  });

  renderDashboardCurrentView();
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
  renderDashboardCurrentView();
}

async function renderDashboardCurrentView() {
  const contentEl = document.getElementById('live-match-content');
  if (!contentEl) return;

  if (activeDashboardView === 'live') {
    renderLiveMatches();
    return;
  }

  // Load dashboard data if not cached
  if (!dashboardDataCache) {
    contentEl.innerHTML = `<div class="p-8 text-center text-cyan-400">Loading sports intelligence dashboard...</div>`;
    try {
      const res = await fetch('/api/sports/dashboard-data');
      dashboardDataCache = await res.json();
    } catch (e) {
      contentEl.innerHTML = `<div class="p-8 text-center text-rose-400">Failed to load sports dashboard feed.</div>`;
      return;
    }
  }

  if (activeDashboardView === 'fixtures') {
    renderUpcomingFixtures();
  } else if (activeDashboardView === 'results') {
    renderRecentResults();
  } else if (activeDashboardView === 'rankings') {
    renderOfficialRankings();
  }
}

function renderUpcomingFixtures() {
  const contentEl = document.getElementById('live-match-content');
  if (!contentEl || !dashboardDataCache) return;

  const fixtures = dashboardDataCache.upcomingFixtures?.[activeLiveSport] || [];
  if (fixtures.length === 0) {
    contentEl.innerHTML = `<div class="p-8 text-center text-gray-400 text-xs">No upcoming fixtures scheduled for this sport.</div>`;
    return;
  }

  contentEl.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-white/10">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <span>📅</span> <span>Upcoming ${activeLiveSport.toUpperCase()} Fixtures & Tournaments</span>
        </h4>
        <span class="text-[10px] text-cyan-300 font-mono">Official Calendar</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${fixtures.map(f => `
          <div class="glass-panel rounded-2xl border border-white/10 p-5 space-y-3 shadow-xl">
            <div class="flex items-center justify-between border-b border-white/10 pb-2">
              <span class="text-xs font-bold text-cyan-300">${escapeHtml(f.match)}</span>
              <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">${escapeHtml(f.date)}</span>
            </div>
            <div class="text-xs text-gray-300 flex items-center gap-2">
              <span>📍</span> <span>${escapeHtml(f.venue)}</span>
            </div>
            <div class="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 leading-relaxed">
              <strong class="text-cyan-400">Tactical Key:</strong> ${escapeHtml(f.tacticalKey)}
            </div>
            <div class="pt-2 border-t border-white/5 flex justify-end">
              <button onclick="closeLiveFeedModal(); sendChatMessage('Preview the upcoming tactical clash: ${escapeHtml(f.match).replace(/'/g, "\\'")} taking place on ${escapeHtml(f.date)}');" class="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition flex items-center gap-1">
                <span>⚡</span> Ask AI Match Preview →
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRecentResults() {
  const contentEl = document.getElementById('live-match-content');
  if (!contentEl || !dashboardDataCache) return;

  const results = dashboardDataCache.recentResults?.[activeLiveSport] || [];
  if (results.length === 0) {
    contentEl.innerHTML = `<div class="p-8 text-center text-gray-400 text-xs">No recent championship results for this sport.</div>`;
    return;
  }

  contentEl.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-white/10">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <span>🏆</span> <span>Recent Major Championship Results</span>
        </h4>
        <span class="text-[10px] text-emerald-300 font-mono">Verified Match Outcomes</span>
      </div>

      <div class="space-y-4">
        ${results.map(r => `
          <div class="glass-panel rounded-2xl border border-white/10 p-5 space-y-3 shadow-xl">
            <div class="flex items-center justify-between border-b border-white/10 pb-2">
              <span class="text-xs font-bold text-white">${escapeHtml(r.match)}</span>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">Winner: ${escapeHtml(r.winner)}</span>
            </div>
            <div class="text-sm font-bold text-cyan-300 font-mono">
              ${escapeHtml(r.teams)}
            </div>
            <p class="text-xs text-gray-300 leading-relaxed italic">
              "${escapeHtml(r.summary)}"
            </p>
            <div class="pt-2 border-t border-white/5 flex justify-end">
              <button onclick="closeLiveFeedModal(); sendChatMessage('Analyze the historic tactical turning points of: ${escapeHtml(r.match).replace(/'/g, "\\'")} (${escapeHtml(r.teams).replace(/'/g, "\\'")})');" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition">
                <span>📖</span> Tactical Breakdown →
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderOfficialRankings() {
  const contentEl = document.getElementById('live-match-content');
  if (!contentEl || !dashboardDataCache) return;

  const rankings = dashboardDataCache.rankings?.[activeLiveSport];
  if (!rankings) {
    contentEl.innerHTML = `<div class="p-8 text-center text-gray-400 text-xs">Rankings data unavailable.</div>`;
    return;
  }

  let html = '';
  if (activeLiveSport === 'cricket') {
    const testR = rankings.iccRankings?.test || [];
    const t20R = rankings.iccRankings?.t20i || [];
    html = `
      <div class="space-y-5">
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <span>📊</span> <span>Official ICC World Cricket Rankings</span>
          </h4>
          <span class="text-[10px] text-cyan-300 font-mono">ICC Official</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
            <h5 class="text-xs font-bold text-red-300">ICC Test Championship Table</h5>
            <div class="space-y-1.5 text-xs">
              ${testR.map(t => `
                <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                  <span class="font-bold text-white">#${t.rank} ${t.team}</span>
                  <span class="text-cyan-300 font-mono font-bold">${t.rating} Pts</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
            <h5 class="text-xs font-bold text-red-300">ICC Men's T20I Team Standings</h5>
            <div class="space-y-1.5 text-xs">
              ${t20R.map(t => `
                <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                  <span class="font-bold text-white">#${t.rank} ${t.team}</span>
                  <span class="text-cyan-300 font-mono font-bold">${t.rating} Rating</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300">
          <strong class="text-white">Recent Tournament:</strong> ${escapeHtml(rankings.recentTournament || '')}
        </div>
      </div>
    `;
  } else if (activeLiveSport === 'football') {
    const fifa = rankings.fifaRankings || [];
    html = `
      <div class="space-y-5">
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <span>📊</span> <span>FIFA Men's World Rankings & European Honours</span>
          </h4>
          <span class="text-[10px] text-emerald-300 font-mono">FIFA / UEFA Official</span>
        </div>

        <div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
          <h5 class="text-xs font-bold text-emerald-300">FIFA Men's Top National Teams</h5>
          <div class="space-y-1.5 text-xs">
            ${fifa.map(f => `
              <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <span class="font-bold text-white">#${f.rank} ${f.team}</span>
                <span class="text-emerald-300 font-mono font-bold">${f.points} Pts</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div class="text-[11px] text-gray-400">UEFA Champions League Reigning Champion</div>
            <div class="text-xs font-bold text-white mt-1">${escapeHtml(rankings.uclChampion || '')}</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div class="text-[11px] text-gray-400">Ballon d'Or 2024 Winner</div>
            <div class="text-xs font-bold text-amber-300 mt-1">${escapeHtml(rankings.ballonDor2024 || '')}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    const mens = rankings.bwfRankings?.mensSingles || [];
    const womens = rankings.bwfRankings?.womensSingles || [];
    html = `
      <div class="space-y-5">
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <span>📊</span> <span>BWF World Tour Official Rankings</span>
          </h4>
          <span class="text-[10px] text-indigo-300 font-mono">BWF World Tour</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
            <h5 class="text-xs font-bold text-indigo-300">Men's Singles World Rankings</h5>
            <div class="space-y-1.5 text-xs">
              ${mens.map(m => `
                <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                  <span class="font-bold text-white">#${m.rank} ${m.player} (${m.country})</span>
                  <span class="text-indigo-300 font-mono font-bold">${m.points.toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
            <h5 class="text-xs font-bold text-indigo-300">Women's Singles World Rankings</h5>
            <div class="space-y-1.5 text-xs">
              ${womens.map(w => `
                <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                  <span class="font-bold text-white">#${w.rank} ${w.player} (${w.country})</span>
                  <span class="text-indigo-300 font-mono font-bold">${w.points.toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  contentEl.innerHTML = html;
}

function renderLiveMatches() {
  const contentEl = document.getElementById('live-match-content');
  if (!contentEl || !liveMatchesCache) return;

  const matches = liveMatchesCache.matches?.[activeLiveSport] || [];
  const statusInfo = liveMatchesCache.sourceStatus?.[activeLiveSport];
  const isLive = Boolean(statusInfo?.isLive);
  const providerName = statusInfo?.provider || 'Verified Sports Feed';

  const statusBannerHtml = `
    <div class="p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border mb-4 shadow-md ${
      isLive ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-white/5 border-white/10 text-gray-300'
    }">
      <div class="flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}"></span>
        <div>
          <div class="text-xs font-bold text-white flex items-center gap-2">
            <span>${isLive ? '🟢 LIVE API FEED CONNECTED' : '🟡 LIVE SPORTS DATA FEED'}</span>
            ${statusInfo?.configured ? '<span class="text-[10px] px-2 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">API Key Linked</span>' : ''}
          </div>
          <div class="text-[11px] text-gray-400">${escapeHtml(providerName)}</div>
        </div>
      </div>
      <div class="flex items-center gap-3 text-xs">
        <button onclick="openSettingsModal()" class="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1">
          <span>⚙️</span> API Keys
        </button>
        <span class="text-[10px] text-gray-400 font-mono">Updated: ${escapeHtml(liveMatchesCache.lastUpdated || '')}</span>
      </div>
    </div>
  `;

  if (matches.length === 0) {
    contentEl.innerHTML = statusBannerHtml + `<div class="p-8 text-center text-gray-400 text-xs">No active matches found for this sport at this moment.</div>`;
    return;
  }

  contentEl.innerHTML = statusBannerHtml + `
    <div class="space-y-4">
      ${matches.map(m => {
        if (activeLiveSport === 'cricket') {
          return renderCricketMatchCard(m);
        } else if (activeLiveSport === 'football') {
          return renderFootballMatchCard(m);
        } else {
          return renderBadmintonMatchCard(m);
        }
      }).join('')}
    </div>
  `;
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

        <!-- Strengths & Weaknesses -->
        ${p1.strengths ? `
          <div class="text-[11px] space-y-1 pt-1 border-t border-white/5">
            <div><strong class="text-emerald-400">Strengths:</strong> <span class="text-gray-300">${p1.strengths.join(', ')}</span></div>
            <div><strong class="text-rose-400">Weaknesses:</strong> <span class="text-gray-400">${p1.weaknesses.join(', ')}</span></div>
          </div>
        ` : ''}
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
        <button onclick="closePlayerMatrixModal(); sendChatMessage('Analyze head-to-head match stats and tactical advantages between ${escapeHtml(p1.name).replace(/'/g, "\\'")} and ${escapeHtml(p2.name).replace(/'/g, "\\'")} in ${activeMatrixSport}');" class="mt-3 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition flex items-center gap-1">
          <span>⚡</span> Analyze with SportsAI →
        </button>
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

        <!-- Strengths & Weaknesses -->
        ${p2.strengths ? `
          <div class="text-[11px] space-y-1 pt-1 border-t border-white/5">
            <div><strong class="text-emerald-400">Strengths:</strong> <span class="text-gray-300">${p2.strengths.join(', ')}</span></div>
            <div><strong class="text-rose-400">Weaknesses:</strong> <span class="text-gray-400">${p2.weaknesses.join(', ')}</span></div>
          </div>
        ` : ''}
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

// ==========================================
// 5. AI TACTICAL ANALYSIS & PITCH BOARDS
// ==========================================
let tacticalDataCache = null;
let activeTacticalSport = 'football'; // 'football' | 'cricket' | 'badminton'
let activeFootballFormation = '4-3-3'; // '4-3-3' | '4-2-3-1' | '3-5-2'

async function openTacticalAnalysisModal() {
  const modal = document.getElementById('tactical-analysis-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  if (!tacticalDataCache) {
    await fetchTacticalData();
  } else {
    renderTacticalBoard();
  }
}

function closeTacticalAnalysisModal() {
  const modal = document.getElementById('tactical-analysis-modal');
  modal?.classList.add('hidden');
}

async function fetchTacticalData() {
  const contentEl = document.getElementById('tactical-board-content');
  if (contentEl) contentEl.innerHTML = `<div class="p-8 text-center text-cyan-400">Loading pitch tactical models and spatial datasets...</div>`;

  try {
    const res = await fetch('/api/sports/tactical-data');
    tacticalDataCache = await res.json();
    renderTacticalBoard();
  } catch (err) {
    console.error('Failed to load tactical data:', err);
    if (contentEl) contentEl.innerHTML = `<div class="p-8 text-center text-rose-400">Failed to load tactical dataset.</div>`;
  }
}

function switchTacticalSport(sport) {
  activeTacticalSport = sport;
  ['football', 'cricket', 'badminton'].forEach(s => {
    const tab = document.getElementById(`tac-tab-${s}`);
    if (tab) {
      if (s === sport) {
        tab.className = `px-4 py-2 border-b-2 ${
          s === 'football' ? 'border-emerald-500 text-emerald-300' :
          s === 'cricket' ? 'border-red-500 text-red-300' :
          'border-indigo-500 text-indigo-300'
        } text-xs font-bold flex items-center gap-1.5 transition`;
      } else {
        tab.className = 'px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition';
      }
    }
  });

  renderTacticalBoard();
}

function setFootballFormation(formation) {
  activeFootballFormation = formation;
  renderTacticalBoard();
}

function renderTacticalBoard() {
  const contentEl = document.getElementById('tactical-board-content');
  if (!contentEl || !tacticalDataCache) return;

  if (activeTacticalSport === 'football') {
    renderFootballTacticalBoard(contentEl);
  } else if (activeTacticalSport === 'cricket') {
    renderCricketTacticalBoard(contentEl);
  } else {
    renderBadmintonTacticalBoard(contentEl);
  }
}

function renderFootballTacticalBoard(contentEl) {
  const fbData = tacticalDataCache.football;
  const fmtData = fbData?.formations?.[activeFootballFormation] || fbData?.formations?.['4-3-3'];
  if (!fmtData) return;

  const players = fmtData.players || [];
  const svgPitch = generateFootballPitchSvg(players, fmtData);

  contentEl.innerHTML = `
    <!-- Top Controls: Formation Selector -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-300 mr-1">Tactical System:</span>
        <button onclick="setFootballFormation('4-3-3')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeFootballFormation === '4-3-3' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}">
          4-3-3 Positional Play
        </button>
        <button onclick="setFootballFormation('4-2-3-1')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeFootballFormation === '4-2-3-1' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}">
          4-2-3-1 Gegenpressing
        </button>
        <button onclick="setFootballFormation('3-5-2')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeFootballFormation === '3-5-2' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}">
          3-5-2 Wing-Back Overload
        </button>
      </div>

      <span class="text-[10px] text-emerald-400 font-mono font-bold">105m × 68m UEFA Pitch Matrix</span>
    </div>

    <!-- Main Grid: SVG Pitch Board + Tactical Insights Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      <!-- Left: Interactive 105x68m SVG Football Pitch -->
      <div class="lg:col-span-7 glass-panel rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col items-center">
        <div class="w-full flex items-center justify-between text-[11px] text-gray-400 mb-2">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Attacking Direction ↑</span>
          <span>Pressing Zone: <strong class="text-emerald-300">${escapeHtml(fmtData.pressingZone)}</strong></span>
        </div>
        ${svgPitch}
        <div class="w-full flex items-center justify-between text-[10px] text-gray-500 mt-2 font-mono">
          <span>● Click/Hover player node for spatial instructions</span>
          <span>11 Active Tactical Hubs</span>
        </div>
      </div>

      <!-- Right: Tactical Breakdown & xG Dynamics -->
      <div class="lg:col-span-5 space-y-4">
        
        <!-- Tactical Philosophy Card -->
        <div class="glass-panel rounded-2xl border border-emerald-500/30 p-5 space-y-2.5 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-300 uppercase tracking-wider">${escapeHtml(fmtData.name)}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Tactical Profile</span>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed italic">
            "${escapeHtml(fmtData.philosophy)}"
          </p>
        </div>

        <!-- Key Passing Hubs -->
        <div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-2 shadow-xl">
          <div class="text-xs font-bold text-white flex items-center gap-1.5">
            <span>🔗</span> Key Spatial Passing Hubs
          </div>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${(fmtData.passingHubs || []).map(h => `
              <span class="text-xs px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-cyan-200">${escapeHtml(h)}</span>
            `).join('')}
          </div>
        </div>

        <!-- Expected Goals (xG) Shot Distribution -->
        <div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-3 shadow-xl">
          <div class="text-xs font-bold text-white flex items-center justify-between">
            <span>📊 Expected Goals (xG) Zone Distribution</span>
            <span class="text-[10px] text-gray-400">Opta Metrics</span>
          </div>
          <div class="space-y-2 text-xs">
            ${Object.entries(fmtData.xGDistribution || {}).map(([zone, pct]) => `
              <div>
                <div class="flex justify-between text-gray-300 mb-1">
                  <span class="capitalize text-[11px]">${zone.replace(/([A-Z])/g, ' $1')}:</span>
                  <span class="text-emerald-300 font-mono font-bold">${pct}</span>
                </div>
                <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-emerald-400 to-cyan-400 h-1.5 rounded-full" style="width: ${parseInt(pct, 10)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Tactical Masterclass Button -->
        <button onclick="generateAITacticalReport('football', '${escapeHtml(fmtData.name)}')" class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
          <span>✨</span> Generate AI Tactical Masterclass (Phi-3)
        </button>

      </div>
    </div>

    <!-- AI Tactical Report Output Box -->
    <div id="ai-tactical-report-box" class="hidden glass-panel rounded-2xl border border-emerald-500/40 p-6 text-xs text-gray-200 markdown-body shadow-2xl">
      <!-- Injected via JS -->
    </div>
  `;
}

function generateFootballPitchSvg(players, fmtData) {
  const width = 560;
  const height = 400;

  // Passing lines between nodes
  let linesSvg = '';
  if (players.length >= 11) {
    // Connect GK to CBs, CBs to DM, DM to CMs/Wings, etc.
    const connections = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 5], [2, 5], [3, 5], [4, 5],
      [5, 6], [5, 7], [6, 8], [7, 10],
      [6, 9], [7, 9], [8, 9], [10, 9]
    ];
    connections.forEach(([i, j]) => {
      const p1 = players[i];
      const p2 = players[j];
      if (p1 && p2) {
        const x1 = 20 + (p1.x / 100) * (width - 40);
        const y1 = 20 + (p1.y / 100) * (height - 40);
        const x2 = 20 + (p2.x / 100) * (width - 40);
        const y2 = 20 + (p2.y / 100) * (height - 40);
        linesSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00f2fe" stroke-width="1.2" stroke-opacity="0.3" stroke-dasharray="3,3" />`;
      }
    });
  }

  // Render 11 Player Nodes
  let nodesSvg = '';
  players.forEach(p => {
    const px = 20 + (p.x / 100) * (width - 40);
    const py = 20 + (p.y / 100) * (height - 40);

    nodesSvg += `
      <g class="cursor-pointer group">
        <circle cx="${px}" cy="${py}" r="15" fill="#0b1322" stroke="#10b981" stroke-width="2.5" class="transition-transform group-hover:scale-125" filter="drop-shadow(0 0 6px rgba(16,185,129,0.6))">
          <title>${p.num}. ${p.label} (${p.role})</title>
        </circle>
        <text x="${px}" y="${py + 4}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">${p.num}</text>
        <text x="${px}" y="${py + 26}" text-anchor="middle" fill="#6ee7b7" font-size="9" font-weight="700">${p.role}</text>
      </g>
    `;
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto max-w-[540px] select-none rounded-2xl bg-[#08121a] border border-emerald-500/20 shadow-inner">
      <!-- Pitch Turf & Markings -->
      <rect x="15" y="15" width="530" height="370" rx="12" fill="#07121b" stroke="#10b981" stroke-width="1.8" stroke-opacity="0.4" />
      
      <!-- Halfway Line & Center Circle -->
      <line x1="15" y1="200" x2="545" y2="200" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.35" />
      <circle cx="280" cy="200" r="50" fill="none" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.35" />
      <circle cx="280" cy="200" r="3" fill="#10b981" fill-opacity="0.7" />

      <!-- Top Penalty Box (Opponent) -->
      <rect x="170" y="15" width="220" height="75" fill="none" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.35" />
      <rect x="220" y="15" width="120" height="28" fill="none" stroke="#10b981" stroke-width="1.2" stroke-opacity="0.3" />
      <circle cx="280" cy="65" r="2.5" fill="#10b981" fill-opacity="0.7" />

      <!-- Bottom Penalty Box (Home) -->
      <rect x="170" y="310" width="220" height="75" fill="none" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.35" />
      <rect x="220" y="357" width="120" height="28" fill="none" stroke="#10b981" stroke-width="1.2" stroke-opacity="0.3" />
      <circle cx="280" cy="335" r="2.5" fill="#10b981" fill-opacity="0.7" />

      <!-- Passing Lines & Player Nodes -->
      ${linesSvg}
      ${nodesSvg}
    </svg>
  `;
}

function renderCricketTacticalBoard(contentEl) {
  const cData = tacticalDataCache.cricket;
  const sectors = cData?.wagonWheel?.sectors || [];
  const pitchZones = cData?.bowlingLengthMap?.zones || [];

  contentEl.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-white/10">
      <div>
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <span>🏏</span> <span>Cricket Ground Wagon Wheel & Pitch Length Heatmap</span>
        </h4>
        <p class="text-xs text-gray-400">360° Batting Shot Distribution & 22-Yard Bowling Corridor Analytics</p>
      </div>
      <span class="text-[10px] text-red-400 font-mono font-bold">ICC Hawkeye Matrix</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      <!-- Left: 360 Wagon Wheel SVG Ground -->
      <div class="lg:col-span-7 glass-panel rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col items-center">
        <div class="text-xs font-bold text-white mb-2 flex items-center justify-between w-full">
          <span>360° Ground Wagon Wheel (Elite Batting Radar)</span>
          <span class="text-[10px] text-cyan-300 font-mono">Boundary Vectors</span>
        </div>
        ${generateWagonWheelSvg(sectors)}
        <div class="w-full flex items-center justify-between text-[10px] text-gray-500 mt-2 font-mono">
          <span>● Off-Side Overload (Cover / Point)</span>
          <span>● Leg-Side Flick & Pull</span>
        </div>
      </div>

      <!-- Right: 22-Yard Pitch Bowling Lengths & Wicket Probability -->
      <div class="lg:col-span-5 space-y-4">
        
        <div class="glass-panel rounded-2xl border border-red-500/30 p-5 space-y-3 shadow-xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="text-xs font-bold text-red-300">22-Yard Pitch Bowling Zones</span>
            <span class="text-[10px] text-gray-400">Hawkeye Length</span>
          </div>

          <div class="space-y-3">
            ${pitchZones.map(z => `
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="font-bold text-white">${escapeHtml(z.name)}</span>
                  <span class="text-cyan-300 font-mono font-bold">${z.percentage}</span>
                </div>
                <div class="text-[11px] text-gray-400">
                  <strong class="text-rose-400">Threat:</strong> ${escapeHtml(z.wicketProbability)}
                </div>
                <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div class="bg-gradient-to-r from-red-500 to-amber-400 h-1.5 rounded-full" style="width: ${parseInt(z.percentage, 10) * 2}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Tactical Masterclass Button -->
        <button onclick="generateAITacticalReport('cricket', 'Wagon Wheel & Bowling Pitch Corridor')" class="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-black font-extrabold text-xs transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
          <span>✨</span> Generate AI Cricket Field Setting Analysis (Phi-3)
        </button>

      </div>
    </div>

    <!-- AI Tactical Report Output Box -->
    <div id="ai-tactical-report-box" class="hidden glass-panel rounded-2xl border border-red-500/40 p-6 text-xs text-gray-200 markdown-body shadow-2xl">
      <!-- Injected via JS -->
    </div>
  `;
}

function generateWagonWheelSvg(sectors) {
  const width = 440;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const r = 160;

  let sectorsSvg = '';
  const total = sectors.length || 8;

  sectors.forEach((sec, i) => {
    const startAngle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const endAngle = (Math.PI * 2 / total) * (i + 1) - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;

    const x1 = cx + Math.cos(startAngle) * r;
    const y1 = cy + Math.sin(startAngle) * r;
    const x2 = cx + Math.cos(endAngle) * r;
    const y2 = cy + Math.sin(endAngle) * r;

    const lx = cx + Math.cos(midAngle) * (r - 28);
    const ly = cy + Math.sin(midAngle) * (r - 28);

    sectorsSvg += `
      <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z" fill="#0c1726" fill-opacity="${0.2 + (i % 2) * 0.15}" stroke="#00f2fe" stroke-width="1" stroke-opacity="0.3" class="hover:fill-cyan-500/30 transition cursor-pointer">
        <title>${sec.name}: ${sec.runs} runs (${sec.boundaries} boundaries)</title>
      </path>
      <text x="${lx}" y="${ly}" text-anchor="middle" fill="#e2e8f0" font-size="9" font-weight="700">${sec.runs}</text>
    `;
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto max-w-[420px] select-none bg-[#08101a] rounded-2xl border border-cyan-500/20 p-2">
      <!-- Boundary Circle -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#081422" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.4" />
      <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,4" stroke-opacity="0.25" />

      <!-- Sectors -->
      ${sectorsSvg}

      <!-- 22-Yard Pitch in Center -->
      <rect x="${cx - 6}" y="${cy - 22}" width="12" height="44" rx="2" fill="#d97706" stroke="#fbbf24" stroke-width="1.5" />
      <circle cx="${cx}" cy="${cy - 18}" r="2" fill="#ffffff" />
      <circle cx="${cx}" cy="${cy + 18}" r="2" fill="#ffffff" />
    </svg>
  `;
}

function renderBadmintonTacticalBoard(contentEl) {
  const bData = tacticalDataCache.badminton;
  const smashList = bData?.smashDistribution || [];
  const footwork = bData?.footworkHubs || [];

  contentEl.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-white/10">
      <div>
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <span>🏸</span> <span>Badminton Court Smash Heatmap & Base Footwork Hubs</span>
        </h4>
        <p class="text-xs text-gray-400">13.4m × 6.1m BWF Official Court Spatial Attack Zones</p>
      </div>
      <span class="text-[10px] text-indigo-300 font-mono font-bold">BWF Hawk-Eye Feed</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      <!-- Left: BWF Court SVG with Smash Landing Heat Zones -->
      <div class="lg:col-span-7 glass-panel rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col items-center">
        <div class="text-xs font-bold text-white mb-2 flex items-center justify-between w-full">
          <span>Court Smash Placement & Footwork Hubs</span>
          <span class="text-[10px] text-indigo-300 font-mono">13.4m × 6.1m</span>
        </div>
        ${generateBadmintonCourtSvg(smashList)}
        <div class="w-full flex items-center justify-between text-[10px] text-gray-500 mt-2 font-mono">
          <span>● Forecourt Net Tumbling Hub</span>
          <span>● Rearcourt Scissor Kick Zone</span>
        </div>
      </div>

      <!-- Right: Smash Velocities & Footwork Mechanics -->
      <div class="lg:col-span-5 space-y-4">
        
        <div class="glass-panel rounded-2xl border border-indigo-500/30 p-5 space-y-3 shadow-xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="text-xs font-bold text-indigo-300">Smash Attack Distribution</span>
            <span class="text-[10px] text-gray-400">Speed / Win %</span>
          </div>

          <div class="space-y-2.5">
            ${smashList.map(s => `
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="font-bold text-white">${escapeHtml(s.zone)}</span>
                  <span class="text-indigo-300 font-mono font-bold">${s.percentage}</span>
                </div>
                <div class="flex justify-between text-[11px] text-gray-400">
                  <span>Avg Speed: <strong class="text-cyan-300">${s.avgSpeed}</strong></span>
                  <span>Winner Rate: <strong class="text-emerald-400">${s.winnerRate}</strong></span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="glass-panel rounded-2xl border border-white/10 p-4 space-y-2 shadow-xl">
          <div class="text-xs font-bold text-white flex items-center gap-1.5">
            <span>👟</span> Base Footwork Centers
          </div>
          <div class="space-y-2 text-xs text-gray-300">
            ${footwork.map(f => `
              <div>
                <strong class="text-indigo-300">${escapeHtml(f.hub)}:</strong>
                <p class="text-gray-400 text-[11px] mt-0.5">${escapeHtml(f.description)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Tactical Masterclass Button -->
        <button onclick="generateAITacticalReport('badminton', 'BWF Court Smash Distribution & Split-Step')" class="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-black font-extrabold text-xs transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
          <span>✨</span> Generate AI Badminton Tactics Masterclass (Phi-3)
        </button>

      </div>
    </div>

    <!-- AI Tactical Report Output Box -->
    <div id="ai-tactical-report-box" class="hidden glass-panel rounded-2xl border border-indigo-500/40 p-6 text-xs text-gray-200 markdown-body shadow-2xl">
      <!-- Injected via JS -->
    </div>
  `;
}

function generateBadmintonCourtSvg(smashList) {
  const width = 460;
  const height = 340;

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto max-w-[440px] select-none bg-[#090f1d] rounded-2xl border border-indigo-500/30 p-2">
      <!-- Outer Court (Doubles 13.4m x 6.1m) -->
      <rect x="25" y="25" width="410" height="290" fill="#0b1426" stroke="#6366f1" stroke-width="2" stroke-opacity="0.6" rx="4" />
      
      <!-- Singles Side Tramlines -->
      <line x1="25" y1="45" x2="435" y2="45" stroke="#6366f1" stroke-width="1.2" stroke-opacity="0.4" />
      <line x1="25" y1="295" x2="435" y2="295" stroke="#6366f1" stroke-width="1.2" stroke-opacity="0.4" />

      <!-- Center Net Line -->
      <line x1="230" y1="20" x2="230" y2="320" stroke="#f43f5e" stroke-width="2.5" stroke-opacity="0.8" />
      <text x="230" y="15" text-anchor="middle" fill="#fb7185" font-size="9" font-weight="bold">NET (1.55m)</text>

      <!-- Short Service Lines -->
      <line x1="175" y1="25" x2="175" y2="315" stroke="#6366f1" stroke-width="1.5" stroke-opacity="0.4" />
      <line x1="285" y1="25" x2="285" y2="315" stroke="#6366f1" stroke-width="1.5" stroke-opacity="0.4" />

      <!-- Center Service Lines -->
      <line x1="25" y1="170" x2="175" y2="170" stroke="#6366f1" stroke-width="1.2" stroke-opacity="0.4" />
      <line x1="285" y1="170" x2="435" y2="170" stroke="#6366f1" stroke-width="1.2" stroke-opacity="0.4" />

      <!-- Smash Landing Zones Heatmap -->
      <rect x="40" y="48" width="90" height="90" rx="8" fill="#f43f5e" fill-opacity="0.35" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3,3" />
      <text x="85" y="98" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">Smash 34%</text>

      <rect x="40" y="202" width="90" height="90" rx="8" fill="#a855f7" fill-opacity="0.3" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3,3" />
      <text x="85" y="252" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">Body 28%</text>

      <!-- Footwork Hub (Base T-Junction) -->
      <circle cx="340" cy="170" r="16" fill="#00f2fe" fill-opacity="0.25" stroke="#00f2fe" stroke-width="2" class="animate-pulse" />
      <circle cx="340" cy="170" r="4" fill="#00f2fe" />
      <text x="340" y="202" text-anchor="middle" fill="#67e8f9" font-size="9" font-weight="bold">Base Hub (T)</text>
    </svg>
  `;
}

async function generateAITacticalReport(sport, topic) {
  const reportBox = document.getElementById('ai-tactical-report-box');
  if (!reportBox) return;

  reportBox.classList.remove('hidden');
  reportBox.innerHTML = `<div class="p-4 text-center text-cyan-300 animate-pulse">⚡ Phi-3 Mini is drafting high-performance tactical analysis report...</div>`;

  try {
    const res = await fetch('/api/sports/ai-tactical-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport,
        formationOrTopic: topic,
        tacticalDetails: tacticalDataCache?.[sport] || {}
      })
    });

    const data = await res.json();
    if (data.report) {
      reportBox.innerHTML = `
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <span class="text-xs font-bold text-cyan-300 flex items-center gap-2">
            <span>✨</span> <span>Masterclass Tactical Breakdown: ${escapeHtml(topic)}</span>
          </span>
          <span class="text-[10px] text-gray-400 font-mono">Model: ${data.modelUsed || 'phi3:latest'}</span>
        </div>
        ${formatMarkdownForRender(data.report)}
      `;
    } else {
      reportBox.innerHTML = `<div class="p-3 text-rose-400">Failed to generate tactical report: ${data.error || 'Unknown error'}</div>`;
    }
  } catch (err) {
    reportBox.innerHTML = `<div class="p-3 text-rose-400">Error generating tactical report: ${err.message}</div>`;
  }
}
