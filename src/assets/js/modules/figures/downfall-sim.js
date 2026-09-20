// Downfall figure: a scripted run of the four stage course. The camera follows
// the agent, raycasts are coloured by hit type, the observation vector updates
// live, and the return grows with a bonus at each stage gate. This is an
// illustration of what the policy sees, not a recorded episode.
import { animate, C } from "./anim-loop.js";

const PLATFORMS = [[0, 150, 200], [240, 150, 140], [420, 128, 120], [580, 150, 120], [740, 140, 130],
  [910, 150, 110], [1060, 132, 120], [1220, 150, 110], [1370, 140, 170]];
const STAGES = [{ x: 0, name: "1 platforms" }, { x: 400, name: "2 bombs" }, { x: 760, name: "3 spike roller" }, { x: 1140, name: "4 goal gate" }];
const WALLS = [{ x: 1300, y: 95, w: 10, h: 45 }];
const GATE_X = 1500, RUN_FRAMES = 900, PAUSE_FRAMES = 120, VIEW_W = 640, WORLD_W = 1540, RAY_MAX = 120;
const RAY_DIRS = [[1, 0], [0.9, -0.45], [0.45, -0.9], [0.9, 0.45], [-0.7, -0.7]].map(([x, y]) => {
  const n = Math.hypot(x, y); return [x / n, y / n];
});

function buildPath() {
  const path = [];
  for (let i = 0; i <= RUN_FRAMES; i++) {
    const x = 40 + i * (1480 / RUN_FRAMES);
    let y = 150;
    PLATFORMS.forEach(([px, py, pw]) => { if (x >= px && x <= px + pw) y = py; });
    let jump = 0;
    PLATFORMS.forEach(([px, py, pw], j) => {
      if (j === PLATFORMS.length - 1) return;
      const edge = px + pw, next = PLATFORMS[j + 1][0];
      if (x > edge - 18 && x < next + 18) {
        const u = (x - (edge - 18)) / (next - edge + 36);
        jump = Math.max(jump, 40 * Math.sin(u * Math.PI));
        y = Math.min(py, PLATFORMS[j + 1][1]);
      }
    });
    if (Math.abs(x - 1300) < 30) jump = Math.max(jump, 55 * Math.cos(((x - 1300) / 30) * (Math.PI / 2)));
    path.push([x, y - 8 - jump]);
  }
  return path;
}

