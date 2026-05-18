# Life Chart App — Background Design Brief

## What this app is
A mystical life/astrology chart web app built in React (single file). It has two modes:
- **Night mode** — deep cosmic dark (near-black with purple/indigo tones, gold accents)
- **Day mode** — warm cream/amber (parchment tones, muted gold accents)

The user can toggle between modes. The central content is a grid of playing cards with readings. The visual tone is sacred, mystical, contemplative — like an ancient oracle meets modern design.

---

## What's there now (keep these)
- **Gradient background** — three-stop linear gradient from the CSS variables `--bg1 → --bg2 → --bg3`
- **Atmospheric orb** — subtle radial glow behind the center content (CSS `::before`)
- **Bottom beam** — a narrow tapered light pillar rising from the bottom (CSS `::after`)
- **Constellations** — four slowly drifting SVG star patterns (Cassiopeia, Big Dipper, Scorpius, Leo) visible only at night
- **Particles** — 18 small glowing dots floating gently, gold in day, purple in night
- **Light rays** — three top-down and two bottom-up thin beams pulsing gently

---

## Color palette

### Night mode
```
Background: #04030f → #0a0820 → #160830 (deep black-indigo)
Gold accent: #F4C842
Text: #e8dcc8 (warm cream)
Border: rgba(244,200,66,0.18)
Orb: rgba(140,80,255,0.13) (purple)
```

### Day mode
```
Background: #fdf8ef → #faefd8 → #f5e8c8 (warm parchment)
Gold accent: #D4A820
Text: #2a1e08 (dark brown)
Border: rgba(212,168,32,0.24)
Orb: rgba(255,180,40,0.12) (amber)
```

---

## What was removed (needs to be replaced)
The old decorative layer used emoji elements positioned around the screen edges. These have been cleared and need to be redesigned with something more intentional:

### Night — old elements (now gone)
- 🌳 Spectral colored trees (6 left, 6 right, swaying)
- 🦊 Foxes at bottom corners
- 🦌 Deer mid-left
- 🌸🪷🌺 Flowers at bottom sides
- 💎 Crystal bottom-right
- 🐋 Glowing manta ray floating above header
- 🪐🌕 Planets top corners
- ✦ Glowing star symbols scattered near top

### Day — old elements (now gone)
- 🌻 Sunflowers along bottom edges
- 🌼🌸 Small flowers mid-bottom
- 🦋 Butterflies mid-left
- 🌿🍃 Leaves on sides
- ☀️ Sun at top center

---

## The design slot in the code
Background elements are fixed-position divs rendered at the top of the component, before the main content. They all use `pointer-events: none; z-index: 0` so they never block interaction.

The CSS lives in a `<style>` tag inside the component. The pattern is:
```css
/* Night elements */
.night .my-element { position: fixed; top: X%; left: Y%; ... animation: ...; }
/* Day elements */
.day  .my-element  { position: fixed; ... }
/* Hide opposites */
.day  .my-element  { opacity: 0; }
.night .my-day-element { opacity: 0; }
```

Available keyframes already in the code:
- `pulse` — gentle opacity pulse (5s)
- `rayshine` — brighter opacity pulse (7s)  
- `floatup` — float upward and scale up (4-9s)
- `ctwink` — star twinkle (3-5s)
- `cdrift1-4` — slow drift/rotation (50-65s)
- `planetglow` — blue glow pulse for symbol elements

---

## Design direction request
Looking for something that feels **sacred and atmospheric** rather than cute/emoji-based. Ideas to explore:

- **Night**: perhaps geometric sacred geometry patterns, soft nebula-like gradients, subtle mandala elements, moon phases, celestial symbols — things that feel ancient and cosmic
- **Day**: perhaps golden ratio spirals, sunrise light beams, soft botanical line art, sun symbols — warm and grounded

The existing constellations, particles, and light rays set a good base — the new elements should complement that existing atmosphere.

The app is ~1500 lines in `/Users/bryan_gallagher/life-chart-app/src/App.jsx`. Background JSX goes after `<Constellations />` around line 1333. Background CSS goes in the style block around lines 998–1104 (currently empty/cleared).
