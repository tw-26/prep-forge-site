// Header "Free Tools" dropdown. Opens on hover (mouse), click/tap and keyboard; closes on Escape,
// outside click, or focus leaving. No storage, no network. Without JS the CSS :hover/:focus-within fallback applies.
(() => {
  document.documentElement.classList.add("rb-nav-js");
  const root = document.querySelector("[data-rb-menu]");
  if (!root) return;
  const toggle = root.querySelector(".rb-menu-toggle");
  const OPEN_DELAY = 80;
  const CLOSE_DELAY = 350; // forgiving for imprecise pointers; the panel also stays hoverable
  let timer = 0;
  let pinned = false; // opened by click/keyboard, so mouse leave does not close it

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const set = (open) => {
    window.clearTimeout(timer);
    toggle.setAttribute("aria-expanded", String(open));
    if (!open) pinned = false;
  };
  const later = (open, delay) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => set(open), delay);
  };

  root.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse" && !isOpen()) later(true, OPEN_DELAY);
    else window.clearTimeout(timer);
  });
  root.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse" && !pinned) later(false, CLOSE_DELAY);
  });

  toggle.addEventListener("click", () => {
    if (isOpen() && !pinned) {
      pinned = true; // a click on a hover-opened menu keeps it open instead of flicking it shut
      return;
    }
    set(!isOpen());
    pinned = isOpen();
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      set(false);
      toggle.focus();
    }
  });
  root.addEventListener("focusout", (e) => {
    if (isOpen() && !root.contains(e.relatedTarget)) set(false);
  });
  document.addEventListener("pointerdown", (e) => {
    if (isOpen() && !root.contains(e.target)) set(false);
  });
})();