export function initDownfallSim() {
  const svg = document.getElementById("df-fig");
  if (!svg) return;
  const $ = (id) => document.getElementById(id);
  const path = buildPath();
  const hazards = [{ x: 500, y: 60, r: 9, kind: "bomb" }, { x: 640, y: 40, r: 9, kind: "bomb" }, { x: 900, kind: "roller" }, { x: 990, kind: "roller" }];
  let returnPts = [], total = 0, passed = new Set();

  const castRay = (ax, ay, dx, dy) => {
    for (let s = 4; s < RAY_MAX; s += 4) {
      const x = ax + dx * s, y = ay + dy * s;
      for (const h of hazards) {
        if (h.kind === "bomb" ? Math.hypot(x - h.x, y - h.cy) < h.r : Math.abs(x - h.x) < 14 && Math.abs(y - 120) < 14) return [s, C.red];
      }
      for (const w of WALLS) if (x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h) return [s, C.grayDark];
      for (const [px, py, pw] of PLATFORMS) if (x >= px && x <= px + pw && y >= py && y <= py + 8) return [s, C.green];
    }
    return [RAY_MAX, C.grayLight];
  };

  animate(svg.closest("figure"), (frame) => {
    // Reduced motion (frame 0): show a moment inside stage 2.
    const t = frame === 0 ? 330 : frame % (RUN_FRAMES + PAUSE_FRAMES);
    const i = Math.min(t, RUN_FRAMES);
    const [ax, ay] = path[i];
    const cam = Math.max(0, Math.min(ax - 200, WORLD_W - VIEW_W));
    const sx = (x) => (x - cam + 20).toFixed(1);
    hazards.forEach((h, j) => { if (h.kind === "bomb") h.cy = h.y + 30 * (1 + Math.sin(t / 14 + j)); });

    let s = "";
    STAGES.forEach((st) => {
      s += `<line x1="${sx(st.x)}" y1="10" x2="${sx(st.x)}" y2="180" stroke="${C.gray}" stroke-width=".6" stroke-dasharray="3 3"/>`
        + `<text class="svg-label" x="${sx(st.x + 8)}" y="28" style="font-size:11px">${st.name}</text>`;
    });
    PLATFORMS.forEach(([px, py, pw]) => { s += `<rect x="${sx(px)}" y="${py}" width="${pw}" height="8" rx="2" fill="#C8CFD9"/>`; });
    hazards.forEach((h) => {
      s += h.kind === "bomb"
        ? `<circle cx="${sx(h.x)}" cy="${h.cy.toFixed(1)}" r="${h.r}" fill="${C.red}"/>`
        : `<g transform="translate(${sx(h.x)},120) rotate(${(t * 6) % 360})"><rect x="-14" y="-2" width="28" height="4" fill="${C.grayDark}"/><rect x="-2" y="-14" width="4" height="28" fill="${C.grayDark}"/></g>`;
    });
    WALLS.forEach((w) => { s += `<rect x="${sx(w.x)}" y="${w.y}" width="${w.w}" height="${w.h}" fill="${C.grayDark}"/>`; });
    s += `<rect x="${sx(GATE_X)}" y="80" width="8" height="60" fill="${C.green}"/>`;
    const rays = RAY_DIRS.map(([dx, dy]) => {
      const hit = castRay(ax, ay, dx, dy);
      s += `<line x1="${sx(ax)}" y1="${ay.toFixed(1)}" x2="${sx(ax + dx * hit[0])}" y2="${(ay + dy * hit[0]).toFixed(1)}" stroke="${hit[1]}" stroke-width="1.2" opacity=".85"/>`;
      return hit;
    });
    s += `<rect x="${sx(ax - 7)}" y="${(ay - 7).toFixed(1)}" width="14" height="14" rx="2" fill="${C.accent}"/>`;
    $("df-world").innerHTML = s;

    const stage = STAGES.reduce((k, st, j) => (ax >= st.x ? j : k), 0);
    const prev = path[Math.max(0, i - 1)];
    const onGround = Math.abs(ay - prev[1]) < 0.3;
    const vy = prev[1] - ay;
    let o = "";
    rays.forEach(([dist, col], j) => {
      const w = (1 - dist / RAY_MAX) * 150;
      o += `<text class="svg-label" x="20" y="${226 + j * 16}" style="font-size:11px">ray ${j + 1}</text>`
        + `<rect x="70" y="${217 + j * 16}" width="150" height="10" rx="2" fill="#E2E6EB"/>`
        + `<rect x="70" y="${217 + j * 16}" width="${w.toFixed(1)}" height="10" rx="2" fill="${col}"/>`;
    });
    o += `<text class="svg-label" x="240" y="226" style="font-size:11px">stage</text>`;
    for (let k = 0; k < 4; k++) o += `<rect x="${300 + k * 16}" y="216" width="12" height="12" rx="2" fill="${k === stage ? C.accent : "#E2E6EB"}"/>`;
    o += `<text class="svg-label" x="240" y="250" style="font-size:11px">on ground</text><circle cx="330" cy="246" r="5" fill="${onGround ? C.green : "#E2E6EB"}"/>`;
    const vw = Math.min(50, Math.abs(vy * 10));
    o += `<text class="svg-label" x="240" y="274" style="font-size:11px">vert. vel.</text><rect x="330" y="265" width="1.5" height="12" fill="${C.gray}"/>`
      + `<rect x="${(vy >= 0 ? 331.5 : 331.5 - vw).toFixed(1)}" y="267" width="${vw.toFixed(1)}" height="8" fill="${C.violet}"/>`;
    o += `<text class="svg-label" x="240" y="298" style="font-size:11px">to goal</text>`
      + `<line x1="300" y1="294" x2="${(300 + Math.max(4, Math.min(80, (GATE_X - ax) / 18))).toFixed(1)}" y2="294" stroke="${C.accent}" stroke-width="2"/>`;
    $("df-obs").innerHTML = o;

    if (t === 0) { returnPts = []; total = 0; passed = new Set(); }
    if (frame !== 0 && i < RUN_FRAMES && t % 6 === 0) {
      total += 0.3;
      STAGES.forEach((st, j) => { if (j > 0 && ax >= st.x && !passed.has(j)) { passed.add(j); total += 14; } });
      returnPts.push(`${(400 + returnPts.length * (260 / (RUN_FRAMES / 6))).toFixed(1)},${(326 - total * 1.05).toFixed(1)}`);
      $("df-return").setAttribute("points", returnPts.join(" "));
    }
  });
}
