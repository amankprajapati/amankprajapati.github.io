// Videos are attached only when they scroll near the screen. An autoplaying <video> in the initial
// HTML makes Firefox paint the page before its stylesheets load (a flash of unstyled content), and
// it also downloads tens of MB up front. Until then each video shows its poster.
export function initLazyVideos(selector = "video[data-src]") {
  const videos = document.querySelectorAll(selector);
  const attach = (v) => {
    v.src = v.dataset.src;
    v.removeAttribute("data-src");
    v.play().catch(() => {});                      // muted autoplay; ignore if the browser declines
  };
  if (!("IntersectionObserver" in window)) {
    videos.forEach(attach);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        observer.unobserve(e.target);
        attach(e.target);
      }
    });
  }, { rootMargin: "300px 0px" });
  videos.forEach((v) => observer.observe(v));
}
