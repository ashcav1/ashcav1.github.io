/* Site behavior: nav toggle, scroll reveal, gallery rendering, lightbox.
   Gallery content lives in data/gallery-data.js — edit that file to add items. */

(function () {
  // ---------- footer year ----------
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- mobile nav ----------
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // ---------- gallery helpers ----------
  const items = typeof GALLERY_ITEMS !== "undefined" ? GALLERY_ITEMS : [];
  const cats = typeof GALLERY_CATEGORIES !== "undefined" ? GALLERY_CATEGORIES : {};

  function youtubeId(src) {
    const m = src.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    return m ? m[1] : src;
  }

  function thumbHTML(item) {
    if (item.type === "video") {
      const poster = item.poster ? ' poster="' + item.poster + '"' : "";
      return '<video src="' + item.src + '"' + poster + ' muted loop playsinline preload="metadata"></video><div class="g-play">▶</div>';
    }
    if (item.type === "youtube") {
      return '<img src="https://img.youtube.com/vi/' + youtubeId(item.src) + '/hqdefault.jpg" alt="' + item.title + '" loading="lazy"><div class="g-play">▶</div>';
    }
    return '<img src="' + item.src + '" alt="' + item.title + '" loading="lazy">';
  }

  function cardHTML(item, idx) {
    return (
      '<button class="g-card" data-index="' + idx + '" aria-label="Open ' + item.title + '">' +
      '<div class="g-thumb">' + thumbHTML(item) +
      '<span class="g-badge">' + (cats[item.category] || item.category) + "</span></div>" +
      '<div class="g-body"><h3>' + item.title + "</h3><p>" + (item.caption || "") + "</p>" +
      (item.date ? '<span class="g-date">' + item.date + "</span>" : "") +
      "</div></button>"
    );
  }

  // ---------- featured strip (homepage) ----------
  const featuredGrid = document.getElementById("featured-grid");
  if (featuredGrid) {
    const featured = items.filter((i) => i.featured).slice(0, 3);
    const picks = featured.length ? featured : items.slice(0, 3);
    featuredGrid.innerHTML = picks.map((item) => cardHTML(item, items.indexOf(item))).join("");
    bindCards(featuredGrid);
  }

  // ---------- full gallery page ----------
  const grid = document.getElementById("gallery-grid");
  const filterBar = document.getElementById("filter-bar");
  const emptyMsg = document.getElementById("gallery-empty");
  let visibleItems = items;

  if (grid && filterBar) {
    const usedCats = Object.keys(cats).filter((c) => items.some((i) => i.category === c));
    filterBar.innerHTML =
      '<button class="filter-chip active" data-cat="all">All <span class="count">' + items.length + "</span></button>" +
      usedCats
        .map((c) => {
          const n = items.filter((i) => i.category === c).length;
          return '<button class="filter-chip" data-cat="' + c + '">' + cats[c] + ' <span class="count">' + n + "</span></button>";
        })
        .join("");

    function render(cat) {
      visibleItems = cat === "all" ? items : items.filter((i) => i.category === cat);
      grid.innerHTML = visibleItems.map((item) => cardHTML(item, items.indexOf(item))).join("");
      if (emptyMsg) emptyMsg.hidden = visibleItems.length > 0;
      bindCards(grid);
    }

    filterBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      filterBar.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      render(chip.dataset.cat);
    });

    render("all");
  }

  // ---------- lightbox ----------
  const lb = document.getElementById("lightbox");
  let currentIdx = -1;

  function lightboxMediaHTML(item) {
    if (item.type === "video") {
      return '<video src="' + item.src + '" controls autoplay loop playsinline></video>';
    }
    if (item.type === "youtube") {
      return '<iframe src="https://www.youtube-nocookie.com/embed/' + youtubeId(item.src) + '?autoplay=1" allow="autoplay; fullscreen" allowfullscreen title="' + item.title + '"></iframe>';
    }
    return '<img src="' + item.src + '" alt="' + item.title + '">';
  }

  function openLightbox(idx) {
    if (!lb || !items[idx]) return;
    currentIdx = idx;
    const item = items[idx];
    document.getElementById("lb-media").innerHTML = lightboxMediaHTML(item);
    document.getElementById("lb-title").textContent = item.title;
    document.getElementById("lb-caption").textContent = item.caption || "";
    document.getElementById("lb-meta").textContent =
      (cats[item.category] || item.category) + (item.date ? " · " + item.date : "");
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lb) return;
    lb.hidden = true;
    document.getElementById("lb-media").innerHTML = "";
    document.body.style.overflow = "";
  }

  function step(dir) {
    if (!visibleItems.length) return;
    const pos = visibleItems.indexOf(items[currentIdx]);
    const next = visibleItems[(pos + dir + visibleItems.length) % visibleItems.length];
    openLightbox(items.indexOf(next));
  }

  function bindCards(scope) {
    scope.querySelectorAll(".g-card").forEach((card) => {
      card.addEventListener("click", () => openLightbox(parseInt(card.dataset.index, 10)));
      const vid = card.querySelector("video");
      if (vid) {
        card.addEventListener("mouseenter", () => vid.play().catch(() => {}));
        card.addEventListener("mouseleave", () => vid.pause());
      }
    });
  }

  if (lb) {
    document.getElementById("lb-close").addEventListener("click", closeLightbox);
    document.getElementById("lb-prev").addEventListener("click", () => step(-1));
    document.getElementById("lb-next").addEventListener("click", () => step(1));
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }
})();
