// "See the project" links: scroll to the entry and briefly highlight it, so it is obvious where the
// jump landed (a plain fragment jump scrolls silently and can look like nothing happened).
export function initJumpLinks(selector = 'a.jump[href^="#"]') {
  const flash = (target) => {
    target.classList.remove("landed");
    void target.offsetWidth;                       // restart the highlight if clicked again
    target.classList.add("landed");
  };

  document.querySelectorAll(selector).forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", a.getAttribute("href"));
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      flash(target);
    });
  });

  const fromUrl = location.hash && document.querySelector(location.hash);
  if (fromUrl && fromUrl.classList.contains("entry")) flash(fromUrl);
}
