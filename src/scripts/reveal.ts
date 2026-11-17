// Motion: the shelf settles in on wide screens; index rows of #napryamy appear once on scroll (data-reveal).
// Content stays visible without JS and with reduced motion. Anything the reader has scrolled past is revealed too,
// so a jump to an anchor (or a fast scroll) never leaves hidden rows behind.
const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const phone = window.matchMedia("(max-width: 959px)").matches;
const show = (el: Element) => el.classList.add("is-visible");

if (reduce || !("IntersectionObserver" in window)) {
  items.forEach(show);
} else {
  if (phone) items.forEach((el) => { el.style.setProperty("--reveal-delay", "0ms"); if (el.dataset.reveal === "desktop") show(el); });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting || e.boundingClientRect.top < 0) { show(e.target); io.unobserve(e.target); }
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  items.forEach((el) => io.observe(el));
  let ticking = false;
  const sweep = () => {
    ticking = false;
    const limit = window.innerHeight;
    for (const el of items) if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < limit) { show(el); io.unobserve(el); }
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } }, { passive: true });
}
