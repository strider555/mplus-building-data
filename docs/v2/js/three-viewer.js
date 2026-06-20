/**
 * M+ Building — Three.js 3D Wireframe Model (v3 - Rebuilt from photos)
 * 
 * Key insights from real photos + HdM axonometry:
 * - Podium is a THICK dark block (nearly square plan), wrapped in horizontal louvres
 * - Podium is raised on concrete pilotis (open ground floor)
 * - Tower/Facade is a WIDE FLAT SLAB sitting on top of podium
 * - Behind the facade slab, a narrower tower rises higher
 * - Horizontal louvre cladding covers both podium and tower
 * - Found Space underground has organic irregular footprint
 * 
 * Real dimensions (approx):
 * - Total height: ~65m
 * - Podium: ~110m wide × ~80m deep × ~20m tall (on pilotis)
 * - Facade slab: ~110m wide × ~45m tall × ~20m deep
 * - Tower top: ~30m wide × additional ~10m above facade
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
  const wireBright = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.65, transparent: true });
  const wireMed = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.35, transparent: true });
  const wireDim = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.15, transparent: true });
  const wireVDim = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.08, transparent: true });
  const accentMat = new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.5, transparent: true });
  const fillDark = new THREE.MeshBasicMaterial({ color: 0x222222, opacity: 0.15, transparent: true, side: THREE.DoubleSide });
  const fillLight = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.02, transparent: true, side: THREE.DoubleSide });

  const building = new THREE.Group();

  // ============================================================
  // SCALE: 1 unit ≈ 1m (real-world scale)
  // ============================================================

  // === 1. PILOTIS / GROUND LEVEL (open, columns) ===
  const pilotisH = 6;
  // Concrete columns array
  const colPositions = [];
  for (let x = -45; x <= 45; x += 15) {
    for (let z = -30; z <= 30; z += 15) {
      colPositions.push([x, z]);
    }
  }
  colPositions.forEach(([x, z]) => {
    const colGeo = new THREE.BoxGeometry(2, pilotisH, 2);
    const colEdges = new THREE.EdgesGeometry(colGeo);
    const col = new THREE.LineSegments(colEdges, wireDim);
    col.position.set(x, pilotisH / 2, z);
    building.add(col);
  });

  // Ground slab (thin, showing open ground floor)
  const groundSlabGeo = new THREE.BoxGeometry(112, 0.5, 82);
  const groundSlabEdges = new THREE.EdgesGeometry(groundSlabGeo);
  const groundSlab = new THREE.LineSegments(groundSlabEdges, wireDim);
  groundSlab.position.set(0, pilotisH, 0);
  building.add(groundSlab);

  // === 2. PODIUM BLOCK (thick solid mass with louvres) ===
  const podW = 110, podH = 18, podD = 80;
  const podY = pilotisH; // sits on top of pilotis

  const podGeo = new THREE.BoxGeometry(podW, podH, podD);
  const podEdges = new THREE.EdgesGeometry(podGeo);
  const podWire = new THREE.LineSegments(podEdges, wireBright);
  podWire.position.set(0, podY + podH / 2, 0);
  podWire.userData = { name: 'Podium', desc: 'G–L2 · Thick block raised on pilotis\n33 Galleries · 17,000 m² exhibition\nCinema ×3 · Mediatheque · Learning Hub\nMain Hall · Atrium' };
  building.add(podWire);

  // Podium fill
  const podFill = new THREE.Mesh(podGeo, fillDark);
  podFill.position.copy(podWire.position);
  building.add(podFill);

  // Podium floor divisions (3 levels inside)
  for (let i = 1; i <= 2; i++) {
    const y = podY + i * (podH / 3);
    const fGeo = new THREE.PlaneGeometry(podW - 2, podD - 2);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(0, y, 0);
    building.add(fl);
  }

  // HORIZONTAL LOUVRES on podium (all 4 faces)
  const louvreCount = 25;
  for (let i = 0; i < louvreCount; i++) {
    const y = podY + 1 + i * (podH / louvreCount);
    // Front face
    const fGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-podW/2, y, podD/2 + 0.5),
      new THREE.Vector3(podW/2, y, podD/2 + 0.5),
    ]);
    building.add(new THREE.Line(fGeo, wireDim));
    // Back face
    const bGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-podW/2, y, -podD/2 - 0.5),
      new THREE.Vector3(podW/2, y, -podD/2 - 0.5),
    ]);
    building.add(new THREE.Line(bGeo, wireVDim));
    // Left face
    const lGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-podW/2 - 0.5, y, -podD/2),
      new THREE.Vector3(-podW/2 - 0.5, y, podD/2),
    ]);
    building.add(new THREE.Line(lGeo, wireVDim));
    // Right face
    const rGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(podW/2 + 0.5, y, -podD/2),
      new THREE.Vector3(podW/2 + 0.5, y, podD/2),
    ]);
    building.add(new THREE.Line(rGeo, wireVDim));
  }

  // === 3. TOWER / FACADE SLAB (wide, flat, sitting on podium) ===
  const facW = 110, facH = 35, facD = 20;
  const facY = podY + podH; // on top of podium

  const facGeo = new THREE.BoxGeometry(facW, facH, facD);
  const facEdges = new THREE.EdgesGeometry(facGeo);
  const facWire = new THREE.LineSegments(facEdges, wireBright);
  facWire.position.set(0, facY + facH / 2, (podD/2 - facD/2) - 5); // positioned toward harbour side
  facWire.userData = { name: 'Tower / M+ Facade', desc: 'L3–L11 · Wide flat slab\nFacade: 65.8m × 110m with LED louvres\nL6: Terrace Restaurant\nL7: Research Centre · L8: Office\nL9: M+ Lounge · L10–L11: F&B' };
  building.add(facWire);

  const facFill = new THREE.Mesh(facGeo, fillDark);
  facFill.position.copy(facWire.position);
  building.add(facFill);

  // Tower floor divisions
  for (let i = 1; i <= 9; i++) {
    const y = facY + i * (facH / 10);
    const fGeo = new THREE.PlaneGeometry(facW - 2, facD - 2);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fl = new THREE.LineSegments(fEdges, wireVDim);
    fl.rotation.x = -Math.PI / 2;
    fl.position.set(0, y, (podD/2 - facD/2) - 5);
    building.add(fl);
  }

  // HORIZONTAL LOUVRES on tower/facade (main harbour-facing side)
  const facLouvres = 40;
  const facFrontZ = (podD/2 - facD/2) - 5 + facD/2 + 0.5;
  for (let i = 0; i < facLouvres; i++) {
    const y = facY + 1 + i * (facH / facLouvres);
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-facW/2, y, facFrontZ),
      new THREE.Vector3(facW/2, y, facFrontZ),
    ]);
    building.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.12, transparent: true })));
  }

  // LED facade glow indicator (front face of tower)
  const ledGeo = new THREE.PlaneGeometry(facW, facH);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xe8c547, opacity: 0.04, transparent: true, side: THREE.DoubleSide });
  const ledPlane = new THREE.Mesh(ledGeo, ledMat);
  ledPlane.position.set(0, facY + facH/2, facFrontZ + 0.3);
  ledPlane.userData = { name: 'M+ Facade (LED Screen)', desc: '65.8m × 110m\n140,000 ceramic tiles with embedded LEDs\nScreens commissioned moving image artworks\nVisible from harbour & HK Island' };
  building.add(ledPlane);

  // Side louvres on tower
  for (let i = 0; i < facLouvres; i++) {
    const y = facY + 1 + i * (facH / facLouvres);
    const facBackZ = (podD/2 - facD/2) - 5 - facD/2 - 0.5;
    // Left side
    const lgeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-facW/2 - 0.5, y, facBackZ + facD/2),
      new THREE.Vector3(-facW/2 - 0.5, y, facFrontZ - 0.5),
    ]);
    building.add(new THREE.Line(lgeo, wireVDim));
    // Right side
    const rgeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(facW/2 + 0.5, y, facBackZ + facD/2),
      new THREE.Vector3(facW/2 + 0.5, y, facFrontZ - 0.5),
    ]);
    building.add(new THREE.Line(rgeo, wireVDim));
  }

  // === 4. TOWER TOP (narrower block rising above facade slab) ===
  const topW = 30, topH = 12, topD = 15;
  const topGeo = new THREE.BoxGeometry(topW, topH, topD);
  const topEdges = new THREE.EdgesGeometry(topGeo);
  const topWire = new THREE.LineSegments(topEdges, wireMed);
  topWire.position.set(0, facY + facH + topH/2, (podD/2 - facD/2) - 5);
  topWire.userData = { name: 'Tower Top', desc: 'Upper tower structure\nRises above main facade block\nPlant / mechanical' };
  building.add(topWire);

  // Louvres on tower top
  for (let i = 0; i < 8; i++) {
    const y = facY + facH + 1 + i * (topH / 8);
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-topW/2, y, (podD/2 - facD/2) - 5 + topD/2 + 0.3),
      new THREE.Vector3(topW/2, y, (podD/2 - facD/2) - 5 + topD/2 + 0.3),
    ]);
    building.add(new THREE.Line(geo, wireDim));
  }

  // === 5. ROOF GARDEN (on podium, around tower base) ===
  const roofGeo = new THREE.PlaneGeometry(podW, podD - facD - 10);
  const roofEdges = new THREE.EdgesGeometry(roofGeo);
  const roofGarden = new THREE.LineSegments(roofEdges, new THREE.LineBasicMaterial({ color: 0x5a9e5a, opacity: 0.2, transparent: true }));
  roofGarden.rotation.x = -Math.PI / 2;
  roofGarden.position.set(0, facY + 0.2, -(podD/2 - (podD - facD - 10)/2));
  roofGarden.userData = { name: 'Roof Garden', desc: 'L3 · Atop podium\nFaces Victoria Harbour\nOpen-air terrace' };
  building.add(roofGarden);

  // === 6. FOUND SPACE (underground, organic footprint) ===
  const foundShape = new THREE.Shape();
  // Irregular organic shape based on axonometry (triangular with curved edges)
  foundShape.moveTo(-50, -35);
  foundShape.bezierCurveTo(-55, -15, -50, 15, -30, 30);
  foundShape.lineTo(-10, 38);
  foundShape.bezierCurveTo(10, 40, 35, 35, 45, 20);
  foundShape.lineTo(50, 5);
  foundShape.bezierCurveTo(52, -10, 45, -25, 35, -35);
  foundShape.lineTo(10, -40);
  foundShape.bezierCurveTo(-10, -42, -35, -40, -50, -35);

  const foundExtGeo = new THREE.ExtrudeGeometry(foundShape, { depth: 8, bevelEnabled: false });
  const foundEdges = new THREE.EdgesGeometry(foundExtGeo);
  const foundWire = new THREE.LineSegments(foundEdges, wireMed);
  foundWire.rotation.x = -Math.PI / 2;
  foundWire.position.set(0, -4, 0);
  foundWire.scale.set(0.9, 0.9, 0.9);
  foundWire.userData = { name: 'Found Space (B1)', desc: 'Underground · Organic irregular form\nFollows MTR Airport Express tunnel contours\nLarge-scale installations · The Studio' };
  building.add(foundWire);

  // === 7. AIRPORT EXPRESS TUNNEL (deep underground) ===
  const tunGeo = new THREE.CylinderGeometry(3.5, 3.5, 90, 10, 1, true);
  const tunEdges = new THREE.EdgesGeometry(tunGeo);
  const tunWire = new THREE.LineSegments(tunEdges, wireVDim);
  tunWire.rotation.z = Math.PI / 2;
  tunWire.position.set(0, -12, 0);
  tunWire.userData = { name: 'MTR Airport Express Tunnel', desc: 'Just 1.5m below ground level\n5 mega-trusses span above to protect it' };
  building.add(tunWire);

  // === GROUND + CONTEXT ===
  const gridHelper = new THREE.GridHelper(300, 60, 0x1a1a1a, 0x0f0f0f);
  scene.add(gridHelper);

  // Ground plane edge
  const gpGeo = new THREE.PlaneGeometry(300, 300);
  const gpEdges = new THREE.EdgesGeometry(gpGeo);
  const gp = new THREE.LineSegments(gpEdges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.03, transparent: true }));
  gp.rotation.x = -Math.PI / 2;
  scene.add(gp);

  // Harbour water
  const waterGeo = new THREE.PlaneGeometry(150, 60);
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, opacity: 0.03, transparent: true, side: THREE.DoubleSide });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.5, podD/2 + 40);
  building.add(water);

  scene.add(building);

  // ============================================================
  // CONTROLS
  // ============================================================
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let spherical = { radius: 140, theta: Math.PI / 4.5, phi: Math.PI / 3.5 };
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
    spherical.phi = Math.max(0.2, Math.min(Math.PI * 0.7, spherical.phi + (e.clientY - prevMouse.y) * 0.005));
    prevMouse = { x: e.clientX, y: e.clientY };
    updateCamera();
  });
  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });
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
  canvas.addEventListener('touchend', () => { isDragging = false; });

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
      const nearby = building.children.find(c => c.userData && c.userData.name && c.position.distanceTo(hit.object.position) < 3);
      if (nearby) {
        infoTitle.textContent = nearby.userData.name;
        infoDesc.textContent = nearby.userData.desc;
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
    scene.fog = new THREE.Fog(isDay ? 0xf5f3ef : 0x0c0c0c, 150, 350);
  });

  // Animate
  let ledTime = 0;
  setTimeout(() => { autoRotate = false; }, 25000);

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) { spherical.theta += 0.001; updateCamera(); }
    ledTime += 0.015;
    ledMat.opacity = 0.03 + Math.sin(ledTime) * 0.025;
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
