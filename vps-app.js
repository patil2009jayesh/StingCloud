/* ============================================================
   STINGCLOUD VPS — Interactive 3D Server Experience
   High-Contrast Enterprise Multi-Layer Server Model
   Three.js Scene: Multi-tier 3U rack server, slide-out compute blade,
   dual AMD EPYC sockets, DDR5 banks, hot-swap NVMe drive bays,
   modular fan wall, studio high-contrast lighting
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── COMPONENT DATA ──
const COMPONENTS = {
  cpu: {
    icon: '⚡',
    title: 'Dual AMD EPYC™ 9654',
    desc: 'Dual-socket enterprise Zen 4 silicon with 192 total vCPUs and 5.0 GHz boost. Stacked copper heatpipe cooling towers guarantee peak throughput with zero thermal throttling.',
    specs: [
      ['Sockets', 'Dual AMD EPYC Zen 4'],
      ['Cores / Threads', 'Up to 192 vCPUs'],
      ['Clock Speed', '5.0 GHz Max Boost'],
      ['L3 Cache', '384MB High-Speed Pool'],
    ],
    cameraPos: { x: 0.8, y: 2.2, z: 2.8 },
    lookAt: { x: 0.0, y: 0.2, z: 0.1 },
  },
  ram: {
    icon: '🧠',
    title: 'DDR5 ECC Octa-Channel',
    desc: 'High-density DDR5 ECC memory running in 8-channel configuration with on-die error-correcting code for zero-fault data integrity and ultra-low latency memory access.',
    specs: [
      ['Architecture', 'DDR5 Octa-Channel'],
      ['Capacity', 'Up to 512GB ECC'],
      ['Bandwidth', '4800 MT/s Ultra-Wide'],
      ['Error Handling', 'Multi-Bit ECC Guard'],
    ],
    cameraPos: { x: 2.2, y: 1.8, z: 2.0 },
    lookAt: { x: 1.3, y: 0.3, z: 0.1 },
  },
  ssd: {
    icon: '💾',
    title: '12x Hot-Swap NVMe SAN',
    desc: 'Multi-layer hot-swappable enterprise NVMe Gen4 drive array in RAID-10. Features independent activity LEDs, quick-eject caddies, and continuous hardware-level encryption.',
    specs: [
      ['Configuration', '12x 2.5" Hot-Swap Caddies'],
      ['Throughput', 'Up to 14,000 MB/s Read'],
      ['IOPS', 'Over 1.8 Million IOPS'],
      ['Redundancy', 'Hardware RAID-10 Mirror'],
    ],
    cameraPos: { x: 0.0, y: 1.0, z: 3.4 },
    lookAt: { x: 0.0, y: 0.15, z: 1.6 },
  },
  network: {
    icon: '🌐',
    title: 'Dual 100G/10G Optical Fabric',
    desc: 'Redundant PCIe Gen5 optical networking with dual SFP28 cages. Connected directly to Tier-1 cloud transits with enterprise DDoS scrubbing and unlimited bandwidth.',
    specs: [
      ['Port Type', 'Dual SFP28 Optical 10G/100G'],
      ['Uplink Redundancy', 'Active-Active LACP'],
      ['DDoS Mitigation', 'Line-Rate 10Tbps Defense'],
      ['Latency', '< 2ms Cloud Backbone'],
    ],
    cameraPos: { x: 2.6, y: 1.2, z: 1.4 },
    lookAt: { x: 1.2, y: -0.1, z: -0.7 },
  },
  psu: {
    icon: '🔋',
    title: 'Dual 80+ Titanium PSUs',
    desc: 'Hot-swappable dual 1200W Titanium-certified power distribution modules with automatic millisecond failover, copper bus bar links, and Tier-4 datacenter generator backup.',
    specs: [
      ['Efficiency', '96% 80+ Titanium'],
      ['Configuration', '1+1 Hot-Swap Redundant'],
      ['Failover Time', '0ms Seamless Transfer'],
      ['Uptime SLA', '99.99% Guaranteed'],
    ],
    cameraPos: { x: -2.4, y: 1.2, z: 1.6 },
    lookAt: { x: -1.4, y: -0.1, z: -0.8 },
  },
  cooling: {
    icon: '❄️',
    title: 'Modular High-RPM Fan Wall',
    desc: 'Quad counter-rotating dual-rotor cooling fans with smart PWM thermal zoning and illuminated RGB status rings. Maintains optimal operating temperatures under 100% sustained load.',
    specs: [
      ['Fan Units', '4x Dual-Rotor Modular'],
      ['Airflow Volume', '240 CFM Static Pressure'],
      ['Bearing Type', 'Dual Precision Ball Bearings'],
      ['Thermal Target', '< 62°C Constant'],
    ],
    cameraPos: { x: 0.0, y: 1.8, z: 3.0 },
    lookAt: { x: 0.0, y: 0.3, z: 0.9 },
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
scene.fog = new THREE.FogExp2(0x070d1a, 0.032);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
const IDLE_CAM = { x: 5.2, y: 3.6, z: 5.8 };
const IDLE_LOOK = { x: 0, y: 0.1, z: 0 };
const OPEN_CAM = { x: 3.4, y: 4.4, z: 4.6 };
const OPEN_LOOK = { x: 0, y: 0.15, z: 0 };

camera.position.set(IDLE_CAM.x, IDLE_CAM.y, IDLE_CAM.z);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI * 0.54;
controls.minPolarAngle = Math.PI * 0.12;
controls.minDistance = 2.8;
controls.maxDistance = 12;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.75;
controls.target.set(IDLE_LOOK.x, IDLE_LOOK.y, IDLE_LOOK.z);

// ── HIGH-CONTRAST STUDIO LIGHTING ──
// 1. Cool Ambient Fill (prevents black dead shadows)
const ambientLight = new THREE.AmbientLight(0x223048, 1.6);
scene.add(ambientLight);

// 2. Powerful Crisp Key Light (creates razor-sharp metallic highlights)
const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
keyLight.position.set(6, 9, 6);
scene.add(keyLight);

// 3. Front Face Bezel Fill (illuminates drive bays, OLED screen, LEDs)
const frontBezelLight = new THREE.DirectionalLight(0xe0f2fe, 2.2);
frontBezelLight.position.set(0, 2, 7.5);
scene.add(frontBezelLight);

// 4. Electric Cyan Cyber Rim Light (sharp glowing edge along left & back)
const rimLightCyan = new THREE.DirectionalLight(0x38bdf8, 4.2);
rimLightCyan.position.set(-7, 5, -5);
scene.add(rimLightCyan);

// 5. Deep Violet Kicker Light (cyber depth on right & back)
const rimLightViolet = new THREE.DirectionalLight(0xa855f7, 3.2);
rimLightViolet.position.set(6, 6, -6);
scene.add(rimLightViolet);

// 6. Overhead Studio Soft Light
const topLight = new THREE.DirectionalLight(0xffffff, 2.2);
topLight.position.set(0, 10, 0);
scene.add(topLight);

// 7. Internal Inspection Glows (activated when opened)
const internalGlowCyan = new THREE.PointLight(0x38bdf8, 0, 7);
internalGlowCyan.position.set(0, 0.4, 0.2);
scene.add(internalGlowCyan);

const internalGlowWhite = new THREE.PointLight(0xffffff, 0, 5);
internalGlowWhite.position.set(0, 0.6, -0.2);
scene.add(internalGlowWhite);

// ── OLED SCREEN TEXTURE GENERATOR ──
function createOledTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');

  // Background
  ctx.fillStyle = '#050b16';
  ctx.fillRect(0, 0, 512, 128);

  // Border glow
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(3, 3, 506, 122);

  // Tech Grid lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 42); ctx.lineTo(502, 42);
  ctx.moveTo(10, 84); ctx.lineTo(502, 84);
  ctx.stroke();

  // Header
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 22px "Outfit", monospace';
  ctx.fillText('STINGCLOUD // ENTERPRISE NODE-01', 18, 30);

  // Status Indicator
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(485, 25, 7, 0, Math.PI * 2);
  ctx.fill();

  // Metrics
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('STATUS: OPTIMAL   32C / 64T   99.99% UPTIME', 18, 68);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px monospace';
  ctx.fillText('RAM: 128GB ECC  //  NET: 10G DUAL  //  21.8°C', 18, 110);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

// ── HIGH-CONTRAST MATERIALS ──
// Chassis body: Gunmetal brushed titanium with bright specular response
const matChassis = new THREE.MeshStandardMaterial({
  color: 0x2e384c,
  metalness: 0.82,
  roughness: 0.28,
});
const matChassisInner = new THREE.MeshStandardMaterial({
  color: 0x161d2b,
  metalness: 0.75,
  roughness: 0.4,
});
const matBezel = new THREE.MeshStandardMaterial({
  color: 0x1f2636,
  metalness: 0.88,
  roughness: 0.25,
});
// Rack ears & handles: High-polish chrome/aluminium
const matChrome = new THREE.MeshStandardMaterial({
  color: 0xd8e1ec,
  metalness: 0.96,
  roughness: 0.12,
});
const matSlideRails = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  metalness: 0.92,
  roughness: 0.2,
});
// Drive caddies: Brushed silver metal plates
const matDriveCaddy = new THREE.MeshStandardMaterial({
  color: 0x3d4960,
  metalness: 0.9,
  roughness: 0.22,
});
const matDriveLatch = new THREE.MeshStandardMaterial({
  color: 0x64748b,
  metalness: 0.95,
  roughness: 0.15,
});
// Glowing neon emissive materials
const matNeonCyan = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  emissive: 0x38bdf8,
  emissiveIntensity: 2.4,
  roughness: 0.1,
  metalness: 0.8,
});
const matNeonGreen = new THREE.MeshStandardMaterial({
  color: 0x10b981,
  emissive: 0x10b981,
  emissiveIntensity: 2.2,
  roughness: 0.1,
});
const matNeonAmber = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  emissive: 0xf59e0b,
  emissiveIntensity: 2.0,
  roughness: 0.1,
});
const matLEDDim = new THREE.MeshStandardMaterial({
  color: 0x064e3b,
  emissive: 0x064e3b,
  emissiveIntensity: 0.4,
});

// Hardware internal materials
const matMotherboard = new THREE.MeshStandardMaterial({
  color: 0x0b2419,
  metalness: 0.4,
  roughness: 0.6,
});
const matCopper = new THREE.MeshStandardMaterial({
  color: 0xd97736,
  metalness: 0.94,
  roughness: 0.2,
});
const matGold = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  metalness: 0.96,
  roughness: 0.15,
  emissive: 0xd97706,
  emissiveIntensity: 0.25,
});
const matAluminumFins = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0,
  metalness: 0.94,
  roughness: 0.16,
});
const matRAMHeatsink = new THREE.MeshStandardMaterial({
  color: 0x242e42,
  metalness: 0.85,
  roughness: 0.25,
});
const matPCIeCard = new THREE.MeshStandardMaterial({
  color: 0x1e3a5f,
  metalness: 0.75,
  roughness: 0.35,
});
const matPSUModule = new THREE.MeshStandardMaterial({
  color: 0x242a38,
  metalness: 0.82,
  roughness: 0.28,
});
const matOLED = new THREE.MeshBasicMaterial({
  map: createOledTexture(),
});

// ── ROOT SERVER GROUPS ──
const serverGroup = new THREE.Group();
const hoodGroup = new THREE.Group();        // Removable top service hood
const trayGroup = new THREE.Group();        // Slide-out server compute tray
const sidePanelGroup = new THREE.Group();   // Side inspection cover
const internalsGroup = new THREE.Group();   // Internal components
internalsGroup.visible = false;

// 3U Enterprise Rack Dimensions
const W = 4.6, H = 1.7, D = 3.6;

// Track animated components (fan blades, pulsing LEDs)
const rotatingFans = [];
const activityLEDs = [];

// ── BUILD MULTI-LAYER CHASSIS ──
function buildChassis() {
  // 1. Bottom Baseplate
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(W, 0.08, D), matChassis);
  bottom.position.set(0, -H/2, 0);
  serverGroup.add(bottom);

  // 2. Left Wall
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, H, D), matChassis);
  left.position.set(-W/2, 0, 0);
  serverGroup.add(left);

  // 3. Back Panel
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.08), matChassis);
  back.position.set(0, 0, -D/2);
  serverGroup.add(back);

  // Rear IO details (Power sockets, Exhaust vents, Dual SFP Ports)
  for (let i = 0; i < 2; i++) {
    const psuInlet = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.04), matChassisInner);
    psuInlet.position.set(-W/2 + 0.6 + i * 0.45, -H/2 + 0.4, -D/2 - 0.03);
    serverGroup.add(psuInlet);

    const psuPullRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16), matDriveLatch);
    psuPullRing.position.set(-W/2 + 0.6 + i * 0.45, -H/2 + 0.4, -D/2 - 0.06);
    serverGroup.add(psuPullRing);
  }

  // Rear exhaust fan grilles
  for (let i = 0; i < 3; i++) {
    const rearFan = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 24), matChassisInner);
    rearFan.position.set(W/2 - 0.7 - i * 0.65, 0.1, -D/2 - 0.02);
    serverGroup.add(rearFan);
  }

  // 4. FRONT MULTI-LAYER BEZEL (3 Tiers: Top Telemetry, Mid NVMe SAN, Bottom Ingress)
  buildFrontFaceplate();

  // 5. RACK MOUNT EARS & SLIDE RAILS
  buildRackMounts();

  // 6. Chamfered Edge Highlight Accent Lines (Bright cyan cyber wireframe)
  const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W + 0.02, H + 0.02, D + 0.02));
  const edgesMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
  const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
  serverGroup.add(edgeLines);
}

// ── FRONT MULTI-LAYER FACEPLATE ──
function buildFrontFaceplate() {
  const frontGroup = new THREE.Group();
  frontGroup.position.set(0, 0, D/2 + 0.04);

  // Main Bezel Frame
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.08), matBezel);
  frontGroup.add(bezel);

  // ── LAYER 1 (TOP TIER): Management & Telemetry Node ──
  const topLayerY = H/2 - 0.25;

  // Layer divider bar 1 (Glowing cyan trim line)
  const div1 = new THREE.Mesh(new THREE.BoxGeometry(W * 0.94, 0.025, 0.02), matNeonCyan);
  div1.position.set(0, topLayerY - 0.22, 0.045);
  frontGroup.add(div1);

  // OLED Diagnostic Display in Center
  const oledMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.38), matOLED);
  oledMesh.position.set(-0.2, topLayerY, 0.05);
  frontGroup.add(oledMesh);

  // StingCloud 3D Logo Emblem (Left side)
  const logoPill = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.03), matChassisInner);
  logoPill.position.set(-W/2 + 0.8, topLayerY, 0.045);
  frontGroup.add(logoPill);

  const logoIcon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), matNeonCyan);
  logoIcon.scale.set(1.4, 0.9, 0.5);
  logoIcon.position.set(-W/2 + 0.6, topLayerY, 0.065);
  frontGroup.add(logoIcon);

  // Control Buttons & Diagnostic LEDs (Right side)
  const pwrBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 20), matChrome);
  pwrBtn.rotation.x = Math.PI / 2;
  pwrBtn.position.set(W/2 - 0.45, topLayerY, 0.05);
  frontGroup.add(pwrBtn);

  const pwrRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 20), matNeonCyan);
  pwrRing.position.set(W/2 - 0.45, topLayerY, 0.055);
  frontGroup.add(pwrRing);

  // Unit ID beacon (bright green)
  const idLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), matNeonGreen);
  idLed.position.set(W/2 - 0.75, topLayerY, 0.05);
  frontGroup.add(idLed);

  // Diagnostic Type-C port
  const usbC = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), matChassisInner);
  usbC.position.set(W/2 - 1.05, topLayerY, 0.05);
  frontGroup.add(usbC);

  // ── LAYER 2 (MIDDLE TIER): 12x Enterprise NVMe Hot-Swap Drive Array ──
  const midLayerY = 0.05;
  const caddyCols = 6;
  const caddyRows = 2;
  const caddyW = 0.58;
  const caddyH = 0.32;
  const startX = -((caddyCols - 1) * 0.68) / 2;

  for (let r = 0; r < caddyRows; r++) {
    const rowY = midLayerY + (r === 0 ? 0.2 : -0.2);
    for (let c = 0; c < caddyCols; c++) {
      const colX = startX + c * 0.68;

      // Drive caddy tray body
      const caddy = new THREE.Mesh(new THREE.BoxGeometry(caddyW, caddyH, 0.05), matDriveCaddy);
      caddy.position.set(colX, rowY, 0.045);
      frontGroup.add(caddy);

      // Chrome release lever
      const latch = new THREE.Mesh(new THREE.BoxGeometry(caddyW * 0.75, 0.05, 0.02), matDriveLatch);
      latch.position.set(colX - 0.05, rowY - 0.1, 0.075);
      frontGroup.add(latch);

      // Caddy pull handle clip
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.03), matChrome);
      clip.position.set(colX + caddyW/2 - 0.08, rowY - 0.1, 0.08);
      frontGroup.add(clip);

      // Dual status LEDs: Green Power + Cyan/Amber Activity
      const pwrLED = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), matNeonGreen);
      pwrLED.position.set(colX - caddyW/2 + 0.06, rowY + 0.1, 0.075);
      frontGroup.add(pwrLED);

      const actLED = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 6, 6),
        (r + c) % 2 === 0 ? matNeonCyan.clone() : matNeonAmber.clone()
      );
      actLED.position.set(colX - caddyW/2 + 0.12, rowY + 0.1, 0.075);
      frontGroup.add(actLED);
      activityLEDs.push(actLED);
    }
  }

  // Layer divider bar 2 (Glowing cyan trim line)
  const div2 = new THREE.Mesh(new THREE.BoxGeometry(W * 0.94, 0.025, 0.02), matNeonCyan);
  div2.position.set(0, midLayerY - 0.44, 0.045);
  frontGroup.add(div2);

  // ── LAYER 3 (BOTTOM TIER): Ingress Airflow & High-Speed Optical Ports ──
  const btmLayerY = -H/2 + 0.22;

  // Honeycomb Airflow Grille Array
  for (let i = 0; i < 18; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.26, 0.02), matChassisInner);
    vent.position.set(-W/2 + 0.6 + i * 0.18, btmLayerY, 0.045);
    frontGroup.add(vent);
  }

  // 4x SFP28 10G/100G Optical Fiber Transceiver Ports
  for (let i = 0; i < 4; i++) {
    const sfp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.03), matChrome);
    sfp.position.set(W/2 - 1.4 + i * 0.25, btmLayerY, 0.05);
    frontGroup.add(sfp);

    const sfpLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), matNeonGreen);
    sfpLed.position.set(W/2 - 1.4 + i * 0.25, btmLayerY + 0.08, 0.06);
    frontGroup.add(sfpLed);
  }

  serverGroup.add(frontGroup);
}

// ── RACK MOUNT EARS & SLIDE RAILS ──
function buildRackMounts() {
  for (let side of [-1, 1]) {
    const earX = side * (W/2 + 0.12);

    // Heavy-duty EIA 19" Rack Mounting Flange
    const earFlange = new THREE.Mesh(new THREE.BoxGeometry(0.24, H, 0.08), matChrome);
    earFlange.position.set(earX, 0, D/2 + 0.04);
    serverGroup.add(earFlange);

    // Rack Unit Screw Holes & Screws (3 standard rack unit positions)
    for (let u = -1; u <= 1; u++) {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), matChassisInner);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(earX, u * (H * 0.35), D/2 + 0.09);
      serverGroup.add(screw);
    }

    // Heavy-Duty Die-Cast Chrome Grab Handles
    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, H * 0.65, 16), matChrome);
    handleBar.position.set(earX + side * 0.08, 0, D/2 + 0.22);
    serverGroup.add(handleBar);

    // Handle Top & Bottom Standoff Mounts
    for (let ySign of [-1, 1]) {
      const mount = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.18), matChrome);
      mount.position.set(earX, ySign * (H * 0.32), D/2 + 0.13);
      serverGroup.add(mount);
    }

    // Telescoping Side Slide Rails (Chrome with yellow release tabs)
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, D * 0.95), matSlideRails);
    rail.position.set(side * (W/2 + 0.04), 0, 0);
    serverGroup.add(rail);

    // Yellow safety release lever on slide rail
    const releaseLever = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.25), matNeonAmber);
    releaseLever.position.set(side * (W/2 + 0.08), 0, -D * 0.3);
    serverGroup.add(releaseLever);
  }
}

// ── REMOVABLE TOP SERVICE HOOD ──
function buildTopHood() {
  hoodGroup.position.set(0, H/2 + 0.04, 0);

  // Main brushed titanium lid plate
  const lid = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, 0.06, D - 0.04), matChassis);
  hoodGroup.add(lid);

  // Longitudinal reinforcement ribs
  for (let i = -1; i <= 1; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, D * 0.8), matChassisInner);
    rib.position.set(i * 1.4, 0.04, 0);
    hoodGroup.add(rib);
  }

  // Chrome service release latches
  for (let side of [-1, 1]) {
    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.3), matChrome);
    latch.position.set(side * (W/2 - 0.4), 0.04, D/2 - 0.4);
    hoodGroup.add(latch);
  }

  // Laser-etched StingCloud enterprise insignia plate
  const badgePlate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.5), matChassisInner);
  badgePlate.position.set(0, 0.04, 0);
  hoodGroup.add(badgePlate);

  const badgeGlow = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.01, 0.04), matNeonCyan);
  badgeGlow.position.set(0, 0.055, 0.2);
  hoodGroup.add(badgeGlow);

  serverGroup.add(hoodGroup);
}

// ── SIDE INSPECTION PANEL ──
function buildSidePanel() {
  sidePanelGroup.position.set(W/2, 0, 0);

  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.06, H - 0.04, D - 0.04), matChassis);
  sidePanelGroup.add(panel);

  // Panel handle
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.45, 0.08), matChrome);
  handle.position.set(0.04, 0.2, D/2 - 0.35);
  sidePanelGroup.add(handle);

  // Cyan perimeter edge
  const edgeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.02, H - 0.08, 0.03), matNeonCyan);
  edgeTrim.position.set(0.04, 0, 0);
  sidePanelGroup.add(edgeTrim);

  serverGroup.add(sidePanelGroup);
}

// ── MULTI-LAYER INTERNAL HARDWARE (REVEALED ON OPEN) ──
function buildInternals() {
  // Motherboard (Deep Emerald Server PCB)
  const mobo = new THREE.Mesh(new THREE.BoxGeometry(W * 0.88, 0.05, D * 0.86), matMotherboard);
  mobo.position.set(0, -H/2 + 0.12, 0);
  internalsGroup.add(mobo);

  // Golden Bus Traces (circuit pathways on PCB)
  for (let i = 0; i < 12; i++) {
    const trace = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.005, D * 0.5 + Math.random() * 0.5),
      matGold
    );
    trace.position.set(-W/2 + 0.6 + i * 0.32, -H/2 + 0.15, (Math.random() - 0.5) * 0.6);
    internalsGroup.add(trace);
  }

  // ── LAYER 1: MODULAR DUAL-ROTOR FAN WALL ──
  const fanGroup = new THREE.Group();
  fanGroup.userData = { componentId: 'cooling' };
  const fanPositions = [-1.5, -0.5, 0.5, 1.5];

  fanPositions.forEach(xPos => {
    // Square fan frame
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.35), matChassisInner);
    housing.position.set(xPos, -H/2 + 0.55, 1.0);
    fanGroup.add(housing);

    // Glowing Neon Cyan Intake Halo Ring
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 24), matNeonCyan);
    halo.position.set(xPos, -H/2 + 0.55, 1.18);
    fanGroup.add(halo);

    // Rotating 7-Blade Impeller Rotor
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(xPos, -H/2 + 0.55, 1.0);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12), matChrome);
    hub.rotation.x = Math.PI / 2;
    rotorGroup.add(hub);

    for (let b = 0; b < 7; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.015), matDriveCaddy);
      blade.rotation.z = (b / 7) * Math.PI * 2;
      blade.position.set(Math.cos(blade.rotation.z) * 0.14, Math.sin(blade.rotation.z) * 0.14, 0);
      rotorGroup.add(blade);
    }
    fanGroup.add(rotorGroup);
    rotatingFans.push(rotorGroup);
  });
  internalsGroup.add(fanGroup);

  // ── LAYER 2: DUAL-SOCKET AMD EPYC SILICON & COOLING TOWERS ──
  const cpuGroup = new THREE.Group();
  cpuGroup.userData = { componentId: 'cpu' };
  const cpuSockets = [-0.55, 0.55];

  cpuSockets.forEach(xSocket => {
    // Nickel-plated copper cold plate block
    const coldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.85), matCopper);
    coldPlate.position.set(xSocket, -H/2 + 0.18, 0.1);
    cpuGroup.add(coldPlate);

    // 4 Copper heat pipes rising through cooling tower
    for (let hp = -1; hp <= 1; hp += 0.66) {
      const heatPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 12), matCopper);
      heatPipe.position.set(xSocket + hp * 0.3, -H/2 + 0.52, 0.1);
      cpuGroup.add(heatPipe);
    }

    // Array of 14 reflective silver aluminium cooling fins
    for (let f = 0; f < 14; f++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.015, 0.9), matAluminumFins);
      fin.position.set(xSocket, -H/2 + 0.26 + f * 0.042, 0.1);
      cpuGroup.add(fin);
    }

    // Top Shroud Cover with glowing EPYC insignia
    const topCap = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.04, 0.92), matChassis);
    topCap.position.set(xSocket, -H/2 + 0.86, 0.1);
    cpuGroup.add(topCap);

    const logoStrip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.01, 0.06), matNeonCyan);
    logoStrip.position.set(xSocket, -H/2 + 0.885, 0.1);
    cpuGroup.add(logoStrip);
  });
  internalsGroup.add(cpuGroup);

  // ── LAYER 3: 8x DDR5 ECC MEMORY BANKS ──
  const ramGroup = new THREE.Group();
  ramGroup.userData = { componentId: 'ram' };
  const ramSlots = [
    -1.5, -1.38, -1.26, -1.14,  // Quad-channel bank Left of Socket 1
     1.14,  1.26,  1.38,  1.5   // Quad-channel bank Right of Socket 2
  ];

  ramSlots.forEach((slotX, idx) => {
    // High-profile DDR5 module with heat spreader
    const dimm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.65, 0.95), matRAMHeatsink);
    dimm.position.set(slotX, -H/2 + 0.46, 0.1);
    ramGroup.add(dimm);

    // 24K Gold contact fingers at bottom socket
    const goldPins = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.95), matGold);
    goldPins.position.set(slotX, -H/2 + 0.16, 0.1);
    ramGroup.add(goldPins);

    // Top LED light bar on RAM module
    const ramLED = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.9), matNeonCyan);
    ramLED.position.set(slotX, -H/2 + 0.79, 0.1);
    ramGroup.add(ramLED);
  });
  internalsGroup.add(ramGroup);

  // ── LAYER 4: NVMe GEN4 SSD EXPANSION ARRAY ──
  const ssdGroup = new THREE.Group();
  ssdGroup.userData = { componentId: 'ssd' };

  // M.2 NVMe RAID expansion carrier card with thermal armor
  for (let i = 0; i < 3; i++) {
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.95), matPCIeCard);
    card.position.set(-0.6 + i * 0.45, -H/2 + 0.18, -0.85);
    ssdGroup.add(card);

    // Finned aluminum SSD heatsink
    const ssdSink = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.85), matAluminumFins);
    ssdSink.position.set(-0.6 + i * 0.45, -H/2 + 0.23, -0.85);
    ssdGroup.add(ssdSink);

    // Controller activity LED
    const ssdLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), matNeonAmber);
    ssdLed.position.set(-0.6 + i * 0.45, -H/2 + 0.27, -0.45);
    ssdGroup.add(ssdLed);
  }
  internalsGroup.add(ssdGroup);

  // ── LAYER 5: 100G/10G HIGH-SPEED NETWORK CARD (PCIe) ──
  const netGroup = new THREE.Group();
  netGroup.userData = { componentId: 'network' };

  const netPcb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 1.2), matPCIeCard);
  netPcb.position.set(1.4, -H/2 + 0.44, -0.9);
  netGroup.add(netPcb);

  // Gold PCIe x16 slot fingers
  const netGold = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.8), matGold);
  netGold.position.set(1.4, -H/2 + 0.16, -0.9);
  netGroup.add(netGold);

  // Dual Optical SFP28 metal transceiver cages
  for (let i = 0; i < 2; i++) {
    const cage = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.24), matChrome);
    cage.position.set(1.4, -H/2 + 0.35, -D/2 + 0.25 + i * 0.3);
    netGroup.add(cage);

    const fiberLED = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), matNeonGreen);
    fiberLED.position.set(1.4, -H/2 + 0.46, -D/2 + 0.25 + i * 0.3);
    netGroup.add(fiberLED);
  }
  internalsGroup.add(netGroup);

  // ── LAYER 6: DUAL REDUNDANT 80+ TITANIUM PSUs ──
  const psuGroup = new THREE.Group();
  psuGroup.userData = { componentId: 'psu' };

  for (let i = 0; i < 2; i++) {
    const psuBlock = new THREE.Mesh(new THREE.BoxGeometry(0.65, H * 0.62, D * 0.42), matPSUModule);
    psuBlock.position.set(-W/2 + 0.55 + i * 0.72, -H/2 + 0.55, -D/2 + 0.85);
    psuGroup.add(psuBlock);

    // Copper Power Bus Bars connecting to motherboard
    const busBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.5), matCopper);
    busBar.position.set(-W/2 + 0.55 + i * 0.72, -H/2 + 0.25, -D/2 + 1.6);
    psuGroup.add(busBar);

    // Green Power OK LED
    const psuLed = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), matNeonGreen);
    psuLed.position.set(-W/2 + 0.55 + i * 0.72, -H/2 + 0.95, -D/2 + 0.85);
    psuGroup.add(psuLed);
  }
  internalsGroup.add(psuGroup);

  trayGroup.add(internalsGroup);
  serverGroup.add(trayGroup);
}

// ── GROUND & HIGH-TECH CYBER PEDESTAL ──
function buildEnvironment() {
  const groundGroup = new THREE.Group();

  // Dark reflective base floor
  const groundGeo = new THREE.PlaneGeometry(36, 36);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x070c18,
    roughness: 0.65,
    metalness: 0.35,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -H/2 - 0.08;
  groundGroup.add(ground);

  // Cybernetic Concentric Rings on Pedestal (Emissive Cyan & Indigo)
  const ring1 = new THREE.Mesh(
    new THREE.RingGeometry(2.8, 2.84, 64),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  ring1.rotation.x = -Math.PI / 2;
  ring1.position.y = -H/2 - 0.075;
  groundGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(4.2, 4.25, 64),
    new THREE.MeshBasicMaterial({ color: 0x7c3aed, side: THREE.DoubleSide })
  );
  ring2.rotation.x = -Math.PI / 2;
  ring2.position.y = -H/2 - 0.075;
  groundGroup.add(ring2);

  const ring3 = new THREE.Mesh(
    new THREE.RingGeometry(5.8, 5.86, 64),
    new THREE.MeshBasicMaterial({ color: 0x1e3a5f, side: THREE.DoubleSide })
  );
  ring3.rotation.x = -Math.PI / 2;
  ring3.position.y = -H/2 - 0.075;
  groundGroup.add(ring3);

  // Subtle Datacenter Floating Dust Particles
  const partCount = 120;
  const partGeo = new THREE.BufferGeometry();
  const partPositions = new Float32Array(partCount * 3);
  for (let i = 0; i < partCount * 3; i += 3) {
    partPositions[i] = (Math.random() - 0.5) * 16;
    partPositions[i+1] = Math.random() * 6 - 0.5;
    partPositions[i+2] = (Math.random() - 0.5) * 16;
  }
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
  const partMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.035,
    transparent: true,
    opacity: 0.45,
  });
  const particles = new THREE.Points(partGeo, partMat);
  groundGroup.add(particles);

  scene.add(groundGroup);
}

// ── ASSEMBLE MODEL ──
buildChassis();
buildTopHood();
buildSidePanel();
buildInternals();
buildEnvironment();
scene.add(serverGroup);

// ── RAYCASTING & INTERACTION ──
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function getClickableComponents() {
  const clickable = [];
  internalsGroup.children.forEach(group => {
    if (group.userData && group.userData.componentId) {
      group.traverse(child => {
        if (child.isMesh) {
          child.userData.componentId = group.userData.componentId;
          clickable.push(child);
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

    // Find the component group world position
    let worldPos = new THREE.Vector3();
    internalsGroup.children.forEach(child => {
      if (child.userData.componentId === id) {
        child.getWorldPosition(worldPos);
        worldPos.y += 0.45;
      }
    });

    // Project to screen
    const screenPos = worldPos.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

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

// ── ANIMATION TARGETS ──
const sidePanelTarget = { x: W/2, rotY: 0 };
const hoodTarget = { y: H/2 + 0.04, z: 0, rotX: 0 };
const trayTarget = { z: 0 };
const cameraTarget = { ...IDLE_CAM };
const lookAtTarget = { ...IDLE_LOOK };

// ── STATE TRANSITIONS ──
function openServer() {
  if (state !== 'IDLE') return;
  state = 'OPENING';
  controls.autoRotate = false;
  autoRotate = false;
  btnRotate.classList.remove('active');

  // 1. Top Hood floats UP & BACK (Suspended Engineering Inspection View)
  hoodTarget.y = H/2 + 1.6;
  hoodTarget.z = -1.3;
  hoodTarget.rotX = -0.15;

  // 2. Server Blade Tray glides forward like a datacenter drawer
  trayTarget.z = 0.45;

  // 3. Right Service Panel slides out
  sidePanelTarget.x = W/2 + 2.2;
  sidePanelTarget.rotY = -0.35;

  // 4. Move camera to wide open inspection angle
  Object.assign(cameraTarget, OPEN_CAM);
  Object.assign(lookAtTarget, OPEN_LOOK);

  // 5. Reveal glowing internals
  setTimeout(() => {
    internalsGroup.visible = true;
    internalGlowCyan.intensity = 4.5;
    internalGlowWhite.intensity = 3.5;
    state = 'OPEN';
    createLabels();

    heroOverlay.classList.add('hidden');
    controlBar.classList.add('visible');
  }, 700);
}

function closeServer() {
  if (state !== 'OPEN' && state !== 'FOCUSED') return;
  state = 'CLOSING';

  infoPanel.classList.remove('visible');
  hideLabels();
  controlBar.classList.remove('visible');
  currentComponent = null;

  // Animate parts back to flush positions
  hoodTarget.y = H/2 + 0.04;
  hoodTarget.z = 0;
  hoodTarget.rotX = 0;

  trayTarget.z = 0;

  sidePanelTarget.x = W/2;
  sidePanelTarget.rotY = 0;

  // Move camera back
  Object.assign(cameraTarget, IDLE_CAM);
  Object.assign(lookAtTarget, IDLE_LOOK);

  setTimeout(() => {
    internalsGroup.visible = false;
    internalGlowCyan.intensity = 0;
    internalGlowWhite.intensity = 0;
    state = 'IDLE';
    heroOverlay.classList.remove('hidden');
    if (autoRotate) controls.autoRotate = true;
  }, 800);
}

function focusComponent(id) {
  if (state !== 'OPEN' && state !== 'FOCUSED') return;
  state = 'FOCUSED';
  currentComponent = id;
  const data = COMPONENTS[id];
  if (!data) return;

  Object.assign(cameraTarget, data.cameraPos);
  Object.assign(lookAtTarget, data.lookAt);

  document.getElementById('infoIcon').textContent = data.icon;
  document.getElementById('infoTitle').textContent = data.title;
  document.getElementById('infoDesc').textContent = data.desc;

  const specsEl = document.getElementById('infoSpecs');
  specsEl.innerHTML = data.specs.map(([label, value]) =>
    `<div class="spec-row"><span class="spec-label">${label}</span><span class="spec-val">${value}</span></div>`
  ).join('');

  infoPanel.classList.add('visible');
}

function unfocusComponent() {
  if (state !== 'FOCUSED') return;
  state = 'OPEN';
  currentComponent = null;
  infoPanel.classList.remove('visible');

  Object.assign(cameraTarget, OPEN_CAM);
  Object.assign(lookAtTarget, OPEN_LOOK);
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

// Click detection for 3D components
canvas.addEventListener('click', (e) => {
  if (state !== 'OPEN') return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const clickable = getClickableComponents();
  const intersects = raycaster.intersectObjects(clickable);

  if (intersects.length > 0) {
    const compId = intersects[0].object.userData.componentId;
    if (compId && COMPONENTS[compId]) {
      focusComponent(compId);
    }
  }
});

// Hover cursor
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

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state === 'FOCUSED') unfocusComponent();
    else if (state === 'OPEN') closeServer();
  }
});

// Window resize
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
  const speed = 0.04;

  // 1. Smoothly interpolate Hood, Tray & Side Panel
  hoodGroup.position.y = lerp(hoodGroup.position.y, hoodTarget.y, speed);
  hoodGroup.position.z = lerp(hoodGroup.position.z, hoodTarget.z, speed);
  hoodGroup.rotation.x = lerp(hoodGroup.rotation.x, hoodTarget.rotX, speed);

  trayGroup.position.z = lerp(trayGroup.position.z, trayTarget.z, speed);

  sidePanelGroup.position.x = lerp(sidePanelGroup.position.x, sidePanelTarget.x, speed);
  sidePanelGroup.rotation.y = lerp(sidePanelGroup.rotation.y, sidePanelTarget.rotY, speed);

  // 2. Animate Internal Fans (Spinning blades)
  if (internalsGroup.visible) {
    rotatingFans.forEach(fan => {
      fan.rotation.z += delta * 24;
    });

    // Pulsing internal inspection glow
    internalGlowCyan.intensity = 4.0 + Math.sin(elapsed * 2.5) * 0.8;
  }

  // 3. Animate Drive Array Activity LEDs (Blinking / flickering like real enterprise drives)
  activityLEDs.forEach((led, idx) => {
    const flicker = Math.sin(elapsed * 8 + idx * 1.7);
    led.material.emissiveIntensity = flicker > 0.2 ? 2.4 : 0.3;
  });

  // 4. Smooth camera transitions
  if (state !== 'IDLE' || !controls.autoRotate) {
    lerpVec3(camera.position, cameraTarget, speed);
    lerpVec3(controls.target, lookAtTarget, speed);
  }

  // 5. Gentle server levitation
  serverGroup.position.y = Math.sin(elapsed * 0.9) * 0.045;

  // 6. Update labels
  updateLabels();

  // 7. Update OrbitControls & Render
  controls.update();
  renderer.render(scene, camera);
}

// ── INITIALIZATION ──
function init() {
  // Dismiss loading screen quickly
  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('hidden');
  }, 400);

  // Start animation loop
  animate();

  // Footer current year
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
