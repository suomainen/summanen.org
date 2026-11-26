/* 3D-metsä sivun taustalla (three.js + GSAP ScrollTrigger).
   Matalapolygoninen kuusi- ja mäntymetsä, sen heijastus maan alla, hitaat valopulssit puiden välillä,
   himmeä oranssi polku ja kamera, joka kulkee polkua pitkin metsän läpi sivua vieritettäessä.
   Polun päässä on kota, jonka edessä nuotio syttyy, kun sivu on vieritetty loppuun.

   Tiedosto vain määrittelee funktion startForest(). Sen käynnistää js/animations.js,
   kun sivu on latautunut ja kävijä vierittää tai on kulunut hetki. */
(() => {
  /* ---- Asetukset: säädä metsää näistä ---- */
  const SETTINGS = {
    trees: { desktop: 520, mobile: 300 },   /* puiden yritysmäärä (osa jää pois kameran reitiltä) */
    spread: { desktop: 48, mobile: 30 },    /* puiden alue polun molemmin puolin; kapeammalla näytöllä tiheämpi */
    pixelRatio: { desktop: 1.5, mobile: 1 }, /* piirtotarkkuuden yläraja */
    fps: 30,                                /* piirtokertoja sekunnissa */
    spruceShare: 0.75,                      /* kuusten osuus, loput mäntyjä */
    treeHeight: [3.5, 10],                  /* puun korkeus min–max */
    clearing: { desktop: 8, mobile: 4.5 },  /* puuton käytävä kameran reitin ympärillä */
    fov: { landscape: 58, portrait: 74 },   /* kuvakulma pystysuunnassa; pystynäytöllä laajempi, jotta metsää näkyy sivuilla */
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
      ember: 0xE08A3C,
      flame: 0xFFC46B,
    },
    /* oranssi polku kameran reittiä pitkin maassa */
    path: { start: 30, width: 2.2, lineOpacity: 0.85, glowOpacity: 0.26 },
    /* kota polun päässä (x, z = keskipiste maassa) ja nuotio sen edessä */
    kota: { x: 3, z: -178, radius: 3.8, height: 7.5, sides: 8 },
    fire: { particles: { desktop: 70, mobile: 36 }, ignite: [0.45, 0.95] },
    /* kameran pysähdyspaikat: yksi per osio (x, y, z = kamera, lx, ly, lz = katsesuunta) */
    camera: [
      { x: 0, y: 7, z: 34, lx: 0, ly: 0, lz: -30 },
      { x: 10, y: 4, z: -12, lx: 4, ly: -2, lz: -44 },
      { x: -8, y: 9, z: -28, lx: 0, ly: 2, lz: -70 },
      { x: 7, y: 6, z: -62, lx: 0, ly: 1, lz: -108 },
      { x: -6, y: 10, z: -94, lx: 0, ly: 0, lz: -142 },
      { x: -1, y: 4, z: -152, lx: 3, ly: 3, lz: -180 },
    ],
  };

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* polun kulkupisteet maassa: kameran pysähdyspaikat ja lopuksi kodan ovi */
  const pathPoints = () => {
    const { camera, kota, path } = SETTINGS;
    return [
      { x: camera[0].x, z: path.start },
      ...camera.slice(1).map(({ x, z }) => ({ x, z })),
      { x: kota.x, z: kota.z + kota.radius + 2.5 },
    ];
  };

  /* lyhin etäisyys pisteestä (x, z) polkuun maan tasossa; kodan ympärille jätetään aukio */
  const distanceToCameraPath = (x, z) => {
    const keys = pathPoints();
    const { kota } = SETTINGS;
    let best = Math.hypot(x - kota.x, z - kota.z) - kota.radius - 4;
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
  const buildForest = (treeCount, spread, clearing) => {
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
      const x = rand(-spread, spread);
      const z = rand(-202, 28);
      if (distanceToCameraPath(x, z) < clearing) continue;

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

  /* pehmeä pyöreä valotäplä tekstuurina (nuotion liekit ja hehku) */
  const glowTexture = () => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  };

  /* himmeä oranssi polku: ohut viiva ja sen ympärillä leveä, heikko hehku */
  const buildPath = (scene) => {
    const { ground, colors, path } = SETTINGS;
    const curve = new THREE.CatmullRomCurve3(
      pathPoints().map(({ x, z }) => new THREE.Vector3(x, ground + 0.06, z)), false, 'centripetal'
    );
    const points = curve.getSpacedPoints(400);
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: colors.ember, transparent: true, opacity: path.lineOpacity, depthWrite: false })
    ));

    /* nauha: jokaisen pisteen kohdalle kaksi kärkeä polun sivuille */
    const positions = [], index = [];
    points.forEach((p, i) => {
      const t = curve.getTangentAt(i / (points.length - 1));
      const nx = -t.z * path.width / 2, nz = t.x * path.width / 2;
      positions.push(p.x + nx, p.y - 0.02, p.z + nz, p.x - nx, p.y - 0.02, p.z - nz);
      if (i > 0) {
        const a = (i - 1) * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const ribbon = new THREE.BufferGeometry();
    ribbon.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    ribbon.setIndex(index);
    scene.add(new THREE.Mesh(ribbon, new THREE.MeshBasicMaterial({
      color: colors.ember, transparent: true, opacity: path.glowOpacity,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })));
  };

  /* kota: kahdeksankulmainen kartio, sen yli nousevat salot ja ovi polun puolella */
  const buildKota = () => {
    const { ground, colors, kota } = SETTINGS;
    const group = new THREE.Group();
    group.position.set(kota.x, ground, kota.z);

    const cone = new THREE.ConeGeometry(kota.radius, kota.height, kota.sides, 1, true);
    cone.translate(0, kota.height / 2, 0);
    cone.rotateY(Math.PI / kota.sides);
    group.add(new THREE.Mesh(cone, new THREE.MeshBasicMaterial({ color: colors.treeBody, side: THREE.DoubleSide })));

    const edgeMaterial = new THREE.LineBasicMaterial({ color: colors.ember, transparent: true, opacity: 0.75 });
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(cone), edgeMaterial));

    /* salot jatkuvat huipun yli savuaukon kohdalla */
    const poles = [];
    for (let i = 0; i < kota.sides; i += 2) {
      const a = (i + 0.5) * Math.PI * 2 / kota.sides;
      const bx = Math.sin(a) * kota.radius, bz = Math.cos(a) * kota.radius;
      poles.push(bx * 0.82, kota.height * 0.18, bz * 0.82, -bx * 0.16, kota.height * 1.16, -bz * 0.16);
    }
    /* ovi kohti polkua (+z) */
    const dw = 0.75, dh = 2.3, dz = kota.radius * 0.93;
    poles.push(-dw, 0, dz, -dw * 0.7, dh, dz * 0.8, -dw * 0.7, dh, dz * 0.8, dw * 0.7, dh, dz * 0.8, dw * 0.7, dh, dz * 0.8, dw, 0, dz);
    const poleGeometry = new THREE.BufferGeometry();
    poleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(poles), 3));
    group.add(new THREE.LineSegments(poleGeometry, edgeMaterial));

    /* oviaukosta hohtava valo */
    const door = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), color: colors.ember, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    door.position.set(0, 1.1, dz + 0.2);
    door.scale.set(2.6, 3.2, 1);
    group.add(door);

    return { group, edgeMaterial, door };
  };

  /* nuotio kodan edessä: kivikehä, halot, nousevat liekit ja lämmin hehku maassa */
  const buildFire = (scene, particleCount) => {
    const { ground, colors, kota } = SETTINGS;
    const base = new THREE.Vector3(kota.x + 0.4, ground, kota.z + kota.radius + 1.9);
    const texture = glowTexture();

    const stones = [];
    const stone = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.28, 0)).attributes.position.array;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      for (let k = 0; k < stone.length; k += 3) {
        stones.push(base.x + Math.cos(a) * 0.95 + stone[k], ground + 0.12 + stone[k + 1] * 0.6, base.z + Math.sin(a) * 0.95 + stone[k + 2]);
      }
    }
    /* kaksi ristikkäistä halkoa */
    stones.push(base.x - 0.6, ground + 0.1, base.z - 0.3, base.x + 0.6, ground + 0.25, base.z + 0.3,
                base.x - 0.6, ground + 0.25, base.z + 0.3, base.x + 0.6, ground + 0.1, base.z - 0.3);
    const stoneGeometry = new THREE.BufferGeometry();
    stoneGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(stones), 3));
    scene.add(new THREE.LineSegments(stoneGeometry, new THREE.LineBasicMaterial({ color: colors.ember, transparent: true, opacity: 0.45 })));

    /* liekit: hiukkaset nousevat, kapenevat ja himmenevät; sammuessaan ne syntyvät uudelleen pohjalle */
    const particles = Array.from({ length: particleCount }, () => ({ life: Math.random(), speed: rand(0.7, 1.3), dx: rand(-0.35, 0.35), dz: rand(-0.35, 0.35) }));
    const positions = new Float32Array(particleCount * 3);
    const tint = new Float32Array(particleCount * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(tint, 3));
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
      size: 1.2, map: texture, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })));
    const hot = new THREE.Color(colors.flame), warm = new THREE.Color(colors.ember), c = new THREE.Color();

    /* hehku liekkien ympärillä ja valotäplä maassa */
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture, color: colors.ember, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.position.set(base.x, ground + 1.1, base.z);
    glow.scale.set(6.5, 6.5, 1);
    scene.add(glow);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({
      map: texture, color: colors.ember, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(base.x, ground + 0.03, base.z);
    scene.add(pool);

    let previous = 0;
    /* strength 0–1: kuinka paljon nuotio palaa (syttyy vierityksen lopussa) */
    return (time, strength) => {
      const dt = Math.min(0.1, time - previous);
      previous = time;
      particles.forEach((p, i) => {
        p.life += dt * p.speed * 0.9;
        if (p.life > 1) Object.assign(p, { life: p.life % 1, dx: rand(-0.35, 0.35), dz: rand(-0.35, 0.35) });
        const narrow = 1 - p.life;
        positions.set([
          base.x + p.dx * narrow + Math.sin(time * 6 + i) * 0.06,
          ground + 0.25 + p.life * 2.4 * strength,
          base.z + p.dz * narrow,
        ], i * 3);
        c.copy(hot).lerp(warm, p.life).multiplyScalar((1 - p.life) * strength);
        tint.set([c.r, c.g, c.b], i * 3);
      });
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      const flicker = 0.85 + Math.sin(time * 9) * 0.08 + Math.sin(time * 23) * 0.05;
      glow.material.opacity = 0.85 * strength * flicker;
      pool.material.opacity = 0.5 * strength * flicker;
      return flicker;
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

  /* Käynnistää metsän annetussa canvasissa. small = puhelin tai kosketusnäyttö.
     Palauttaa false, jos selain ei tue WebGL 2:ta (esim. hyvin vanha iPhone); silloin tausta jätetään pois. */
  window.startForest = (canvas, { small = false } = {}) => {
    /* värit lasketaan kuten ennen three.js r152:ta, jotta sävyt ja läpinäkyvyydet pysyvät ennallaan */
    THREE.ColorManagement.enabled = false;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'low-power' });
    } catch (e) {
      return false;
    }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(SETTINGS.colors.background, SETTINGS.fog);

    const camera = new THREE.PerspectiveCamera(SETTINGS.fov.landscape, innerWidth / innerHeight, 0.1, 400);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? SETTINGS.pixelRatio.mobile : SETTINGS.pixelRatio.desktop));

    const grid = buildGround(scene);
    const size = small ? 'mobile' : 'desktop';
    const { forest, treeTops } = buildForest(SETTINGS.trees[size], SETTINGS.spread[size], SETTINGS.clearing[size]);
    const kota = buildKota();
    forest.add(kota.group);
    scene.add(forest, buildReflection(forest));
    buildPath(scene);
    const updateFire = buildFire(scene, small ? SETTINGS.fire.particles.mobile : SETTINGS.fire.particles.desktop);
    const updatePulses = buildPulses(scene, treeTops);
    buildDust(scene);

    const resize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.fov = camera.aspect < 1 ? SETTINGS.fov.portrait : SETTINGS.fov.landscape;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight, false);
    };
    resize();
    addEventListener('resize', resize);

    /* kamera liikkuu pysähdyspaikasta toiseen vierityksen mukana */
    const cam = { ...SETTINGS.camera[0] };
    /* nuotio syttyy viimeisellä kameran siirrolla: 0 = ei pala, 1 = palaa täysillä */
    const stops = SETTINGS.camera;
    const fromZ = stops[stops.length - 2].z, toZ = stops[stops.length - 1].z;
    const [igniteStart, igniteEnd] = SETTINGS.fire.ignite;
    const fireStrength = () => {
      const p = (cam.z - fromZ) / (toZ - fromZ);
      const k = Math.max(0, Math.min(1, (p - igniteStart) / (igniteEnd - igniteStart)));
      return k * k * (3 - 2 * k);
    };
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1.1 },
    });
    SETTINGS.camera.slice(1).forEach((stop) => timeline.to(cam, { ...stop, ease: 'none' }));

    /* piirto: rajattu SETTINGS.fps kertaan sekunnissa ja pysäytetty, kun välilehti on piilossa */
    const startTime = performance.now();
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

      const t = (now - startTime) / 1000;
      camera.position.set(cam.x + Math.sin(t * 0.22) * 1.1, cam.y + Math.sin(t * 0.3) * 0.5, cam.z);
      camera.lookAt(cam.lx, cam.ly, cam.lz);
      updatePulses(t);
      const strength = fireStrength();
      const flicker = updateFire(t, strength);
      kota.door.material.opacity = 0.5 * strength * flicker;
      kota.edgeMaterial.opacity = 0.5 + 0.5 * strength;
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
    return true;
  };
})();
