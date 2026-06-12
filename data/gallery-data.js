/* ============================================================================
   GALLERY DATA — this is the only file you need to edit to add plots/animations
   ============================================================================

   HOW TO ADD SOMETHING NEW (3 steps):

   1. Drop your file into  assets/gallery/   (png, jpg, gif, mp4, webm all work)

   2. Add an entry to GALLERY_ITEMS below (newest first looks best):

        {
          title:    "Bennu Radial Density Profile",
          category: "bennu",                     // key from GALLERY_CATEGORIES
          type:     "image",                     // "image" | "video" | "youtube"
          src:      "assets/gallery/density_profile.png",
          caption:  "One-sentence description shown under the figure.",
          date:     "2026-06",
          featured: true,                        // optional — pins it to the homepage (max 3)
        },

      For videos:   type: "video",  src: "assets/gallery/touchdown.mp4"
                    (optional: poster: "assets/gallery/touchdown_thumb.png")
      For YouTube:  type: "youtube", src: "https://youtu.be/VIDEOID"

   3. Commit and push:
        git add -A && git commit -m "Add new figure" && git push

   To add a whole new category, add a line to GALLERY_CATEGORIES.
   ========================================================================== */

const GALLERY_CATEGORIES = {
  bennu:    "Bennu Gravity",
  granular: "Granular Sims",
  binary:   "Binary Dynamics",
  astro:    "Astrophotography",
};

const GALLERY_ITEMS = [
  {
    title: "Bennu Internal Density Components",
    category: "bennu",
    type: "image",
    src: "assets/gallery/placeholder-bennu.svg",
    caption: "Placeholder — drop in your component density figure from the Icarus paper (e.g. the core + torus + surface layer breakdown).",
    date: "2026-06",
    featured: true,
  },
  {
    title: "LMGC90 Touchdown Simulation",
    category: "granular",
    type: "image",
    src: "assets/gallery/placeholder-granular.svg",
    caption: "Placeholder — swap in an animation of a CubeSat-scale contact on a polyhedral particle bed (mp4/gif works great here).",
    date: "2026-06",
    featured: true,
  },
  {
    title: "GUBAS Mutual Potential of Didymos–Dimorphos",
    category: "binary",
    type: "image",
    src: "assets/gallery/placeholder-binary.svg",
    caption: "Placeholder — surface gravity / slope maps or libration plots from GUBAS go here.",
    date: "2026-06",
    featured: true,
  },
  {
    title: "Night Sky over Boulder",
    category: "astro",
    type: "image",
    src: "assets/gallery/placeholder-astro.svg",
    caption: "Placeholder — your astrophotography lives here too. Asteroids by day, nebulae by night.",
    date: "2026-06",
  },
];
