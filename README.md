# ashcav1.github.io — Asteroid Research Website

Personal research website for Ashish Cavale — Ph.D. student, Aerospace Engineering
Sciences, CU Boulder (Celestial & Spaceflight Mechanics Lab).

Live at: **https://ashcav1.github.io/**

Pure static HTML/CSS/JS — no build step, no frameworks, nothing to install.

## Adding a new plot or animation (the thing you'll do most)

1. Drop the file into `assets/gallery/` — `.png`, `.jpg`, `.gif`, `.mp4`, `.webm` all work.
2. Open `data/gallery-data.js` and add an entry to the top of `GALLERY_ITEMS`:

   ```js
   {
     title:    "Bennu Radial Density Profile",
     category: "bennu",            // bennu | granular | binary | astro
     type:     "image",            // "image" | "video" | "youtube"
     src:      "assets/gallery/density_profile.png",
     caption:  "One-sentence description shown under the figure.",
     date:     "2026-06",
     featured: true,               // optional — pins it to the homepage (first 3 featured items shown)
   },
   ```

3. Push it live:

   ```sh
   git add -A && git commit -m "Add new figure" && git push
   ```

The site updates at https://ashcav1.github.io/ about a minute after pushing.

**Videos:** use `type: "video"` — they autoplay on hover in the grid and play with
controls in the lightbox. Add a `poster: "assets/gallery/thumb.png"` field for a
custom thumbnail. Keep mp4s reasonably small (GitHub blocks files >100 MB; aim for <25 MB).

**YouTube:** use `type: "youtube", src: "https://youtu.be/VIDEOID"` — thumbnail is
fetched automatically and the video embeds in the lightbox. Good for long animations.

**New category:** add a line to `GALLERY_CATEGORIES` in the same file — the filter
chip appears automatically.

## Other common edits

| What | Where |
|---|---|
| Research blurbs | `index.html` → `<section id="research">` |
| Publications & talks | `index.html` → `<section id="publications">` |
| Experience timeline | `index.html` → `<section id="experience">` |
| Colors / fonts / spacing | `css/style.css` → `:root` variables at the top |
| Starfield density, asteroid shape | `js/starfield.js`, `js/asteroid.js` |

## CV download

A CV button is intentionally not included yet — your resume PDF contains your phone
number. To add one: export a phone-free PDF as `assets/Ashish_Cavale_CV.pdf` and add
next to the contact buttons in `index.html`:

```html
<a class="btn btn-ghost" href="assets/Ashish_Cavale_CV.pdf" target="_blank">CV (PDF)</a>
```

## Preview locally

```sh
cd "path/to/Research Website"
python3 -m http.server 8000
# open http://localhost:8000
```

## How it's organized

```
index.html            main page (hero, research, featured visuals, pubs, experience, about, contact)
gallery.html          full gallery with category filters + lightbox
data/gallery-data.js  ← the file you edit to add visuals
css/style.css         all styling (dark theme variables at top)
js/starfield.js       animated star background
js/asteroid.js        procedural rotating rubble pile + moonlet (hero)
js/main.js            nav, scroll reveal, gallery rendering, lightbox
assets/gallery/       your figures and animations live here
```
