// Shared animation loop for figure modules.
// Runs `step(frame)` every animation frame while the figure is on screen
// (figure-observer.js adds the `run` class). With reduced motion, renders once.
export function animate(figure, step) {
  if (!figure) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    step(0);
    return;
  }
  let frame = 0;
  step(frame);
  const tick = () => {
    if (figure.classList.contains("run")) step(++frame);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Site palette, kept in one place for all figure modules.
export const C = {
  accent: "#1F4E9C",
  accentSoft: "#E9F0FA",
  violet: "#574CA6",
  violetMid: "#8B7FC7",
  green: "#2C7A52",
  red: "#B4342C",
  amber: "#B0721A",
  ink: "#15181D",
  inkSoft: "#59616E",
  gray: "#98A1AD",
  grayLight: "#C3CBD8",
  grayDark: "#5F6773",
};

// Smooth curve through points (Catmull-Rom converted to cubic Bezier).
export function smoothPath(points) {
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[Math.max(0, i - 1)];
    const b = points[i];
    const c = points[i + 1];
    const e = points[Math.min(points.length - 1, i + 2)];
    d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)}`
      + ` ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)}`
      + ` ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  return d;
}
