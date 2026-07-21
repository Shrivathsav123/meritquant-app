# design-sync notes

## Repo shape
This is an application repo (`mq-vite`), not a published component library.
There is no library build (`package.json` has no `main`/`module`/`exports`,
and the `build` script produces the whole Vite app, not a `dist/` + `.d.ts`
entry). The converter runs in **synth-entry mode** (`[NO_DIST]`), reading
directly from `src/components`.

## Component scope (confirmed with user 2026-07-21)
Of 21 `.tsx` files under `src/components`, only 9 are prop-driven and render
standalone: `ScoreRing`, `Sparkline`, `GlassCard`, `PriceLadder`, `GateMatrix`,
`NarrativeAccordion`, `PositionCard`, `FilterPillRow`, `TimeFilterBar`.

The other 12 call `usePortfolioStore`/`useNewsStore` or a broker service
directly inside the component body (not via props), so they can't render as
controllable stories without a refactor to accept data via props. They're
excluded via `componentSrcMap: {<Name>: null}`: `AIChannel`, `ChartsChannel`,
`MacroGrid`, `MasterChart`, `SignalDetailModal`, `FloatingDock`,
`NewsTerminal`, `BentoMetricRow`, `HeroPanel`, `PortfolioChannel`,
`SignalCard`, `SignalsChannel`.

**Re-sync risk**: if any of these 12 are refactored to accept their data via
props (recommended), remove their `null` entry from `componentSrcMap` so
they get picked up on the next sync.

## Styling
`cfg.cssEntry` points at `.design-sync/.cache/compiled-tailwind.css`, a
Tailwind CLI compile of a trimmed copy of `src/index.css` (the `@fontsource`
`@import` lines removed — their inlined `@font-face` `url()`s point at
`./files/...` relative to the *original* fontsource package, which breaks
once inlined into a different output file). Regenerate before every rebuild,
using `.design-sync/.cache/tailwind.config.build.js` (NOT the repo's own
`tailwind.config.js` directly) — it extends the real config's `content` glob
with `.design-sync/previews/**/*.tsx`. Without this, any Tailwind utility
class used only inside an authored preview (never in `src/`) gets purged by
Tailwind's JIT content scan and silently renders unstyled (found via
`GlassCard`'s `Empty` story missing `h-24` — the box collapsed to a hairline
because `h-24` appears nowhere in `src/`).

```sh
npx tailwindcss -i .design-sync/.cache/tailwind-entry.css -o .design-sync/.cache/compiled-tailwind.css --config .design-sync/.cache/tailwind.config.build.js
```

Fonts instead come from `cfg.extraFonts`, pointed directly at the
`@fontsource/*` package CSS files (their `url()`s resolve correctly from
inside `node_modules`).

## Re-sync risks
- `tailwind.config.js` also defines a `system.amber` color (warnings) but no
  currently-synced component uses it, so Tailwind's JIT scan never emits
  `.text-system-amber`/`.bg-system-amber` into the compiled CSS — it's
  deliberately left out of `conventions.md` since an unshipped class would be
  a broken claim. If a future-synced component uses it, it'll appear in the
  build automatically and can be added back to the conventions doc.
- `conventions.md`'s font/color/`glass-surface`/`ease-out-expo` claims were
  verified against `ds-bundle/styles.css` + `_ds_bundle.css` at authoring
  time (2026-07-21) — re-verify against the fresh build on every re-sync
  before trusting it (the base skill's conventions step does this
  automatically).

## Known render warns
- `FilterPillRow` pills overflow the card's right edge in both stories. This
  is the component's own design (`overflow-x-auto` — a horizontally
  scrollable pill bar); the static capture shows its resting/unscrolled
  state, same as first paint in the real app on a narrow viewport. Not a
  preview defect.
- `[RENDER_THIN] Sparkline` — expected. Sparkline is a bare SVG polyline with
  no text by design; the thin-content heuristic can't distinguish that from
  a broken render. Confirmed correct visually (falling/rising line, correct
  bull/bear stroke color) in `_screenshots/shared__Sparkline.png`.
