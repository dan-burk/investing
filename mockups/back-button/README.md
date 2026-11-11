# Back-to-home button mockup: Stocks vs. Metals

A "← Home" button that takes people from Stocks vs. Metals back to the portfolio at danielburkhalter.dev.

**Live mockup (private Claude artifact):** https://claude.ai/artifact/Y2nn4Cv74aNJxH8FbMtvZB

## Status

Mocked up on November 11, 2026. **Not implemented.** We decided not to ship it for now; this folder keeps the mockup so it can be picked up later.

## What we decided

- **Label:** "← Home" (arrow icon plus the word Home).
- **Goes to:** https://danielburkhalter.dev/ in the **same tab**. The portfolio already opens every app in a new tab, so the portfolio stays open in the earlier tab; ending up with two portfolio tabs is fine.
- **Desktop:** pinned **32px from the left edge of the window**, level with the app's top row, so it sits clearly apart from the content.
- **Phone:** no margin to use, so it changes shape (see below).
- **Look:** 32px tall, using the app's own font and button colors so it reads as part of the app.
- **Scope:** Bank Check, CDL Prep, US Coin Value, Stocks vs. Metals (investing), Math Scribe and SD XC. Not Agent Sessions (claude-gui demo) and not Dairy Translate.

## Files

- `index.html`: the mockup. Open it in a browser. It's self-contained: real screenshots of the live app (taken November 11, 2026) with a working button placed on top, shown at desktop size, at actual size, and on a 390px phone.

## Placement in Stocks vs. Metals

- **Desktop:** 32px from the left edge of the window, level with the "Stocks vs. Metals" title.
- **Phone:** gets its own row above the title, lined up with the content's left edge.
- **In between:** the content's left edge is `(window width - 960) / 2 + 16`. Keep the pinned version only for windows **1232px or wider**; below that, use the phone layout.

## How to build it

Plain HTML/CSS in `index.html`. Uses the page's existing tokens (`--soft`, `--muted`, `--fg`, `--line`).

```html
<!-- first thing inside <body> -->
<a class="home-link" href="https://danielburkhalter.dev/" aria-label="Back to danielburkhalter.dev">
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
  <span>Home</span>
</a>
```

```css
.home-link {
  position: absolute; left: 32px; top: 64px;   /* centers it on the title (y = 80) */
  display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 12px 0 9px; border-radius: 10px;
  background: var(--soft); color: var(--muted);
  font-family: inherit; font-size: 14px; font-weight: 500; text-decoration: none;
}
.home-link:hover { color: var(--fg); background: var(--line); }
@media (max-width: 1231px) {
  .home-link { position: static; margin: 14px 0 0 16px; }
}
```
