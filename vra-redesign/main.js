/* VRA USA — scroll-driven night drive. Truck stays at origin; the world rolls past. */
(function () {
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060c);
  scene.fog = new THREE.FogExp2(0x04060c, 0.014);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 600);

  // ---------- lighting ----------
  scene.add(new THREE.HemisphereLight(0x223050, 0x0a0806, 0.55));
  const moon = new THREE.DirectionalLight(0x8fa8ff, 0.4);
  moon.position.set(35, 50, -25);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -14; moon.shadow.camera.right = 14;
  moon.shadow.camera.top = 14; moon.shadow.camera.bottom = -14;
  scene.add(moon);

  // ---------- sky ----------
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 900; i++) {
    const t = Math.random() * Math.PI * 2, p = Math.random() * 0.45 + 0.05;
    const r = 280;
    starPos.push(r * Math.cos(t) * Math.cos(p * Math.PI), r * Math.sin(p * Math.PI), r * Math.sin(t) * Math.cos(p * Math.PI));
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xaabbdd, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.75, fog: false
  })));
  const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(8, 32),
    new THREE.MeshBasicMaterial({ color: 0xdfe8ff, fog: false, transparent: true, opacity: 0.9 }));
  moonDisc.position.set(70, 78, -220);
  moonDisc.lookAt(0, 2, 0);
  scene.add(moonDisc);

  // ---------- terrain + road ----------
  function roadTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = '#38301f'; g.fillRect(0, 0, 256, 512);
    // wheel ruts
    for (const x of [58, 162]) {
      const gr = g.createLinearGradient(x, 0, x + 42, 0);
      gr.addColorStop(0, '#38301f'); gr.addColorStop(0.5, '#57492c'); gr.addColorStop(1, '#38301f');
      g.fillStyle = gr; g.fillRect(x, 0, 42, 512);
    }
    // gravel noise
    for (let i = 0; i < 2600; i++) {
      const v = 30 + Math.random() * 55 | 0;
      g.fillStyle = `rgba(${v + 25},${v + 12},${v - 8},${Math.random() * 0.5})`;
      g.fillRect(Math.random() * 256, Math.random() * 512, 2, 2 + Math.random() * 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 34);
    return t;
  }
  const roadTex = roadTexture();
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(8.5, 340),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: 1, color: 0xbbaa99 })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -80);
  road.receiveShadow = true;
  scene.add(road);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(700, 700),
    new THREE.MeshStandardMaterial({ color: 0x0d120c, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.06;
  ground.receiveShadow = true;
  scene.add(ground);

  // mountains — Montana silhouettes
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1c, roughness: 1, flatShading: true });
  [[-130, -200, 95, 34], [-40, -230, 120, 42], [70, -210, 100, 30], [160, -190, 80, 26], [-210, -180, 70, 22]]
    .forEach(([x, z, r, h]) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7, 1), mountainMat);
      m.position.set(x, h / 2 - 2, z);
      m.rotation.y = Math.random() * 3;
      scene.add(m);
    });

  // ---------- recycling props (roll past the truck) ----------
  const SPAN = 300;
  const props = [];
  function addProp(mesh, baseZ) { mesh.userData.baseZ = baseZ; props.push(mesh); scene.add(mesh); }

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 1 });
  for (let i = 0; i < 11; i++) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 7.2, 6), poleMat);
    pole.position.y = 3.6;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.09, 0.09), poleMat);
    arm.position.y = 6.6;
    g.add(pole, arm);
    g.position.x = -6.8;
    addProp(g, i * (SPAN / 11));
  }
  const postMat = new THREE.MeshStandardMaterial({ color: 0x17120e, roughness: 1 });
  for (let i = 0; i < 40; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.15, 0.11), postMat);
    p.position.x = 5.4;
    addProp(p, i * (SPAN / 40));
  }
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x18201a, roughness: 1, flatShading: true });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 1, flatShading: true });
  for (let i = 0; i < 70; i++) {
    const isRock = Math.random() < 0.3;
    const m = new THREE.Mesh(
      isRock ? new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.5)
             : new THREE.IcosahedronGeometry(0.45 + Math.random() * 0.75, 0),
      isRock ? rockMat : bushMat
    );
    let x = 6 + Math.random() * 34;
    if (Math.random() < 0.5) x = -x;
    m.position.x = x;
    m.scale.y = 0.65;
    addProp(m, Math.random() * SPAN);
  }

  // ---------- the truck (F-150-ish, low-poly) ----------
  const truck = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: 0x232a33, metalness: 0.75, roughness: 0.32 });
  const trim  = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x0b0f16, metalness: 0.9, roughness: 0.12 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xb9bec6, metalness: 1, roughness: 0.28 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 1 });

  function box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); truck.add(m); return m;
  }
  // body (front = -z)
  box(2.15, 0.95, 5.9, paint, 0, 1.05, 0);                 // lower body
  box(2.02, 0.32, 1.95, paint, 0, 1.66, -1.85);            // hood
  box(1.92, 0.72, 2.05, glass, 0, 1.98, 0.12);             // cab glass
  box(1.98, 0.1, 2.15, paint, 0, 2.38, 0.12);              // roof
  box(0.14, 0.24, 1.95, paint, -1.0, 1.64, 1.95);          // bed rail L
  box(0.14, 0.24, 1.95, paint, 1.0, 1.64, 1.95);           // bed rail R
  box(2.15, 0.24, 0.14, paint, 0, 1.64, 2.9);              // tailgate
  box(1.85, 0.58, 0.14, trim, 0, 1.18, -2.94);             // grille
  box(2.25, 0.2, 0.28, chrome, 0, 0.66, -2.92);            // bumper F
  box(2.25, 0.2, 0.28, chrome, 0, 0.66, 2.92);             // bumper R
  box(0.1, 0.16, 0.3, trim, -1.12, 2.05, -0.72);           // mirror L
  box(0.1, 0.16, 0.3, trim, 1.12, 2.05, -0.72);            // mirror R
  // lights
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xffeccc });
  const tlMat = new THREE.MeshBasicMaterial({ color: 0xff2a18 });
  [[-0.72], [0.72]].forEach(([x]) => {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.08), hlMat);
    h.position.set(x, 1.38, -2.97); truck.add(h);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.08), tlMat);
    t.position.set(x * 1.36, 1.28, 2.96); truck.add(t);
  });
  // wheels
  const wheels = [];
  [[-1.05, -1.9], [1.05, -1.9], [-1.05, 1.85], [1.05, 1.85]].forEach(([x, z]) => {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 0.4, 18), rubber);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 12),
      new THREE.MeshStandardMaterial({ color: 0x63666c, metalness: 0.9, roughness: 0.4 }));
    w.add(tire, hub);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.57, z);
    truck.add(w); wheels.push(w);
  });
  truck.traverse(m => { if (m.isMesh) m.castShadow = true; });

  // headlight spots
  [[-0.72], [0.72]].forEach(([x]) => {
    const s = new THREE.SpotLight(0xffdfae, 3.2, 60, 0.42, 0.6, 1.1);
    s.position.set(x, 1.35, -2.9);
    s.target.position.set(x * 1.6, 0, -26);
    truck.add(s, s.target);
  });
  // fake volumetric beams
  const beamGeo = new THREE.ConeGeometry(3.2, 22, 24, 1, true);
  beamGeo.translate(0, -11, 0); // apex at origin
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffe0a8, transparent: true, opacity: 0.05, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  [[-0.72], [0.72]].forEach(([x]) => {
    const b = new THREE.Mesh(beamGeo, beamMat);
    b.position.set(x, 1.35, -2.9);
    b.rotation.x = Math.PI / 2 - 0.09;
    truck.add(b);
  });
  const rearGlow = new THREE.PointLight(0xff2a18, 0.7, 6);
  rearGlow.position.set(0, 1.2, 3.2); truck.add(rearGlow);
  const groundSpill = new THREE.PointLight(0xffc890, 0.9, 9);
  groundSpill.position.set(0, 0.7, -3.4); truck.add(groundSpill);
  scene.add(truck);

  // ---------- dust ----------
  const DUST_N = 240;
  const dustGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(DUST_N * 3);
  const dVel = []; const dLife = new Float32Array(DUST_N);
  for (let i = 0; i < DUST_N; i++) { dPos[i * 3 + 1] = -50; dVel.push(new THREE.Vector3()); dLife[i] = 0; }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dustSprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    gr.addColorStop(0, 'rgba(205,185,150,0.85)'); gr.addColorStop(1, 'rgba(205,185,150,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    map: dustSprite, color: 0x9b8266, size: 1.7, transparent: true, opacity: 0.3, depthWrite: false
  }));
  scene.add(dust);

  // ---------- camera shots (a commercial shoot's coverage) ----------
  const SHOTS = [
    { pos: [0, 2.7, 9.5],  look: [0, 1.2, -5] },    // opening: behind the truck
    { pos: [-5.8, 1.35, 1.2], look: [0, 1.1, -0.4] }, // side tracking
    { pos: [-3.6, 1.05, -6.9], look: [0.3, 1.15, 0.5] }, // front 3/4 low hero angle
    { pos: [1.5, 10.5, 2.5],  look: [0, 0.4, -1.5] },  // overhead crane
    { pos: [-1.5, 3.6, 17],   look: [0, 1.3, -12] },   // wide pull-back
  ];
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(),
        vLook = new THREE.Vector3(), vPos = new THREE.Vector3();
  const smoothstep = t => t * t * (3 - 2 * t);

  // ---------- overlay panels ----------
  const OVERLAYS = [
    { el: document.getElementById('s-hero'),    a: -0.02, b: 0.13 },
    { el: document.getElementById('s-about'),   a: 0.20,  b: 0.36 },
    { el: document.getElementById('s-crew'),    a: 0.43,  b: 0.60 },
    { el: document.getElementById('s-work'),    a: 0.66,  b: 0.80 },
    { el: document.getElementById('s-contact'), a: 0.88,  b: 1.03 },
  ];
  const progressBar = document.getElementById('progress');

  document.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', () => {
      const p = parseFloat(el.dataset.go);
      window.scrollTo({ top: p * (document.body.scrollHeight - innerHeight), behavior: 'smooth' });
    });
  });

  // ---------- loop ----------
  let smoothP = 0, drive = 0, prevDrive = 0, lastT = performance.now();

  function frame(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now;
    const time = now / 1000;

    const maxScroll = document.body.scrollHeight - innerHeight;
    const targetP = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    // hidden tab (headless capture): rAF is paused, so snap instead of easing
    if (document.hidden) smoothP = targetP;
    else smoothP += (targetP - smoothP) * Math.min(1, dt * 6);

    // world motion: constant idle roll + scroll drive
    prevDrive = drive;
    drive = smoothP * 260 + time * 3.5;
    const speed = (drive - prevDrive) / dt;

    roadTex.offset.y = -(drive / 10);
    for (const p of props) {
      p.position.z = -250 + ((p.userData.baseZ + drive) % SPAN + SPAN) % SPAN;
    }

    // truck life: wheel spin, body bob and sway
    for (const w of wheels) w.rotation.x -= (speed * dt) / 0.57;
    truck.position.y = Math.sin(time * 11) * 0.018 + Math.sin(time * 5.3) * 0.012;
    truck.rotation.z = Math.sin(time * 4.2) * 0.006;
    truck.rotation.y = Math.sin(time * 0.7) * 0.01;

    // dust
    const dp = dustGeo.attributes.position.array;
    const spawnChance = Math.min(0.9, speed / 26);
    for (let i = 0; i < DUST_N; i++) {
      if (dLife[i] > 0) {
        dLife[i] -= dt;
        dVel[i].y += dt * 0.5;
        dp[i * 3] += dVel[i].x * dt;
        dp[i * 3 + 1] += dVel[i].y * dt;
        dp[i * 3 + 2] += dVel[i].z * dt;
        if (dLife[i] <= 0) dp[i * 3 + 1] = -50;
      } else if (Math.random() < spawnChance) {
        const side = Math.random() < 0.5 ? -1 : 1;
        dp[i * 3] = side * (0.9 + Math.random() * 0.4);
        dp[i * 3 + 1] = 0.2 + Math.random() * 0.25;
        dp[i * 3 + 2] = 2.1 + Math.random() * 0.6;
        dVel[i].set((Math.random() - 0.5) * 1.6, 0.4 + Math.random() * 1.2, 2.5 + Math.random() * (speed * 0.25));
        dLife[i] = 0.8 + Math.random() * 1.4;
      }
    }
    dustGeo.attributes.position.needsUpdate = true;

    // camera along shot list
    const seg = Math.min(SHOTS.length - 2, Math.floor(smoothP * (SHOTS.length - 1)));
    const t = smoothstep(Math.min(1, Math.max(0, smoothP * (SHOTS.length - 1) - seg)));
    vPos.copy(vA.fromArray(SHOTS[seg].pos).lerp(vB.fromArray(SHOTS[seg + 1].pos), t));
    vLook.copy(vA.fromArray(SHOTS[seg].look).lerp(vB.fromArray(SHOTS[seg + 1].look), t));
    // handheld drift
    vPos.x += Math.sin(time * 0.9) * 0.09;
    vPos.y += Math.sin(time * 1.27) * 0.05;
    camera.position.copy(vPos);
    camera.lookAt(vLook);

    // overlays
    const EDGE = 0.045;
    for (const o of OVERLAYS) {
      const op = Math.max(0, Math.min(1, (smoothP - o.a) / EDGE, (o.b - smoothP) / EDGE));
      o.el.style.opacity = op.toFixed(3);
      o.el.style.visibility = op > 0.01 ? 'visible' : 'hidden';
      o.el.style.transform = `translateY(${(1 - op) * 18}px)`;
    }
    progressBar.style.width = (targetP * 100) + '%';

    renderer.render(scene, camera);
  }
  // deep link: #p=0.5 opens the page already at that scroll progress
  const hashP = location.hash.match(/p=([\d.]+)/);
  if (hashP) {
    const p0 = Math.min(1, Math.max(0, parseFloat(hashP[1])));
    window.scrollTo(0, p0 * (document.body.scrollHeight - innerHeight));
    smoothP = p0;
  }

  function loop(now) { frame(now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  setInterval(() => { if (document.hidden) frame(performance.now()); }, 400);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();
