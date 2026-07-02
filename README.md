# The Chronicle of the Third War

The full story of **Warcraft III** (Reign of Chaos + The Frozen Throne), typeset as one
continuous illuminated manuscript — with a live RTS skirmish waged directly on top of the
page. Your keep holds the lower-left corner of the screen; the Black Necropolis festers at
the upper-right and sends escalating waves against you. Every soldier, projectile, and
death-blast physically shoves the words of the chronicle aside as the war moves across
the text, and the letters spring back like reeds.

**[▶ Play it now →](https://kevinrufino.github.io/third-war-chronicle/)**

Built around [pretext](https://github.com/chenglou/pretext), chenglou's pure-arithmetic
text measurement & layout engine.

![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)
![No framework](https://img.shields.io/badge/framework-none-2b2015)
![Deploy](https://github.com/kevinrufino/third-war-chronicle/actions/workflows/deploy.yml/badge.svg)
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

Gold accrues over time. The Scourge's waves grow with every assault it loses.

## Play

Visit **[kevinrufino.github.io/third-war-chronicle](https://kevinrufino.github.io/third-war-chronicle/)** — no installation needed.

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
  justification, virtualization, spring physics
- `src/game.ts` — units, bases, combat, projectiles, gold, Scourge wave AI
- `src/render.ts` — one-canvas renderer: manuscript page + ink-blob armies
- `src/input.ts` / `src/hud.ts` / `src/main.ts` — RTS controls, war-council UI, boot + loop

## Tech stack

- **[pretext](https://github.com/chenglou/pretext)** — text measurement & line layout (the core dependency)
- **TypeScript**, no UI framework — a single `<canvas>` and a hand-written rAF loop
- **Vite** for dev/build; deployed to **GitHub Pages** via GitHub Actions on every push to `main`
- Typefaces: *UnifrakturMaguntia* (blackletter), *IM Fell English* (body), *Cinzel* (small caps)

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds with Node 20 and publishes `dist/` to GitHub Pages. No manual step.

## Credits & disclaimer

This is a non-commercial **fan project**. *Warcraft III*, its story, characters, and
setting are trademarks and copyright of **Blizzard Entertainment**. The prose here is
an original retelling written for this project and is not affiliated with, endorsed by,
or sponsored by Blizzard. Text layout by [pretext](https://github.com/chenglou/pretext)
(© chenglou, MIT).

## License

[MIT](LICENSE) — applies to this project's own code. Trademarks and the underlying
*Warcraft* IP remain with their respective owners.
