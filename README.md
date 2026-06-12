# ashcav1.github.io

Personal research website for Ashish Cavale — Ph.D. student, Aerospace Engineering
Sciences, CU Boulder (Celestial & Spaceflight Mechanics Lab).

Live at: **https://ashcav1.github.io/**

Pure static HTML/CSS/JS — no build step, no frameworks, nothing to install.

## Adding a figure or animation (the easy way)

```sh
python3 add-figure.py ~/Desktop/my_plot.png
```

The script copies the file into the site, asks for a title, caption, and category,
and offers to commit and push. The site updates about a minute after pushing.
Works with png, jpg, gif, svg, webp, mp4, webm, and mov.

## Adding one manually

1. Drop the file into `assets/gallery/`.
2. Add an entry to the top of `GALLERY_ITEMS` in `data/gallery-data.js`:

   ```js
   {
     title:    "Bennu Radial Density Profile",
     category: "bennu",            // bennu | granular | binary
     type:     "image",            // "image" | "video" | "youtube"
     src:      "assets/gallery/density_profile.png",
     caption:  "One-sentence description shown under the figure.",
     date:     "2026-06",
     featured: true,               // optional — shows on the homepage (first 3 featured items)
   },
   ```

3. `git add -A && git commit -m "Add figure" && git push`

**Videos** autoplay on hover in the grid and play with controls in the lightbox.
Keep mp4s reasonably small (aim for <25 MB). **YouTube:** use
`type: "youtube", src: "https://youtu.be/VIDEOID"`. **New category:** add a line to
`GALLERY_CATEGORIES` — the filter chip appears automatically.

## Other common edits

| What | Where |
|---|---|
| Research descriptions | `index.html` → `<section id="research">` |
| Publications & talks | `index.html` → `<section id="publications">` |
| Bio & education | `index.html` → `<section id="about">` |
| Colors / fonts / spacing | `css/style.css` → `:root` variables at the top |
| Asteroid model (shape, labels, colors) | `js/asteroid.js` |

## CV download

A CV button is intentionally not included yet — the resume PDF contains a phone
number. To add one: export a phone-free PDF as `assets/Ashish_Cavale_CV.pdf` and add
a link in the contact section of `index.html`:

```html
<li><a href="assets/Ashish_Cavale_CV.pdf" target="_blank">CV (PDF)</a></li>
```

## Preview locally

```sh
cd "path/to/Research Website"
python3 -m http.server 8000
# open http://localhost:8000
```

## How it's organized

```
index.html            main page (research, selected figures, publications, about, contact)
gallery.html          full gallery with category filters + lightbox
add-figure.py         helper script — adds a figure and pushes it live
data/gallery-data.js  gallery content (edited by add-figure.py, or by hand)
css/style.css         all styling (theme variables at top)
js/asteroid.js        Bennu-style asteroid with schematic interior (hero)
js/main.js            nav, gallery rendering, lightbox
assets/gallery/       figures and animations live here
```
