// Header "Free Tools" dropdown, shared by the generated tool pages and the Rankbound landing page.
// Disclosure pattern (button + aria-expanded), not role="menu", per the WAI-ARIA Authoring Practices.
// Franchise names stay off every page but the editorial one, so each item uses its neutral label.
import { esc } from "../../assets/rankbound/tools/render.js";
import { PAGES_BY_SLUG } from "./pages.mjs";

const GROUPS = [
  { label: "Plan a workout", slugs: ["workout-generator", "push-up-calculator"] },
  { label: "Workouts", slugs: ["30-day-calisthenics-challenge", "no-equipment-workout", "15-minute-workout", "anime-workout"] },
  { label: "Guides", slugs: ["one-punch-man-workout"] }
];

/** @param {string} [currentPath] path of the page being rendered, to mark aria-current */
export function toolsMenuHtml(currentPath = "") {
  const groups = GROUPS.map(({ label, slugs }) => {
    const items = slugs
      .map((slug) => {
        const page = PAGES_BY_SLUG.get(slug);
        if (!page) throw new Error(`menu: unknown page ${slug}`);
        const current = page.path === currentPath ? ' aria-current="page"' : "";
        return `<li><a href="${page.path}"${current}>${esc(page.cardLabel ?? page.navLabel)}</a></li>`;
      })
      .join("");
    return `<li class="rb-menu-group"><span class="rb-menu-label">${esc(label)}</span><ul>${items}</ul></li>`;
  }).join("");
  return `<div class="rb-menu" data-rb-menu>
            <button class="rb-header-link rb-menu-toggle" type="button" aria-expanded="false" aria-controls="rb-tools-menu">Free Tools<svg class="rb-menu-caret" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <nav class="rb-menu-panel" id="rb-tools-menu" aria-label="Free tools"><ul>${groups}</ul></nav>
          </div>`;
}
