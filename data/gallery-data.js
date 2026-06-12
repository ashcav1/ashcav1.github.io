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
          featured: true,                        // optional — shows it on the homepage (max 3)
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
  granular: "Granular Mechanics",
  binary:   "Binary Dynamics",
};

const GALLERY_ITEMS = [
  {
    title: "Bennu Internal Density Components",
    category: "bennu",
    type: "image",
    src: "assets/gallery/placeholder-bennu.svg",
    caption: "Placeholder — replace with a figure from the Bennu density estimation work.",
    date: "2026-06",
    featured: true,
  },
  {
    title: "LMGC90 Contact Simulation",
    category: "granular",
    type: "image",
    src: "assets/gallery/placeholder-granular.svg",
    caption: "Placeholder — replace with an LMGC90 simulation figure or animation.",
    date: "2026-06",
    featured: true,
  },
  {
    title: "GUBAS Binary Dynamics",
    category: "binary",
    type: "image",
    src: "assets/gallery/placeholder-binary.svg",
    caption: "Placeholder — replace with GUBAS surface gravity, slope, or libration figures.",
    date: "2026-06",
    featured: true,
  },
];
