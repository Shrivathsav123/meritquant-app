## Dark canvas by default — no wrapper needed

This system has no root provider. `styles.css` (already in your bound copies) carries a
global rule that paints the page itself:

```css
html { background: #020205 /* void-base */; color: #fff; }
body { font-family: 'Plus Jakarta Sans', Inter, sans-serif /* font-interface */; }
```

Once `styles.css` is imported, every page is dark by construction — do not add a
light-background container or an explicit dark-mode wrapper around these components.
Build ON the dark canvas, not against it: pick text/border colors assuming a near-black
background everywhere, including empty states.

## Styling idiom: Tailwind utilities, a fixed color + type vocabulary

There are no CSS-in-JS props and no theme object — everything is Tailwind utility
classes, restricted to this system's own palette and two font stacks. Use these names
verbatim; inventing new colors or falling back to default Tailwind grays/blues breaks
the brand.

**Colors** (`tailwind.config.js` `theme.extend.colors`):

| Token | Use |
|---|---|
| `void-base`, `void-surface`, `void-surfaceMuted` | page bg, card bg, muted panel bg — the only backgrounds |
| `catalyst`, `catalyst-glow`, `catalyst-light` | brand accent (purple) — active/selected states, primary actions |
| `bull`, `bull-glow`, `bull-text` | gains, positive deltas, "passed" states (green) |
| `bear`, `bear-glow`, `bear-text` | losses, negative deltas, "failed" states (red/pink) |
| `system-slate`, `system-slateMuted` | secondary/muted text, hairline borders |

**Fonts**: `font-telemetry` (Geist Mono / JetBrains Mono) for anything numeric —
prices, tickers, percentages, scores. `font-interface` (Plus Jakarta Sans / Inter) for
labels, body copy, and UI chrome. Numbers in this system are always monospace; never
render a price or ticker in `font-interface`.

**Card surface**: the `.glass-surface` utility (defined in `styles.css`'s `@layer
components`) is the standard card treatment — semi-transparent `void-surface`
background, `backdrop-blur-xl`, a hairline white border, and an inset highlight. Reach
for it (or the bound `GlassCard` component, which applies it plus `rounded-3xl`) for
any card-like container instead of hand-rolling a background+border combination.

**Motion**: the custom `ease-out-expo` timing function
(`cubic-bezier(0.16, 1, 0.3, 1)`) is this system's standard easing for
transitions/transforms — use it instead of Tailwind's default eases.

## Where the truth lives

- `styles.css` at the bundle root — read it (and its `@import`ed
  `_ds_bundle.css`) before styling anything by hand; it's the actual compiled
  Tailwind output plus every `@font-face`.
- Each component's `<Name>.prompt.md` and `<Name>.d.ts` — the real prop contract.

## Idiomatic composition example

A metric readout built the way this system's own components are built — dark
glass card, monospace figure, signed color:

```tsx
import { GlassCard } from 'meritquant-app-ui';

function DailyPnlCard({ valueUsd }: { valueUsd: number }) {
  const up = valueUsd >= 0;
  return (
    <GlassCard className="w-72 p-5">
      <p className="font-interface text-[10px] uppercase tracking-widest text-system-slate">
        Daily P&amp;L
      </p>
      <p className={`mt-1 font-telemetry text-2xl font-bold ${up ? 'text-bull' : 'text-bear'}`}>
        {up ? '+' : '-'}${Math.abs(valueUsd).toLocaleString()}
      </p>
    </GlassCard>
  );
}
```
