import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Mail,
  Github,
  Linkedin,
  FileDown,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
  Wrench,
  Layers,
  ExternalLink,
} from "lucide-react";

/**
 * Aman Portfolio – Single‑file React app
 * Requirements covered:
 * - Left vertical navbar centered on the page height
 * - Moving, pixel‑dithered background with mouse interaction
 * - Uses images (inline SVG placeholders) and resume details
 * - Clean, modern Tailwind UI
 * - Export‑friendly: one file, no external assets required
 */

// ---------- DATA (from resume) ----------
const DATA = {
  name: "Aman Kumar Prajapati",
  title: "B.Tech ECE @ IIIT Dharwad | Data & AI",
  location: "Dharwad, Karnataka, India",
  phone: "+91 8306711315",
  email: "22bec006@iiitdwd.ac.in",
  links: {
    github: "https://github.com/forcodingakp",
    linkedin: "https://www.linkedin.com/in/aman-kumar-prajapati/",
    resume: "Aman__CV.pdf", // put the PDF file next to the page when deploying
  },
  summary:
    "ML engineer and researcher with hands‑on work in satellite telemetry anomaly detection, RAG systems, CV for rail inspection, and real‑time health analytics. Strong track record of building end‑to‑end pipelines, optimizing latency/cost, and shipping usable tools.",
  education: [
    {
      school: "Indian Institute of Information Technology (IIIT) Dharwad",
      degree: "B.Tech in Electronics and Communication Engineering",
      meta: "CGPA: 9.42/10",
      period: "2022 – 2026",
      location: "Dharwad, Karnataka, India",
    },
    {
      school: "Indian Institute of Technology (IIT) Madras (Online)",
      degree: "Diploma in Data Science and Applications",
      period: "2024 – 2025",
    },
  ],
  experience: [
    {
      company: "U R Rao Satellite Centre, ISRO",
      role: "Research Intern",
      period: "May 2025 – Jun 2025",
      location: "Bengaluru, India",
      bullets: [
        "Built a physics‑informed autoencoder (PIAE) that embeds rigid‑body dynamics in the loss to denoise DTG angular‑rate telemetry and flag non‑physical spikes.",
        "Integrated PIAE with CRC to cut false alarms while preserving time‑to‑detection.",
        "Benchmarked LSTM/Transformer/Isolation Forest/OC‑SVM with standard Precision/Recall/F1 protocol.",
      ],
    },
    {
      company: "Strative.ai",
      role: "ML Engineer Intern",
      period: "Aug 2024 – Oct 2024",
      location: "Remote",
      bullets: [
        "Developed a blended RAG (dense + sparse) with hybrid queries; hit ~89% top‑10 on NQ, extended to TREC‑COVID and SQuAD with EM & nDCG@k.",
        "Used Ray on GKE for autoscaling bulk‑ingestion & multi‑search; cut ingestion/retrieval/eval time by ~80%.",
        "Stack: Python, LangChain, Llama 3, Elasticsearch, Milvus, RAGAS.",
      ],
    },
    {
      company: "L&T Technology Services",
      role: "ML Engineer Intern",
      period: "May 2024 – Jul 2024",
      location: "Bengaluru, India",
      bullets: [
        "Fine‑tuned YOLOv5 and RT‑DETR on US rail‑track data for crack detection; reached ~86% precision.",
        "Optimized compute time by ~68% via OpenMPI; deployed WireGuard for secure comms with 40+ devices.",
        "Stack: Python, OpenCV, PyTorch, CUDA, OpenVINO.",
      ],
    },
    {
      company: "Humors Tech (Health‑tech Startup)",
      role: "Research Intern",
      period: "Apr 2024 – Aug 2024",
      location: "Remote",
      bullets: [
        "Built RNN/LSTM models to classify lung health (Poor/Normal/Good) with ~92% F1.",
        "Developed a Flask dashboard for real‑time status and model insights; owned data processing.",
        "Tools: Python, Flask, Matplotlib, Pandas, scikit‑learn, Keras.",
      ],
    },
    {
      company: "Speech Processing Lab, IIIT Dharwad",
      role: "NLP Research Intern",
      period: "Aug 2023 – Nov 2023",
      location: "Dharwad, India",
      bullets: [
        "Built realtime En/Hi ↔ Kn translation on embedded hardware.",
        "Trained & quantized Transformer/RNN variants; best model ~87 BLEU.",
        "Owned the data pipeline end‑to‑end (collection → cleaning → splits).",
      ],
    },
  ],
  publication: {
    title:
      "Compress, Encode, Diagnose: PCA‑Enhanced Quantum Neural Networks for Breast Cancer Classification",
    venue: "IEEE RASSE 2025",
    status: "In review",
  },
  projects: [
    {
      name: "Autonomous Navigation on Indian Roads (ongoing)",
      bullets: [
        "Curating 120 km multimodal drive dataset (30 FPS + sensors).",
        "3D‑CNN + sensor‑transformer to forecast speed and lateral path.",
      ],
    },
    {
      name: "Multimodal LLM‑based Recommendation System",
      bullets: [
        "Fine‑tuned LLaVA on custom leaf‑disease image/text set → 90% accuracy.",
        "Deployed a chatbot resolving ~75% routine queries; reproducible, metric‑driven eval.",
      ],
    },
    {
      name: "AI‑Powered Smart Agriculture Platform",
      bullets: [
        "Drone + ESP32 + Raspberry Pi 4 for NDVI‑based crop health; +24% yield prediction accuracy.",
        "Edge LLM guidance → 30% less water usage & 40% lower latency; live Tailwind/JS dashboard.",
      ],
    },
  ],
  teaching: [
    {
      place:
        "Atal Innovation Lab, Mallasajjan English Medium School (Undergraduate TA)",
      period: "Oct 2023 – Nov 2024",
      bullets: [
        "Taught Arduino/ESP32, sensors, C/C++, Python, and circuits.",
        "Mentored robotics/IoT projects from schematic to demo; Fusion 360 basics & 3D printing.",
      ],
    },
  ],
  activities: [
    "VP – EPOCH (DS & AI Society)",
    "Head – IoT Group, IRIS Robotics Club",
    "VP – AccelAirate Club",
    "Core Member – Google DSC",
    "Guitarist – 440hz Band",
    "Cinematographer – Iridescence Film & Photography",
  ],
  awards: [
    "IASc–INSA–NASI Summer Research Fellow (2025)",
    "CHANAKYA Fellowship – TIH IoT, IIT Bombay (2024)",
    "Winner – Clash of Data Analysts, 48‑hr Hackathon (2023)",
    "Gold – National Science Olympiad (2015)",
  ],
  skills: {
    languages: ["Python", "C++", "MATLAB", "R", "SQL", "HTML/CSS"],
    frameworks: ["PyTorch", "TensorFlow"],
    tech: ["Linux", "Git", "Docker", "CUDA", "OpenVINO"],
    packages: [
      "NumPy",
      "Pandas",
      "SciPy",
      "OpenCV",
      "scikit‑learn",
      "Statsmodels",
      "Matplotlib",
    ],
    analytics: [
      "Regression",
      "Classification",
      "Clustering",
      "Neural Networks",
      "Data Analysis",
    ],
  },
  certs: [
    "Generative AI with Diffusion Models (NVIDIA, 2024)",
    "Deep Learning Foundation (Kaggle, 2024)",
    "Machine Learning Foundation (Kaggle, 2024)",
    "Google Cloud – Cloud Foundations & GenAI (2023)",
    "IIT Madras – Foundation in Programming & Data Science (2023)",
  ],
};

