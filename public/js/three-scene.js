/**
 * 3D Interactive Sports Arena (Three.js)
 * Enhanced with Dynamic Cursor-Hover 3D Animations & Procedural Photorealism:
 * 
 * 1. 🏏 English Willow Cricket Bat:
 *    - Procedural willow wood grain texture with GelDeck Pro Edition / SportsAI badge
 *    - Sculpted blade geometry with tapered shoulders, rear spine ridge & toe curve
 *    - Crimson red rubber handle grip, yellow rubber knob cap & collar ring
 *    - Dynamic Cover-Drive Stroke 3D Animation on cursor hover
 * 
 * 2. 🔴 Realistic Match Cricket Ball:
 *    - Deep crimson leather gradient with micro-pore noise
 *    - Equator seam with distinct stitched cross threads & golden foil embossed stamp
 *    - High-RPM 6-Row Seam Spin & Trajectory Curve 3D Animation on cursor hover
 * 
 * 3. ⚽ IFAB FIFA Quality Pro Football:
 *    - Classic Adidas Tango inspired pattern with dark navy/blue glow triad panels
 *    - White stitch seams & SportsAI Trefoil center crest
 *    - Tactical blue neon scan ring around the ball
 *    - Rapid Magnus Spin & Dynamic Cursor-Tracking Tilt 3D Animation on cursor hover
 * 
 * 4. 🏸 BWF Official Feather Shuttlecock:
 *    - Domed cork base with dark emerald green ribbon neck band
 *    - 16 authentic goose feather vanes (quills + flaring blades) with dual thread rings
 *    - Cyan aerodynamic speed halo ring
 *    - 565 km/h Supersonic Smash Spiral & Steep Attack Dive 3D Animation on cursor hover
 * 
 * Features:
 * - Real-time Raycaster cursor collision detection
 * - Smooth lerp scaling (1.2x - 1.3x) & hover acceleration
 * - Floating HUD telemetry badge near cursor
 * - Click impulse physics (kick bounce, cover drive crack, smash boost)
 * - OrbitControls and responsive multi-viewport positioning
 */

class Sports3DScene {
  constructor(containerId = 'three-canvas-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // 3D Sports Groups
    this.football = null;
    this.footballMesh = null;
    this.footballScanRing = null;

    this.cricketBat = null;
    this.cricketBall = null;

    this.shuttlecock = null;
    this.shuttlecockAeroRing = null;

    this.particles = null;

    // Camera & Parallax
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.cameraFocusTarget = { x: 0, y: 0, z: 24, lookX: 0, lookY: 0, lookZ: 0 };
    this.currentLookAt = { x: 0, y: 0, z: 0 };
    this.focusedObject = null;

    // Raycasting & Cursor Hover States
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredObject = null; // 'football' | 'bat' | 'ball' | 'shuttlecock' | null

    this.hoverState = {
      football: { hovered: false, currentScale: 1.0, targetScale: 1.0, spinVelocity: 0.009, impulse: 0 },
      bat: { hovered: false, currentScale: 1.0, targetScale: 1.0, swingPhase: 0, impulse: 0 },
      ball: { hovered: false, currentScale: 1.0, targetScale: 1.0, spinVelocity: 0.014, impulse: 0 },
      shuttlecock: { hovered: false, currentScale: 1.0, targetScale: 1.0, spiralVelocity: 0.012, impulse: 0 }
    };

    // Base Positions for Arena
    this.basePositions = {
      football: new THREE.Vector3(-6.2, -3.8, 3.0),
      bat: new THREE.Vector3(-6.8, 3.2, 0.5),
      ball: new THREE.Vector3(-4.4, 2.2, 2.2),
      shuttlecock: new THREE.Vector3(-1.8, -4.5, 2.0)
    };

    this.hudEl = null;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Retrying in 400ms...');
      setTimeout(() => this.init(), 400);
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 24);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 3. Studio Lighting Rig
    this.setupLighting();

    // 4. Create High-Fidelity 3D Sports Assets
    this.createFootball();
    this.createCricketBat();
    this.createCricketBall();
    this.createBadmintonShuttlecock();
    this.createParticleField();

    // 5. Setup Interactive HUD Tooltip
    this.createHudTooltip();

    // 6. Update Responsive Positions
    this.updateObjectPositions();

    // 7. Event Listeners (Mouse move, Click, Resize)
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('click', (e) => this.onClick(e));

