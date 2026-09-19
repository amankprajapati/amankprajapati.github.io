// Click-to-play video cards. The external player is only loaded on click,
// so the page does not pay for iframes nobody watches.
export function initVideoEmbeds(selector = ".vcard .vstill[data-src]") {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.src = button.dataset.src;
      frame.allow = "autoplay; fullscreen";
      frame.allowFullscreen = true;
      frame.title = button.getAttribute("aria-label") || "Video";
      button.replaceWith(frame);
    });
  });
}
