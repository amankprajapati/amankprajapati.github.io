// MedMNIST figure: steps through the four modalities. For each one the input
// image is framed, the parent forest's vote settles on it, the route to the
// matching expert lights up, and the right panel shows that result.
import { animate, C } from "./anim-loop.js";

const STEP_FRAMES = 170; // about 2.8 s at 60 fps
const IMPORTANCE = "assets/img/medmnist/pneumonia-importance.png";

const MODALITIES = [
  { name: "OCT", expert: "random forest", task: "4 retinal classes", metric: "",
    notes: ["parent reads the", "horizontal retinal layers"], vis: "oct" },
  { name: "Chest X ray", expert: "XGBoost", task: "pneumonia vs normal", metric: "AUC 0.95",
    notes: ["red pixels drive the", "prediction (recomputed)"], vis: "importance" },
  { name: "Fundus", expert: "XGBoost", task: "5 severity grades", metric: "hardest at 28 px",
    notes: ["surrogate splits on mean", "brightness: a shortcut"], vis: "tree" },
  { name: "Ultrasound", expert: "random forest", task: "malignant vs benign", metric: "AUC 0.91",
    notes: ["SHAP and LIME", "explain single cases"], vis: "attribution" },
];

function explanation(kind) {
  switch (kind) {
    case "importance":
      return `<image href="${IMPORTANCE}" x="484" y="120" width="96" height="96" style="image-rendering:pixelated"/>`;
    case "tree":
      return `<rect x="520" y="126" width="100" height="24" rx="4" fill="#F3E6CF" stroke="${C.amber}" stroke-width=".6"/>
        <text class="svg-label" x="570" y="142" text-anchor="middle" style="font-size:11px">mean brightness</text>
        <path d="M545 150 L520 182 M595 150 L620 182" stroke="${C.gray}" fill="none"/>
        <rect x="494" y="182" width="52" height="22" rx="4" fill="#E2E6EB"/><rect x="594" y="182" width="52" height="22" rx="4" fill="#E2E6EB"/>
        <text class="svg-label" x="520" y="197" text-anchor="middle" style="font-size:11px">dark</text>
        <text class="svg-label" x="620" y="197" text-anchor="middle" style="font-size:11px">bright</text>`;
    case "oct": {
      let s = "";
      for (let r = 0; r < 6; r++) s += `<rect x="484" y="${128 + r * 15}" width="160" height="${r % 2 ? 5 : 8}" fill="${C.accent}" opacity="${(0.15 + r * 0.12).toFixed(2)}"/>`;
      return s;
    }
    case "attribution": {
      let s = `<line x1="564" y1="124" x2="564" y2="214" stroke="${C.gray}" stroke-width=".6"/>`;
      [0.8, -0.5, 0.35, -0.2, 0.15].forEach((v, i) => {
        const w = Math.abs(v) * 70;
        s += `<rect x="${v > 0 ? 564 : 564 - w}" y="${128 + i * 17}" width="${w}" height="11" fill="${v > 0 ? C.red : C.accent}" opacity=".65"/>`;
      });
      return s;
    }
    default:
      return "";
  }
}

export function initMedmnistRouter() {
  const svg = document.getElementById("med-fig");
  if (!svg) return;
  const $ = (id) => document.getElementById(id);

  let frames = "", votes = "", experts = "", routes = "";
  MODALITIES.forEach((m, i) => {
    const y = 40 + i * 62;
    frames += `<rect id="med-frame-${i}" x="18" y="${y - 2}" width="60" height="60" rx="3" fill="none" stroke="${C.accent}" stroke-width="0"/>`;
    votes += `<text class="svg-label" x="140" y="${110 + i * 38}" style="font-size:11px">${m.name}</text>
      <rect x="140" y="${116 + i * 38}" width="144" height="8" rx="2" fill="#E2E6EB"/>
      <rect id="med-vote-${i}" x="140" y="${116 + i * 38}" width="4" height="8" rx="2" fill="${C.accent}" style="transition:width .6s ease"/>`;
    experts += `<rect id="med-expert-${i}" x="328" y="${66 + i * 50}" width="126" height="34" rx="4" fill="#FFFFFF" stroke="#C9D0DA"/>
      <text class="svg-label" x="338" y="${80 + i * 50}" style="font-size:11px">${m.name}</text>
      <text class="svg-num" x="338" y="${94 + i * 50}" style="font-size:10.5px">${m.expert}</text>`;
    routes += `<path id="med-route-${i}" d="M298 ${120 + i * 38} L312 ${120 + i * 38} L312 ${83 + i * 50} L326 ${83 + i * 50}" fill="none" stroke="${C.accent}" stroke-width="1.5" opacity="0"/>`;
  });
  $("med-frames").innerHTML = frames;
  $("med-votes").innerHTML = votes;
  $("med-experts").innerHTML = experts;
  $("med-routes").innerHTML = routes;

  let shown = -1;
  const show = (k) => {
    if (k === shown) return;
    shown = k;
    const m = MODALITIES[k];
    MODALITIES.forEach((_, i) => {
      const on = i === k;
      $(`med-frame-${i}`).setAttribute("stroke-width", on ? 2.5 : 0);
      $(`med-vote-${i}`).setAttribute("width", on ? 132 : 4 + ((i * 37 + k * 11) % 18));
      $(`med-route-${i}`).setAttribute("opacity", on ? 1 : 0);
      const box = $(`med-expert-${i}`);
      box.setAttribute("fill", on ? C.accentSoft : "#FFFFFF");
      box.setAttribute("stroke", on ? C.accent : "#C9D0DA");
      box.setAttribute("stroke-width", on ? 1.5 : 1);
    });
    $("med-r-title").textContent = m.name;
    $("med-r-sub").textContent = m.task;
    $("med-r-metric").textContent = m.metric;
    $("med-r-vis").innerHTML = explanation(m.vis);
    $("med-r-note1").textContent = m.notes[0];
    $("med-r-note2").textContent = m.notes[1];
  };

  // Reduced motion shows the chest X ray step (index 1), which has the real importance map.
  animate(svg.closest("figure"), (frame) => {
    show(frame === 0 ? 1 : Math.floor(frame / STEP_FRAMES) % MODALITIES.length);
  });
}
