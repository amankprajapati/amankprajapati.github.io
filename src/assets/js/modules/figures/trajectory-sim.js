// Trajectory figure: a small rule based planner stands in for the model so
// the page can show the behaviour. The ego car keeps its gap, moves into a
// free gap when a slower vehicle is ahead, slows down if none is free, and
// returns to the centre once past. The forecast is simulated forward from the
// car's current state and drives the output box, speedometer and wheel.
import { animate, C, smoothPath } from "./anim-loop.js";

const EGO_Y = 420, TOP = 150, LANES = [215, 300, 385];
const CRUISE = 38, FOLLOW = 26, GAUGE_MAX = 60;
const GAUGE = { cx: 508, cy: 250, r: 42 };
const PULSE_PATHS = [
  [[204, 72], [222, 72]],
  [[344, 42], [364, 68]],
  [[344, 102], [364, 76]],
  [[482, 72], [500, 72]],
  [[582, 126], [582, 140], [545, 140], [545, 156]],
];

export function initTrajectorySim() {
  const svg = document.getElementById("traj-fig");
  if (!svg) return;
  const $ = (id) => document.getElementById(id);

  const traffic = [
    { x: 215, y: 90, w: 30, h: 72, c: C.grayDark, s: 0.45 },
    { x: 300, y: 150, w: 20, h: 28, c: C.amber, s: 0.9 },
    { x: 385, y: 220, w: 10, h: 20, c: C.green, s: 0.2, weave: true },
    { x: 385, y: -60, w: 22, h: 40, c: C.gray, s: 0.5 },
    { x: 215, y: 330, w: 10, h: 20, c: C.green, s: 0.3, weave: true },
  ];
  const ego = { x: 300, target: 300, vx: 0 };
  let speed = CRUISE;
  const imuTrace = [], gpsTrace = [];

  const occupied = (lx, y0, y1) =>
    traffic.find((v) => Math.abs(v.x - lx) < v.w / 2 + 16 && v.y + v.h > y0 && v.y < y1) || null;
  const ahead = (lx) => {
    let best = null;
    traffic.forEach((v) => {
      const front = v.y + v.h;
      if (Math.abs(v.x - lx) < v.w / 2 + 16 && front < EGO_Y - 18 && front > EGO_Y - 210 && (!best || v.y > best.y)) best = v;
    });
    return best;
  };
  const laneOf = (x) => LANES.reduce((b, l, i) => (Math.abs(l - x) < Math.abs(LANES[b] - x) ? i : b), 0);

  const plan = () => {
    const cur = laneOf(ego.target);
    if (!ahead(LANES[cur])) {
      if (cur !== 1 && !occupied(LANES[1], EGO_Y - 190, EGO_Y + 30) && !ahead(LANES[1])) return [LANES[1], "return to centre"];
      return [LANES[cur], "keep course"];
    }
    const options = [cur - 1, cur + 1]
      .filter((k) => k >= 0 && k < 3 && !occupied(LANES[k], EGO_Y - 170, EGO_Y + 40))
      .sort((a, b) => Math.abs(a - 1) - Math.abs(b - 1));
    if (options.length) return [LANES[options[0]], `overtake ${LANES[options[0]] < LANES[cur] ? "left" : "right"}`];
    return [LANES[cur], "follow, slow down"];
  };

  const gaugeArc = (frac) => {
    const start = Math.PI * 1.25, end = start - frac * Math.PI * 1.5;
    const sx = GAUGE.cx + GAUGE.r * Math.cos(start), sy = GAUGE.cy - GAUGE.r * Math.sin(start);
    const ex = GAUGE.cx + GAUGE.r * Math.cos(end), ey = GAUGE.cy - GAUGE.r * Math.sin(end);
    return `M${sx.toFixed(1)} ${sy.toFixed(1)} A${GAUGE.r} ${GAUGE.r} 0 ${frac > 2 / 3 ? 1 : 0} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  };
  const along = (seg, u) => {
    const n = seg.length - 1, k = Math.min(n - 1, Math.floor(u * n)), f = u * n - k;
    return [seg[k][0] + (seg[k + 1][0] - seg[k][0]) * f, seg[k][1] + (seg[k + 1][1] - seg[k][1]) * f];
  };

  animate(svg.closest("figure"), (t) => {
    const [target, manoeuvre] = plan();
    ego.target = target;
    speed += ((manoeuvre.startsWith("follow") ? FOLLOW : CRUISE) - speed) * 0.03;
    const rel = speed / CRUISE;

    traffic.forEach((v, i) => {
      v.y += v.s * rel;
      if (v.weave) v.x += Math.sin((t + i * 40) / 35) * 0.15;
      if (v.y > 480) {
        v.y = TOP - 110 - ((i * 53 + t) % 80);
        const free = LANES.filter((l) => !occupied(l, TOP - 140, TOP + 40));
        if (free.length) v.x = free[(i + t) % free.length];
      }
    });

    ego.vx += ((ego.target - ego.x) * 0.02 - ego.vx) * 0.15;
    ego.x += ego.vx;
    $("traj-ego").setAttribute("transform", `translate(${ego.x.toFixed(1)},${EGO_Y})`);
    $("traj-traffic").innerHTML = traffic
      .map((v) => `<rect x="${(v.x - v.w / 2).toFixed(1)}" y="${v.y.toFixed(1)}" width="${v.w}" height="${v.h}" rx="4" fill="${v.c}"/>`)
      .join("");

    // Forecast: roll the same lateral controller forward, one point per second.
    const pts = [[ego.x, EGO_Y - 22]];
    let fx = ego.x, fv = ego.vx;
    for (let k = 1; k <= 5; k++) {
      for (let s = 0; s < 40; s++) { fv += ((ego.target - fx) * 0.02 - fv) * 0.15; fx += fv; }
      pts.push([fx, EGO_Y - 22 - k * 48 * rel]);
    }
    const left = [], right = [];
    pts.forEach(([x, y], k) => { const w = 3 + k * 5.5; left.push([x - w, y]); right.unshift([x + w, y]); });
    const rightPath = smoothPath(right);
    $("traj-path").setAttribute("d", smoothPath(pts));
    $("traj-band").setAttribute("d", `${smoothPath(left)} L${right[0][0].toFixed(1)} ${right[0][1].toFixed(1)}${rightPath.slice(rightPath.indexOf(" C"))} Z`);
    $("traj-dots").innerHTML = pts.slice(1)
      .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#fff" stroke="${C.accent}" stroke-width="1.5"/>`)
      .join("");

    const angle = (Math.atan2(pts[2][0] - pts[0][0], pts[0][1] - pts[2][1]) * 180) / Math.PI;
    const kmh = `${Math.round(speed)} km/h`, deg = `${Math.round(angle)}°`;
    $("traj-o-path").textContent = manoeuvre;
    $("traj-o-speed").textContent = kmh;
    $("traj-o-angle").textContent = deg;
    $("traj-man").textContent = manoeuvre;
    $("traj-speed").textContent = kmh;
    $("traj-angle").textContent = deg;

    const frac = Math.max(0.02, Math.min(1, speed / GAUGE_MAX));
    $("traj-speed-arc").setAttribute("d", gaugeArc(frac));
    const na = Math.PI * 1.25 - frac * Math.PI * 1.5;
    $("traj-needle").setAttribute("x2", (GAUGE.cx + 34 * Math.cos(na)).toFixed(1));
    $("traj-needle").setAttribute("y2", (GAUGE.cy - 34 * Math.sin(na)).toFixed(1));
    $("traj-wheel").setAttribute("transform", `translate(612,250) rotate(${Math.max(-90, Math.min(90, angle * 4)).toFixed(1)})`);

    // Inputs react to the car's own motion.
    imuTrace.push(48 - ego.vx * 12 + Math.sin(t / 3) * 1.5);
    if (imuTrace.length > 40) imuTrace.shift();
    $("traj-imu").setAttribute("points", imuTrace.map((y, i) => `${112 + i * 2},${y.toFixed(1)}`).join(" "));
    if (t % 12 === 0) { gpsTrace.push(ego.x); if (gpsTrace.length > 6) gpsTrace.shift(); }
    $("traj-gps").innerHTML = gpsTrace
      .map((x, i) => `<circle cx="${116 + i * 14}" cy="${(106 + (x - 300) * 0.1).toFixed(1)}" r="2.6" fill="${C.green}" opacity="${(0.35 + i * 0.11).toFixed(2)}"/>`)
      .join("");
    let cam = "";
    traffic.forEach((v) => {
      const d = EGO_Y - (v.y + v.h);
      if (d <= 0 || d >= 260) return;
      const sc = 1 - d / 260, cx = 66 + (v.x - ego.x) * 0.16 * (0.3 + sc), cy = 56 + sc * 36, w = v.w * 0.3 * (0.3 + sc);
      if (cx > 32 && cx < 100) cam += `<rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - w * 0.6).toFixed(1)}" width="${w.toFixed(1)}" height="${(w * 0.8).toFixed(1)}" rx="1" fill="${v.c}"/>`;
    });
    $("traj-cam").innerHTML = cam;

    $("traj-pulses").innerHTML = PULSE_PATHS
      .map((seg, j) => {
        const [x, y] = along(seg, (t / 50 + j * 0.18) % 1);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${j === 4 ? C.accent : C.violet}"/>`;
      })
      .join("");
  });
}
