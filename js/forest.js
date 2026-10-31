/* 3D-metsä sivun taustalla (three.js + GSAP ScrollTrigger).
   Matalapolygoninen kuusi- ja mäntymetsä, sen heijastus maan alla, hitaat valopulssit puiden välillä
   ja kamera, joka kulkee metsän läpi sivua vieritettäessä.

   Tiedosto vain määrittelee funktion startForest(). Sen käynnistää js/animations.js,
   kun sivu on latautunut ja kävijä vierittää tai on kulunut hetki. */
(() => {
  /* ---- Asetukset: säädä metsää näistä ---- */
  const SETTINGS = {
    trees: { desktop: 520, mobile: 240 },   /* puiden yritysmäärä (osa jää pois kameran reitiltä) */
    pixelRatio: { desktop: 1.5, mobile: 1 }, /* piirtotarkkuuden yläraja */
    fps: 30,                                /* piirtokertoja sekunnissa */
    spruceShare: 0.75,                      /* kuusten osuus, loput mäntyjä */
    treeHeight: [3.5, 10],                  /* puun korkeus min–max */
    clearing: 8,                            /* puuton käytävä kameran reitin ympärillä */
    pulses: 8,                              /* valopulssien määrä */
    dust: 1800,                             /* ilmassa leijuvia hiukkasia */
    fog: 0.02,                              /* sumun tiheys */
    ground: -8,                             /* maan korkeus */
    colors: {
      background: 0x0E1714,
      mint: 0x8FC7B4,
      pine: 0x2E7D6B,
      treeBody: 0x131D1A,
      gridMinor: 0x1E322C,
      groundGlow: 0x10281F,
      dust: 0xBFD6CC,
    },
    /* kameran pysähdyspaikat: yksi per osio (x, y, z = kamera, lx, ly, lz = katsesuunta) */
    camera: [
      { x: 0, y: 7, z: 34, lx: 0, ly: 0, lz: -30 },
      { x: 10, y: 4, z: -12, lx: 4, ly: -2, lz: -44 },
      { x: -8, y: 9, z: -28, lx: 0, ly: 2, lz: -70 },
      { x: 7, y: 6, z: -62, lx: 0, ly: 1, lz: -108 },
      { x: -6, y: 10, z: -94, lx: 0, ly: 0, lz: -142 },
      { x: 0, y: 18, z: -140, lx: 0, ly: 2, lz: -200 },
    ],
  };

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* lyhin etäisyys pisteestä (x, z) kameran reittiin maan tasossa */
  const distanceToCameraPath = (x, z) => {
    const keys = SETTINGS.camera;
    let best = Infinity;
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z;
      const u = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)));
      best = Math.min(best, Math.hypot(a.x + dx * u - x, a.z + dz * u - z));
    }
    return best;
  };

  /* Kaikki puut kootaan kahdeksi geometriaksi (rungot ja reunaviivat),
     jolloin satoja puita piirretään kahdella piirtokomennolla. */
  const buildForest = (treeCount) => {
    const { ground, colors } = SETTINGS;
    const unitShapes = [
      new THREE.ConeGeometry(1, 1, 7, 1),       /* kuusen kerros */
      new THREE.CylinderGeometry(1, 1, 1, 5, 1), /* runko */
      new THREE.IcosahedronGeometry(1, 0),       /* männyn latva */
    ].map((g) => ({
      body: (g.index ? g.toNonIndexed() : g).attributes.position.array,
      edge: new THREE.EdgesGeometry(g).attributes.position.array,
    }));
    const [CONE, TRUNK, CROWN] = unitShapes;

    const bodyPos = [], edgePos = [], edgeColor = [];
    const matrix = new THREE.Matrix4(), translate = new THREE.Matrix4(), scale = new THREE.Matrix4();
    const v = new THREE.Vector3();
    const mint = new THREE.Color(colors.mint), pine = new THREE.Color(colors.pine);

    const addPiece = (shape, x, y, z, sx, sy, sz, rotation, color) => {
      matrix.makeRotationY(rotation)
        .premultiply(translate.makeTranslation(x, y, z))
        .multiply(scale.makeScale(sx, sy, sz));
      for (let i = 0; i < shape.body.length; i += 3) {
        v.set(shape.body[i], shape.body[i + 1], shape.body[i + 2]).applyMatrix4(matrix);
        bodyPos.push(v.x, v.y, v.z);
      }
      for (let i = 0; i < shape.edge.length; i += 3) {
        v.set(shape.edge[i], shape.edge[i + 1], shape.edge[i + 2]).applyMatrix4(matrix);
        edgePos.push(v.x, v.y, v.z);
        edgeColor.push(color.r, color.g, color.b);
      }
    };

    const treeTops = [];
    for (let n = 0; n < treeCount; n++) {
      const x = rand(-48, 48);
      const z = rand(-202, 28);
      if (distanceToCameraPath(x, z) < SETTINGS.clearing) continue;

      const h = rand(...SETTINGS.treeHeight);
      const rotation = Math.random() * Math.PI;
      const color = (Math.random() < 0.3 ? pine : mint).clone().multiplyScalar(rand(0.3, 0.65));

      if (Math.random() < SETTINGS.spruceShare) {
        /* kuusi: lyhyt runko ja kolme tai neljä päällekkäistä kartiota */
        const radius = h * 0.24, tiers = Math.random() < 0.5 ? 4 : 3, trunkH = h * 0.12, coneH = h * 0.42;
        addPiece(TRUNK, x, ground + trunkH / 2, z, 0.16, trunkH, 0.16, rotation, color);
        for (let t = 0; t < tiers; t++) {
          const r = radius * (1 - t * 0.24);
          const y = ground + trunkH + t * (h - trunkH - coneH) / (tiers - 1) + coneH / 2;
          addPiece(CONE, x, y, z, r, coneH, r, rotation + t, color);
        }
      } else {
        /* mänty: pitkä paljas runko ja litteä latva */
        const trunkH = h * 0.72;
        addPiece(TRUNK, x, ground + trunkH / 2, z, 0.18, trunkH, 0.18, rotation, color);
        addPiece(CROWN, x, ground + trunkH + h * 0.1, z, h * 0.13, h * 0.14, h * 0.13, rotation, color);
      }
      treeTops.push(new THREE.Vector3(x, ground + h, z));
    }

    const geometry = (positions) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
      return g;
    };
    const edges = geometry(edgePos);
    edges.setAttribute('color', new THREE.BufferAttribute(new Float32Array(edgeColor), 3));

    const forest = new THREE.Group();
    forest.add(new THREE.Mesh(geometry(bodyPos), new THREE.MeshBasicMaterial({ color: colors.treeBody })));
    forest.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ vertexColors: true })));
    return { forest, treeTops };
  };

  /* järvenpinnan heijastus: sama metsä peilattuna maan alle, himmeänä */
  const buildReflection = (forest) => {
    const mirror = forest.clone();
    mirror.scale.y = -1;
    mirror.position.y = SETTINGS.ground * 2;
    mirror.traverse((o) => {
      if (!o.material) return;
      o.material = o.material.clone();
      Object.assign(o.material, { transparent: true, opacity: 0.14, depthWrite: false });
    });
    return mirror;
  };

  /* valopulssit: kaarevat polut puiden latvojen välillä ja niitä pitkin kulkevat pisteet */
  const buildPulses = (scene, treeTops) => {
    const { colors } = SETTINGS;
    const paths = [];
    const lineMaterial = new THREE.LineBasicMaterial({
      color: colors.mint, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false,
    });

    /* arvotaan puupareja, joiden välimatka on sopiva; yritysten määrä on rajattu */
    for (let tries = 0; paths.length < SETTINGS.pulses && tries < 500; tries++) {
      const a = pick(treeTops), b = pick(treeTops);
      if (a === b || a.distanceTo(b) > 60) continue;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += rand(6, 14);
      const curve = new THREE.CatmullRomCurve3([a.clone(), mid, b.clone()]);
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), lineMaterial));
      paths.push({ curve, offset: Math.random() });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(paths.length * 3), 3));
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
      color: colors.mint, size: 0.7, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    const positions = geometry.attributes.position.array;
    return (time) => {
      paths.forEach(({ curve, offset }, i) => {
        const p = curve.getPoint((time * 0.045 + offset) % 1);
        positions.set([p.x, p.y, p.z], i * 3);
      });
      geometry.attributes.position.needsUpdate = true;
    };
  };

  /* maan ruudukko ja sen alla heikko vihreä hehku */
  const buildGround = (scene) => {
    const { ground, colors } = SETTINGS;
    const grid = new THREE.GridHelper(260, 130, colors.mint, colors.gridMinor);
    Object.assign(grid.material, { transparent: true, opacity: 0.32 });
    grid.position.y = ground;
    scene.add(grid);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 260),
      new THREE.MeshBasicMaterial({
        color: colors.groundGlow, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = ground - 0.05;
    scene.add(glow);
    return grid;
  };

  /* ilmassa leijuvat hiukkaset */
  const buildDust = (scene) => {
    const positions = new Float32Array(SETTINGS.dust * 3);
    for (let i = 0; i < SETTINGS.dust; i++) {
      positions.set([rand(-80, 80), rand(-30, 30), rand(-220, 0)], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
      color: SETTINGS.colors.dust, size: 0.1, transparent: true, opacity: 0.4, depthWrite: false,
    })));
  };

  /* Käynnistää metsän annetussa canvasissa. small = puhelin tai kosketusnäyttö. */
  window.startForest = (canvas, { small = false } = {}) => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(SETTINGS.colors.background, SETTINGS.fog);

    const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 400);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? SETTINGS.pixelRatio.mobile : SETTINGS.pixelRatio.desktop));

    const grid = buildGround(scene);
    const { forest, treeTops } = buildForest(small ? SETTINGS.trees.mobile : SETTINGS.trees.desktop);
    scene.add(forest, buildReflection(forest));
    const updatePulses = buildPulses(scene, treeTops);
    buildDust(scene);

    const resize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight, false);
    };
    resize();
    addEventListener('resize', resize);

    /* kamera liikkuu pysähdyspaikasta toiseen vierityksen mukana */
    const cam = { ...SETTINGS.camera[0] };
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1.1 },
    });
    SETTINGS.camera.slice(1).forEach((stop) => timeline.to(cam, { ...stop, ease: 'none' }));

    /* piirto: rajattu SETTINGS.fps kertaan sekunnissa ja pysäytetty, kun välilehti on piilossa */
    const clock = new THREE.Clock();
    const frameMs = 1000 / SETTINGS.fps;
    let last = 0;
    let running = true;

    const render = (now) => {
      if (document.hidden) {
        running = false;
        return;
      }
      requestAnimationFrame(render);
      if (now - last < frameMs - 1) return;
      last = now;

      const t = clock.getElapsedTime();
      camera.position.set(cam.x + Math.sin(t * 0.22) * 1.1, cam.y + Math.sin(t * 0.3) * 0.5, cam.z);
      camera.lookAt(cam.lx, cam.ly, cam.lz);
      updatePulses(t);
      grid.material.opacity = 0.26 + Math.sin(t * 0.8) * 0.06;
      renderer.render(scene, camera);
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !running) {
        running = true;
        requestAnimationFrame(render);
      }
    });

    requestAnimationFrame(render);
    canvas.classList.add('on');
  };
})();
