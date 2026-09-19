// Runs figure animations only while the figure is on screen.
// CSS pauses every `.anim` element until its figure has the `run` class.
export function observeFigures(selector = "[data-fig]") {
  const figures = document.querySelectorAll(selector);
  if (!("IntersectionObserver" in window)) {
    figures.forEach((fig) => fig.classList.add("run"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle("run", e.isIntersecting)),
    { rootMargin: "80px 0px", threshold: 0.12 },
  );
  figures.forEach((fig) => observer.observe(fig));
}
