/**
 * M+ Building — Three.js 3D Wireframe Viewer
 * Blueprint-style 3D model (procedural geometry since b3dm parsing is complex)
 */

(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0c0c);
  scene.fog = new THREE.Fog(0x0c0c0c, 80, 200);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(50, 30, 60);
  camera.lookAt(0, 10, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight - 52);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Materials
  const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true });
  const wireMatBright = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.7, transparent: true });
  const accentMat = new THREE.LineBasicMaterial({ color: 0xe8c547, opacity: 0.6, transparent: true });
  const fillMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.03, transparent: true, side: THREE.DoubleSide });
  const fillMatHover = new THREE.MeshBasicMaterial({ color: 0xe8c547, opacity: 0.08, transparent: true, side: THREE.DoubleSide });

  // Building group
  const building = new THREE.Group();

  // --- Podium (main body) ---
  const podiumGeo = new THREE.BoxGeometry(60, 12, 35);
  const podiumEdges = new THREE.EdgesGeometry(podiumGeo);
  const podiumWire = new THREE.LineSegments(podiumEdges, wireMatBright);
  podiumWire.position.set(0, 6, 0);
  podiumWire.userData = { name: 'Podium', desc: 'G–3F · 33 galleries · 17,000 m² exhibition\nCinema ×3 · Mediatheque · Learning Hub' };
  building.add(podiumWire);

  const podiumFill = new THREE.Mesh(podiumGeo, fillMat);
  podiumFill.position.copy(podiumWire.position);
  building.add(podiumFill);

  // Floor lines in podium
  for (let i = 1; i <= 3; i++) {
    const y = i * 3;
    const floorGeo = new THREE.PlaneGeometry(59, 34);
    const floorEdges = new THREE.EdgesGeometry(floorGeo);
    const floorLine = new THREE.LineSegments(floorEdges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.1, transparent: true }));
    floorLine.rotation.x = -Math.PI / 2;
    floorLine.position.set(0, y, 0);
    building.add(floorLine);
  }

  // --- Tower ---
  const towerGeo = new THREE.BoxGeometry(18, 50, 14);
  const towerEdges = new THREE.EdgesGeometry(towerGeo);
  const towerWire = new THREE.LineSegments(towerEdges, wireMatBright);
  towerWire.position.set(0, 37, 0);
  towerWire.userData = { name: 'Tower', desc: '4–20F · 65m height\nResearch Centre · M+ Lounge (L11)\nLingnan U (L13) · HSUHK (L15)' };
  building.add(towerWire);

  const towerFill = new THREE.Mesh(towerGeo, fillMat);
  towerFill.position.copy(towerWire.position);
  building.add(towerFill);

  // Tower floor lines
  for (let i = 1; i <= 16; i++) {
    const y = 12 + i * 3;
    const fGeo = new THREE.PlaneGeometry(17, 13);
    const fEdges = new THREE.EdgesGeometry(fGeo);
    const fLine = new THREE.LineSegments(fEdges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.06, transparent: true }));
    fLine.rotation.x = -Math.PI / 2;
    fLine.position.set(0, y, 0);
    building.add(fLine);
  }

  // --- LED Facade (right side of tower) ---
  const ledGeo = new THREE.PlaneGeometry(0.5, 48);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xe8c547, opacity: 0.15, transparent: true, side: THREE.DoubleSide });
  const ledPlane = new THREE.Mesh(ledGeo, ledMat);
  ledPlane.position.set(9.2, 37, 0);
  ledPlane.userData = { name: 'LED Facade', desc: '65.8m × 110m\n140,000 ceramic tiles with embedded LEDs\nFacing Victoria Harbour' };
  building.add(ledPlane);

  // LED edge glow
  const ledEdgeGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.5, 48));
  const ledEdge = new THREE.LineSegments(ledEdgeGeo, accentMat);
  ledEdge.position.copy(ledPlane.position);
  building.add(ledEdge);

  // --- Found Space (underground) ---
  const foundShape = new THREE.Shape();
  foundShape.moveTo(-25, -5);
  foundShape.quadraticCurveTo(0, -10, 25, -5);
  foundShape.lineTo(25, 5);
  foundShape.quadraticCurveTo(0, 8, -25, 5);
  foundShape.closePath();

  const foundGeo = new THREE.ExtrudeGeometry(foundShape, { depth: 20, bevelEnabled: false });
  const foundEdges = new THREE.EdgesGeometry(foundGeo);
  const foundWire = new THREE.LineSegments(foundEdges, wireMat);
  foundWire.position.set(0, -8, -10);
  foundWire.userData = { name: 'Found Space', desc: 'B2 · Underground exhibition hall\nFollows MTR tunnel contours\nLarge-scale installations' };
  building.add(foundWire);

  // --- Mega-trusses (simplified) ---
  const trussMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true });
  const trussPositions = [-20, -10, 0, 10, 20];
  trussPositions.forEach(xPos => {
    const points = [
      new THREE.Vector3(xPos, -5, -12),
      new THREE.Vector3(xPos * 0.6, 0, -12),
      new THREE.Vector3(xPos, -5, 12),
      new THREE.Vector3(xPos * 0.6, 0, 12),
    ];
    const trussGeo = new THREE.BufferGeometry().setFromPoints([points[0], points[1]]);
    building.add(new THREE.Line(trussGeo, trussMat));
    const trussGeo2 = new THREE.BufferGeometry().setFromPoints([points[2], points[3]]);
    building.add(new THREE.Line(trussGeo2, trussMat));
  });

  // --- Ground Plane ---
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundEdges = new THREE.EdgesGeometry(groundGeo);
  const ground = new THREE.LineSegments(groundEdges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.05, transparent: true }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  // Grid on ground
  const gridHelper = new THREE.GridHelper(200, 40, 0x222222, 0x151515);
  scene.add(gridHelper);

  // Add building to scene
  scene.add(building);

  // --- Orbit Controls (manual) ---
  let isDragging = false;
  let previousMouse = { x: 0, y: 0 };
  let spherical = { radius: 90, theta: Math.PI / 4, phi: Math.PI / 3 };

  function updateCamera() {
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.lookAt(0, 15, 0);
  }

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMouse = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - previousMouse.x;
    const dy = e.clientY - previousMouse.y;
    spherical.theta -= dx * 0.005;
    spherical.phi = Math.max(0.3, Math.min(Math.PI - 0.3, spherical.phi + dy * 0.005));
    previousMouse = { x: e.clientX, y: e.clientY };
    updateCamera();
  });

  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });

  canvas.addEventListener('wheel', (e) => {
    spherical.radius = Math.max(30, Math.min(200, spherical.radius + e.deltaY * 0.05));
    updateCamera();
  }, { passive: true });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });
  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - previousMouse.x;
    const dy = e.touches[0].clientY - previousMouse.y;
    spherical.theta -= dx * 0.005;
    spherical.phi = Math.max(0.3, Math.min(Math.PI - 0.3, spherical.phi + dy * 0.005));
    previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    updateCamera();
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isDragging = false; });

  // --- Click to select ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const infoPanel = document.getElementById('info-panel');
  const infoTitle = document.getElementById('info-title');
  const infoDesc = document.getElementById('info-desc');
  const closePanel = document.getElementById('close-panel');

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(building.children, false);
    
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      // Find parent with userData
      let target = obj;
      if (!target.userData.name) {
        // Check siblings
        target = building.children.find(c => c.userData.name && c.position.distanceTo(obj.position) < 1) || obj;
      }
      
      if (target.userData.name) {
        infoTitle.textContent = target.userData.name;
        infoDesc.textContent = target.userData.desc;
        infoPanel.classList.add('active');
      }
    }
  });

  closePanel.addEventListener('click', () => {
    infoPanel.classList.remove('active');
  });

  // --- Auto-rotation ---
  let autoRotate = true;

  canvas.addEventListener('mousedown', () => { autoRotate = false; });
  setTimeout(() => { autoRotate = false; }, 15000); // Stop after 15s

  // --- LED pulse ---
  let ledTime = 0;

  // --- Animation loop ---
  function animate() {
    requestAnimationFrame(animate);
    
    if (autoRotate) {
      spherical.theta += 0.002;
      updateCamera();
    }
    
    // LED pulse
    ledTime += 0.02;
    ledMat.opacity = 0.1 + Math.sin(ledTime) * 0.08;
    
    renderer.render(scene, camera);
  }

  // --- Resize ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight - 52);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 52);
  });

  // --- Day/Night toggle ---
  const modeToggle = document.getElementById('mode-toggle');
  modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('day-mode');
    const isDay = document.body.classList.contains('day-mode');
    modeToggle.querySelector('.mode-icon').textContent = isDay ? '☀' : '☾';
    scene.background = new THREE.Color(isDay ? 0xf5f3ef : 0x0c0c0c);
    scene.fog = new THREE.Fog(isDay ? 0xf5f3ef : 0x0c0c0c, 80, 200);
    wireMat.color.set(isDay ? 0x333333 : 0xffffff);
    wireMatBright.color.set(isDay ? 0x1a1a1a : 0xffffff);
  });

  // Init
  updateCamera();
  animate();
})();
