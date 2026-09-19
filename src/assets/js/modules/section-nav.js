// Highlights the section in the left rail that is currently being read.
// The last section is also marked when the page is scrolled to the bottom,
// since short final sections can never reach the reading line.
export function initSectionNav(selector = "nav.rail a") {
  const links = [...document.querySelectorAll(selector)];
  if (!links.length) return;
  const targets = links.map((a) => document.querySelector(a.getAttribute("href")));

  const mark = () => {
    const readingLine = window.scrollY + Math.max(140, window.innerHeight * 0.35);
    let active = 0;
    targets.forEach((t, i) => {
      if (t && t.offsetTop <= readingLine) active = i;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) active = links.length - 1;
    links.forEach((a, i) => a.classList.toggle("active", i === active));
  };

  window.addEventListener("scroll", mark, { passive: true });
  window.addEventListener("resize", mark);
  mark();
}
