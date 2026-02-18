# Miwa Game Specification

## Scope
- Product: single-level browser game ("Level 1: Take Miwa to the park")
- Stack: React + TypeScript + Canvas 2D
- Entry point: `src/main.tsx` -> `src/app/App.tsx`

## Core Objective
- Win by reaching `100%` progress before losing conditions trigger.
- Lose if either:
  - Timer reaches `0`
  - Stubbornness reaches `100`

## Game State Model
- `progress` (0..100+ internally, clamped for display)
- `timeLeftMs` (starts at `60000`)
- `stubbornness` (starts at `10`, max `100`)
- `status`: `playing | won | lost`
- `activeDistraction`: nullable event blocking passive movement
- `activePowerUp`: nullable collectible defined by `id` + `progressAt`
- `log`: latest gameplay message

## Timing and Tick System
- Tick interval: every `100ms` while status is `playing`.
- Per tick:
  - Decrease time by `100ms`
  - Attempt distraction spawn (if none active)
  - Attempt power-up spawn (if none active and far enough from goal)
  - Resolve movement/stubbornness depending on distraction state
  - Resolve power-up pickup if player position reached pickup point
  - Re-evaluate win/loss

### Probabilistic Spawns
- Spawn checks use conversion from per-second rate to per-tick chance:
  - `chance = 1 - (1 - rate) ^ tickSeconds`
- Configured rates:
  - Distraction: `0.32` per second
  - Power-up: `0.20` per second

## Movement and Progress Rules
- Passive movement (no active distraction): `+3 progress/sec` (`+0.3` per tick)
- Encourage action (no active distraction): `+2 progress` instant
- Correct distraction action: `+4 progress` instant
- Power-up `speedBoost`: `+10 progress` instant on pickup
- Progress is clamped to `levelTarget = 100`
- UI percent display rounds progress and caps at `100`

## Stubbornness Rules
- Passive stubbornness gain during active distraction: `+9/sec`
- Encourage during active distraction (blocked encourage): `+4`
- Incorrect distraction action: `+8`
- Correct distraction action: `-8` (floored at `0`)
- `treatBag` pickup: `-18` (floored at `0`)
- Lose immediately when stubbornness `>= 100`

## Timer Rules
- Start: `60s`
- Countdown: every tick
- `timeBonus` pickup: `+7s`
- Lose immediately when time `<= 0`
- UI time display: `ceil(ms/1000)` and floor at `0`

## Distraction System
- Only one distraction can be active at a time.
- While active:
  - Passive forward movement is blocked.
  - Correct response clears distraction.
- Distraction catalog:
  - `refuse` -> correct action `treat`
  - `cat` -> correct action `gentlePull`
  - `dog` -> correct action `letSniff`
  - `direction` -> correct action `firmLead`
- Selection: uniform random from distraction list.

## Power-up System
- Only one power-up can be active at a time.
- Spawn blocked near finish:
  - No spawn when progress is within `9` of target (`>= 91`)
- Spawn location:
  - Ahead by random range `9..24` progress units
  - Capped to `99` (`levelTarget - 1`)
- Pickup trigger:
  - Auto-collected once current progress `>= progressAt`
- Power-up types:
  - `treatBag`: reduce stubbornness
  - `speedBoost`: increase progress
  - `timeBonus`: add time

## Player Controls
- `Encourage` button: always enabled while playing
- Action buttons (`Offer treat`, `Gentle pull`, `Let sniff`, `Firm lead`):
  - Enabled only when a distraction is active and game is in `playing`
- `Restart` button:
  - Always available
  - Resets all state to initial values
  - Uses restart log text: "Level 1 restarted: Take Miwa to the park."
- Canvas shortcuts:
  - Click on scene triggers `Encourage`
  - Press `Space` while scene focused triggers `Encourage`

## UI Composition
- `GameScene`: animated canvas, character movement tied to `progressPct`
- `GameStats`: time/progress/stubbornness readout
- `ProgressBar`: visual progress fill
- `EventPanel`: active distraction + power-up hints
- `ActionControls`: user actions and restart
- `GameResult`: shows `Level Complete` or `Level Failed` when not playing
- `log` line shows latest event feedback or outcome message

## Scene/Visual Behavior
- 2D canvas animation runs via `requestAnimationFrame`.
- Scene includes:
  - parallax-like background + particles
  - path, handler, leash, Miwa actor
  - distraction bubble/indicator
  - power-up indicator at target position
  - status overlay for won/lost states

## Constants (Current Build)
- `levelTarget`: `100`
- `maxStubbornness`: `100`
- `startTime`: `60` seconds
- `startStubbornness`: `10`
- `tickMs`: `100`
- `baseMovePerSecond`: `3`
- `distractionChancePerSecond`: `0.32`
- `powerUpChancePerSecond`: `0.2`
- `powerUpMinAheadProgress`: `9`
- `powerUpMaxAheadProgress`: `24`
- `passiveStubbornnessPerSecond`: `9`
- `blockedEncouragePenalty`: `4`
- `encourageBoost`: `2`
- `powerUpProgressBoost`: `10`
- `powerUpTimeBonusSeconds`: `7`
- `powerUpStubbornnessDrop`: `18`
- `failedActionPenalty`: `8`
- `successActionStubbornnessDrop`: `8`
- `actionProgressBonus`: `4`

## Out of Scope / Notes
- Current production app uses modular path (`src/app/App.tsx`).
- `src/App.tsx` exists as a legacy prototype and is not mounted by `src/main.tsx`.
