// ISRO figure: a playhead sweeps the gyroscope telemetry, revealing the
// residual; the physics informed alert fires before the rule based check.
import { animate, C } from "./anim-loop.js";

const X0 = 20, X1 = 660, N = 160, ALERT_X = 452, RULE_X = 520;
const SWEEP_FRAMES = 420, HOLD_FRAMES = 90;

const noise = (i) => { const v = Math.sin(i * 12.9898) * 43758.5453; return v - Math.floor(v); };

export function initIsroTimeline() {
  const svg = document.getElementById("isro-fig");
  if (!svg) return;
  const $ = (id) => document.getElementById(id);

  const raw = [], rec = [];
  for (let i = 0; i <= N; i++) {
    const x = X0 + i * 4;
    const base = 212 + 12 * Math.sin(i / 14);
    const bump = 24 * Math.exp(-(((i - 112) / 9) ** 2));
    raw.push(`${x},${(base - bump + (noise(i) - 0.5) * 8).toFixed(1)}`);
    rec.push(`${x},${base.toFixed(1)}`);
  }
  $("isro-raw").setAttribute("points", raw.join(" "));
  $("isro-rec").setAttribute("points", rec.join(" "));

  let bars = "";
  for (let i = 0; i < N; i += 4) {
    const x = X0 + i * 4;
    const h = 5 + noise(i + 3) * 6 + 46 * Math.exp(-(((i - 112) / 8) ** 2));
    const over = 302 - h < 268;
    bars += `<rect x="${x}" y="${(302 - h).toFixed(1)}" width="10" height="${h.toFixed(1)}" fill="${over ? C.red : C.grayLight}"/>`;
  }
  $("isro-bars").innerHTML = bars;

  const reveal = $("isro-reveal"), play = $("isro-play");
  const alert = $("isro-alert"), rule = $("isro-rule"), gap = $("isro-gap");
  animate(svg.closest("figure"), (frame) => {
    const f = frame % (SWEEP_FRAMES + HOLD_FRAMES);
    // Reduced motion (frame 0 only): show the finished state.
    const p = frame === 0 && !svg.closest("figure").classList.contains("run") ? 1 : Math.min(1, f / SWEEP_FRAMES);
    const x = X0 + (X1 - X0) * p;
    reveal.setAttribute("width", x - X0);
    play.setAttribute("x1", x);
    play.setAttribute("x2", x);
    alert.setAttribute("opacity", x >= ALERT_X ? 1 : 0);
    rule.setAttribute("opacity", x >= RULE_X ? 1 : 0);
    gap.setAttribute("opacity", x >= RULE_X + 2 ? 1 : 0);
  });
}
