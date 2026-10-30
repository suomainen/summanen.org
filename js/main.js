  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas = document.getElementById('city');
    var bar = document.getElementById('bar');
    var cue = document.getElementById('cue');
    var sys = document.getElementById('sys');
    var states = ['neljä roolia', 'rooli 1/4 · arkkitehti', 'rooli 2/4 · yrittäjä', 'rooli 3/4 · valtuutettu', 'rooli 4/4 · isä', 'yhteys · auki'];

    /* copy buttons after the email and phone: icon turns into a check, screen readers hear the result */
    var checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    var copyStatus = document.getElementById('copy-status');
    document.querySelectorAll('.copy').forEach(function (btn) {
      var icon = btn.innerHTML, title = btn.title, what = btn.getAttribute('data-what'), timer = null;
      function selectText() {
        var range = document.createRange(); range.selectNodeContents(btn.parentNode.querySelector('a'));
        var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      }
      function done(ok) {
        clearTimeout(timer);
        copyStatus.textContent = ok ? what + ' kopioitu' : what + ' valittu, kopioi se näppäimillä';
        btn.title = ok ? 'Kopioitu' : 'Valittu, kopioi näppäimillä';
        if (ok) { btn.innerHTML = checkIcon; btn.classList.add('is-done'); }
        timer = setTimeout(function () { btn.innerHTML = icon; btn.classList.remove('is-done'); btn.title = title; copyStatus.textContent = ''; }, 2200);
      }
      btn.addEventListener('click', function () {
        var txt = btn.getAttribute('data-copy');
        try {
          navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { selectText(); done(false); });
        } catch (e) { selectText(); done(false); }
      });
    });

    /* menu: open/close, Esc, click outside, and which section is current */
    var menuBtn = document.getElementById('menu-btn');
    var menuList = document.getElementById('menu-list');
    var menuLinks = menuList.querySelectorAll('a');
    function setMenu(open, refocus) {
      if (!open) hoverOpen = false;
      menuList.hidden = !open;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open && refocus) menuBtn.focus();
    }
    /* mouse users: hovering opens the menu, leaving closes it; a click while hover-opened pins it open */
    var menuEl = document.querySelector('.menu');
    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var hoverOpen = false, leaveTimer = null;
    if (canHover) {
      menuEl.addEventListener('mouseenter', function () {
        clearTimeout(leaveTimer);
        if (menuList.hidden) { hoverOpen = true; setMenu(true); }
      });
      menuEl.addEventListener('mouseleave', function () {
        if (!hoverOpen) return;
        leaveTimer = setTimeout(function () { hoverOpen = false; setMenu(false); }, 250);
      });
    }
    menuBtn.addEventListener('click', function () {
      if (hoverOpen) { hoverOpen = false; return; }
      var open = menuList.hidden;
      setMenu(open);
      if (open) { var cur = menuList.querySelector('[aria-current]') || menuLinks[0]; cur.focus(); }
    });
    menuList.addEventListener('click', function (e) { if (e.target.closest('a, button')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menuList.hidden) setMenu(false, true); });
    document.addEventListener('click', function (e) { if (!menuList.hidden && !e.target.closest('.menu')) setMenu(false); });
    document.querySelector('.menu').addEventListener('focusout', function (e) {
      if (!menuList.hidden && e.relatedTarget && !e.relatedTarget.closest('.menu')) setMenu(false);
    });

    /* current section = the one crossing a line 40% from the top of the screen */
    function setActive(i) {
      sys.textContent = states[i] || states[0];
      menuLinks.forEach(function (a) {
        if (+a.getAttribute('data-i') === i) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }
    setActive(0);
    /* measured on scroll rather than with IntersectionObserver: inside the artifact frame the observer ignores rootMargin */
    var scenes = document.querySelectorAll('main .scene');
    var activeIdx = 0, ticking = false;
    function checkActive() {
      ticking = false;
      var line = innerHeight * 0.4, idx = 0;
      scenes.forEach(function (sec, i) { if (sec.getBoundingClientRect().top <= line) idx = i; });
      if (idx !== activeIdx) { activeIdx = idx; setActive(idx); }
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(checkActive); } }, { passive: true });
    addEventListener('resize', checkActive);
    checkActive();

    if (reduce || !window.THREE || !window.gsap) { canvas.style.display = 'none'; return; }

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0E1714, 0.02);
    var camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 400);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

    var MINT = 0x8FC7B4, PINE = 0x2E7D6B, EMBER = 0xE08A3C;

    /* ground grid plus a faint mirrored copy for a reflection feel */
    var grid = new THREE.GridHelper(260, 130, MINT, 0x1E322C);
    grid.material.transparent = true;
    grid.material.opacity = 0.32;
    grid.position.y = -8;
    scene.add(grid);

    var glow = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 260),
      new THREE.MeshBasicMaterial({ color: 0x10281F, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -8.05;
    scene.add(glow);

    /* camera keyframes, shared by the scroll timeline and the forest corridor */
    var keys = [
      { x: 0, y: 7, z: 34, lx: 0, ly: 0, lz: -30 },
      { x: 10, y: 4, z: -12, lx: 4, ly: -2, lz: -44 },
      { x: -8, y: 9, z: -28, lx: 0, ly: 2, lz: -70 },
      { x: 7, y: 6, z: -62, lx: 0, ly: 1, lz: -108 },
      { x: -6, y: 10, z: -94, lx: 0, ly: 0, lz: -142 },
      { x: 0, y: 18, z: -140, lx: 0, ly: 2, lz: -200 }
    ];
    var GROUND = -8;

    function distToPath(x, z) {
      var best = 1e9;
      for (var i = 0; i < keys.length - 1; i++) {
        var ax = keys[i].x, az = keys[i].z, bx = keys[i + 1].x, bz = keys[i + 1].z;
        var dx = bx - ax, dz = bz - az;
        var u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
        var px = ax + dx * u - x, pz = az + dz * u - z;
        best = Math.min(best, Math.sqrt(px * px + pz * pz));
      }
      return best;
    }

    /* forest: every tree is merged into one body mesh and one edge mesh, so 400+ trees cost two draw calls */
    var unitCone = new THREE.ConeGeometry(1, 1, 7, 1);
    var unitTrunk = new THREE.CylinderGeometry(1, 1, 1, 5, 1);
    var unitCrown = new THREE.IcosahedronGeometry(1, 0);
    var shapes = [unitCone, unitTrunk, unitCrown].map(function (g) {
      return { body: (g.index ? g.toNonIndexed() : g).attributes.position.array, edge: new THREE.EdgesGeometry(g).attributes.position.array };
    });
    var CONE = 0, TRUNK = 1, CROWN = 2;

    var bodyPos = [], edgePos = [], edgeCol = [];
    var mtx = new THREE.Matrix4(), vtx = new THREE.Vector3();
    var cMint = new THREE.Color(MINT), cPine = new THREE.Color(PINE);

    function piece(shape, x, y, z, sx, sy, sz, rot, col) {
      mtx.makeRotationY(rot).premultiply(new THREE.Matrix4().makeTranslation(x, y, z)).multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
      var s = shapes[shape], i;
      for (i = 0; i < s.body.length; i += 3) {
        vtx.set(s.body[i], s.body[i + 1], s.body[i + 2]).applyMatrix4(mtx);
        bodyPos.push(vtx.x, vtx.y, vtx.z);
      }
      for (i = 0; i < s.edge.length; i += 3) {
        vtx.set(s.edge[i], s.edge[i + 1], s.edge[i + 2]).applyMatrix4(mtx);
        edgePos.push(vtx.x, vtx.y, vtx.z);
        edgeCol.push(col.r, col.g, col.b);
      }
    }

    var tops = [];
    for (var n = 0; n < 520; n++) {
      var tx = (Math.random() - 0.5) * 96;
      var tz = 28 - Math.random() * 230;
      if (distToPath(tx, tz) < 8) continue;

      var H = 3.5 + Math.random() * 6.5;
      var rot = Math.random() * Math.PI;
      var col = (Math.random() < 0.3 ? cPine : cMint).clone().multiplyScalar(0.3 + Math.random() * 0.35);

      if (Math.random() < 0.75) {
        /* spruce: short trunk and three or four stacked cones */
        var R = H * 0.24, tiers = 3 + (Math.random() < 0.5 ? 1 : 0), trunkH = H * 0.12;
        piece(TRUNK, tx, GROUND + trunkH / 2, tz, 0.16, trunkH, 0.16, rot, col);
        for (var tI = 0; tI < tiers; tI++) {
          var ch = H * 0.42, r = R * (1 - tI * 0.24);
          piece(CONE, tx, GROUND + trunkH + tI * (H - trunkH - ch) / (tiers - 1) + ch / 2, tz, r, ch, r, rot + tI, col);
        }
      } else {
        /* pine: tall bare trunk and a flat crown */
        var th = H * 0.72;
        piece(TRUNK, tx, GROUND + th / 2, tz, 0.18, th, 0.18, rot, col);
        piece(CROWN, tx, GROUND + th + H * 0.1, tz, H * 0.13, H * 0.14, H * 0.13, rot, col);
      }
      tops.push(new THREE.Vector3(tx, GROUND + H, tz));
    }

    function buildGeo(arr) {
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
      return g;
    }
    var edgeGeo = buildGeo(edgePos);
    edgeGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(edgeCol), 3));

    var forest = new THREE.Group();
    forest.add(new THREE.Mesh(buildGeo(bodyPos), new THREE.MeshBasicMaterial({ color: 0x131D1A })));
    forest.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ vertexColors: true })));
    scene.add(forest);

    /* lake reflection: the same forest mirrored below the ground plane, faint */
    var mirror = forest.clone();
    mirror.scale.y = -1;
    mirror.position.y = GROUND * 2;
    mirror.traverse(function (o) {
      if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.14; o.material.depthWrite = false; }
    });
    scene.add(mirror);

    /* energy paths: curves between tree tops, with pulses running along them */
    var paths = [];
    var pulsePos = [];
    for (var p = 0; p < 8; p++) {
      var a = tops[(Math.random() * tops.length) | 0];
      var b = tops[(Math.random() * tops.length) | 0];
      if (a === b || a.distanceTo(b) > 60) { p--; continue; }
      var mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      mid.y += 6 + Math.random() * 8;
      var curve = new THREE.CatmullRomCurve3([a.clone(), mid, b.clone()]);
      var line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
        new THREE.LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      scene.add(line);
      paths.push({ curve: curve, offset: Math.random() });
      pulsePos.push(0, 0, 0);
    }

    var pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pulsePos), 3));
    var pulses = new THREE.Points(pulseGeo, new THREE.PointsMaterial({
      color: MINT, size: 0.7, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(pulses);

    /* atmosphere */
    var DN = 1800, dp = new Float32Array(DN * 3);
    for (var k = 0; k < DN; k++) {
      dp[k * 3] = (Math.random() - 0.5) * 160;
      dp[k * 3 + 1] = (Math.random() - 0.5) * 60;
      dp[k * 3 + 2] = -Math.random() * 220;
    }
    var dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    scene.add(new THREE.Points(dg, new THREE.PointsMaterial({
      color: 0xBFD6CC, size: 0.1, transparent: true, opacity: 0.4, depthWrite: false
    })));

    function resize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight, false);
    }
    resize();
    addEventListener('resize', resize);

    var cam = Object.assign({}, keys[0]);
    gsap.registerPlugin(ScrollTrigger);

    var tl = gsap.timeline({
      scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1.1 }
    });

    keys.slice(1).forEach(function (k) { tl.to(cam, Object.assign({ ease: 'none' }, k)); });

    gsap.utils.toArray('.scene').forEach(function (sec, idx) {
      gsap.from(sec.children, {
        y: 40, opacity: 0.15, duration: 0.9, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: sec, start: 'top 74%', once: true }
      });
    });

    ScrollTrigger.create({
      trigger: 'main', start: 'top top', end: 'bottom bottom',
      onUpdate: function (self) {
        bar.style.width = (self.progress * 100) + '%';
        cue.style.opacity = self.progress > 0.02 ? '0' : '1';
      }
    });

    var clock = new THREE.Clock();
    var pp = pulseGeo.attributes.position.array;

    function render() {
      var t = clock.getElapsedTime();

      camera.position.set(cam.x + Math.sin(t * 0.22) * 1.1, cam.y + Math.sin(t * 0.3) * 0.5, cam.z);
      camera.lookAt(cam.lx, cam.ly, cam.lz);


      paths.forEach(function (pth, i) {
        var u = (t * 0.045 + pth.offset) % 1;
        var v = pth.curve.getPoint(u);
        pp[i * 3] = v.x; pp[i * 3 + 1] = v.y; pp[i * 3 + 2] = v.z;
      });
      pulseGeo.attributes.position.needsUpdate = true;

      grid.material.opacity = 0.26 + Math.sin(t * 0.8) * 0.06;

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  })();
