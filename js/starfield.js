/* Animated starfield background with slow drift, twinkle, and the
   occasional shooting star. Respects prefers-reduced-motion. */

(function () {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = [];
  let meteors = [];
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.min(340, Math.floor((w * h) / 4200));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.25,
        base: Math.random() * 0.55 + 0.25,
        tw: Math.random() * Math.PI * 2,
        twSpeed: Math.random() * 0.018 + 0.004,
        drift: Math.random() * 0.045 + 0.008,
        hue: Math.random() < 0.12 ? "rgba(244,162,97," : Math.random() < 0.2 ? "rgba(125,211,252," : "rgba(226,232,240,",
      });
    }
  }

  function spawnMeteor() {
    if (meteors.length > 1 || Math.random() > 0.0035) return;
    const x = Math.random() * w * 0.8 + w * 0.1;
    meteors.push({ x: x, y: -20, vx: -(Math.random() * 3 + 2.5), vy: Math.random() * 3 + 3, life: 1 });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      s.tw += s.twSpeed;
      s.y += s.drift;
      if (s.y > h + 2) { s.y = -2; s.x = Math.random() * w; }
      const a = s.base + Math.sin(s.tw) * 0.25;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.hue + Math.max(0.05, a) + ")";
      ctx.fill();
    }

    spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx; m.y += m.vy; m.life -= 0.012;
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
      grad.addColorStop(0, "rgba(226,232,240," + 0.85 * m.life + ")");
      grad.addColorStop(1, "rgba(226,232,240,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
      ctx.stroke();
      if (m.life <= 0 || m.y > h + 40 || m.x < -40) meteors.splice(i, 1);
    }

    if (!reduced) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  frame(); // draws a single static frame when reduced-motion is set
})();
