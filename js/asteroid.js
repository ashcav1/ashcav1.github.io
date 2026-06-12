/* Procedural low-poly rubble pile, rendered as a shaded rotating wireframe,
   with a small moonlet in an inclined orbit (a nod to Didymos–Dimorphos).
   Pure canvas, no dependencies. Respects prefers-reduced-motion. */

(function () {
  const canvas = document.getElementById("asteroid-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- build an icosahedron, subdivide once, then roughen it up ---
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

  // subdivide each triangle into four
  const midCache = {};
  function midpoint(a, b) {
    const key = a < b ? a + "_" + b : b + "_" + a;
    if (midCache[key] !== undefined) return midCache[key];
    const p = verts[a], q = verts[b];
    verts.push(normalize([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]));
    midCache[key] = verts.length - 1;
    return midCache[key];
  }

  const newFaces = [];
  for (const [a, b, c] of faces) {
    const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
    newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
  }
  faces = newFaces;

  // deterministic lumpy radius — same asteroid on every visit
  function bump(i, v) {
    const s = Math.sin(i * 12.9898 + v[0] * 78.233 + v[1] * 37.719 + v[2] * 53.137) * 43758.5453;
    return 0.82 + (s - Math.floor(s)) * 0.34;
  }
  verts = verts.map((v, i) => {
    const r = bump(i, v);
    // slight equatorial bulge — Bennu's spinning-top silhouette
    const eq = 1 + 0.13 * (1 - Math.abs(v[1]));
    return [v[0] * r * eq, v[1] * r, v[2] * r * eq];
  });

  let w, h, dpr, cx, cy, scale;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2; cy = h / 2;
    scale = Math.min(w, h) * 0.30;
  }

  const light = normalize([-0.45, 0.55, 0.72]);
  let angle = Math.random() * Math.PI * 2;
  let tilt = 0.42;

  function rotate(v, ay, ax) {
    const cy_ = Math.cos(ay), sy_ = Math.sin(ay);
    const cx_ = Math.cos(ax), sx_ = Math.sin(ax);
    let x = v[0] * cy_ + v[2] * sy_;
    let z = -v[0] * sy_ + v[2] * cy_;
    let y = v[1] * cx_ - z * sx_;
    z = v[1] * sx_ + z * cx_;
    return [x, y, z];
  }

  function project(v) {
    const persp = 3.2 / (3.2 - v[2]);
    return [cx + v[0] * scale * persp, cy - v[1] * scale * persp];
  }

  function drawMoonlet(mx, my, mr) {
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
    ctx.shadowColor = "rgba(125, 211, 252, 0.7)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    angle += 0.0038;

    const rotated = verts.map((v) => rotate(v, angle, tilt));

    // moonlet on an inclined orbit
    const oa = angle * 1.8;
    const orbit = rotate([Math.cos(oa) * 1.95, Math.sin(oa) * 0.36, Math.sin(oa) * 1.95], 0.18, 0.5);
    const [mx, my] = project(orbit);
    const mr = 4.5 * (3.2 / (3.2 - orbit[2]));

    // faint orbit ring
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const p = project(rotate([Math.cos(a) * 1.95, Math.sin(a) * 0.36, Math.sin(a) * 1.95], 0.18, 0.5));
      i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]);
    }
    ctx.strokeStyle = "rgba(125, 211, 252, 0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (orbit[2] < 0) drawMoonlet(mx, my, mr);

    // depth-sort faces, paint back to front
    const order = faces
      .map((f, i) => ({ i, z: (rotated[f[0]][2] + rotated[f[1]][2] + rotated[f[2]][2]) / 3 }))
      .sort((a, b) => a.z - b.z);

    for (const { i } of order) {
      const [a, b, c] = faces[i];
      const va = rotated[a], vb = rotated[b], vc = rotated[c];

      // face normal
      const u = [vb[0] - va[0], vb[1] - va[1], vb[2] - va[2]];
      const v2 = [vc[0] - va[0], vc[1] - va[1], vc[2] - va[2]];
      let n = [u[1] * v2[2] - u[2] * v2[1], u[2] * v2[0] - u[0] * v2[2], u[0] * v2[1] - u[1] * v2[0]];
      n = normalize(n);
      if (n[2] < 0) continue; // back-face cull

      const shade = Math.max(0, n[0] * light[0] + n[1] * light[1] + n[2] * light[2]);
      const pa = project(va), pb = project(vb), pc = project(vc);

      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.lineTo(pc[0], pc[1]);
      ctx.closePath();
      ctx.fillStyle = "rgba(244, 162, 97, " + (0.03 + shade * 0.16) + ")";
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 170, 110, " + (0.16 + shade * 0.38) + ")";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    if (orbit[2] >= 0) drawMoonlet(mx, my, mr);

    if (!reduced) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  frame(); // single static frame when reduced-motion is set
})();
