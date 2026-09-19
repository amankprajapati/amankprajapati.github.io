// Piecewise linear colour maps, stops given as [position 0..1, [r, g, b]].
export const HOT = [
  [0, [90, 0, 0]], [0.3, [209, 26, 0]], [0.62, [255, 157, 0]], [0.85, [255, 236, 61]], [1, [255, 251, 224]],
];
export const JET = [
  [0, [0, 0, 127]], [0.2, [0, 64, 255]], [0.4, [0, 214, 255]], [0.6, [125, 255, 122]], [0.8, [255, 176, 0]], [1, [139, 0, 0]],
];

export function sample(stops, t) {
  const x = Math.min(1, Math.max(0, t));
  for (let k = 1; k < stops.length; k++) {
    if (x <= stops[k][0]) {
      const [p0, c0] = stops[k - 1];
      const [p1, c1] = stops[k];
      const u = (x - p0) / (p1 - p0);
      return c0.map((c, i) => Math.round(c + (c1[i] - c) * u));
    }
  }
  return stops[stops.length - 1][1];
}
