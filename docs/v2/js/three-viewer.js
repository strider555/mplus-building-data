/**
 * M+ Building — Three.js 3D Wireframe Viewer (v2 - Accurate)
 * Based on Herzog & de Meuron Section B drawing (415_DR_2110_002)
 * 
 * HdM Cross Section Legend:
 * 1. Found Space  2. The Studio  3. Main Hall  4. Atrium
 * 5. Galleries  6. Terrace Restaurant  7. Research Centre
 * 8. Office  9. M+ Members Lounge  10. Art-related OACF
 * 11. RDE (F&B)  12. Roof Garden  13. CSF Art Storage
 * 14. CSF Conservation Labs  15. Avenue  16. Carriageway
 * 17. Parking  18. Waterfront Promenade  19. Victoria Harbour
 * 20. Airport Express Line Tunnel  21. MTR / Elements Cooling Main
 */

(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0c0c);
  scene.fog = new THREE.Fog(0x0c0c0c, 120, 300);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(80, 40, 80);
  camera.lookAt(0, 15, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight - 52);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Materials
  const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.35, transparent: true });
  const wireMatBright = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.7, transparent: true });
  const wireMatDim = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.15, transparent: true });
  const accentMat = new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.6, transparent: true });
  const fillMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.02, transparent: true, side: THREE.DoubleSide });
  const groundFill = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.01, transparent: true, side: THREE.DoubleSide });

  const building = new THREE.Group();

  // === PROPORTIONS (based on HdM axonometry + section) ===
  // Podium: wide (~160m) x ~15m tall x ~80m deep
  // Tower: narrow front-to-back (~18m deep) but the FACADE wall is ~110m wide
  // The facade is a massive flat screen spanning most of podium width
  // Tower structure behind facade is only ~30m wide
  // Scale: 1 unit = ~2m
  const podW = 80, podH = 7.5, podD = 40;
  const towW = 15, towH = 45, towD = 9; // actual tower structure (narrow)
  const facadeW = 55; // M+ Facade wall (~110m) - much wider than tower!
  const facadeH = 44; // almost full tower height
  const towOffsetX = 0; // centered per section drawing

  // === UNDERGROUND: Found Space + Studio + Tunnel ===
  // Found Space - irregular organic shape (from axonometry)
  const foundShape = new THREE.Shape();
  foundShape.moveTo(-30, -20);
  foundShape.bezierCurveTo(-35, -10, -20, 5, -10, 15);
  foundShape.lineTo(10, 18);
  foundShape.bezierCurveTo(20, 15, 30, 5, 25, -10);
  foundShape.lineTo(20, -18);
  foundShape.bezierCurveTo(10, -22, -15, -22, -30, -20);
  
  const foundExtrudeSettings = { depth: 8, bevelEnabled: false };
  const foundGeo = new THREE.ExtrudeGeometry(foundShape, foundExtrudeSettings);
  const foundEdges = new THREE.EdgesGeometry(foundGeo);
  const foundWire = new THREE.LineSegments(foundEdges, wireMat);
  foundWire.rotation.x = -Math.PI / 2;
  foundWire.position.set(0, -6, 0);
  foundWire.scale.set(0.6, 0.6, 0.6);
  foundWire.userData = { name: 'Found Space', desc: 'B1/F · Underground exhibition hall\nOrganic form following MTR tunnel contours\nLarge-scale installations & The Studio' };
  building.add(foundWire);

  // Airport Express Tunnel (cylindrical, underground)
  const tunnelGeo = new THREE.CylinderGeometry(3, 3, 70, 12, 1, true);
  const tunnelEdges = new THREE.EdgesGeometry(tunnelGeo);
  const tunnelWire = new THREE.LineSegments(tunnelEdges, wireMatDim);
  tunnelWire.rotation.z = Math.PI / 2;
  tunnelWire.position.set(0, -12, 0);
  tunnelWire.userData = { name: 'Airport Express Line Tunnel', desc: 'MTR tunnel running just 1.5m below ground\n5 mega-trusses span above to protect it' };
  building.add(tunnelWire);

  // === PODIUM (Ground to Roof Garden level) ===
  // Multi-level podium with cantilever
  const podiumGeo = new THREE.BoxGeometry(podW, podH, podD);
  const podiumEdges = new THREE.EdgesGeometry(podiumGeo);
  const podiumWire = new THREE.LineSegments(podiumEdges, wireMatBright);
  podiumWire.position.set(0, podH / 2, 0);
  podiumWire.userData = { name: 'Podium', desc: 'G–2F · Main Hall · Atrium · 33 Galleries\n17,000 m² exhibition · Cinema ×3\nMediatheque · Learning Hub' };
  building.add(podiumWire);
  
  const podiumFill = new THREE.Mesh(podiumGeo, fillMat);
  podiumFill.position.copy(podiumWire.position);
  building.add(podiumFill);

  // Podium floor divisions (3 main levels: GF, L1, L2)
  for (let i = 1; i <= 2; i++) {
    const y = i * 2.5;
    const floorGeo = new THREE.PlaneGeometry(podW - 1, podD - 1);
    const floorEdges = new THREE.EdgesGeometry(floorGeo);
    const floorLine = new THREE.LineSegments(floorEdges, wireMatDim);
    floorLine.rotation.x = -Math.PI / 2;
    floorLine.position.set(0, y, 0);
    building.add(floorLine);
  }

  // Cantilever extensions (podium overhangs ground floor)
  const cantGeo = new THREE.BoxGeometry(6, 0.3, podD);
  const cantEdges = new THREE.EdgesGeometry(cantGeo);
  const cantL = new THREE.LineSegments(cantEdges, wireMatDim);
  cantL.position.set(-podW/2 - 3, 5, 0);
  building.add(cantL);
  const cantR = new THREE.LineSegments(cantEdges.clone(), wireMatDim);
  cantR.position.set(podW/2 + 3, 5, 0);
  building.add(cantR);

  // === ROOF GARDEN (atop podium, both sides of tower) ===
  const roofGardenGeo = new THREE.PlaneGeometry(podW, podD);
  const roofGardenEdges = new THREE.EdgesGeometry(roofGardenGeo);
  const roofGarden = new THREE.LineSegments(roofGardenEdges, new THREE.LineBasicMaterial({ color: 0x4a9e4a, opacity: 0.25, transparent: true }));
  roofGarden.rotation.x = -Math.PI / 2;
  roofGarden.position.set(0, podH + 0.1, 0);
  roofGarden.userData = { name: 'Roof Garden', desc: 'Level 3 · Faces Victoria Harbour\nOpen-air terrace spanning podium roof' };
  building.add(roofGarden);

  // === TOWER (narrow structure BEHIND the wide facade) ===
  // From axonometry: tower is narrow front-to-back, sits behind facade
  const towerGeo = new THREE.BoxGeometry(towW, towH, towD);
  const towerEdges = new THREE.EdgesGeometry(towerGeo);
  const towerWire = new THREE.LineSegments(towerEdges, wireMatBright);
  towerWire.position.set(towOffsetX, podH + towH / 2, -towD / 2); // behind facade
  towerWire.userData = { name: 'Tower', desc: 'L6–L11 (visible floors)\nL6: Terrace Restaurant\nL7: Research Centre\nL8: Offices (×4 floors)\nL9: M+ Members Lounge\nL10: Art-related OACF\nL11: RDE (F&B) — top floors' };
  building.add(towerWire);

  const towerFill = new THREE.Mesh(towerGeo, fillMat);
  towerFill.position.copy(towerWire.position);
  building.add(towerFill);

  // Tower floor lines (11 visible floors based on section)
  for (let i = 1; i <= 10; i++) {
    const y = podH + i * (towH / 11);
    const fGeo = new THREE.PlaneGeometry(towW - 0.5, towD - 0.5);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fLine = new THREE.LineSegments(fEdges, wireMatDim);
    fLine.rotation.x = -Math.PI / 2;
    fLine.position.set(towOffsetX, y, -towD / 2);
    building.add(fLine);
  }

  // Small tower top (the narrow top visible above facade in axonometry)
  const topGeo = new THREE.BoxGeometry(towW, 5, towD);
  const topEdges = new THREE.EdgesGeometry(topGeo);
  const topWire = new THREE.LineSegments(topEdges, wireMat);
  topWire.position.set(towOffsetX, podH + towH + 2.5, -towD / 2);
  building.add(topWire);

  // === M+ FACADE (massive flat wall, spanning most of podium width) ===
  // Per axonometry: facade is a huge screen wall MUCH wider than the narrow tower
  // 110m wide × 65.8m high - the defining visual element of M+
  const ledGeo = new THREE.PlaneGeometry(facadeW, facadeH);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xe8c547, opacity: 0.08, transparent: true, side: THREE.DoubleSide });
  const ledPlane = new THREE.Mesh(ledGeo, ledMat);
  ledPlane.position.set(towOffsetX, podH + facadeH / 2, towD / 2 + 0.5);
  ledPlane.userData = { name: 'M+ Facade (LED)', desc: '65.8m high × 110m wide\nMassive screen wall spanning podium width\nEmbedded LED light bars in ceramic louvres\nScreens commissioned moving image artworks\nVisible from harbour promenade & HK Island' };
  building.add(ledPlane);

  // Facade wireframe edge
  const ledEdgeGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(facadeW, facadeH));
  const ledEdge = new THREE.LineSegments(ledEdgeGeo, accentMat);
  ledEdge.position.copy(ledPlane.position);
  building.add(ledEdge);

  // Facade fill (slightly visible solid to show the wall mass)
  const facadeSolidGeo = new THREE.BoxGeometry(facadeW, facadeH, 1.5);
  const facadeSolidEdges = new THREE.EdgesGeometry(facadeSolidGeo);
  const facadeSolid = new THREE.LineSegments(facadeSolidEdges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true }));
  facadeSolid.position.set(towOffsetX, podH + facadeH / 2, towD / 2 + 0.5);
  building.add(facadeSolid);

  // Horizontal louvre lines across entire facade width (the characteristic pattern)
  for (let i = 0; i < 30; i++) {
    const ly = podH + 2 + i * (facadeH / 30);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(towOffsetX - facadeW/2, ly, towD/2 + 1.3),
      new THREE.Vector3(towOffsetX + facadeW/2, ly, towD/2 + 1.3),
    ]);
    building.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.12, transparent: true })));
  }

  // Vertical divisions on facade (subtle)
  for (let i = 1; i < 8; i++) {
    const lx = towOffsetX - facadeW/2 + i * (facadeW / 8);
    const vGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(lx, podH + 1, towD/2 + 1.3),
      new THREE.Vector3(lx, podH + facadeH - 1, towD/2 + 1.3),
    ]);
    building.add(new THREE.Line(vGeo, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.05, transparent: true })));
  }

  // === CSF BUILDING (Conservation & Storage Facility - to the right) ===
  const csfW = 12, csfH = 20, csfD = 14;
  const csfGeo = new THREE.BoxGeometry(csfW, csfH, csfD);
  const csfEdges = new THREE.EdgesGeometry(csfGeo);
  const csfWire = new THREE.LineSegments(csfEdges, wireMat);
  csfWire.position.set(podW/2 + 10, csfH/2, 0);
  csfWire.userData = { name: 'CSF Building', desc: 'Conservation & Storage Facility\nL13: Art Storage\nL14: Conservation Labs\nConnected to main building' };
  building.add(csfWire);

  // CSF floor lines
  for (let i = 1; i < 5; i++) {
    const fy = i * (csfH / 5);
    const cfGeo = new THREE.PlaneGeometry(csfW - 0.5, csfD - 0.5);
    const cfEdges = new THREE.EdgesGeometry(cfGeo);
    const cfLine = new THREE.LineSegments(cfEdges, wireMatDim);
    cfLine.rotation.x = -Math.PI / 2;
    cfLine.position.set(podW/2 + 10, fy, 0);
    building.add(cfLine);
  }

  // === MEGA-TRUSSES (5, spanning above tunnel) ===
  const trussPositions = [-28, -14, 0, 14, 28];
  trussPositions.forEach(xPos => {
    const pts = [
      new THREE.Vector3(xPos, -8, -podD/3),
      new THREE.Vector3(xPos, 0, -podD/3),
    ];
    const pts2 = [
      new THREE.Vector3(xPos, -8, podD/3),
      new THREE.Vector3(xPos, 0, podD/3),
    ];
    const tGeo1 = new THREE.BufferGeometry().setFromPoints(pts);
    const tGeo2 = new THREE.BufferGeometry().setFromPoints(pts2);
    const trussMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.18, transparent: true });
    building.add(new THREE.Line(tGeo1, trussMat));
    building.add(new THREE.Line(tGeo2, trussMat));
    // Cross brace
    const cross = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xPos, -8, -podD/3),
      new THREE.Vector3(xPos, 0, podD/3),
    ]);
    building.add(new THREE.Line(cross, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.08, transparent: true })));
  });

  // === GROUND + WATERFRONT ===
  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(250, 250);
  const groundEdges = new THREE.EdgesGeometry(groundGeo);
  const ground = new THREE.LineSegments(groundEdges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.04, transparent: true }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Grid
  const gridHelper = new THREE.GridHelper(250, 50, 0x1a1a1a, 0x111111);
  scene.add(gridHelper);

  // Waterfront promenade (south side)
  const proGeo = new THREE.PlaneGeometry(100, 8);
  const proEdges = new THREE.EdgesGeometry(proGeo);
  const promenade = new THREE.LineSegments(proEdges, new THREE.LineBasicMaterial({ color: 0x4a9eff, opacity: 0.15, transparent: true }));
  promenade.rotation.x = -Math.PI / 2;
  promenade.position.set(0, 0.05, podD/2 + 10);
  promenade.userData = { name: 'Waterfront Promenade', desc: 'Public waterfront facing Victoria Harbour\nViewing point for M+ Facade LED art' };
  building.add(promenade);

  // Victoria Harbour indicator
  const harbourGeo = new THREE.PlaneGeometry(120, 40);
  const harbourMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, opacity: 0.03, transparent: true, side: THREE.DoubleSide });
  const harbour = new THREE.Mesh(harbourGeo, harbourMat);
  harbour.rotation.x = -Math.PI / 2;
  harbour.position.set(0, -0.1, podD/2 + 30);
  building.add(harbour);

  scene.add(building);

  // === ORBIT CONTROLS ===
  let isDragging = false;
  let previousMouse = { x: 0, y: 0 };
  let spherical = { radius: 110, theta: Math.PI / 5, phi: Math.PI / 3.2 };

  function updateCamera() {
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.lookAt(0, 12, 0);
  }

  canvas.addEventListener('mousedown', (e) => { isDragging = true; autoRotate = false; previousMouse = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    spherical.theta -= (e.clientX - previousMouse.x) * 0.005;
    spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi + (e.clientY - previousMouse.y) * 0.005));
    previousMouse = { x: e.clientX, y: e.clientY };
    updateCamera();
  });
  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });
  canvas.addEventListener('wheel', (e) => {
    spherical.radius = Math.max(40, Math.min(250, spherical.radius + e.deltaY * 0.05));
    updateCamera();
  }, { passive: true });

  // Touch
  canvas.addEventListener('touchstart', (e) => { isDragging = true; autoRotate = false; previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    spherical.theta -= (e.touches[0].clientX - previousMouse.x) * 0.005;
    spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi + (e.touches[0].clientY - previousMouse.y) * 0.005));
    previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    updateCamera();
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isDragging = false; });

  // === CLICK TO SELECT ===
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const infoPanel = document.getElementById('info-panel');
  const infoTitle = document.getElementById('info-title');
  const infoDesc = document.getElementById('info-desc');
  document.getElementById('close-panel').addEventListener('click', () => { infoPanel.classList.remove('active'); });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(building.children, false);
    if (intersects.length > 0) {
      // Find object with userData
      for (const hit of intersects) {
        let target = hit.object;
        if (target.userData && target.userData.name) {
          infoTitle.textContent = target.userData.name;
          infoDesc.textContent = target.userData.desc;
          infoPanel.classList.add('active');
          break;
        }
        // Check nearby objects
        const nearby = building.children.find(c => c.userData && c.userData.name && c.position.distanceTo(target.position) < 2);
        if (nearby) {
          infoTitle.textContent = nearby.userData.name;
          infoDesc.textContent = nearby.userData.desc;
          infoPanel.classList.add('active');
          break;
        }
      }
    }
  });

  // === AUTO ROTATE ===
  let autoRotate = true;
  setTimeout(() => { autoRotate = false; }, 20000);

  // === LED PULSE ===
  let ledTime = 0;

  // === ANIMATE ===
  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) { spherical.theta += 0.0015; updateCamera(); }
    ledTime += 0.02;
    ledMat.opacity = 0.08 + Math.sin(ledTime) * 0.06;
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight - 52);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 52);
  });

  // Day/Night
  const modeToggle = document.getElementById('mode-toggle');
  modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('day-mode');
    const isDay = document.body.classList.contains('day-mode');
    modeToggle.querySelector('.mode-icon').textContent = isDay ? '☀' : '☾';
    scene.background = new THREE.Color(isDay ? 0xf5f3ef : 0x0c0c0c);
    scene.fog = new THREE.Fog(isDay ? 0xf5f3ef : 0x0c0c0c, 120, 300);
  });

  updateCamera();
  animate();
})();