    // 8. Start Render Loop
    this.animate();
  }

  setupLighting() {
    // Ambient stadium light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // Cyan Stadium Key Light (Top-Left)
    const keyLightCyan = new THREE.DirectionalLight(0x00f2fe, 2.4);
    keyLightCyan.position.set(-16, 14, 12);
    this.scene.add(keyLightCyan);

    // Purple Stadium Rim Light (Bottom-Right)
    const rimLightPurple = new THREE.DirectionalLight(0xa855f7, 2.0);
    rimLightPurple.position.set(16, -12, 10);
    this.scene.add(rimLightPurple);

    // Warm Golden Key Light (Center-Front)
    const fillLightGold = new THREE.PointLight(0xfef08a, 1.3, 50);
    fillLightGold.position.set(0, 2, 16);
    this.scene.add(fillLightGold);
  }

  // =========================================================================
  // 1. 3D FOOTBALL (Classic Adidas Tango Motif with Tactical Scan Ring)
  // =========================================================================
  createFootball() {
    const group = new THREE.Group();
    group.name = 'football';

    const radius = 2.4;
    const sphereGeo = new THREE.SphereGeometry(radius, 64, 64);

    const texture = this.generateFootballTexture();
    const bumpMap = this.generateFootballBumpMap();

    const footballMat = new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: bumpMap,
      bumpScale: 0.08,
      roughness: 0.28,
      metalness: 0.12,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25
    });

    const ballMesh = new THREE.Mesh(sphereGeo, footballMat);
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;
    group.add(ballMesh);
    this.footballMesh = ballMesh;

    // Glowing Tactical Neon Scan Ring
    const ringGeo = new THREE.RingGeometry(radius * 1.15, radius * 1.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    scanRing.rotation.x = Math.PI / 2.3;
    scanRing.position.y = -0.15;
    group.add(scanRing);
    this.footballScanRing = scanRing;

    // Subtle atmospheric glow halo
    const haloGeo = new THREE.RingGeometry(radius * 1.3, radius * 1.45, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 3;
    group.add(halo);

    group.position.copy(this.basePositions.football);
    this.scene.add(group);
    this.football = group;
  }

  generateFootballTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Crisp White Leather Base
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 2048, 1024);

    // Micro leather grain noise
    ctx.fillStyle = 'rgba(148, 163, 184, 0.06)';
    for (let i = 0; i < 5000; i++) {
      const rx = Math.random() * 2048;
      const ry = Math.random() * 1024;
      ctx.fillRect(rx, ry, 2.5, 2.5);
    }

    // Stylized curved triangular panels (Tango triad motif in dark navy with cyan/blue glow)
    const cols = 6;
    const rows = 3;
    const stepX = 2048 / cols;
    const stepY = 1024 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * stepX + ((r % 2) * (stepX / 2));
        const cy = r * stepY + stepY / 2;

        ctx.save();
        ctx.translate(cx, cy);

        // Outer blue neon halo around triads
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.35)';
        ctx.fill();

        // Black inner curved panel
        ctx.beginPath();
        ctx.arc(0, 0, 62, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0f1d';
        ctx.fill();

        // Neon cyan inner accent arc
        ctx.beginPath();
        ctx.arc(0, 0, 52, 0, Math.PI * 1.2);
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;
        ctx.stroke();

        // White stitch seam around panel
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
      }
    }

    // Trefoil / SportsAI Center Crest
    ctx.save();
    ctx.translate(1024, 512);

    ctx.fillStyle = '#090d16';
    // Center leaf
    ctx.beginPath();
    ctx.ellipse(0, -32, 18, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    // Left leaf
    ctx.beginPath();
    ctx.ellipse(-30, -22, 16, 36, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    // Right leaf
    ctx.beginPath();
    ctx.ellipse(30, -22, 16, 36, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Trefoil horizontal stripes cutouts
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-55, -26, 110, 5);
    ctx.fillRect(-55, -15, 110, 5);
    ctx.fillRect(-55, -4, 110, 5);

    // Brand Wordmark
    ctx.fillStyle = '#090d16';
    ctx.font = '900 34px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('sportsai', 0, 36);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('FIFA QUALITY PRO • 100-PAGE RAG', 0, 62);

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  generateFootballBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 1024, 512);

    // Dark indented seam grooves
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 4;
    for (let x = 80; x < 1024; x += 170) {
      for (let y = 80; y < 512; y += 170) {
        ctx.beginPath();
        ctx.arc(x, y, 62, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    return new THREE.CanvasTexture(canvas);
  }

  // =========================================================================
  // 2. 3D CRICKET BAT (English Willow Pro with GelDeck / SportsAI Badge)
  // =========================================================================
  createCricketBat() {
    const group = new THREE.Group();
    group.name = 'bat';

    // A. Willow Blade (custom sculpted with toe curve and rear spine ridge)
    const bladeGeo = new THREE.BoxGeometry(1.6, 5.0, 0.42, 6, 16, 4);
    const pos = bladeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Shoulders taper inward near top
      if (y > 1.8) {
        const factor = 1 - (y - 1.8) * 0.42;
        pos.setX(i, x * Math.max(factor, 0.52));
      }
      // Rounded toe near bottom
      if (y < -2.0) {
        const toeFactor = 1 - Math.abs(y + 2.0) * 0.35;
        pos.setX(i, x * Math.max(toeFactor, 0.78));
        // Curve toe forward
        pos.setZ(i, z + Math.sin((y + 2.0) * 1.5) * 0.12);
      }
      // Spine camber: thicker in the middle sweet spot (z > 0)
      if (z > 0 && Math.abs(y) < 1.5) {
        pos.setZ(i, z * 1.3);
      }
    }
    bladeGeo.computeVertexNormals();

    const woodTexture = this.generateWoodTexture();
    const bladeMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.36,
      metalness: 0.06
    });

    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.castShadow = true;
    blade.receiveShadow = true;
    group.add(blade);

    // B. Bat Shoulder Taper
    const shoulderGeo = new THREE.CylinderGeometry(0.24, 0.72, 0.7, 16);
    const shoulder = new THREE.Mesh(shoulderGeo, bladeMat);
    shoulder.position.y = 2.85;
    group.add(shoulder);

    // C. Cane Handle with Crimson Red Rubber Grip
    const handleGeo = new THREE.CylinderGeometry(0.18, 0.19, 2.5, 32);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0xcc1f2f, // Crimson red rubber grip
      roughness: 0.6,
      metalness: 0.1
    });
    const handle = new THREE.Mesh(handleGeo, gripMat);
    handle.position.y = 4.3;
    group.add(handle);

    // D. Yellow Rubber Knob Cap at Top
    const knobGeo = new THREE.CylinderGeometry(0.25, 0.19, 0.3, 24);
    const knobMat = new THREE.MeshStandardMaterial({
      color: 0xfde047, // Yellow rubber knob
      roughness: 0.45
    });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.y = 5.6;
    group.add(knob);

    // E. Yellow Rubber Collar Ring near base of handle
    const collarGeo = new THREE.TorusGeometry(0.2, 0.05, 12, 24);
    const collar = new THREE.Mesh(collarGeo, knobMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 3.2;
    group.add(collar);

    // Initial stance: angled proudly like an elite batsman awaiting delivery
    group.rotation.z = -0.32;
    group.rotation.y = 0.42;
    group.rotation.x = 0.18;

    group.position.copy(this.basePositions.bat);
    this.scene.add(group);
    this.cricketBat = group;
  }

  generateWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Natural English Willow base
    ctx.fillStyle = '#eed6b2';
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine wood grain lines
    for (let i = 0; i < 750; i++) {
      const x = Math.random() * 1024;
      const width = 1 + Math.random() * 2.5;
      const alpha = 0.04 + Math.random() * 0.14;
      ctx.fillStyle = `rgba(145, 98, 48, ${alpha})`;
      ctx.fillRect(x, 0, width, 1024);
    }

    // Slightly darker bat willow spine grain streaks
    for (let x = 120; x < 950; x += 110) {
      ctx.fillStyle = 'rgba(160, 110, 60, 0.18)';
      ctx.fillRect(x + Math.sin(x) * 10, 0, 4, 1024);
    }

    // Modern Metallic SportsAI Bat Face Sticker
    ctx.save();
    ctx.translate(512, 380);

    // Shield background
    ctx.beginPath();
    ctx.moveTo(-140, -100);
    ctx.lineTo(140, -100);
    ctx.lineTo(120, 90);
    ctx.lineTo(0, 150);
    ctx.lineTo(-120, 90);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#00f2fe';
    ctx.stroke();

    // Cyan central diamond
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.lineTo(105, 10);
    ctx.lineTo(0, 105);
    ctx.lineTo(-105, 10);
    ctx.closePath();
    ctx.fillStyle = '#0284c7';
    ctx.fill();

    // Badge Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GelDeck', 0, 14);

    ctx.fillStyle = '#bae6fd';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRO WILLOW • MCC 5.7', 0, 46);

    ctx.fillStyle = '#fde047';
    ctx.font = '14px sans-serif';
    ctx.fillText('★ 100-PAGE KNOWLEDGE CORE ★', 0, 80);

    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  // =========================================================================
  // 3. 3D MATCH CRICKET BALL (Deep Crimson Leather with 6-Row Seam & Gold Stamp)
  // =========================================================================
  createCricketBall() {
    const group = new THREE.Group();
    group.name = 'ball';

    const radius = 1.6;

    // Leather Sphere
    const sphereGeo = new THREE.SphereGeometry(radius, 64, 64);
    const ballTexture = this.generateCricketBallTexture();

    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.24,
      metalness: 0.16,
      clearcoat: 0.45,
      clearcoatRoughness: 0.2
    });

    const sphere = new THREE.Mesh(sphereGeo, ballMat);
    sphere.castShadow = true;
    group.add(sphere);

    // White raised stitched seam torus around equator
    const seamGeo = new THREE.TorusGeometry(radius * 1.018, 0.065, 16, 120);
    const seamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.75,
      metalness: 0.1
    });
    const seam = new THREE.Mesh(seamGeo, seamMat);
    seam.rotation.x = Math.PI / 2;
    group.add(seam);

    // Flanking stitch rows
    const flank1 = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.01, 0.025, 12, 100), seamMat);
    flank1.rotation.x = Math.PI / 2;
    flank1.position.z = 0.055;
    group.add(flank1);

    const flank2 = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.01, 0.025, 12, 100), seamMat);
    flank2.rotation.x = Math.PI / 2;
    flank2.position.z = -0.055;
    group.add(flank2);

    group.position.copy(this.basePositions.ball);
    this.scene.add(group);
    this.cricketBall = group;
  }

  generateCricketBallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep rich red crimson base leather
    const grad = ctx.createRadialGradient(512, 512, 50, 512, 512, 512);
    grad.addColorStop(0, '#c91b2c');
    grad.addColorStop(0.7, '#960d1b');
    grad.addColorStop(1, '#650610');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine leather grain pore noise
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const r = Math.random() * 1.6;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.14)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Prominent Equator Seam Track
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 506, 1024, 12);

    // Distinct Stitched Cross Threads
    for (let x = 0; x < 1024; x += 12) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x, 496);
      ctx.lineTo(x + 6, 528);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(70, 4, 10, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 2, 493);
      ctx.lineTo(x + 8, 531);
      ctx.stroke();
    }

    // Golden foil embossed text stamp
    ctx.save();
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('SPECIAL TEST MATCH', 512, 380);
    ctx.fillText('★ 156g LEATHER ★', 512, 650);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // =========================================================================
  // 4. 3D BADMINTON SHUTTLECOCK (16 Goose Feathers, Cork Dome & Speed Halo)
  // =========================================================================
  createBadmintonShuttlecock() {
    const group = new THREE.Group();
    group.name = 'shuttlecock';

    // A. Domed Cork Base
    const corkGeo = new THREE.SphereGeometry(0.85, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const corkMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.32,
      metalness: 0.05
    });
    const cork = new THREE.Mesh(corkGeo, corkMat);
    cork.rotation.z = Math.PI;
    group.add(cork);

    // Flat cylinder backing to seal cork dome
    const corkBackGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.35, 32);
    const corkBack = new THREE.Mesh(corkBackGeo, corkMat);
    corkBack.position.y = 0.18;
    group.add(corkBack);

    // Dark Green Ribbon Band around Cork neck
    const greenBandGeo = new THREE.CylinderGeometry(0.86, 0.86, 0.2, 32);
    const greenBandMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Deep emerald dark green
      roughness: 0.4
    });
    const greenBand = new THREE.Mesh(greenBandGeo, greenBandMat);
    greenBand.position.y = 0.22;
    group.add(greenBand);

    // B. 16 Authentic Goose Feather Vanes radiating upwards
    const featherCount = 16;
    const featherMat = new THREE.MeshStandardMaterial({
      color: 0xfcfcfc,
      roughness: 0.45,
      side: THREE.DoubleSide
    });
    const quillMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35
    });

    const featherBladeGeo = new THREE.PlaneGeometry(0.68, 2.6);
    const quillStemGeo = new THREE.CylinderGeometry(0.035, 0.045, 2.8, 8);

    for (let i = 0; i < featherCount; i++) {
      const angle = (i / featherCount) * Math.PI * 2;
      const featherHolder = new THREE.Group();

      const r = 0.75;
      featherHolder.position.set(Math.cos(angle) * r, 0.25, Math.sin(angle) * r);
      featherHolder.rotation.y = -angle;
      featherHolder.rotation.z = -0.36; // Flare outwards
      featherHolder.rotation.x = 0.18; // Aerodynamic twist

      const quill = new THREE.Mesh(quillStemGeo, quillMat);
      quill.position.y = 1.35;
      featherHolder.add(quill);

      const blade = new THREE.Mesh(featherBladeGeo, featherMat);
      blade.position.y = 1.6;
      blade.position.z = 0.02;
      blade.rotation.y = 0.2;
      featherHolder.add(blade);

      group.add(featherHolder);
    }

    // C. Dual Thread Rings tying the feathers together
    const threadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });

    const lowerRing = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.03, 8, 48), threadMat);
    lowerRing.position.y = 1.4;
    lowerRing.rotation.x = Math.PI / 2;
    group.add(lowerRing);

    const upperRing = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.03, 8, 48), threadMat);
    upperRing.position.y = 2.15;
    upperRing.rotation.x = Math.PI / 2;
    group.add(upperRing);

    // D. Cyan Aerodynamic Speed Halo Ring
    const aeroRingGeo = new THREE.TorusGeometry(2.1, 0.035, 8, 64);
    const aeroRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.55
    });
    const aeroRing = new THREE.Mesh(aeroRingGeo, aeroRingMat);
    aeroRing.rotation.x = Math.PI / 2.2;
    aeroRing.position.y = 1.8;
    group.add(aeroRing);
    this.shuttlecockAeroRing = aeroRing;

    // Initial angle tilt
    group.rotation.z = 0.95;
    group.rotation.x = 0.45;

    group.position.copy(this.basePositions.shuttlecock);
    this.scene.add(group);
    this.shuttlecock = group;
  }

  // =========================================================================
  // 5. STADIUM PARTICLES
  // =========================================================================
  createParticleField() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 44;
      positions[i + 1] = (Math.random() - 0.5) * 32;
      positions[i + 2] = (Math.random() - 0.5) * 28;

      const isCyan = Math.random() > 0.5;
      colors[i] = isCyan ? 0.0 : 0.65;
      colors[i + 1] = isCyan ? 0.95 : 0.35;
      colors[i + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.65
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  // =========================================================================
  // 6. FLOATING HUD TOOLTIP CHIP
  // =========================================================================
  createHudTooltip() {
    let el = document.getElementById('sports-3d-hud');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sports-3d-hud';
      el.className = 'fixed z-50 pointer-events-none px-3.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-xl border border-white/20 shadow-2xl opacity-0 transform -translate-x-1/2 -translate-y-12 transition-opacity duration-150 text-white flex items-center gap-2';
      el.style.background = 'rgba(10, 15, 28, 0.92)';
      document.body.appendChild(el);
    }
    this.hudEl = el;
  }

  updateHudTooltip(e, key) {
    if (!this.hudEl) return;

    if (!key) {
      this.hudEl.style.opacity = '0';
      return;
    }

    let html = '';
    if (key === 'football') {
      html = `<span class="text-cyan-400 font-bold">⚽ Football Pro</span> <span class="text-slate-300 font-normal">• Magnus Spin Active • Click to Kick</span>`;
    } else if (key === 'bat') {
      html = `<span class="text-amber-400 font-bold">🏏 English Willow Bat</span> <span class="text-slate-300 font-normal">• Cover Drive Stance • Click to Drive</span>`;
    } else if (key === 'ball') {
      html = `<span class="text-rose-400 font-bold">🔴 Match Leather Ball</span> <span class="text-slate-300 font-normal">• 6-Row Seam Swing • Click to Spin</span>`;
    } else if (key === 'shuttlecock') {
      html = `<span class="text-indigo-400 font-bold">🏸 BWF Shuttlecock</span> <span class="text-slate-300 font-normal">• 565 km/h Smash Telemetry • Click to Smash</span>`;
    }

    this.hudEl.innerHTML = html;
    this.hudEl.style.left = `${e.clientX}px`;
    this.hudEl.style.top = `${e.clientY}px`;
    this.hudEl.style.opacity = '1';
  }

  // =========================================================================
  // 7. RESPONSIVE POSITIONING (Adapts cleanly for Register & Chat pages)
  // =========================================================================
  updateObjectPositions() {
    const w = window.innerWidth;
    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;
    const isChatPage = window.location.pathname.includes('/chat') || !!document.getElementById('messages-container');

    if (isMobile) {
      this.basePositions.football.set(-2.5, -4.5, 0);
      this.basePositions.bat.set(-3.5, 3.0, -2);
      this.basePositions.ball.set(3.0, 3.2, -1);
      this.basePositions.shuttlecock.set(2.5, -4.5, -1);
    } else if (isTablet) {
      this.basePositions.football.set(-4.5, -4.0, 2);
      this.basePositions.bat.set(-7.5, 3.2, 0);
      this.basePositions.ball.set(-5.0, 2.0, 1.8);
      this.basePositions.shuttlecock.set(-1.8, -4.8, 1.5);
    } else {
      if (isChatPage) {
        // Chat Page: offset gracefully next to sidebar and framing central search area
        this.basePositions.football.set(-6.2, -3.8, 3.0);
        this.basePositions.bat.set(-6.8, 3.2, 0.5);
        this.basePositions.ball.set(-4.4, 2.2, 2.2);
        this.basePositions.shuttlecock.set(-1.8, -4.5, 2.0);
      } else {
        // Register Page: Left column hero frame
        this.basePositions.football.set(-6.8, -3.8, 3.2);
        this.basePositions.bat.set(-9.4, 3.2, 0.5);
        this.basePositions.ball.set(-6.4, 2.2, 2.4);
        this.basePositions.shuttlecock.set(-1.8, -4.5, 2.0);
      }
    }

    if (this.football) this.football.position.copy(this.basePositions.football);
    if (this.cricketBat) this.cricketBat.position.copy(this.basePositions.bat);
    if (this.cricketBall) this.cricketBall.position.copy(this.basePositions.ball);
    if (this.shuttlecock) this.shuttlecock.position.copy(this.basePositions.shuttlecock);
  }

  // =========================================================================
  // 8. MOUSE MOVE & REAL-TIME RAYCASTING HOVER DETECTION
  // =========================================================================
  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;

    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (!this.camera) return;

    // Raycast against all 4 sports objects
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const candidateObjects = [this.football, this.cricketBat, this.cricketBall, this.shuttlecock].filter(Boolean);
    const intersects = this.raycaster.intersectObjects(candidateObjects, true);

    let detectedKey = null;

    if (intersects.length > 0) {
      let topGroup = intersects[0].object;
      while (topGroup.parent && topGroup.parent !== this.scene) {
        topGroup = topGroup.parent;
      }
      if (topGroup.name) {
        detectedKey = topGroup.name;
      }
    }

    // Update Hover States
    const keys = ['football', 'bat', 'ball', 'shuttlecock'];
    keys.forEach(k => {
      const isHovered = (detectedKey === k);
      this.hoverState[k].hovered = isHovered;
      this.hoverState[k].targetScale = isHovered ? (k === 'ball' ? 1.30 : k === 'football' ? 1.25 : 1.20) : 1.0;
    });

    this.hoveredObject = detectedKey;

    // Change cursor style and show HUD tooltip
    if (detectedKey) {
      document.body.style.cursor = 'pointer';
      this.updateHudTooltip(e, detectedKey);
    } else {
      document.body.style.cursor = 'default';
      this.updateHudTooltip(e, null);
    }
  }

  onClick(e) {
    // If click was on interactive form elements or modals, ignore
    if (e.target.closest('input, textarea, button, a, select, aside, #sidebar, .glass-panel-interactive')) {
      return;
    }

    if (this.hoveredObject) {
      const k = this.hoveredObject;
      this.hoverState[k].impulse = 0.22; // Trigger click impulse burst!

      // Play audio cue or pulse
      if (window.sports3D) {
        if (k === 'football') {
          this.football.position.y += 0.4;
        } else if (k === 'shuttlecock') {
          this.shuttlecock.position.y += 0.35;
        }
      }
    }
  }

  focusSport(sportKey) {
    this.focusedObject = sportKey;
    const isMobile = window.innerWidth < 768;

    let target = null;
    let zOffset = 8;

    if (sportKey === 'football' && this.football) {
      target = this.football.position;
      zOffset = isMobile ? 10 : 8;
      this.hoverState.football.impulse = 0.15;
    } else if ((sportKey === 'cricket' || sportKey === 'bat' || sportKey === 'ball') && this.cricketBat) {
      target = this.cricketBat.position;
      zOffset = isMobile ? 12 : 9;
      this.hoverState.bat.impulse = 0.18;
    } else if ((sportKey === 'badminton' || sportKey === 'shuttlecock') && this.shuttlecock) {
      target = this.shuttlecock.position;
      zOffset = isMobile ? 9 : 7;
      this.hoverState.shuttlecock.impulse = 0.16;
    }

    if (target) {
      this.cameraFocusTarget = {
        x: target.x + (sportKey === 'cricket' ? 1.0 : 0),
        y: target.y,
        z: target.z + zOffset,
        lookX: target.x,
        lookY: target.y,
        lookZ: target.z
      };
    }
  }

  resetView() {
    this.focusedObject = null;
    this.cameraFocusTarget = { x: 0, y: 0, z: 24, lookX: 0, lookY: 0, lookZ: 0 };
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.updateObjectPositions();
  }

  // =========================================================================
  // 9. ANIMATION LOOP WITH INTERACTIVE 3D HOVER TRANSFORMATIONS
  // =========================================================================
  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Smooth camera mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    // Smooth camera target lerp
    const lerpSpeed = 0.05;
    this.camera.position.x += (this.cameraFocusTarget.x + this.mouseX * 1.8 - this.camera.position.x) * lerpSpeed;
    this.camera.position.y += (this.cameraFocusTarget.y + this.mouseY * 1.4 - this.camera.position.y) * lerpSpeed;
    this.camera.position.z += (this.cameraFocusTarget.z - this.camera.position.z) * lerpSpeed;

    this.currentLookAt.x += (this.cameraFocusTarget.lookX - this.currentLookAt.x) * lerpSpeed;
    this.currentLookAt.y += (this.cameraFocusTarget.lookY - this.currentLookAt.y) * lerpSpeed;
    this.currentLookAt.z += (this.cameraFocusTarget.lookZ - this.currentLookAt.z) * lerpSpeed;
    this.camera.lookAt(this.currentLookAt.x, this.currentLookAt.y, this.currentLookAt.z);

    // -----------------------------------------------------------------------
    // A. 3D FOOTBALL ANIMATION (Dynamic Magnus Spin on Hover)
    // -----------------------------------------------------------------------
    if (this.football) {
      const state = this.hoverState.football;
      state.currentScale += (state.targetScale - state.currentScale) * 0.12;
      this.football.scale.set(state.currentScale, state.currentScale, state.currentScale);

      // Rotational acceleration on hover
      const spinTarget = state.hovered ? 0.055 : 0.009;
      state.spinVelocity += (spinTarget - state.spinVelocity) * 0.1;
      const totalSpin = state.spinVelocity + state.impulse;

      this.football.rotation.y += totalSpin;
      this.football.rotation.x += totalSpin * 0.65;

      // Dynamic tilt following cursor when hovered
      if (state.hovered) {
        this.football.rotation.z += (this.mouseX * 0.45 - this.football.rotation.z) * 0.1;
      }

      // Tactical Scan Ring Acceleration & Pulse
      if (this.footballScanRing) {
        this.footballScanRing.rotation.z -= totalSpin * 1.8;
        this.footballScanRing.material.opacity = state.hovered ? 0.85 : 0.45;
      }

      // Gentle floating bob
      this.football.position.y = this.basePositions.football.y + Math.sin(time * 1.6) * 0.08 + (state.hovered ? 0.2 : 0);

      // Dampen impulse
      state.impulse *= 0.92;
    }

    // -----------------------------------------------------------------------
    // B. 3D CRICKET BAT ANIMATION (Dynamic Cover-Drive Swing on Hover)
    // -----------------------------------------------------------------------
    if (this.cricketBat) {
      const state = this.hoverState.bat;
      state.currentScale += (state.targetScale - state.currentScale) * 0.12;
      this.cricketBat.scale.set(state.currentScale, state.currentScale, state.currentScale);

      if (state.hovered) {
        // Dynamic cover-drive stroke animation!
        state.swingPhase += 0.08 + state.impulse;
        const driveStroke = Math.sin(state.swingPhase) * 0.35;
        this.cricketBat.rotation.z = -0.32 + driveStroke;
        this.cricketBat.rotation.y = 0.42 + Math.cos(state.swingPhase) * 0.25;
        this.cricketBat.position.x = this.basePositions.bat.x + Math.sin(state.swingPhase) * 0.3;
      } else {
        // Return smoothly to ready stance
        this.cricketBat.rotation.z += (-0.32 - this.cricketBat.rotation.z) * 0.08;
        this.cricketBat.rotation.y += (0.42 + Math.sin(time * 0.7) * 0.07 - this.cricketBat.rotation.y) * 0.08;
        this.cricketBat.position.x += (this.basePositions.bat.x - this.cricketBat.position.x) * 0.08;
      }

      this.cricketBat.position.y = this.basePositions.bat.y + Math.sin(time * 1.2 + 1.0) * 0.07;
      state.impulse *= 0.92;
    }

    // -----------------------------------------------------------------------
    // C. 3D CRICKET BALL ANIMATION (High-RPM Seam Spin on Hover)
    // -----------------------------------------------------------------------
    if (this.cricketBall) {
      const state = this.hoverState.ball;
      state.currentScale += (state.targetScale - state.currentScale) * 0.12;
      this.cricketBall.scale.set(state.currentScale, state.currentScale, state.currentScale);

      // High-RPM 6-Row seam spin
      const spinTarget = state.hovered ? 0.08 : 0.014;
      state.spinVelocity += (spinTarget - state.spinVelocity) * 0.1;
      const totalSpin = state.spinVelocity + state.impulse;

      this.cricketBall.rotation.x += totalSpin;
      this.cricketBall.rotation.y += totalSpin * 1.15;

      // Trajectory curve bob
      const ballBob = state.hovered ? Math.sin(time * 3.5) * 0.22 : Math.cos(time * 1.5) * 0.06;
      this.cricketBall.position.y = this.basePositions.ball.y + ballBob;

      state.impulse *= 0.92;
    }

    // -----------------------------------------------------------------------
    // D. 3D SHUTTLECOCK ANIMATION (565 km/h Smash Spiral on Hover)
    // -----------------------------------------------------------------------
    if (this.shuttlecock) {
      const state = this.hoverState.shuttlecock;
      state.currentScale += (state.targetScale - state.currentScale) * 0.12;
      this.shuttlecock.scale.set(state.currentScale, state.currentScale, state.currentScale);

      // Fast aerodynamic spiral on hover
      const spiralTarget = state.hovered ? 0.085 : 0.012;
      state.spiralVelocity += (spiralTarget - state.spiralVelocity) * 0.1;
      const totalSpiral = state.spiralVelocity + state.impulse;

      this.shuttlecock.rotation.y += totalSpiral;

      if (state.hovered) {
        // Steep attack smash dive attitude (cork leading)
        this.shuttlecock.rotation.x += (0.85 + Math.sin(time * 4.0) * 0.12 - this.shuttlecock.rotation.x) * 0.1;
        if (this.shuttlecockAeroRing) {
          this.shuttlecockAeroRing.material.opacity = 0.9;
          this.shuttlecockAeroRing.scale.set(1.2, 1.2, 1.2);
        }
      } else {
        this.shuttlecock.rotation.x += (Math.sin(time * 1.8) * 0.15 + 0.45 - this.shuttlecock.rotation.x) * 0.08;
        if (this.shuttlecockAeroRing) {
          this.shuttlecockAeroRing.material.opacity = 0.55;
          this.shuttlecockAeroRing.scale.set(1.0, 1.0, 1.0);
        }
      }

      this.shuttlecock.position.y = this.basePositions.shuttlecock.y + Math.sin(time * 1.6 + 2.0) * 0.08;
      state.impulse *= 0.92;
    }

    // -----------------------------------------------------------------------
    // E. DRIFT PARTICLES
    // -----------------------------------------------------------------------
    if (this.particles) {
      this.particles.rotation.y += 0.0005;
      this.particles.rotation.x += 0.0002;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Auto-initialize when canvas container exists
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('three-canvas-container')) {
    window.sports3D = new Sports3DScene('three-canvas-container');
  }
});
