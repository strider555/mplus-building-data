/**
 * M+ Building — Three.js 3D Model (v4 - Correct axonometry proportions)
 * 
 * From the HdM exploded axonometry:
 * - Level -1: Organic irregular footprint (Found Space), LARGER than floors above
 * - Level 0: Rectangular floor plate (~1.3:1 width:depth ratio)  
 * - Level +1: Similar to Level 0
 * - Tower: Wide FLAT SLAB (same width as podium) + narrower structure above
 *   - The "dark block" in axonometry = tower main volume (facade side)
 *   - Narrower louvre structure above = upper tower
 *   - Small cap on top = plant room
 * 
 * KEY INSIGHT: Tower appears narrow in SECTION because section cuts through
 * its SHALLOW dimension (~20m deep). But it's WIDE (~110m) facing harbour.
 * 
 * Scale: 1 unit ≈ 1m
 */

(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0c0c);
  scene.fog = new THREE.Fog(0x0c0c0c, 180, 400);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight - 52);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Materials
  const wireBright = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.55, transparent: true });
  const wireMed = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
  const wireDim = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.12, transparent: true });
  const wireVDim = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.06, transparent: true });
  const accentDim = new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.1, transparent: true });
  const accentMed = new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.4, transparent: true });
  const fillDark = new THREE.MeshBasicMaterial({ color: 0x111111, opacity: 0.25, transparent: true, side: THREE.DoubleSide });
  const fillTower = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, opacity: 0.35, transparent: true, side: THREE.DoubleSide });

  const building = new THREE.Group();

  // ============================================================
  // PROPORTIONS (from axonometry measurement)
  // Podium floors: ~160m wide × ~110m deep
  // Tower facade slab: ~110m wide × ~20m deep × ~35m tall
  // Upper tower: ~35m wide × ~18m deep × ~20m tall
  // ============================================================
  
  // Podium
  const podW = 120;  // width (E-W, along harbour)
  const podD = 85;   // depth (N-S)
  const podH = 14;   // height (GF + L1 + L2)
  const pilH = 5;    // pilotis height

  // Tower (wide flat slab)
  const towW = 110;  // same as podium width roughly
  const towD = 20;   // SHALLOW depth
  const towH = 35;   // main facade slab height

  // Upper tower (narrower, above facade slab)
  const upW = 32;
  const upD = 18;
  const upH = 18;

  // ============================================================
  // LEVEL -1: FOUND SPACE (organic, larger than above)
  // ============================================================
  const foundShape = new THREE.Shape();
  // Triangular organic form from axonometry
  foundShape.moveTo(-60, -40);
  foundShape.bezierCurveTo(-65, -15, -55, 20, -35, 40);
  foundShape.lineTo(0, 48);
  foundShape.bezierCurveTo(25, 45, 50, 35, 60, 15);
  foundShape.lineTo(55, -10);
  foundShape.bezierCurveTo(50, -30, 35, -42, 15, -45);
  foundShape.lineTo(-20, -45);
  foundShape.bezierCurveTo(-40, -44, -55, -42, -60, -40);

  const foundGeo = new THREE.ExtrudeGeometry(foundShape, { depth: 6, bevelEnabled: false });
  const foundEdges = new THREE.EdgesGeometry(foundGeo);
  const foundWire = new THREE.LineSegments(foundEdges, wireMed);
  foundWire.rotation.x = -Math.PI / 2;
  foundWire.position.set(0, -5, 0);
  foundWire.userData = { name: 'Level -1 · Found Space', desc: 'Underground · Organic irregular footprint\n1. Found Space · 2. The Studio\nLarger than building above\nFollows MTR tunnel contours' };
  building.add(foundWire);

  // Shaft dropping below found space
  const shaftGeo = new THREE.BoxGeometry(4, 12, 4);
  const shaftEdges = new THREE.EdgesGeometry(shaftGeo);
  const shaft = new THREE.LineSegments(shaftEdges, wireDim);
  shaft.position.set(10, -14, -20);
  building.add(shaft);

  // Ramp/wedge element (the triangular thing extending from Level -1 in axonometry)
  const wedgeShape = new THREE.Shape();
  wedgeShape.moveTo(-55, -10);
  wedgeShape.lineTo(-75, 5);
  wedgeShape.lineTo(-75, 15);
  wedgeShape.lineTo(-55, 10);
  wedgeShape.lineTo(-55, -10);
  const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, { depth: 3, bevelEnabled: false });
  const wedgeEdges = new THREE.EdgesGeometry(wedgeGeo);
  const wedge = new THREE.LineSegments(wedgeEdges, wireDim);
  wedge.rotation.x = -Math.PI / 2;
  wedge.position.set(0, -3, 0);
  building.add(wedge);

  // ============================================================
  // PILOTIS (open ground floor with columns)
  // ============================================================
  for (let x = -50; x <= 50; x += 20) {
    for (let z = -35; z <= 35; z += 18) {
      const colGeo = new THREE.BoxGeometry(1.5, pilH, 1.5);
      const colEdges = new THREE.EdgesGeometry(colGeo);
      const col = new THREE.LineSegments(colEdges, wireDim);
      col.position.set(x, pilH / 2, z);
      building.add(col);
    }
  }

  // ============================================================
  // LEVEL 0 (Ground Floor plate)
  // ============================================================
  const l0Geo = new THREE.BoxGeometry(podW, 0.5, podD);
  const l0Edges = new THREE.EdgesGeometry(l0Geo);
  const l0 = new THREE.LineSegments(l0Edges, wireMed);
  l0.position.set(0, pilH, 0);
  building.add(l0);

  // ============================================================
  // PODIUM BLOCK (Levels 0 to +2)
  // ============================================================
  const podBase = pilH;

  const podGeo = new THREE.BoxGeometry(podW, podH, podD);
  const podEdges = new THREE.EdgesGeometry(podGeo);
  const podWire = new THREE.LineSegments(podEdges, wireBright);
  podWire.position.set(0, podBase + podH/2, 0);
  podWire.userData = { name: 'Podium (Levels 0–+1)', desc: 'Wide horizontal mass\n3. Main Hall · 4. Atrium · 5. Galleries\nCinema ×3 · Mediatheque · Learning Hub\n17,000 m² exhibition space' };
  building.add(podWire);
  building.add(new THREE.Mesh(podGeo, fillDark).translateY(podBase + podH/2));

  // Internal floors
  for (let i = 1; i <= 2; i++) {
    const y = podBase + i * (podH / 3);
    const fGeo = new THREE.PlaneGeometry(podW - 4, podD - 4);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(0, y, 0);
    building.add(fl);
  }

  // Podium louvres (all faces, dense horizontal lines)
  for (let i = 0; i < 22; i++) {
    const y = podBase + 0.5 + i * (podH / 22);
    // Front
    building.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-podW/2, y, podD/2 + 0.2),
        new THREE.Vector3(podW/2, y, podD/2 + 0.2)
      ]), wireDim));
    // Sides (every other)
    if (i % 2 === 0) {
      building.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-podW/2 - 0.2, y, -podD/2),
          new THREE.Vector3(-podW/2 - 0.2, y, podD/2)
        ]), wireVDim));
      building.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(podW/2 + 0.2, y, -podD/2),
          new THREE.Vector3(podW/2 + 0.2, y, podD/2)
        ]), wireVDim));
    }
  }

  // ============================================================
  // ROOF GARDEN LEVEL (podium top, both sides of tower)
  // ============================================================
  const roofY = podBase + podH;
  const rgMat = new THREE.LineBasicMaterial({ color: 0x5a9e5a, opacity: 0.15, transparent: true });

  // Left garden
  const rgLGeo = new THREE.PlaneGeometry((podW - towW)/2 - 2, podD - 4);
  const rgLEdges = new THREE.EdgesGeometry(rgLGeo);
  const rgL = new THREE.LineSegments(rgLEdges, rgMat);
  rgL.rotation.x = -Math.PI / 2;
  rgL.position.set(-(towW/2 + (podW-towW)/4), roofY + 0.1, 0);
  building.add(rgL);

  // Right garden
  const rgR = new THREE.LineSegments(new THREE.EdgesGeometry(rgLGeo), rgMat);
  rgR.rotation.x = -Math.PI / 2;
  rgR.position.set((towW/2 + (podW-towW)/4), roofY + 0.1, 0);
  rgR.userData = { name: 'Roof Garden (12)', desc: 'Both sides of tower on podium roof\nFaces Victoria Harbour' };
  building.add(rgR);

  // ============================================================
  // TOWER: WIDE FLAT SLAB (the dark block in axonometry)
  // ============================================================
  const towBase = roofY;

  // Main facade volume
  const tGeo = new THREE.BoxGeometry(towW, towH, towD);
  const tEdges = new THREE.EdgesGeometry(tGeo);
  const tWire = new THREE.LineSegments(tEdges, wireBright);
  tWire.position.set(0, towBase + towH/2, (podD/2 - towD/2) - 5); // toward harbour
  tWire.userData = { name: 'Tower (Facade Slab)', desc: 'Wide flat slab · ~110m × 20m × 35m\nContains L3–L8 floors\nFacade with LED louvres faces harbour\nAppears narrow in section (shallow depth)' };
  building.add(tWire);
  
  const tFill = new THREE.Mesh(tGeo, fillTower);
  tFill.position.copy(tWire.position);
  building.add(tFill);

  // Tower floor lines
  const towCenterZ = (podD/2 - towD/2) - 5;
  for (let i = 1; i < 10; i++) {
    const y = towBase + i * (towH / 10);
    const fGeo = new THREE.PlaneGeometry(towW - 2, towD - 2);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(0, y, towCenterZ);
    building.add(fl);
  }

  // Tower LOUVRES (dense horizontal lines = the facade character)
  const towFrontZ = towCenterZ + towD/2 + 0.3;
  for (let i = 0; i < 50; i++) {
    const y = towBase + 0.5 + i * (towH / 50);
    // Front face (LED louvres - gold/accent)
    building.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-towW/2, y, towFrontZ),
        new THREE.Vector3(towW/2, y, towFrontZ)
      ]), accentDim));
    // Sides (every 3rd)
    if (i % 3 === 0) {
      building.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-towW/2 - 0.2, y, towCenterZ - towD/2),
          new THREE.Vector3(-towW/2 - 0.2, y, towCenterZ + towD/2)
        ]), wireVDim));
      building.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(towW/2 + 0.2, y, towCenterZ - towD/2),
          new THREE.Vector3(towW/2 + 0.2, y, towCenterZ + towD/2)
        ]), wireVDim));
    }
  }

  // LED facade glow
  const ledGeo = new THREE.PlaneGeometry(towW, towH);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xe8c547, opacity: 0.035, transparent: true, side: THREE.DoubleSide });
  const ledPlane = new THREE.Mesh(ledGeo, ledMat);
  ledPlane.position.set(0, towBase + towH/2, towFrontZ + 0.1);
  ledPlane.userData = { name: 'M+ Facade (LED)', desc: '65.8m × 110m\nCeramic louvres with embedded LED bars\nCommissioned moving image artworks\nVisible from harbour & HK Island' };
  building.add(ledPlane);

  // Facade edge
  building.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(ledGeo), accentMed
  ).translateY(towBase + towH/2).translateZ(towFrontZ + 0.1));

  // ============================================================
  // UPPER TOWER (narrower block above facade slab, visible in axonometry)
  // ============================================================
  const upBase = towBase + towH;
  const upGeo = new THREE.BoxGeometry(upW, upH, upD);
  const upEdges = new THREE.EdgesGeometry(upGeo);
  const upWire = new THREE.LineSegments(upEdges, wireMed);
  upWire.position.set(0, upBase + upH/2, towCenterZ);
  upWire.userData = { name: 'Upper Tower', desc: 'L9–L11 · Narrower top structure\n9. M+ Members Lounge\n10. Art-related OACF\n11. RDE (F&B)\nVisual louvre pattern on facade' };
  building.add(upWire);

  // Upper tower louvres
  for (let i = 0; i < 15; i++) {
    const y = upBase + 1 + i * (upH / 15);
    building.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-upW/2, y, towCenterZ + upD/2 + 0.2),
        new THREE.Vector3(upW/2, y, towCenterZ + upD/2 + 0.2)
      ]), wireDim));
  }

  // Upper tower floors
  for (let i = 1; i < 5; i++) {
    const y = upBase + i * (upH / 5);
    const fGeo = new THREE.PlaneGeometry(upW - 1, upD - 1);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(0, y, towCenterZ);
    building.add(fl);
  }

  // Plant room cap
  const capGeo = new THREE.BoxGeometry(upW + 4, 3, upD + 2);
  const capEdges = new THREE.EdgesGeometry(capGeo);
  const cap = new THREE.LineSegments(capEdges, wireDim);
  cap.position.set(0, upBase + upH + 1.5, towCenterZ);
  building.add(cap);

  // ============================================================
  // CSF BUILDING (separate, right side — from section)
  // ============================================================
  const csfGeo = new THREE.BoxGeometry(16, 30, 20);
  const csfEdges = new THREE.EdgesGeometry(csfGeo);
  const csfWire = new THREE.LineSegments(csfEdges, wireMed);
  csfWire.position.set(podW/2 + 15, 15, 0);
  csfWire.userData = { name: 'CSF Building', desc: '13. Art Storage · 14. Conservation Labs\n15. Avenue · 17. Parking\nSeparate structure connected to main building' };
  building.add(csfWire);

  for (let i = 1; i < 7; i++) {
    const y = i * (30/7);
    const fGeo = new THREE.PlaneGeometry(14, 18);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(podW/2 + 15, y, 0);
    building.add(fl);
  }

  // ============================================================
  // UNDERGROUND TUNNEL
  // ============================================================
  const tunGeo = new THREE.CylinderGeometry(3, 3, 80, 8, 1, true);
  const tunEdges = new THREE.EdgesGeometry(tunGeo);
  const tunWire = new THREE.LineSegments(tunEdges, wireVDim);
  tunWire.rotation.z = Math.PI / 2;
  tunWire.position.set(0, -12, 5);
  tunWire.userData = { name: 'Airport Express Tunnel', desc: 'MTR tunnel below building\n5 mega-trusses protect it' };
  building.add(tunWire);

  // ============================================================
  // ENVIRONMENT
  // ============================================================
  scene.add(new THREE.GridHelper(300, 60, 0x181818, 0x0e0e0e));

  // Water
  const waterGeo = new THREE.PlaneGeometry(160, 50);
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, opacity: 0.02, transparent: true, side: THREE.DoubleSide });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.3, podD/2 + 35);
  water.userData = { name: 'Victoria Harbour', desc: 'Waterfront Promenade along edge\nM+ Facade visible across harbour' };
  building.add(water);

  scene.add(building);

  // ============================================================
  // CAMERA + CONTROLS
  // ============================================================
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let spherical = { radius: 160, theta: Math.PI / 4.5, phi: Math.PI / 3.5 };
  let autoRotate = true;

  function updateCamera() {
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.lookAt(0, 20, 0);
  }

  canvas.addEventListener('mousedown', (e) => { isDragging = true; autoRotate = false; prevMouse = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    spherical.theta -= (e.clientX - prevMouse.x) * 0.005;
    spherical.phi = Math.max(0.2, Math.min(2.2, spherical.phi + (e.clientY - prevMouse.y) * 0.005));
    prevMouse = { x: e.clientX, y: e.clientY };
    updateCamera();
  });
  canvas.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);
  canvas.addEventListener('wheel', (e) => {
    spherical.radius = Math.max(50, Math.min(350, spherical.radius + e.deltaY * 0.08));
    updateCamera();
  }, { passive: true });

  canvas.addEventListener('touchstart', (e) => { isDragging = true; autoRotate = false; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    spherical.theta -= (e.touches[0].clientX - prevMouse.x) * 0.005;
    spherical.phi = Math.max(0.2, Math.min(2.2, spherical.phi + (e.touches[0].clientY - prevMouse.y) * 0.005));
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    updateCamera();
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchend', () => isDragging = false);

  // Click info
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const infoPanel = document.getElementById('info-panel');
  const infoTitle = document.getElementById('info-title');
  const infoDesc = document.getElementById('info-desc');
  document.getElementById('close-panel').addEventListener('click', () => infoPanel.classList.remove('active'));

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(building.children, false);
    for (const hit of hits) {
      if (hit.object.userData && hit.object.userData.name) {
        infoTitle.textContent = hit.object.userData.name;
        infoDesc.textContent = hit.object.userData.desc;
        infoPanel.classList.add('active');
        return;
      }
    }
  });

  // Day/Night
  const modeToggle = document.getElementById('mode-toggle');
  modeToggle.addEventListener('click', () => {
    const isDay = document.body.classList.toggle('day-mode');
    modeToggle.querySelector('.mode-icon').textContent = isDay ? '☀' : '☾';
    scene.background = new THREE.Color(isDay ? 0xf5f3ef : 0x0c0c0c);
    scene.fog = new THREE.Fog(isDay ? 0xf5f3ef : 0x0c0c0c, 180, 400);
  });

  // Animate
  let ledTime = 0;
  setTimeout(() => { autoRotate = false; }, 20000);

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) { spherical.theta += 0.0012; updateCamera(); }
    ledTime += 0.012;
    ledMat.opacity = 0.03 + Math.sin(ledTime) * 0.015;
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight - 52);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 52);
  });

  updateCamera();
  animate();
})();
