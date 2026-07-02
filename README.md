# The Chronicle of the Third War

The full story of **Warcraft III** (Reign of Chaos + The Frozen Throne), typeset as one
continuous illuminated manuscript — with a live RTS skirmish waged directly on top of the
page. Your keep holds the lower-left corner of the screen; the Black Necropolis festers at
the upper-right and sends escalating waves against you. Every soldier, projectile, and
death-blast physically shoves the words of the chronicle aside as the war moves across
the text, and the letters spring back like reeds.

Built around [pretext](https://github.com/chenglou/pretext), chenglou's pure-arithmetic
text measurement & layout engine.

## Why pretext

Canvas has no multiline text. pretext *is* the text engine here:

- `prepareWithSegments` + `layoutNextLine` lay out the entire ~6,000-word chronicle into
  lines with **zero DOM measurement and zero reflow** — pure arithmetic.
- Illuminated **drop caps** are done with per-line variable widths (the first three lines
  of each chapter get a narrower band), something CSS can't express without float hacks.
- The measured document height drives native scrolling (a spacer div) and **virtualization**
  — only visible words are simulated and drawn.
- Because layout is data, every word becomes a **spring-damper particle**: rest position
  from pretext, displacement from the war. The whole pipeline (game sim + word physics +
  full render) runs in **under 1 ms/frame**.

## Controls

| Input | Action |
| --- | --- |
| Scroll | read the chronicle (the camera *is* the page) |
| Left-drag | marquee-select soldiers |
| Left-click | select one soldier (Shift adds) |
| Right-click | attack-move; right-click an enemy or the necropolis to focus it |
| `1` / `2` / `3` | train Footman (50g) / Archer (75g) / Knight (140g) |
| `F` | select the whole army · `Esc` deselect |

Gold accrues over time. The Scourge's waves grow with every assault it loses.

## Run

```sh
npm install
npm run dev     # vite dev server (Node 18+)
npm run build   # type-check + production build
```

## Structure

- `src/story.ts` — the chronicle itself (original retelling, prologue → epilogue)
- `src/typeset.ts` — pretext layout: chapters → lines → word particles; drop caps,
  justification, virtualization, spring physics
- `src/game.ts` — units, bases, combat, projectiles, gold, Scourge wave AI
- `src/render.ts` — one-canvas renderer: manuscript page + ink-blob armies
- `src/input.ts` / `src/hud.ts` / `src/main.ts` — RTS controls, war-council UI, boot + loop
