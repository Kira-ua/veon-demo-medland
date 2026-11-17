// Mobile menu (native popover), mobile contact bar visibility, active nav item.
const menu = document.getElementById("mobile-menu") as (HTMLElement & { hidePopover?: () => void }) | null;
for (const a of document.querySelectorAll<HTMLAnchorElement>("[data-menu-link]")) {
  a.addEventListener("click", () => menu?.hidePopover?.());
}

// Contact bar: shown after the first screen, hidden while #kontakty is on screen.
const bar = document.querySelector<HTMLElement>("[data-mbar]");
const hero = document.getElementById("hero");
const kontakty = document.getElementById("kontakty");
if (bar && hero && kontakty && "IntersectionObserver" in window) {
  let pastHero = false;
  let atContacts = false;
  const update = () => bar.classList.toggle("is-shown", pastHero && !atContacts);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; update(); }, { rootMargin: "-40% 0px 0px 0px" }).observe(hero);
  new IntersectionObserver(([e]) => { atContacts = e.isIntersecting; update(); }).observe(kontakty);
} else if (bar) {
  bar.classList.add("is-shown");
}

// Active anchor in the header.
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav]"));
const sections = links.map((l) => document.querySelector<HTMLElement>(l.getAttribute("href") ?? "")).filter((s): s is HTMLElement => !!s);
if ("IntersectionObserver" in window && sections.length) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      for (const l of links) {
        const on = l.getAttribute("href") === `#${e.target.id}`;
        l.classList.toggle("is-active", on);
        if (on) l.setAttribute("aria-current", "location"); else l.removeAttribute("aria-current");
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
}
