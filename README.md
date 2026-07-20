# The Chronicle of the Third War

The full story of **Warcraft III** (Reign of Chaos + The Frozen Throne), typeset as one
continuous illuminated manuscript — with a live RTS skirmish waged directly on top of the
page. Your keep holds the lower-left corner of the screen; the Black Necropolis festers at
the upper-right and sends escalating waves against you. Every soldier, projectile, and
death-blast physically shoves the words of the chronicle aside as the war moves across
the text, and the letters spring back like reeds.

And the book reads itself aloud. **The Chronicler** — an audiobook narrator built on the
browser's own speech engine — tells the tale in a low, stately voice while each spoken
word kindles gold on the page, a lamplight glow travels with the telling, and the page
**turns itself in 3D** whenever the voice reads past the foot of the folio. Command your
army while the story of the war is read over the battle.

**[▶ Play it now →](https://third-war-chronicle.vercel.app/)**

Built around [pretext](https://github.com/chenglou/pretext), chenglou's pure-arithmetic
text measurement & layout engine.

![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)
![No framework](https://img.shields.io/badge/framework-none-2b2015)
![Deployed on Vercel](https://img.shields.io/badge/deployed-Vercel-000000?logo=vercel&logoColor=white)
![License: MIT](https://img.shields.io/badge/license-MIT-9a7423)

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
| `N` | the Chronicler reads aloud (play / pause) |

Gold accrues over time. The Scourge's waves grow with every assault it loses.

## The Chronicler (audio narration)

Begin with **“let the Chronicler speak”** (or press `N` any time) and the chronicle is
read to you like an audiobook while you play:

- **No assets, no keys, no server** — narration uses the Web Speech API built into the
  browser. The narrator picks the most chronicler-like voice available (deep, en-GB
  where possible) and reads at a low pitch and stately pace; hover the lectern in the
  top-left to choose a different voice or cadence, or skip between chapters.
- **Word-perfect highlighting** — the engine's word-boundary events are mapped back
  through the pretext layout to the exact word particle on the canvas, which kindles
  gold as it is spoken and fades back to ink behind the voice. A soft lamplight glow
  follows the reading down the page.
- **The page turns itself** — when the spoken word walks off the open page, the live
  canvas is photographed and flipped over in 3D like a leaf of the codex (spine at the
  screen's edge, ink ghosting through the back of the sheet) while the scroll lands on
  the next passage beneath it. Scroll away mid-telling and a *“Return to the telling”*
  pill flips you back. `prefers-reduced-motion` swaps the flip for a smooth scroll.
- **Never stalls** — browsers without boundary events (or without any voice at all)
  fall back to a reading-pace estimator, so the highlight and the page-turns carry on
  silently and the telling never wedges.

## Play

Visit **[third-war-chronicle.vercel.app](https://third-war-chronicle.vercel.app/)** — no installation needed.

## Develop

```sh
npm install
npm run dev     # localhost:5173 dev server (Node 18+)
npm run build   # type-check + production build → dist/
```

## How it fits together

```
 pretext            typeset.ts          game.ts
 (layout)   ──▶  words as particles ◀──  units / projectiles / blasts
                        │                      │  push forces
                        ▼                      ▼
                    render.ts  ──▶  one <canvas>: parchment + ink armies
                        ▲
        main.ts loop ───┘   (scroll = camera · spacer div = scrollbar)
```

Each frame: step the war → collect every unit/projectile/blast/cursor as a push
force → integrate the visible words' spring physics → draw the whole page and the
battle in a single canvas pass. Only words inside the viewport are simulated or
drawn (binary-searched against pretext's measured line positions).

## Structure

- `src/story.ts` — the chronicle itself (original retelling, prologue → epilogue)
- `src/typeset.ts` — pretext layout: chapters → lines → word particles; drop caps,
  justification, virtualization, spring physics, narration segments
- `src/game.ts` — units, bases, combat, projectiles, gold, Scourge wave AI
- `src/render.ts` — one-canvas renderer: manuscript page + ink-blob armies + the
  Chronicler's karaoke glow and lamplight
- `src/narration.ts` — the Chronicler: Web Speech narration, word-boundary sync,
  reading-pace estimator, page-flip cues
- `src/pageflip.ts` — the 3D page-turn (canvas snapshot flipped like a codex leaf)
- `src/chronicler.ts` — the lectern dock: play/pause, chapter skips, voice & cadence
- `src/input.ts` / `src/hud.ts` / `src/main.ts` — RTS controls, war-council UI, boot + loop

## Tech stack

- **[pretext](https://github.com/chenglou/pretext)** — text measurement & line layout (the core dependency)
- **TypeScript**, no UI framework — a single `<canvas>` and a hand-written rAF loop
- **Vite** for dev/build; deployed to **Vercel**
- Typefaces: *UnifrakturMaguntia* (blackletter), *IM Fell English* (body), *Cinzel* (small caps)

## Deployment

Hosted on **Vercel** (auto-detected Vite project). Deploy from the repo root with:

```sh
vercel --prod
```

## Credits & disclaimer

This is a non-commercial **fan project**. *Warcraft III*, its story, characters, and
setting are trademarks and copyright of **Blizzard Entertainment**. The prose here is
an original retelling written for this project and is not affiliated with, endorsed by,
or sponsored by Blizzard. Text layout by [pretext](https://github.com/chenglou/pretext)
(© chenglou, MIT).

## License

[MIT](LICENSE) — applies to this project's own code. Trademarks and the underlying
*Warcraft* IP remain with their respective owners.
