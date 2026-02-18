# Miwa

A simple TypeScript + React web game prototype.

## Run

```bash
pnpm install
pnpm dev
```

## Current gameplay

- Level 1: take Miwa (a playful, stubborn Shiba Inu) to the park.
- Goal: reach 100% progress before time runs out.
- Challenges: random distractions like refusing to walk, chasing a cat, and pulling in another direction.
- Includes a stylized 2D canvas scene with continuous movement, parallax layers, ambient particles, improved character shading, random distractions, and random power-ups.

## Structure

```text
src/
  app/                # App shell and composition
  game/
    components/       # Presentational game UI
    config.ts         # Tunable game rules
    data/             # Level text and labels
    hooks/            # State + gameplay transitions
    lib/              # Small helpers
    styles/           # Game-specific styles
    types.ts          # Domain types
  styles/
    global.css        # Global/reset styles
```
