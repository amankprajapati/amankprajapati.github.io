// Entry point. Each module is independent and safe to run on any page.
import { observeFigures } from "./modules/figure-observer.js";
import { initSectionNav } from "./modules/section-nav.js";
import { initVideoEmbeds } from "./modules/video-embed.js";
import { initGrainFields } from "./modules/grain-fields.js";
import { initIsroTimeline } from "./modules/figures/isro-timeline.js";
import { initMedmnistRouter } from "./modules/figures/medmnist-router.js";
import { initTrajectorySim } from "./modules/figures/trajectory-sim.js";
import { initDownfallSim } from "./modules/figures/downfall-sim.js";

observeFigures();
initSectionNav();
initVideoEmbeds();
initGrainFields();
initIsroTimeline();
initMedmnistRouter();
initTrajectorySim();
initDownfallSim();
