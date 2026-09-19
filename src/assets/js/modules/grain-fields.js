// Grain storage figure: steps through the days, cross-fading the temperature
// and humidity fields in sync with the daily heat and water budget.
// Data comes from src/_data/grain.json, rendered into <script id="grain-data">.
import { HOT, JET } from "./colormap.js";
import { renderField } from "./field-render.js";

const STEP_MS = 2200;
const COLORS = { gain: "#B0721A", loss: "#1F4E9C", wet: "#1E63B0", dry: "#59616E" };

const argBy = (values, better) => values.reduce((best, v, i) => (better(v, values[best]) ? i : best), 0);

export function initGrainFields() {
  const dataEl = document.getElementById("grain-data");
  const layers = { T: [0, 1].map((i) => document.getElementById(`gT${i}`)), R: [0, 1].map((i) => document.getElementById(`gR${i}`)) };
  if (!dataEl || !layers.T[0]) return;

  const data = JSON.parse(dataEl.textContent);
  const el = {
    date: document.getElementById("grain-date"),
    heat: document.getElementById("grain-dh"),
    water: document.getElementById("grain-dw"),
    tNote: document.getElementById("grain-tnote"),
    rNote: document.getElementById("grain-rnote"),
    pips: document.querySelectorAll(".grain-pip"),
  };

  const common = { positions: data.positions_m, hull: data.hull_m, extent: data.extent_m, top: data.top_m };
  const frames = data.days.map((_, n) => ({
    T: renderField({ ...common, values: data.temperature_c[n], range: data.scales.temperature_c, stops: HOT }),
    R: renderField({ ...common, values: data.relative_humidity_pct[n], range: data.scales.relative_humidity_pct, stops: JET }),
  }));

  let front = 0;
  const show = (n, first = false) => {
    const next = first ? 0 : 1 - front;
    for (const key of ["T", "R"]) {
      const [incoming, outgoing] = [layers[key][next], layers[key][1 - next]];
      incoming.setAttribute("href", frames[n][key]);
      incoming.style.opacity = 1;
      if (!first) outgoing.style.opacity = 0;
    }
    front = next;

    const day = data.days[n];
    el.date.textContent = day.label;
    el.heat.textContent = day.heat;
    el.heat.style.fill = day.heat.startsWith("+") ? COLORS.gain : COLORS.loss;
    el.water.textContent = day.water;
    el.water.style.fill = day.water.startsWith("+") ? COLORS.wet : COLORS.dry;

    const T = data.temperature_c[n];
    const R = data.relative_humidity_pct[n];
    const s = data.sensors;
    const hot = argBy(T, (a, b) => a > b), cool = argBy(T, (a, b) => a < b);
    const dry = argBy(R, (a, b) => a < b), wet = argBy(R, (a, b) => a > b);
    el.tNote.textContent = `warmest ${s[hot]} ~${T[hot].toFixed(1)} °C, coolest ${s[cool]} ~${T[cool].toFixed(1)} °C`;
    el.rNote.textContent = `driest ${s[dry]} ~${R[dry]}%, wettest ${s[wet]} ~${R[wet]}%`;
    el.pips.forEach((p, k) => { p.style.fill = k === n ? "#1F4E9C" : k < n ? "#9DB1D3" : "#C7D0DB"; });
  };

  show(0, true);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let n = 0;
    setInterval(() => { n = (n + 1) % data.days.length; show(n); }, STEP_MS);
  }
}