// ---------- UTIL ----------
const Section = ({ id, title, icon: Icon, children }) => (
  <section id={id} className="scroll-mt-24" aria-label={title}>
    <div className="mb-6 flex items-center gap-3">
      {Icon ? (
        <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-md">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs md:text-sm">
    {children}
  </span>
);

// Simple image placeholder (inline SVG) with pixel‑dither style
const ImgPlaceholder = ({ label = "", seed = 1 }) => {
  const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#6ee7b7'/>
          <stop offset='50%' stop-color='#60a5fa'/>
          <stop offset='100%' stop-color='#a78bfa'/>
        </linearGradient>
        <filter id='dith'>
          <feTurbulence type='fractalNoise' baseFrequency='0.${seed}' numOctaves='2' stitchTiles='stitch'/>
          <feColorMatrix values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7'/>
        </filter>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <rect width='100%' height='100%' filter='url(#dith)' opacity='0.35'/>
      <g font-family='monospace' font-size='20' fill='white' opacity='0.9'>
        <text x='20' y='40'>${label}</text>
      </g>
    </svg>`);
  const src = `data:image/svg+xml;charset=UTF-8,${svg}`;
  return (
    <img
      src={src}
      alt={label}
      className="h-40 w-full rounded-xl object-cover [image-rendering:pixelated]"
      draggable={false}
    />
  );
};

// ---------- BACKGROUND CANVAS with pixel‑dither effect ----------
const BackgroundCanvas = () => {
  const canvasRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });

    let raf;
    let t = 0;

    const resize = () => {
      const { innerWidth: W, innerHeight: H } = window;
      // Render at low resolution then scale up for a dithered/pixel look
      const scale = 14; // bigger → chunkier pixels
      canvas.width = Math.ceil(W / scale);
      canvas.height = Math.ceil(H / scale);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      canvas.style.imageRendering = "pixelated";
    };
    resize();

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const img = ctx.createImageData(w, h);
      const data = img.data;

      // Pointer in low‑res space
      const mx = pointer.x * w;
      const my = pointer.y * h;

      // Animate shimmering bands influenced by cursor distance
      const speed = 0.015;
      const freq = 0.09;
      const swirl = 0.012;

      let i = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = x - mx;
          const dy = y - my;
          const d = Math.hypot(dx, dy);
          // Wave + swirl field
          const angle = Math.atan2(dy, dx);
          const wave = Math.sin(d * freq - t * 2.5 + Math.cos(angle * 3) * 0.6);
          // Quantize to produce a soft dither/halftone vibe
          let v = (wave * 0.5 + 0.5) ** 1.1; // 0..1
          const levels = 6;
          v = Math.round(v * levels) / levels;
          const r = 80 + 80 * v;
          const g = 90 + 70 * (1 - v);
          const b = 110 + 50 * Math.sin(v * Math.PI);

          data[i++] = r; // R
          data[i++] = g; // G
          data[i++] = b; // B
          data[i++] = 255; // A
        }
      }
      ctx.putImageData(img, 0, 0);

      // Darken overlay for better text contrast
      ctx.globalAlpha = 0.38;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      t += speed;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    const onMove = (e) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const x = (e.clientX ?? (e.touches?.[0]?.clientX || 0)) / W;
      const y = (e.clientY ?? (e.touches?.[0]?.clientY || 0)) / H;
      setPointer({ x, y });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [pointer.x, pointer.y]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-50 block"
      aria-hidden="true"
    />
  );
};

// Subtle dotted overlay to enhance the dither vibe
const DitherOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 -z-40 opacity-25"
    style={{
      backgroundImage:
        "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1.2px)",
      backgroundSize: "6px 6px",
      mixBlendMode: "overlay",
    }}
  />
);

// A trailing cursor halo for extra interaction
const CursorHalo = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const move = (e) => {
      el.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 h-6 w-6 rounded-full bg-white/30 blur-[2px] transition-transform duration-75"
    />
  );
};

// ---------- LEFT NAV ----------
const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "teaching", label: "Teaching" },
  { id: "publication", label: "Publication" },
  { id: "awards", label: "Awards" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const LeftNav = () => {
  const [active, setActive] = useState("about");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:block">
      <nav className="flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-black/20 p-2 backdrop-blur-md shadow-xl">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`group relative rounded-xl px-3 py-2 text-xs font-medium transition hover:bg-white/10 ${
              active === s.id ? "bg-white/15" : "bg-transparent"
            }`}
            title={s.label}
          >
            <span className="text-white/90 group-hover:text-white">{s.label}</span>
            {active === s.id && (
              <span className="absolute -right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white" />
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
};

// ---------- MAIN APP ----------
export default function Portfolio() {
  return (
    <div className="min-h-screen text-white">
      <BackgroundCanvas />
      <DitherOverlay />
      <CursorHalo />
      <LeftNav />

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-white/20 bg-black/30 px-3 py-2 backdrop-blur-md shadow-xl md:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="whitespace-nowrap rounded-xl px-3 py-1 text-xs font-medium hover:bg-white/10"
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Content container */}
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10 md:pt-16">
        {/* HERO */}
        <header className="mb-10 rounded-3xl border border-white/20 bg-black/30 p-6 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col-reverse items-start gap-6 md:flex-row md:items-center">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                {DATA.name}
              </h1>
              <p className="mt-2 text-white/80">{DATA.title}</p>
              <p className="mt-4 max-w-2xl text-sm md:text-base text-white/80">
                {DATA.summary}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Pill>
                  <MapPin className="mr-2 h-4 w-4" /> {DATA.location}
                </Pill>
                <Pill>
                  <Mail className="mr-2 h-4 w-4" /> {DATA.email}
                </Pill>
                <Pill>{DATA.phone}</Pill>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={DATA.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={DATA.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
                >
                  <Github className="h-4 w-4" /> GitHub <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={DATA.links.resume}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
                >
                  <FileDown className="h-4 w-4" /> Download Resume
                </a>
              </div>
            </div>

            {/* hero image placeholder */}
            <div className="w-full md:w-[320px]">
              <ImgPlaceholder label="A K P" seed={37} />
            </div>
          </div>
        </header>

        {/* ABOUT */}
        <Section id="about" title="About" icon={BookOpen}>
          <p className="leading-relaxed text-white/90">
            I build practical AI systems: telemetry anomaly detection, retrieval‑augmented QA, real‑time perception, and
            health analytics. I enjoy the full lifecycle — from data and modeling to deployment and iteration — optimizing
            for accuracy, latency, and cost. Outside work: clubs, robotics, music, and film.
          </p>
        </Section>

        {/* EXPERIENCE */}
        <Section id="experience" title="Experience" icon={Briefcase}>
          <div className="grid gap-4 md:grid-cols-2">
            {DATA.experience.map((e, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md shadow-xl"
              >
                <ImgPlaceholder label={e.company} seed={idx + 1} />
                <h3 className="mt-3 text-lg font-semibold">{e.role}</h3>
                <p className="text-sm text-white/80">
                  {e.company} · {e.period}
                </p>
                <p className="text-xs text-white/60">{e.location}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {e.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        {/* PROJECTS */}
        <Section id="projects" title="Projects" icon={Layers}>
          <div className="grid gap-4 md:grid-cols-3">
            {DATA.projects.map((p, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md shadow-xl"
              >
                <ImgPlaceholder label={p.name} seed={idx + 11} />
                <h3 className="mt-3 text-base font-semibold">{p.name}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {p.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        {/* EDUCATION */}
        <Section id="education" title="Education" icon={GraduationCap}>
          <div className="grid gap-4 md:grid-cols-2">
            {DATA.education.map((ed, idx) => (
              <div key={idx} className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md">
                <h3 className="text-lg font-semibold">{ed.school}</h3>
                <p className="text-sm text-white/80">{ed.degree}</p>
                {ed.meta ? <p className="text-sm text-white/70">{ed.meta}</p> : null}
                <p className="text-xs text-white/60">{ed.period}</p>
                {ed.location ? (
                  <p className="text-xs text-white/60">{ed.location}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Section>

        {/* TEACHING */}
        <Section id="teaching" title="Teaching" icon={BookOpen}>
          {DATA.teaching.map((t, idx) => (
            <div key={idx} className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md">
              <h3 className="text-base font-semibold">{t.place}</h3>
              <p className="text-xs text-white/60">{t.period}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {t.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        {/* PUBLICATION */}
        <Section id="publication" title="Publication" icon={BookOpen}>
          <div className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md">
            <p className="text-sm">
              <span className="font-semibold">{DATA.publication.title}</span> — {DATA.publication.venue} ({DATA.publication.status})
            </p>
          </div>
        </Section>

        {/* AWARDS */}
        <Section id="awards" title="Awards & Fellowships" icon={Award}>
          <ul className="grid gap-2 md:grid-cols-2">
            {DATA.awards.map((a, i) => (
              <li
                key={i}
                className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm backdrop-blur-md"
              >
                {a}
              </li>
            ))}
          </ul>
        </Section>

        {/* SKILLS */}
        <Section id="skills" title="Skills" icon={Wrench}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md">
              <h4 className="mb-2 font-semibold">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {DATA.skills.languages.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>
              <h4 className="mb-2 mt-4 font-semibold">Frameworks</h4>
              <div className="flex flex-wrap gap-2">
                {DATA.skills.frameworks.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>
              <h4 className="mb-2 mt-4 font-semibold">Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {DATA.skills.tech.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md">
              <h4 className="mb-2 font-semibold">Python/ML Packages</h4>
              <div className="flex flex-wrap gap-2">
                {DATA.skills.packages.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>
              <h4 className="mb-2 mt-4 font-semibold">Analytical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {DATA.skills.analytics.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>
              <h4 className="mb-2 mt-4 font-semibold">Certifications</h4>
              <ul className="list-disc pl-5 text-sm text-white/90">
                {DATA.certs.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* CONTACT */}
        <Section id="contact" title="Contact" icon={Mail}>
          <div className="rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md">
            <p className="text-sm md:text-base">
              Open to internships and collaborations in ML, CV, and data platforms.
              Reach me at <a className="underline" href={`mailto:${DATA.email}`}>{DATA.email}</a> or on
              <a className="underline ml-1" href={DATA.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>.
            </p>
          </div>
        </Section>

        {/* FOOTER */}
        <footer className="mt-10 flex items-center justify-between text-xs text-white/70">
          <span>© {new Date().getFullYear()} {DATA.name}</span>
          <span>Built with React & Tailwind • Background: pixel‑dither shader</span>
        </footer>
      </main>
    </div>
  );
}
