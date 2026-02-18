# Miwa — Game Specification

## Overview

Miwa is a small single-level React + TypeScript browser game. The player must guide Miwa (a stubborn Shiba Inu) to the park by reaching 100% progress before time or stubbornness runs out.

## Goal

- Reach `100%` progress before `time` runs out or `stubbornness` reaches the maximum.

## Core concepts

- **Progress**: increases continuously when there is no active distraction; actions and power-ups can boost it.
- **Time**: game starts with a fixed number of seconds and ticks down; certain power-ups grant time.
- **Stubbornness**: increases when distractions occur or wrong actions are chosen; reaching the max causes game loss.
- **Status**: `playing`, `won`, or `lost`.

## Player actions

- `treat` — Offer a treat.
- `gentlePull` — Gentle pull on the lead.
- `letSniff` — Allow sniffing/socializing.
- `firmLead` — Firmly lead Miwa.

Players can also `encourage` Miwa (click the scene, press Space, or the Encourage button) to push progress when no distraction is active.

## Distractions

Distractions are random events that require a correct action to resolve. Current distractions (from `src/game/data/distractions.ts`):

- `refuse`: Miwa refuses to walk. (correctAction: `treat`)
- `cat`: Miwa chases a cat. (correctAction: `gentlePull`)
- `dog`: Miwa wants to socialize. (correctAction: `letSniff`)
- `direction`: Miwa picks a different direction. (correctAction: `firmLead`)

When a distraction is active:
- Passive stubbornness increases each tick.
- Player must choose the correct action to reduce stubbornness and gain progress; wrong actions increase stubbornness.

## Power-ups

Available power-ups (from `src/game/data/powerups.ts`):

- `treatBag`: reduces stubbornness.
- `speedBoost`: increases progress by a fixed amount.
- `timeBonus`: adds seconds to the clock.

Power-ups spawn ahead of the current progress and are picked up automatically once progress reaches their `progressAt` threshold.

## Game loop & state transitions

- Ticking: the game uses a `tickMs` interval (100ms by default) to drive the main loop.
- Each tick reduces time, may spawn distractions or power-ups, and updates progress or stubbornness.
- Actions handled by the reducer:
  - `tick` — core per-tick update
  - `encourage` — manual encouragement, boosts progress if no distraction
  - `chooseAction` — resolves an active distraction
  - `restart` — restarts the level

State and transitions are implemented in `src/game/lib/gameLoop.ts` and exposed via the `useMiwaGame` hook in `src/game/hooks/useMiwaGame.ts`.

## Tunable constants (from `src/game/config.ts`)

- `levelTarget`: 100 (goal progress)
- `maxStubbornness`: 100 (loss threshold)
- `startTime`: 60 (seconds)
- `startStubbornness`: 10
- `tickMs`: 100
- `baseMovePerSecond`: 3
- `distractionChancePerSecond`: 0.32
- `powerUpChancePerSecond`: 0.2
- `passiveStubbornnessPerSecond`: 9
- `blockedEncouragePenalty`: 4
- `encourageBoost`: 2
- `powerUpProgressBoost`: 10
- `powerUpTimeBonusSeconds`: 7
- `powerUpStubbornnessDrop`: 18
- `failedActionPenalty`: 8
- `successActionStubbornnessDrop`: 8
- `actionProgressBonus`: 4

These constants determine pacing and difficulty and are the recommended first place to tune the experience.

## UI & Components

- `src/game/hooks/useMiwaGame.ts` — hook exposing game state and actions to the UI.
- `src/game/lib/gameLoop.ts` — reducer, state model, and core game logic.
- `src/game/components/GameScene.tsx` — canvas renderer and input (click, Space) handling.
- `src/game/components/ActionControls.tsx` — UI buttons for `encourage`, the action list, and `restart`.
- `src/game/components/GameResult.tsx` — shows win/lose overlay.
- `src/game/lib/sceneRenderer.ts` and supporting `lib/*` — rendering, parallax, and visual effects.

## Data

- Distraction definitions: `src/game/data/distractions.ts` (texts and correct actions).
- Power-up definitions: `src/game/data/powerups.ts` (titles and pickup text).

## Controls

- Click the canvas or press `Space` to `encourage`.
- Use the action buttons to resolve distractions.

## Build & Run

Install and run with pnpm (project uses Vite):

```bash
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
pnpm preview
```

## Suggested tests & extensions

- Add unit tests for `gameReducer` behaviors (tick, encourage, chooseAction, power-up pickup).
- Add integration tests for `useMiwaGame` hooking into the reducer.
- Expose difficulty presets by varying `distractionChancePerSecond` and `passiveStubbornnessPerSecond`.
- Add analytics for action success/failure to tune difficulty.

---

Generated from code in the repository (checked: `src/game/*`).
