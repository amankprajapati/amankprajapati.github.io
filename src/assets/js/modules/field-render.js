// Renders a scalar field from point readings using inverse distance weighting,
// clipped to a polygon, and returns it as a PNG data URL.
import { sample } from "./colormap.js";

function insidePolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function renderField({ positions, values, hull, extent, top, range, stops, width = 240, power = 1.3 }) {
  const [spanX, spanY] = extent;
  const height = Math.round((width * spanY) / spanX);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(width, height);
  const [lo, hi] = range;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x = (px / width) * spanX;
      const y = top - (py / height) * spanY;
      if (!insidePolygon(x, y, hull)) continue;

      let num = 0;
      let den = 0;
      let exact = null;
      for (let s = 0; s < positions.length; s++) {
        const dx = x - positions[s][0];
        const dy = y - positions[s][1];
        const d2 = dx * dx + dy * dy;
        if (d2 < 1e-6) { exact = values[s]; break; }
        const w = 1 / Math.pow(d2, power);
        num += w * values[s];
        den += w;
      }
      const v = exact ?? num / den;
      const [r, g, b] = sample(stops, (v - lo) / (hi - lo));
      const o = (py * width + px) * 4;
      image.data[o] = r;
      image.data[o + 1] = g;
      image.data[o + 2] = b;
      image.data[o + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}
