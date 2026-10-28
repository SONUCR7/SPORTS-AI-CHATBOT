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
// 3. LIVE FEED & PLAYER MATRIX MODALS
// ==========================================
function openLiveFeedModal() {
  applySuggestion('Show me live world rankings and upcoming tournament schedules for Cricket, Football, and Badminton');
}

function openPlayerMatrixModal() {
  applySuggestion('Compare all-time icons across Cricket, Football, and Badminton: Sachin vs Kohli, Messi vs Ronaldo, and Lin Dan vs Lee Chong Wei in a unified matrix');
}
