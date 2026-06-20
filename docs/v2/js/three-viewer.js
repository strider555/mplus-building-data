/**
 * M+ Building — Three.js 3D Wireframe Model (v3 - Correct from HdM Section B)
 * 
 * From the CROSS SECTION (415_DR_2110_002):
 * - Tower is NARROW and CENTERED on the wide podium (~1:6 ratio)
 * - Podium is wide (~160m) and 2-3 stories
 * - Tower rises from center with ~14 floors (L6-L11)
 * - CSF Building is separate structure on the right
 * - Found Space + Studio underground (irregular)
 * - Roof Garden extends both sides of tower at podium roof level
 * - Tower has louvre facade on harbour side
 * 
 * From the PINK SECTION:
 * - Tower ~14 floors, very slender
 * - Podium ~3 levels, wide horizontal mass
 * - Open ground floor (pilotis)
 * - Underground spaces visible
 * 
 * Scale: 1 unit ≈ 1m
 */

(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0c0c);
  scene.fog = new THREE.Fog(0x0c0c0c, 150, 350);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight - 52);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Materials
  const wireBright = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true });
  const wireMed = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.35, transparent: true });
  const wireDim = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.15, transparent: true });
  const wireVDim = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.07, transparent: true });
  const accentMat = new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.5, transparent: true });
  const accentDim = new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.12, transparent: true });
  const fillDark = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, opacity: 0.2, transparent: true, side: THREE.DoubleSide });
  const fillLight = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.015, transparent: true, side: THREE.DoubleSide });

  const building = new THREE.Group();

  // ============================================================
  // DIMENSIONS (from section drawing proportions)
  // ============================================================
  const podW = 130; // podium width (~160m, scaled)
  const podH = 14;  // podium height (2-3 stories)
  const podD = 70;  // podium depth

  const towW = 22;  // tower width (NARROW, ~1/6 of podium)
  const towD = 18;  // tower depth
  const towH = 52;  // tower height (14 floors × ~3.7m)

  const pilotisH = 5; // open ground floor

  // ============================================================
  // 1. PILOTIS / OPEN GROUND FLOOR
  // ============================================================
  // Concrete columns
  for (let x = -55; x <= 55; x += 18) {
    for (let z = -28; z <= 28; z += 14) {
      const colGeo = new THREE.BoxGeometry(1.5, pilotisH, 1.5);
      const colEdges = new THREE.EdgesGeometry(colGeo);
      const col = new THREE.LineSegments(colEdges, wireDim);
      col.position.set(x, pilotisH / 2, z);
      building.add(col);
    }
  }

  // Ground level slab
  const slabGeo = new THREE.BoxGeometry(podW + 4, 0.4, podD + 4);
  const slabEdges = new THREE.EdgesGeometry(slabGeo);
  const slab = new THREE.LineSegments(slabEdges, wireDim);
  slab.position.set(0, pilotisH, 0);
  building.add(slab);

  // ============================================================
  // 2. PODIUM (wide, thick block, louvre-clad)
  // ============================================================
  const podGeo = new THREE.BoxGeometry(podW, podH, podD);
  const podEdges = new THREE.EdgesGeometry(podGeo);
  const podWire = new THREE.LineSegments(podEdges, wireBright);
  podWire.position.set(0, pilotisH + podH / 2, 0);
  podWire.userData = { name: 'Podium', desc: 'G–L2 · Wide horizontal mass\n5. Galleries (both sides) · 4. Atrium (center)\n3. Main Hall · Cinema ×3 · Mediatheque\n17,000 m² exhibition space' };
  building.add(podWire);
  building.add(new THREE.Mesh(podGeo, fillDark).translateX(0).translateY(pilotisH + podH/2).translateZ(0));

  // Podium internal floor lines (3 levels: GF, L1, L2)
  for (let i = 1; i <= 2; i++) {
    const y = pilotisH + i * (podH / 3);
    const fGeo = new THREE.PlaneGeometry(podW - 4, podD - 4);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(0, y, 0);
    building.add(fl);
  }

  // Podium louvres (horizontal lines on all 4 faces)
  const podTop = pilotisH + podH;
  const podBot = pilotisH;
  const louvreSpacing = 0.6;
  const numLouvres = Math.floor(podH / louvreSpacing);
  
  for (let i = 0; i < numLouvres; i++) {
    const y = podBot + 0.5 + i * louvreSpacing;
    // Front (harbour side)
    building.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-podW/2, y, podD/2 + 0.3),
        new THREE.Vector3(podW/2, y, podD/2 + 0.3)
      ]), wireDim));
    // Back
    if (i % 2 === 0) building.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-podW/2, y, -podD/2 - 0.3),
        new THREE.Vector3(podW/2, y, -podD/2 - 0.3)
      ]), wireVDim));
    // Sides
    if (i % 2 === 0) {
      building.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-podW/2 - 0.3, y, -podD/2),
          new THREE.Vector3(-podW/2 - 0.3, y, podD/2)
        ]), wireVDim));
      building.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(podW/2 + 0.3, y, -podD/2),
          new THREE.Vector3(podW/2 + 0.3, y, podD/2)
        ]), wireVDim));
    }
  }

  // ============================================================
  // 3. TOWER (narrow, centered, ~14 floors)
  // ============================================================
  const towBase = podTop; // tower sits on podium roof

  const towGeo = new THREE.BoxGeometry(towW, towH, towD);
  const towEdges = new THREE.EdgesGeometry(towGeo);
  const towWire = new THREE.LineSegments(towEdges, wireBright);
  towWire.position.set(0, towBase + towH / 2, 0);
  towWire.userData = { name: 'Tower', desc: 'NARROW slender tower, centered on podium\nL6: Terrace Restaurant\nL7: Research Centre\nL8: Office (×4 floors)\nL9: M+ Members Lounge\nL10: Art-related OACF (×2)\nL11: RDE F&B (×3 top floors)' };
  building.add(towWire);
  building.add(new THREE.Mesh(towGeo, fillDark).translateX(0).translateY(towBase + towH/2).translateZ(0));

  // Tower floor lines (14 floors)
  const floorH = towH / 14;
  for (let i = 1; i < 14; i++) {
    const y = towBase + i * floorH;
    const fGeo = new THREE.PlaneGeometry(towW - 1, towD - 1);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(0, y, 0);
    building.add(fl);
  }

  // Tower louvres (harbour face = LED facade in gold, other faces in white)
  const towFrontZ = towD / 2 + 0.3;
  for (let i = 0; i < 45; i++) {
    const y = towBase + 1 + i * (towH / 45);
    // Front (LED facade — gold)
    building.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-towW/2, y, towFrontZ),
        new THREE.Vector3(towW/2, y, towFrontZ)
      ]), accentDim));
    // Sides (white, dim)
    if (i % 2 === 0) {
      building.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-towW/2 - 0.3, y, -towD/2),
          new THREE.Vector3(-towW/2 - 0.3, y, towD/2)
        ]), wireVDim));
      building.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(towW/2 + 0.3, y, -towD/2),
          new THREE.Vector3(towW/2 + 0.3, y, towD/2)
        ]), wireVDim));
    }
    // Back
    if (i % 3 === 0) building.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-towW/2, y, -towD/2 - 0.3),
        new THREE.Vector3(towW/2, y, -towD/2 - 0.3)
      ]), wireVDim));
  }

  // Tower facade LED panel (front face glow)
  const ledGeo = new THREE.PlaneGeometry(towW, towH - 2);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xe8c547, opacity: 0.04, transparent: true, side: THREE.DoubleSide });
  const ledPlane = new THREE.Mesh(ledGeo, ledMat);
  ledPlane.position.set(0, towBase + towH/2, towFrontZ + 0.2);
  ledPlane.userData = { name: 'M+ Facade (LED)', desc: 'Harbour-facing facade\nCeramic louvres with embedded LED bars\nScreens commissioned moving image art\nVisible from Victoria Harbour & HK Island' };
  building.add(ledPlane);

  // LED facade edge
  building.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(towW, towH - 2)),
    accentMat
  ).translateX(0).translateY(towBase + towH/2).translateZ(towFrontZ + 0.2));

  // Tower top cap (plant room / mechanical)
  const capGeo = new THREE.BoxGeometry(towW + 2, 3, towD + 2);
  const capEdges = new THREE.EdgesGeometry(capGeo);
  const cap = new THREE.LineSegments(capEdges, wireMed);
  cap.position.set(0, towBase + towH + 1.5, 0);
  building.add(cap);

  // ============================================================
  // 4. ROOF GARDEN (both sides of tower, on podium roof)
  // ============================================================
  // Left side
  const rgW = (podW - towW) / 2 - 5;
  const rgGeo = new THREE.PlaneGeometry(rgW, podD - 10);
  const rgEdges = new THREE.EdgesGeometry(rgGeo);
  const rgMat = new THREE.LineBasicMaterial({ color: 0x5a9e5a, opacity: 0.2, transparent: true });
  
  const rgL = new THREE.LineSegments(rgEdges.clone(), rgMat);
  rgL.rotation.x = -Math.PI / 2;
  rgL.position.set(-(towW/2 + rgW/2 + 3), podTop + 0.2, 0);
  rgL.userData = { name: 'Roof Garden (12)', desc: 'Both sides of tower on podium roof\nOpen-air terrace facing Victoria Harbour' };
  building.add(rgL);

  const rgR = new THREE.LineSegments(rgEdges.clone(), rgMat);
  rgR.rotation.x = -Math.PI / 2;
  rgR.position.set((towW/2 + rgW/2 + 3), podTop + 0.2, 0);
  building.add(rgR);

  // ============================================================
  // 5. CSF BUILDING (separate, on the right)
  // ============================================================
  const csfW = 18, csfH = 35, csfD = 22;
  const csfX = podW/2 + 15;

  const csfGeo = new THREE.BoxGeometry(csfW, csfH, csfD);
  const csfEdges = new THREE.EdgesGeometry(csfGeo);
  const csfWire = new THREE.LineSegments(csfEdges, wireMed);
  csfWire.position.set(csfX, csfH/2, 0);
  csfWire.userData = { name: 'CSF Building (13-14)', desc: 'Conservation & Storage Facility\n13: Art Storage (multiple floors)\n14: Conservation Labs (top)\n17: Parking (below)' };
  building.add(csfWire);

  // CSF floors
  for (let i = 1; i < 8; i++) {
    const y = i * (csfH / 8);
    const fGeo = new THREE.PlaneGeometry(csfW - 1, csfD - 1);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(csfX, y, 0);
    building.add(fl);
  }

  // ============================================================
  // 6. FOUND SPACE + STUDIO (underground, irregular)
  // ============================================================
  const foundShape = new THREE.Shape();
  foundShape.moveTo(-45, -30);
  foundShape.bezierCurveTo(-50, -10, -40, 20, -25, 32);
  foundShape.lineTo(5, 35);
  foundShape.bezierCurveTo(20, 33, 40, 25, 48, 10);
  foundShape.lineTo(50, -5);
  foundShape.bezierCurveTo(48, -20, 40, -30, 30, -35);
  foundShape.lineTo(0, -38);
  foundShape.bezierCurveTo(-20, -37, -35, -35, -45, -30);

  const foundGeo = new THREE.ExtrudeGeometry(foundShape, { depth: 7, bevelEnabled: false });
  const foundEdges = new THREE.EdgesGeometry(foundGeo);
  const foundWire = new THREE.LineSegments(foundEdges, wireMed);
  foundWire.rotation.x = -Math.PI / 2;
  foundWire.position.set(5, -5, 0);
  foundWire.scale.set(0.85, 0.85, 0.85);
  foundWire.userData = { name: 'Found Space + Studio (B1)', desc: '1. Found Space · 2. The Studio\nUnderground · Organic irregular form\nFollows MTR tunnel contours' };
  building.add(foundWire);

  // ============================================================
  // 7. AIRPORT EXPRESS TUNNEL (underground)
  // ============================================================
  const tunGeo = new THREE.CylinderGeometry(3, 3, 80, 8, 1, true);
  const tunEdges = new THREE.EdgesGeometry(tunGeo);
  const tunWire = new THREE.LineSegments(tunEdges, wireVDim);
  tunWire.rotation.z = Math.PI / 2;
  tunWire.position.set(0, -12, 5);
  tunWire.userData = { name: 'Airport Express Tunnel (20)', desc: 'MTR tunnel 1.5m below ground\n5 mega-trusses protect it from building loads' };
  building.add(tunWire);

  // ============================================================
  // ENVIRONMENT
  // ============================================================
  const gridHelper = new THREE.GridHelper(300, 60, 0x1a1a1a, 0x0f0f0f);
  scene.add(gridHelper);

  // Waterfront
  const waterGeo = new THREE.PlaneGeometry(160, 40);
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, opacity: 0.025, transparent: true, side: THREE.DoubleSide });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.3, podD/2 + 30);
  water.userData = { name: 'Victoria Harbour (19)', desc: 'M+ Facade visible across harbour\nWaterfront Promenade (18) along edge' };
  building.add(water);

  scene.add(building);

  // ============================================================
  // CAMERA CONTROLS
  // ============================================================
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let spherical = { radius: 150, theta: Math.PI / 4, phi: Math.PI / 3.2 };
  let autoRotate = true;

  function updateCamera() {
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.lookAt(0, 18, 0);
  }

  canvas.addEventListener('mousedown', (e) => { isDragging = true; autoRotate = false; prevMouse = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    spherical.theta -= (e.clientX - prevMouse.x) * 0.005;
    spherical.phi = Math.max(0.2, Math.min(Math.PI * 0.7, spherical.phi + (e.clientY - prevMouse.y) * 0.005));
    prevMouse = { x: e.clientX, y: e.clientY };
    updateCamera();
  });
  canvas.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);
  canvas.addEventListener('wheel', (e) => {
    spherical.radius = Math.max(50, Math.min(300, spherical.radius + e.deltaY * 0.08));
    updateCamera();
  }, { passive: true });

  // Touch
  canvas.addEventListener('touchstart', (e) => { isDragging = true; autoRotate = false; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    spherical.theta -= (e.touches[0].clientX - prevMouse.x) * 0.005;
    spherical.phi = Math.max(0.2, Math.min(Math.PI * 0.7, spherical.phi + (e.touches[0].clientY - prevMouse.y) * 0.005));
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

  // Day/Night toggle
  const modeToggle = document.getElementById('mode-toggle');
  modeToggle.addEventListener('click', () => {
    const isDay = document.body.classList.toggle('day-mode');
    modeToggle.querySelector('.mode-icon').textContent = isDay ? '☀' : '☾';
    scene.background = new THREE.Color(isDay ? 0xf5f3ef : 0x0c0c0c);
    scene.fog = new THREE.Fog(isDay ? 0xf5f3ef : 0x0c0c0c, 150, 350);
  });

  // Animate
  let ledTime = 0;
  setTimeout(() => { autoRotate = false; }, 25000);

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) { spherical.theta += 0.001; updateCamera(); }
    ledTime += 0.015;
    ledMat.opacity = 0.03 + Math.sin(ledTime) * 0.02;
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
