/* ============================================================
   STINGCLOUD VPS — Interactive 3D Server Experience
   Three.js Scene: Procedural server model, open/close animation,
   component hotspots, camera transitions
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── COMPONENT DATA ──
const COMPONENTS = {
  cpu: {
    icon: '⚡',
    title: 'AMD EPYC™ Processor',
    desc: 'High-performance Zen 4 cores deliver unmatched single-thread and multi-thread performance for any workload — from web apps to databases to AI inference.',
    specs: [
      ['Architecture', 'AMD Zen 4'],
      ['Cores', 'Up to 32 vCPUs'],
      ['Clock Speed', '5.0 GHz Boost'],
      ['Cache', '256MB L3'],
    ],
    cameraPos: { x: 1.0, y: 1.2, z: 2.5 },
    lookAt: { x: -0.3, y: 0.15, z: 0 },
  },
  ram: {
    icon: '🧠',
    title: 'DDR5 ECC Memory',
    desc: 'Error-correcting DDR5 RAM ensures zero data corruption. Lightning-fast memory access keeps your applications responsive under any load.',
    specs: [
      ['Type', 'DDR5 ECC'],
      ['Capacity', 'Up to 128GB'],
      ['Speed', '4800 MHz'],
      ['Channels', 'Dual Channel'],
    ],
    cameraPos: { x: 2.0, y: 1.5, z: 2.0 },
    lookAt: { x: 0.5, y: 0.2, z: 0 },
  },
  ssd: {
    icon: '💾',
    title: 'NVMe Gen4 SSD',
    desc: 'Enterprise-grade NVMe storage with power-loss protection. RAID-10 mirroring ensures your data is always safe and accessible at blazing speed.',
    specs: [
      ['Interface', 'PCIe Gen4 NVMe'],
      ['Read Speed', '7,000 MB/s'],
      ['Write Speed', '5,500 MB/s'],
      ['Capacity', 'Up to 2TB'],
    ],
    cameraPos: { x: 0.5, y: 0.6, z: 2.8 },
    lookAt: { x: -0.5, y: -0.35, z: 0 },
  },
  network: {
    icon: '🌐',
    title: '10Gbps Network',
    desc: 'Dual-redundant 10Gbps uplinks with enterprise DDoS mitigation. Unlimited bandwidth means you never worry about overage charges.',
    specs: [
      ['Speed', '10 Gbps'],
      ['Redundancy', 'Dual Uplink'],
      ['DDoS Protection', 'Included'],
      ['Bandwidth', 'Unlimited'],
    ],
    cameraPos: { x: 2.5, y: 0.8, z: 1.5 },
    lookAt: { x: 0.8, y: -0.1, z: -0.5 },
  },
  psu: {
    icon: '🔋',
    title: 'Redundant Power Supply',
    desc: 'Dual hot-swappable power supplies with automatic failover. Backed by Tier-4 datacenter UPS and 72-hour diesel generator backup.',
    specs: [
      ['Configuration', 'Dual PSU'],
      ['Rating', '800W 80+ Platinum'],
      ['Failover', 'Automatic'],
      ['Uptime SLA', '99.99%'],
    ],
    cameraPos: { x: -0.5, y: 0.5, z: 2.5 },
    lookAt: { x: -0.8, y: -0.4, z: -0.5 },
  },
};

// ── STATE ──
let state = 'IDLE'; // IDLE, OPENING, OPEN, FOCUSED, CLOSING
let currentComponent = null;
let autoRotate = true;

// ── ANIMATION HELPERS ──
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpVec3(v, target, t) {
  v.x = lerp(v.x, target.x, t);
  v.y = lerp(v.y, target.y, t);
  v.z = lerp(v.z, target.z, t);
}

// ── SCENE SETUP ──
const canvas = document.getElementById('vpsCanvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060b18, 0.04);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5, 3.5, 6);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI * 0.55;
controls.minPolarAngle = Math.PI * 0.15;
controls.minDistance = 3;
controls.maxDistance = 12;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;
controls.target.set(0, 0.2, 0);

// ── LIGHTING ──
const ambientLight = new THREE.AmbientLight(0x111d35, 2.0);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = false;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
fillLight.position.set(-4, 3, -3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x7c3aed, 0.5);
rimLight.position.set(0, 5, -6);
scene.add(rimLight);

// Internal glow (revealed when server opens)
const internalGlow = new THREE.PointLight(0x38bdf8, 0, 4);
internalGlow.position.set(0, 0.2, 0);
scene.add(internalGlow);

// ── MATERIALS ──
const matChassis = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  metalness: 0.85,
  roughness: 0.25,
});
const matChassisInner = new THREE.MeshStandardMaterial({
  color: 0x0d1629,
  metalness: 0.6,
  roughness: 0.5,
});
const matAccent = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  emissive: 0x38bdf8,
  emissiveIntensity: 0.6,
  metalness: 0.9,
  roughness: 0.1,
});
const matLED = new THREE.MeshBasicMaterial({
  color: 0x10b981,
});
const matLEDBlue = new THREE.MeshBasicMaterial({
  color: 0x38bdf8,
});
const matMotherboard = new THREE.MeshStandardMaterial({
  color: 0x0a3d2a,
  metalness: 0.3,
  roughness: 0.7,
});
const matCPU = new THREE.MeshStandardMaterial({
  color: 0x2d2d3d,
  metalness: 0.9,
  roughness: 0.15,
});
const matHeatsink = new THREE.MeshStandardMaterial({
  color: 0x8a8a9a,
  metalness: 0.95,
  roughness: 0.2,
});
const matRAM = new THREE.MeshStandardMaterial({
  color: 0x1a472a,
  metalness: 0.6,
  roughness: 0.4,
});
const matSSD = new THREE.MeshStandardMaterial({
  color: 0x1a1a3e,
  metalness: 0.8,
  roughness: 0.2,
});
const matPSU = new THREE.MeshStandardMaterial({
  color: 0x222233,
  metalness: 0.7,
  roughness: 0.3,
});
const matNetwork = new THREE.MeshStandardMaterial({
  color: 0x1e3a5f,
  metalness: 0.7,
  roughness: 0.35,
});
const matVent = new THREE.MeshStandardMaterial({
  color: 0x111122,
  metalness: 0.5,
  roughness: 0.6,
});

// ── BUILD SERVER MODEL ──
const serverGroup = new THREE.Group();
const sidePanelGroup = new THREE.Group();
const internalsGroup = new THREE.Group();
internalsGroup.visible = false;

// Server dimensions (rack-mount 2U style)
const W = 4.4, H = 1.5, D = 3.2;

// Main chassis body (open box, no right side)
function buildChassis() {
  // Bottom
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, D), matChassis);
  bottom.position.set(0, -H/2, 0);
  serverGroup.add(bottom);

  // Top
  const top = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, D), matChassis);
  top.position.set(0, H/2, 0);
  serverGroup.add(top);

  // Left side
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.06, H, D), matChassis);
  left.position.set(-W/2, 0, 0);
  serverGroup.add(left);

  // Back panel
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.06), matChassis);
  back.position.set(0, 0, -D/2);
  serverGroup.add(back);

  // Front panel
  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.08), matChassis);
  frontPanel.position.set(0, 0, D/2);
  serverGroup.add(frontPanel);

  // Front accent strip (blue LED bar)
  const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(W * 0.8, 0.03, 0.01), matAccent);
  ledStrip.position.set(0, H/2 - 0.15, D/2 + 0.045);
  serverGroup.add(ledStrip);

  // Front LED indicators
  for (let i = 0; i < 4; i++) {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      i < 3 ? matLED : matLEDBlue
    );
    led.position.set(-W/2 + 0.3 + i * 0.15, H/2 - 0.35, D/2 + 0.045);
    serverGroup.add(led);
  }

  // Front vent grilles
  for (let i = 0; i < 12; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.08, H * 0.4, 0.01), matVent);
    vent.position.set(-W/2 + 1.2 + i * 0.22, -0.1, D/2 + 0.045);
    serverGroup.add(vent);
  }

  // Power button (front)
  const pwrBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), matAccent);
  pwrBtn.rotation.x = Math.PI / 2;
  pwrBtn.position.set(W/2 - 0.3, H/2 - 0.35, D/2 + 0.045);
  serverGroup.add(pwrBtn);

  // Rear IO ports (small rectangles on back)
  for (let i = 0; i < 6; i++) {
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), matVent);
    port.position.set(-W/2 + 0.5 + i * 0.35, -0.1, -D/2 - 0.02);
    serverGroup.add(port);
  }

  // Rear fan exhaust circles
  for (let i = 0; i < 2; i++) {
    const fan = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 24), matChassisInner);
    fan.position.set(W/2 - 0.5 - i * 0.65, 0.1, -D/2 - 0.02);
    serverGroup.add(fan);
  }

  // Edge accent lines (wireframe feel)
  const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W + 0.01, H + 0.01, D + 0.01));
  const edgesMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15 });
  const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
  serverGroup.add(edgeLines);

  // Feet
  for (let x of [-1, 1]) {
    for (let z of [-1, 1]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 12), matChassis);
      foot.position.set(x * (W/2 - 0.3), -H/2 - 0.03, z * (D/2 - 0.3));
      serverGroup.add(foot);
    }
  }
}

// Side panel (separate group for animation)
function buildSidePanel() {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.05, H - 0.02, D - 0.02), matChassis);
  panel.position.set(W/2, 0, 0);
  sidePanelGroup.add(panel);

  // Panel handle
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.06), matAccent);
  handle.position.set(W/2 + 0.035, 0.2, D/2 - 0.3);
  sidePanelGroup.add(handle);

  // Panel edge accent
  const panelEdge = new THREE.Mesh(new THREE.BoxGeometry(0.01, H - 0.04, 0.02), matAccent);
  panelEdge.position.set(W/2 + 0.03, 0, 0);
  panelEdge.material = matAccent.clone();
  panelEdge.material.emissiveIntensity = 0.3;
  sidePanelGroup.add(panelEdge);
}

// Internal components
function buildInternals() {
  // Motherboard (flat PCB)
  const mobo = new THREE.Mesh(new THREE.BoxGeometry(W * 0.85, 0.04, D * 0.85), matMotherboard);
  mobo.position.set(-0.1, -H/2 + 0.1, 0);
  internalsGroup.add(mobo);

  // PCB traces (decorative lines on motherboard)
  for (let i = 0; i < 8; i++) {
    const trace = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.005, D * 0.6 * Math.random() + 0.3),
      matAccent.clone()
    );
    trace.material.emissiveIntensity = 0.2;
    trace.position.set(
      -W/2 + 0.5 + i * 0.45,
      -H/2 + 0.125,
      (Math.random() - 0.5) * 0.5
    );
    internalsGroup.add(trace);
  }

  // ── CPU + Heatsink ──
  const cpuGroup = new THREE.Group();
  cpuGroup.userData = { componentId: 'cpu' };

  // CPU die
  const cpuDie = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), matCPU);
  cpuGroup.add(cpuDie);

  // Heatsink fins
  for (let i = 0; i < 10; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.02), matHeatsink);
    fin.position.set(0, 0.2, -0.22 + i * 0.05);
    cpuGroup.add(fin);
  }

  // CPU fan (simplified)
  const fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 24), matChassisInner);
  fanRing.rotation.x = Math.PI / 2;
  fanRing.position.set(0, 0.42, 0);
  cpuGroup.add(fanRing);

  cpuGroup.position.set(-0.3, -H/2 + 0.15, 0);
  internalsGroup.add(cpuGroup);

  // ── RAM Modules ──
  const ramGroup = new THREE.Group();
  ramGroup.userData = { componentId: 'ram' };
  for (let i = 0; i < 4; i++) {
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 0.9), matRAM);
    stick.position.set(0.55 + i * 0.09, -H/2 + 0.38, 0);
    ramGroup.add(stick);

    // RAM chip accents
    for (let j = 0; j < 4; j++) {
      const chip = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.06, 0.08), matCPU);
      chip.position.set(0.55 + i * 0.09 + 0.025, -H/2 + 0.2 + j * 0.14, 0);
      ramGroup.add(chip);
    }
  }
  internalsGroup.add(ramGroup);

  // ── NVMe SSDs ──
  const ssdGroup = new THREE.Group();
  ssdGroup.userData = { componentId: 'ssd' };
  for (let i = 0; i < 2; i++) {
    const ssd = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.8), matSSD);
    ssd.position.set(-0.5 - i * 0.35, -H/2 + 0.12, -0.4);
    ssdGroup.add(ssd);

    // SSD label accent
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.005, 0.15), matAccent.clone());
    label.material.emissiveIntensity = 0.2;
    label.position.set(-0.5 - i * 0.35, -H/2 + 0.14, -0.5);
    ssdGroup.add(label);
  }
  internalsGroup.add(ssdGroup);

  // ── Network Card (PCIe) ──
  const netGroup = new THREE.Group();
  netGroup.userData = { componentId: 'network' };
  const netCard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 1.0), matNetwork);
  netCard.position.set(1.2, -H/2 + 0.35, -0.3);
  netGroup.add(netCard);

  // Ethernet ports
  for (let i = 0; i < 2; i++) {
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.14), matChassisInner);
    port.position.set(1.2, -H/2 + 0.25, -D/2 + 0.1 + i * 0.2);
    netGroup.add(port);
  }

  // Port LED
  const netLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), matLED);
  netLed.position.set(1.2, -H/2 + 0.35, -D/2 + 0.05);
  netGroup.add(netLed);

  internalsGroup.add(netGroup);

  // ── PSU ──
  const psuGroup = new THREE.Group();
  psuGroup.userData = { componentId: 'psu' };
  const psuBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, H * 0.6, D * 0.35), matPSU);
  psuBox.position.set(-W/2 + 0.8, -H/2 + 0.5, -D/2 + 0.6);
  psuGroup.add(psuBox);

  // PSU fan
  const psuFan = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 24), matChassisInner);
  psuFan.rotation.y = Math.PI / 2;
  psuFan.position.set(-W/2 + 0.2, -H/2 + 0.5, -D/2 + 0.6);
  psuGroup.add(psuFan);

  // PSU label
  const psuLabel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.01), matAccent.clone());
  psuLabel.material.emissiveIntensity = 0.15;
  psuLabel.position.set(-W/2 + 0.9, -H/2 + 0.55, -D/2 + 0.78);
  psuGroup.add(psuLabel);

  internalsGroup.add(psuGroup);
}

// ── GROUND & ENVIRONMENT ──
function buildEnvironment() {
  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(40, 40);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x060b18,
    metalness: 0.1,
    roughness: 0.9,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -H/2 - 0.04;
  scene.add(ground);

  // Ground grid
  const gridHelper = new THREE.GridHelper(20, 40, 0x38bdf8, 0x111d35);
  gridHelper.position.y = -H/2 - 0.03;
  gridHelper.material.opacity = 0.15;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // Floating particles
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.03,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);
}

// ── ASSEMBLE ──
buildChassis();
buildSidePanel();
buildInternals();
buildEnvironment();

serverGroup.add(sidePanelGroup);
serverGroup.add(internalsGroup);
scene.add(serverGroup);

// ── ANIMATION TARGETS ──
const sidePanelTarget = { x: W/2, rotY: 0 };
const cameraTarget = { x: 5, y: 3.5, z: 6 };
const lookAtTarget = { x: 0, y: 0.2, z: 0 };

const IDLE_CAM = { x: 5, y: 3.5, z: 6 };
const IDLE_LOOK = { x: 0, y: 0.2, z: 0 };
const OPEN_CAM = { x: 3.5, y: 1.8, z: 3.5 };
const OPEN_LOOK = { x: 0, y: 0, z: 0 };

// ── RAYCASTER ──
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function getClickableComponents() {
  const clickable = [];
  internalsGroup.children.forEach(child => {
    if (child.userData.componentId) {
      child.traverse(mesh => {
        if (mesh.isMesh) {
          mesh.userData.componentId = child.userData.componentId;
          clickable.push(mesh);
        }
      });
    }
  });
  return clickable;
}

// ── UI ELEMENTS ──
const loadingScreen = document.getElementById('loadingScreen');
const heroOverlay = document.getElementById('heroOverlay');
const infoPanel = document.getElementById('infoPanel');
const controlBar = document.getElementById('controlBar');
const labelsContainer = document.getElementById('labelsContainer');
const btnExplore = document.getElementById('btnExplore');
const btnRotate = document.getElementById('btnRotate');
const btnReset = document.getElementById('btnReset');
const infoClose = document.getElementById('infoClose');

// ── LABEL MANAGEMENT ──
function createLabels() {
  labelsContainer.innerHTML = '';
  Object.entries(COMPONENTS).forEach(([id, data]) => {
    const label = document.createElement('div');
    label.className = 'comp-label';
    label.dataset.component = id;
    label.innerHTML = `<span class="label-dot"></span>${data.title.split(' ')[0]}`;
    label.addEventListener('click', () => focusComponent(id));
    labelsContainer.appendChild(label);
  });
}

function updateLabels() {
  if (state !== 'OPEN') return;

  const labels = labelsContainer.querySelectorAll('.comp-label');
  labels.forEach(label => {
    const id = label.dataset.component;
    const compData = COMPONENTS[id];

    // Find the component group's world position
    let worldPos = new THREE.Vector3();
    internalsGroup.children.forEach(child => {
      if (child.userData.componentId === id) {
        child.getWorldPosition(worldPos);
        worldPos.y += 0.3;
      }
    });

    // Project to screen
    const screenPos = worldPos.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

    // Check if in front of camera
    if (screenPos.z < 1 && x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight) {
      label.style.left = x + 'px';
      label.style.top = y + 'px';
      label.style.display = 'flex';
    } else {
      label.style.display = 'none';
    }
  });
}

function hideLabels() {
  labelsContainer.innerHTML = '';
}

// ── STATE TRANSITIONS ──
function openServer() {
  if (state !== 'IDLE') return;
  state = 'OPENING';
  controls.autoRotate = false;
  autoRotate = false;
  btnRotate.classList.remove('active');

  // Animate side panel sliding off
  sidePanelTarget.x = W/2 + 2.5;
  sidePanelTarget.rotY = -0.3;

  // Move camera to open view
  Object.assign(cameraTarget, OPEN_CAM);
  Object.assign(lookAtTarget, OPEN_LOOK);

  // Show internals after brief delay
  setTimeout(() => {
    internalsGroup.visible = true;
    internalGlow.intensity = 2.5;
    state = 'OPEN';
    createLabels();

    // UI transitions
    heroOverlay.classList.add('hidden');
    controlBar.classList.add('visible');
  }, 800);
}

function closeServer() {
  if (state !== 'OPEN' && state !== 'FOCUSED') return;
  state = 'CLOSING';

  // Hide info panel and labels
  infoPanel.classList.remove('visible');
  hideLabels();
  controlBar.classList.remove('visible');
  currentComponent = null;

  // Animate panel back
  sidePanelTarget.x = W/2;
  sidePanelTarget.rotY = 0;

  // Move camera back
  Object.assign(cameraTarget, IDLE_CAM);
  Object.assign(lookAtTarget, IDLE_LOOK);

  // Hide internals
  setTimeout(() => {
    internalsGroup.visible = false;
    internalGlow.intensity = 0;
    state = 'IDLE';
    heroOverlay.classList.remove('hidden');
    if (autoRotate) controls.autoRotate = true;
  }, 800);
}

function focusComponent(id) {
  if (state !== 'OPEN') return;
  state = 'FOCUSED';
  currentComponent = id;
  const data = COMPONENTS[id];

  // Move camera
  Object.assign(cameraTarget, data.cameraPos);
  Object.assign(lookAtTarget, data.lookAt);

  // Update info panel
  document.getElementById('infoIcon').textContent = data.icon;
  document.getElementById('infoTitle').textContent = data.title;
  document.getElementById('infoDesc').textContent = data.desc;

  const specsEl = document.getElementById('infoSpecs');
  specsEl.innerHTML = data.specs.map(([label, value]) =>
    `<div class="spec-row">
      <span class="spec-row-label">${label}</span>
      <span class="spec-row-value">${value}</span>
    </div>`
  ).join('');

  // Show panel
  setTimeout(() => infoPanel.classList.add('visible'), 200);

  // Hide labels while focused
  hideLabels();
}

function unfocusComponent() {
  if (state !== 'FOCUSED') return;
  state = 'OPEN';
  currentComponent = null;

  infoPanel.classList.remove('visible');

  // Return camera to open view
  Object.assign(cameraTarget, OPEN_CAM);
  Object.assign(lookAtTarget, OPEN_LOOK);

  // Restore labels
  setTimeout(() => createLabels(), 300);
}

// ── EVENT LISTENERS ──
btnExplore.addEventListener('click', openServer);
btnReset.addEventListener('click', closeServer);
infoClose.addEventListener('click', unfocusComponent);

btnRotate.addEventListener('click', () => {
  if (state !== 'IDLE') return;
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;
  btnRotate.classList.toggle('active', autoRotate);
});

// Click on 3D components
canvas.addEventListener('click', (e) => {
  if (state !== 'OPEN') return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const clickable = getClickableComponents();
  const intersects = raycaster.intersectObjects(clickable);

  if (intersects.length > 0) {
    const componentId = intersects[0].object.userData.componentId;
    if (componentId && COMPONENTS[componentId]) {
      focusComponent(componentId);
    }
  }
});

// Hover cursor change
canvas.addEventListener('mousemove', (e) => {
  if (state !== 'OPEN') return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const clickable = getClickableComponents();
  const intersects = raycaster.intersectObjects(clickable);
  canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
});

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state === 'FOCUSED') unfocusComponent();
    else if (state === 'OPEN') closeServer();
  }
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── ANIMATION LOOP ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  const speed = 0.03; // lerp speed

  // Animate side panel
  sidePanelGroup.position.x = lerp(sidePanelGroup.position.x, sidePanelTarget.x - W/2, speed);
  sidePanelGroup.rotation.y = lerp(sidePanelGroup.rotation.y, sidePanelTarget.rotY, speed);

  // Animate internal glow pulse
  if (internalsGroup.visible) {
    internalGlow.intensity = 2.0 + Math.sin(elapsed * 2) * 0.5;
  }

  // Animate camera position (smooth follow)
  if (state !== 'IDLE' || !controls.autoRotate) {
    lerpVec3(camera.position, cameraTarget, speed);
    lerpVec3(controls.target, lookAtTarget, speed);
  }

  // Gentle server float
  serverGroup.position.y = Math.sin(elapsed * 0.8) * 0.04;

  // Update labels
  updateLabels();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
}

// ── INIT ──
function init() {
  // Dismiss loading screen quickly
  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('hidden');
  }, 400);

  // Start animation
  animate();

  // Footer year
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

try {
  init();
} catch (err) {
  console.error('Three.js VPS initialization error:', err);
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
}
