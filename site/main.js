/**
 * FlexHaus "The Comeback" — Three.js Scene Enhancement
 *
 * Pure 3D layer. Form + scroll reveal handled by page.js.
 * Monitors window.__flexhaus for form success/error signals.
 */
import * as THREE from 'three';

(function () {
  'use strict';

  var cfg = window.__flexhaus || {};
  var container = document.getElementById('canvas-container');

  // Only boot 3D if WebGL ok, no reduced motion, container exists
  if (!cfg.webglOk || cfg.reducedMotion || !container) {
    return;
  }

  // ─── Boot Timeout Guard ────────────────────────────────
  var BOOT_MS = 5000;
  var bootTimer = setTimeout(function () {
    document.documentElement.classList.add('no-webgl');
    if (renderer && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }, BOOT_MS);

  // ─── Scene ─────────────────────────────────────────────
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0E1116);
  scene.fog = new THREE.Fog(0x0E1116, 6, 12);

  var camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 20);
  camera.position.set(0, 0.5, 5);
  camera.lookAt(0, 0, 0);

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // ─── Lights ────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x404060, 0.05));

  var dirLight = new THREE.DirectionalLight(0xffffff, 0.15);
  dirLight.position.set(1, 3, 2);
  scene.add(dirLight);

  [[-2, 2.5, -1], [2, 2.5, -1], [-1.5, 2.5, 1.5], [1.5, 2.5, 1.5]]
    .forEach(function (p) {
      var pl = new THREE.PointLight(0xffeedd, 0.3, 6);
      pl.position.set(p[0], p[1], p[2]);
      scene.add(pl);
    });

  // ─── Floor ─────────────────────────────────────────────
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    new THREE.MeshStandardMaterial({ color: 0x1A1D23, roughness: 0.8, metalness: 0.2, transparent: true, opacity: 0.6 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.5, 0);
  scene.add(floor);

  var grid = new THREE.GridHelper(12, 12, 0x2A2D33, 0x2A2D33);
  grid.position.set(0, -0.48, 0);
  grid.material.transparent = true;
  grid.material.opacity = 0.3;
  scene.add(grid);

  // ─── Columns (InstancedMesh) ──────────────────────────
  var colGeo = new THREE.BoxGeometry(0.12, 3.0, 0.12);
  var colMat = new THREE.MeshStandardMaterial({ color: 0x2A2D33, roughness: 0.7, metalness: 0.4 });
  var colPositions = [
    [-2.5, 1.0, -1.5], [2.5, 1.0, -1.5], [-2.5, 1.0, 0], [2.5, 1.0, 0],
    [-2.5, 1.0, 1.5], [2.5, 1.0, 1.5], [-1.8, 1.0, -0.8], [1.8, 1.0, -0.8],
    [-1.8, 1.0, 0.8], [1.8, 1.0, 0.8],
  ];
  var colMesh = new THREE.InstancedMesh(colGeo, colMat, colPositions.length);
  var dummy = new THREE.Object3D();
  colPositions.forEach(function (p, i) {
    dummy.position.set(p[0], p[1], p[2]);
    dummy.updateMatrix();
    colMesh.setMatrixAt(i, dummy.matrix);
  });
  colMesh.instanceMatrix.needsUpdate = true;
  scene.add(colMesh);

  // ─── Ceiling Lights ────────────────────────────────────
  var ceilMat = new THREE.MeshBasicMaterial({ color: 0xffeedd });
  [[-1.5, 2.6, -1], [1.5, 2.6, -1], [-1.5, 2.6, 1], [1.5, 2.6, 1], [0, 2.6, 0]]
    .forEach(function (p) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), ceilMat);
      m.position.set(p[0], p[1], p[2]);
      scene.add(m);
      var g = glowSprite(0xffeedd, 0.08);
      g.position.set(p[0], p[1], p[2]);
      scene.add(g);
    });

  // ─── Pulse Curve ──────────────────────────────────────
  var curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.5, 0.1, -0.5),
    new THREE.Vector3(-2.5, -0.05, -0.3),
    new THREE.Vector3(-1.5, 0.15, -0.1),
    new THREE.Vector3(-0.5, -0.05, 0),
    new THREE.Vector3(0, 0.1, 0.1),
    new THREE.Vector3(0.5, -0.05, 0),
    new THREE.Vector3(1.5, 0.15, -0.1),
    new THREE.Vector3(2.5, -0.05, -0.3),
    new THREE.Vector3(3.5, 0.1, -0.5),
  ]);
  var curvePoints = curve.getPoints(100);
  var curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);

  var pulseLine = new THREE.Line(curveGeo, new THREE.LineBasicMaterial({ color: 0xC6F24E, transparent: true, opacity: 0.3 }));
  scene.add(pulseLine);

  var pulseLine2 = new THREE.Line(curveGeo.clone(), new THREE.LineBasicMaterial({ color: 0xC6F24E, transparent: true, opacity: 0.15 }));
  scene.add(pulseLine2);

  var pulseMat = new THREE.MeshBasicMaterial({ color: 0xC6F24E });
  var pulseSphere = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), pulseMat);
  scene.add(pulseSphere);

  var pulseGlow = glowSprite(0xC6F24E, 0.3);
  scene.add(pulseGlow);

  var poolGlow = glowSprite(0xC6F24E, 1.5);
  poolGlow.position.set(0, 0.1, 0.5);
  poolGlow.material.opacity = 0;
  scene.add(poolGlow);

  // ─── Chalk-Dust Particles ──────────────────────────────
  var MAX_P = 120;
  var pPos = new Float32Array(MAX_P * 3);
  var pVel = new Float32Array(MAX_P * 3);
  for (var i = 0; i < MAX_P; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 8;
    pPos[i * 3 + 1] = Math.random() * 3;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    pVel[i * 3] = (Math.random() - 0.5) * 0.002;
    pVel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
    pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  var pTex = (function () {
    var c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(198,242,78,1)');
    g.addColorStop(0.3, 'rgba(198,242,78,0.5)');
    g.addColorStop(1, 'rgba(198,242,78,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  })();

  var pMat = new THREE.PointsMaterial({
    size: 0.08, map: pTex, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false,
    sizeAttenuation: true, opacity: 0.6,
  });
  var particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ─── Ember Sparks ──────────────────────────────────────
  var sPos = new Float32Array(15 * 3);
  var sAct = new Uint8Array(15);
  for (var si = 0; si < 15; si++) { sPos[si * 3 + 1] = -10; sAct[si] = 0; }
  var sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  var sMat = new THREE.PointsMaterial({
    color: 0xFF5A3C, size: 0.04, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  var sparks = new THREE.Points(sGeo, sMat);
  scene.add(sparks);

  // ─── State ─────────────────────────────────────────────
  var scrollProgress = 0;
  var targetProgress = 0;
  var pulseSpeed = 1;
  var particleCount = 15;
  var pulseTravel = 0;

  // ─── Glow Sprite Factory ──────────────────────────────
  function glowSprite(color, size) {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    var cx = c.getContext('2d');
    var hex = '#' + new THREE.Color(color).getHexString();
    var g = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, hex);
    g.addColorStop(0.2, hex + '99');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = g;
    cx.fillRect(0, 0, 128, 128);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending,
      transparent: true, depthWrite: false, opacity: 0.5,
    }));
    sp.scale.set(size, size, 1);
    return sp;
  }

  // ─── Scroll ────────────────────────────────────────────
  function getScrollPct() {
    var doc = document.documentElement;
    var max = Math.max(
      document.body.scrollHeight, doc.scrollHeight,
      document.body.offsetHeight, doc.offsetHeight,
      document.body.clientHeight
    ) - window.innerHeight;
    var top = window.pageYOffset || doc.scrollTop || 0;
    return Math.min(Math.max(top / Math.max(max, 1), 0), 1);
  }

  function getTargets(p) {
    var t, z, y, pitch, speed, pc, pool;
    if (p < 0.2) {
      t = p / 0.2;
      z = 5; y = 0.5; pitch = 0;
      speed = 0.4 + t * 0.3;
      pc = Math.round(10 + t * 10); pool = 0;
    } else if (p < 0.5) {
      t = (p - 0.2) / 0.3;
      z = 5 - t * 3; y = 0.5 - t * 0.3; pitch = -t * 5;
      speed = 0.7 + t * 1.5;
      pc = Math.round(20 + t * 90); pool = 0;
    } else if (p < 0.7) {
      t = (p - 0.5) / 0.2;
      z = 2; y = 0.5; pitch = -5 * (1 - t);
      speed = 2.2 - t * 0.7;
      pc = Math.round(110 - t * 60); pool = 0;
    } else {
      t = (p - 0.7) / 0.3;
      z = 3; y = 0.3; pitch = 0;
      speed = 1.2 - t * 0.3;
      pc = Math.round(50 - t * 30); pool = t;
    }
    return { z: z, y: y, pitch: pitch, speed: Math.max(0.3, speed), pc: Math.max(10, Math.min(MAX_P, pc)), pool: pool };
  }

  // ─── Animation Loop ────────────────────────────────────
  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    var dt = Math.min(clock.getDelta(), 0.05);
    var time = clock.elapsedTime;
    var lerp = Math.min(1, dt * 3);

    scrollProgress += (targetProgress - scrollProgress) * lerp;
    var p = scrollProgress;
    var t = getTargets(p);

    // Camera
    camera.position.z += (t.z - camera.position.z) * lerp;
    camera.position.y += (t.y - camera.position.y) * lerp;
    camera.position.x *= 0.95;
    camera.lookAt(0.05, 0.2, 0);

    // Pulse
    var isSuccess = cfg.formSuccess || false;
    var isError = cfg.formError || false;
    pulseSpeed += (t.speed - pulseSpeed) * lerp;
    if (isSuccess) pulseSpeed = 5;
    if (isError) pulseSpeed = 0.2;

    pulseTravel += dt * pulseSpeed * 0.15;
    if (pulseTravel > 1) pulseTravel -= 1;

    var pos = curve.getPoint(pulseTravel);
    var freq = isSuccess ? 20 : isError ? 0.5 : 2 + pulseSpeed * 0.5;
    var intensity = isSuccess ? 1 : isError ? 0.3 : 0.5 + Math.sin(time * freq) * (0.3 + pulseSpeed * 0.05);

    // Error state: tint pulse Ember
    var pulseColor = isError ? 0xFF5A3C : 0xC6F24E;
    pulseSphere.material.color.setHex(pulseColor);
    pulseGlow.material.color.setHex(pulseColor);
    pulseLine.material.color.setHex(pulseColor);
    pulseLine2.material.color.setHex(pulseColor);
    poolGlow.material.color.setHex(pulseColor);

    pulseSphere.position.copy(pos);
    pulseGlow.position.copy(pos);
    pulseGlow.material.opacity = Math.min(1, intensity * 0.8);
    pulseLine.material.opacity = Math.min(0.5, 0.15 + intensity * 0.35);
    pulseLine2.material.opacity = Math.min(0.3, 0.05 + intensity * 0.25);

    if (isSuccess) {
      var s = 0.3 + Math.sin(time * 4) * 0.1;
      pulseGlow.scale.set(s, s, 1);
    } else {
      pulseGlow.scale.set(0.3, 0.3, 1);
    }

    poolGlow.material.opacity = t.pool * 0.4;

    // Particles
    particleCount += (t.pc - particleCount) * lerp;
    var vc = Math.round(particleCount);
    var pp = particles.geometry.attributes.position.array;
    var drift = (p > 0.2 && p < 0.5) ? 0.002 : 0.0005;

    for (var j = 0; j < MAX_P; j++) {
      if (j < vc) {
        pp[j * 3] += pVel[j * 3] + (Math.random() - 0.5) * 0.002;
        pp[j * 3 + 1] += pVel[j * 3 + 1] + (Math.random() - 0.5) * 0.001;
        pp[j * 3 + 2] += pVel[j * 3 + 2] + drift;
        if (pp[j * 3] > 4) pp[j * 3] = -4;
        if (pp[j * 3] < -4) pp[j * 3] = 4;
        if (pp[j * 3 + 1] > 3) pp[j * 3 + 1] = 0;
        if (pp[j * 3 + 1] < -0.5) pp[j * 3 + 1] = 2.5;
        if (pp[j * 3 + 2] > 3) pp[j * 3 + 2] = -3;
        if (pp[j * 3 + 2] < -3) pp[j * 3 + 2] = 3;
      } else {
        pp[j * 3 + 1] = -10;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    pMat.opacity = p > 0.15 ? 0.7 : 0.3;

    // Sparks
    var sparkOn = (p > 0.2 && p < 0.5) ? 0.6 : 0;
    sMat.opacity = sparkOn;
    if (sparkOn > 0) {
      var sp = sparks.geometry.attributes.position.array;
      for (var sk = 0; sk < 15; sk++) {
        if (sAct[sk] === 0 && Math.random() < 0.02) {
          sAct[sk] = 1;
          sp[sk * 3] = (Math.random() - 0.5) * 4;
          sp[sk * 3 + 1] = 0.1;
          sp[sk * 3 + 2] = (Math.random() - 0.5) * 3;
        }
        if (sAct[sk] === 1) {
          sp[sk * 3 + 1] += dt * 0.5;
          sp[sk * 3] += (Math.random() - 0.5) * dt * 0.3;
          if (sp[sk * 3 + 1] > 2) { sAct[sk] = 0; sp[sk * 3 + 1] = -10; }
        }
      }
      sparks.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  // ─── Events ────────────────────────────────────────────
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        targetProgress = getScrollPct();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    var w = container.clientWidth;
    var h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }, { passive: true });

  // ─── Boot ──────────────────────────────────────────────
  function boot() {
    clearTimeout(bootTimer);
    targetProgress = getScrollPct();
    scrollProgress = targetProgress;
    animate();
    var w = container.clientWidth;
    var h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
