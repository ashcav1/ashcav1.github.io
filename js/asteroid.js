/* Bennu-style spinning-top asteroid with a schematic view of the internal
   density structure from the research: an under-dense core, an under-dense
   equatorial torus, and an over-dense subsurface layer, with occasional
   particle-ejection events. Pure canvas, no dependencies.
   Respects prefers-reduced-motion. */

(function () {
  const canvas = document.getElementById("asteroid-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // palette — keep in sync with css/style.css :root
  const SHELL = "201, 138, 61";    // regolith ochre
  const INNER = "157, 191, 207";   // pale steel (under-dense regions)
  const LABEL = "163, 154, 136";   // muted text
  const DUST  = "233, 226, 212";   // paper

  // ---------------- mesh: icosahedron subdivided twice ----------------
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(normalize);

  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  function normalize(v) {
    const m = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / m, v[1] / m, v[2] / m];
  }

  for (let s = 0; s < 2; s++) {
    const midCache = {};
    const next = [];
    const midpoint = (a, b) => {
      const key = a < b ? a + "_" + b : b + "_" + a;
      if (midCache[key] !== undefined) return midCache[key];
      const p = verts[a], q = verts[b];
      verts.push(normalize([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]));
      midCache[key] = verts.length - 1;
      return midCache[key];
    };
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }

  // deterministic per-vertex roughness — same asteroid on every visit
  function rough(i, v) {
    const s = Math.sin(i * 12.9898 + v[0] * 78.233 + v[1] * 37.719 + v[2] * 53.137) * 43758.5453;
    return s - Math.floor(s);
  }

  // Bennu's spinning-top profile: equatorial ridge, straight slopes to
  // flattened poles, plus small facet-scale roughness
  verts = verts.map((v, i) => {
    const lat = v[1];
    const taper = 1 - 0.42 * Math.pow(Math.abs(lat), 1.2);
    const ridge = 0.05 * Math.exp(-Math.pow(lat / 0.16, 2));
    const w = taper + ridge;
    const n = 1 + (rough(i, v) - 0.5) * 0.09;
    return [v[0] * w * n, lat * 0.9 * n, v[2] * w * n];
  });

  // surface vertices used as ejection sites
  const surfacePool = verts.filter((_, i) => i % 7 === 0);

  // ---------------- view ----------------
  let w, h, dpr, cx, cy, scale, showLabels;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2; cy = h / 2;
    scale = Math.min(w, h) * 0.29;
    showLabels = w >= 430;
  }

  const TILT = 0.38;
  let angle = Math.random() * Math.PI * 2;

  function rotate(v, ay, ax) {
    const cy_ = Math.cos(ay), sy_ = Math.sin(ay);
    const cx_ = Math.cos(ax), sx_ = Math.sin(ax);
    const x = v[0] * cy_ + v[2] * sy_;
    let z = -v[0] * sy_ + v[2] * cy_;
    const y = v[1] * cx_ - z * sx_;
    z = v[1] * sx_ + z * cx_;
    return [x, y, z];
  }

  function project(v) {
    const persp = 3.4 / (3.4 - v[2]);
    return [cx + v[0] * scale * persp, cy - v[1] * scale * persp, persp];
  }

  const light = normalize([-0.45, 0.55, 0.72]);

  // ---------------- internal structure ----------------
  const RING_R = 0.62;
  const RING_N = 56;

  function drawCore() {
    const r = 0.3 * scale;
    const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    grad.addColorStop(0, "rgba(" + INNER + ", 0.30)");
    grad.addColorStop(1, "rgba(" + INNER + ", 0.04)");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(" + INNER + ", 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawTorus() {
    let anchor = null;
    for (let k = 0; k < RING_N; k++) {
      const a = (k / RING_N) * Math.PI * 2;
      const p = rotate([Math.cos(a) * RING_R, 0, Math.sin(a) * RING_R], angle, TILT);
      const [px, py, persp] = project(p);
      const depth = (p[2] + 1) / 2;
      ctx.beginPath();
      ctx.arc(px, py, 1.9 * persp, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + INNER + ", " + (0.12 + depth * 0.38) + ")";
      ctx.fill();
      if (p[2] > 0 && (!anchor || px > anchor[0])) anchor = [px, py];
    }
    return anchor;
  }

  // ---------------- ejected particles ----------------
  const particles = [];

  function spawnParticles() {
    if (reduced || particles.length > 7 || Math.random() > 0.008) return;
    const n = 1 + Math.floor(Math.random() * 3);
    const site = surfacePool[Math.floor(Math.random() * surfacePool.length)];
    for (let i = 0; i < n; i++) {
      const dir = normalize(site);
      particles.push({
        p: [site[0], site[1], site[2]],
        v: [
          dir[0] * 0.004 + (Math.random() - 0.5) * 0.002,
          dir[1] * 0.004 + (Math.random() - 0.5) * 0.002,
          dir[2] * 0.004 + (Math.random() - 0.5) * 0.002,
        ],
        life: 1,
      });
    }
  }

  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.p[0] += pt.v[0]; pt.p[1] += pt.v[1]; pt.p[2] += pt.v[2];
      pt.life -= 0.004;
      if (pt.life <= 0) { particles.splice(i, 1); continue; }
      const rp = rotate(pt.p, angle, TILT);
      const [px, py, persp] = project(rp);
      ctx.beginPath();
      ctx.arc(px, py, 1.2 * persp, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + DUST + ", " + 0.55 * pt.life + ")";
      ctx.fill();
    }
  }

  // ---------------- labels ----------------
  // anchors are smoothed between frames so the leader lines don't jitter
  const smooth = { torus: null, shell: null };
  function lerp2(prev, target) {
    if (!prev) return target.slice();
    return [prev[0] + (target[0] - prev[0]) * 0.08, prev[1] + (target[1] - prev[1]) * 0.08];
  }

  function drawLabel(text, anchor, tx, ty, align) {
    ctx.font = '10px "IBM Plex Mono", monospace';
    const tw = ctx.measureText(text).width;
    // keep the text fully inside the canvas
    if (align === "right") tx = Math.max(tx, tw + 12);
    else tx = Math.min(tx, w - tw - 12);
    ty = Math.min(Math.max(ty, 12), h - 12);

    ctx.strokeStyle = "rgba(" + LABEL + ", 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(anchor[0], anchor[1]);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(anchor[0], anchor[1], 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(" + LABEL + ", 0.6)";
    ctx.fill();
    ctx.fillStyle = "rgba(" + LABEL + ", 0.9)";
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, tx + (align === "left" ? 6 : -6), ty);
  }

  // ---------------- render ----------------
  function frame() {
    ctx.clearRect(0, 0, w, h);
    if (!reduced) angle += 0.0032;

    const rotated = verts.map((v) => rotate(v, angle, TILT));
    const projected = rotated.map(project);

    const sorted = faces
      .map((f) => {
        const va = rotated[f[0]], vb = rotated[f[1]], vc = rotated[f[2]];
        const u = [vb[0] - va[0], vb[1] - va[1], vb[2] - va[2]];
        const v2 = [vc[0] - va[0], vc[1] - va[1], vc[2] - va[2]];
        let n = [u[1] * v2[2] - u[2] * v2[1], u[2] * v2[0] - u[0] * v2[2], u[0] * v2[1] - u[1] * v2[0]];
        n = normalize(n);
        return { f, n, z: (va[2] + vb[2] + vc[2]) / 3 };
      })
      .sort((a, b) => a.z - b.z);

    function paint(face, front) {
      const [a, b, c] = face.f;
      const pa = projected[a], pb = projected[b], pc = projected[c];
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.lineTo(pc[0], pc[1]);
      ctx.closePath();
      if (front) {
        const shade = Math.max(0, face.n[0] * light[0] + face.n[1] * light[1] + face.n[2] * light[2]);
        ctx.fillStyle = "rgba(" + SHELL + ", " + (0.02 + shade * 0.1) + ")";
        ctx.fill();
        ctx.strokeStyle = "rgba(" + SHELL + ", " + (0.2 + shade * 0.4) + ")";
      } else {
        ctx.strokeStyle = "rgba(" + SHELL + ", 0.07)";
      }
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // back of the shell, then internals, then front of the shell —
    // the translucent shell lets the interior structure read through
    for (const fc of sorted) if (fc.n[2] < 0) paint(fc, false);
    drawCore();
    const torusAnchor = drawTorus();
    for (const fc of sorted) if (fc.n[2] >= 0) paint(fc, true);

    spawnParticles();
    drawParticles();

    if (showLabels) {
      // shell anchor: a front-facing vertex toward the upper left
      let shellTarget = null, best = -Infinity;
      for (let i = 0; i < projected.length; i += 3) {
        if (rotated[i][2] < 0.2) continue;
        const s = -(projected[i][0] - cx) - (projected[i][1] - cy);
        if (s > best) { best = s; shellTarget = [projected[i][0], projected[i][1]]; }
      }
      if (torusAnchor) smooth.torus = lerp2(smooth.torus, torusAnchor);
      if (shellTarget) smooth.shell = lerp2(smooth.shell, shellTarget);

      drawLabel("under-dense core", [cx, cy + 4], cx - scale * 1.3, cy + scale * 1.05, "right");
      if (smooth.torus) drawLabel("under-dense torus", smooth.torus, cx + scale * 1.25, cy + scale * 0.6, "left");
      if (smooth.shell) drawLabel("over-dense subsurface", smooth.shell, cx - scale * 1.1, cy - scale * 1.15, "right");
    }

    if (!reduced) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  frame(); // single static frame when reduced-motion is set
})();
