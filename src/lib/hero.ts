// Homepage hero photo, served from /public in two widths so phones get the
// small file and large/high-density screens get the sharp one. index.html
// preloads the same srcset — keep them in sync.
export const heroImage = {
  src: '/images/hero-1280.webp',
  srcSet:
    '/images/hero-1280.webp 1280w, /images/hero-1920.webp 1920w, /images/hero-2560.webp 2560w, /images/hero-3200.webp 3200w',
  sizes: '100vw',
};
