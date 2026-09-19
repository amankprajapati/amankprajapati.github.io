// Entry point. Each module is independent and safe to run on any page.
import { observeFigures } from "./modules/figure-observer.js";
import { initSectionNav } from "./modules/section-nav.js";
import { initVideoEmbeds } from "./modules/video-embed.js";
import { initGrainFields } from "./modules/grain-fields.js";

observeFigures();
initSectionNav();
initVideoEmbeds();
initGrainFields();
