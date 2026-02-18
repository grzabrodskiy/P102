import { GAME_LOGS, GAME_RULES } from "../config";
import { POWER_UPS } from "../data/powerups";
import { Action, CatActor, Distraction, PowerUp, Status } from "../types";
import { GOAL_X, HILL_ZONES, SCENE_WIDTH, START_X, START_Y } from "./sceneConstants";
import { pickDistraction, pickPowerUpId, randomRange } from "./random";

type MovementState = {
  left: boolean;
  right: boolean;
};

const MOVEMENT_SPEED = 280;
const SHIBA_CHASE_SPEED = 165;
const CAT_SPEED = 260;
const DASH_DISTANCE = 70;
const DISTRACTION_LIFETIME_MS: Record<Distraction["visual"]["kind"], number> = {
  catWalk: 3800,
  dogWalk: 3200,
  rain: 4200
};

export type GameState = {
  score: number;
  progress: number;
  timeLeftMs: number;
  stubbornness: number;
  status: Status;
  playerX: number;
  playerY: number;
  facing: 1 | -1;
  movement: MovementState;
  catActor: CatActor | null;
  distractionAgeMs: number;
  activeDistraction: Distraction | null;
  activePowerUp: PowerUp | null;
  log: string;
};

export type GameAction =
  | { type: "tick" }
  | { type: "dash" }
  | { type: "setMovement"; direction: keyof MovementState; pressed: boolean }
  | { type: "clearMovement" }
  | { type: "chooseAction"; action: Action }
  | { type: "restart" };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampMax(value: number, max: number): number {
  return Math.min(value, max);
}

function chancePerSecond(rate: number, seconds: number): boolean {
  const chance = 1 - Math.pow(1 - rate, seconds);
  return Math.random() < chance;
}

function getProgressFromX(x: number): number {
  const ratio = (x - START_X) / (GOAL_X - START_X);
  return clamp(ratio * GAME_RULES.levelTarget, 0, GAME_RULES.levelTarget);
}

function buildState(log: string): GameState {
  return {
    score: 0,
    progress: 0,
    timeLeftMs: GAME_RULES.startTime * 1000,
    stubbornness: GAME_RULES.startStubbornness,
    status: "playing",
    playerX: START_X,
    playerY: START_Y,
    facing: 1,
    movement: { left: false, right: false },
    catActor: null,
    distractionAgeMs: 0,
    activeDistraction: null,
    activePowerUp: null,
    log
  };
}

export function getInitialState(): GameState {
  return buildState(GAME_LOGS.levelStart);
}

export function getRestartState(): GameState {
  return buildState(GAME_LOGS.levelRestart);
}

function withWinLoss(state: GameState): GameState {
  if (state.status !== "playing") return state;
  if (state.progress >= GAME_RULES.levelTarget) {
    return {
      ...state,
      status: "won",
      log: `${GAME_LOGS.win} Final score: ${Math.round(state.score)}`
    };
  }
  return state;
}

function spawnDistraction(current: Distraction | null, tickSeconds: number): Distraction | null {
  if (current) return current;
  return chancePerSecond(GAME_RULES.distractionChancePerSecond, tickSeconds) ? pickDistraction() : null;
}

function spawnPowerUp(current: PowerUp | null, progress: number, tickSeconds: number): PowerUp | null {
  if (current) return current;
  if (progress >= GAME_RULES.levelTarget - GAME_RULES.powerUpMinAheadProgress) return null;
  if (!chancePerSecond(GAME_RULES.powerUpChancePerSecond, tickSeconds)) return null;

  const ahead = randomRange(GAME_RULES.powerUpMinAheadProgress, GAME_RULES.powerUpMaxAheadProgress);
  const nextProgress = Math.min(GAME_RULES.levelTarget - 1, progress + ahead);
  const x = START_X + (GOAL_X - START_X) * (nextProgress / GAME_RULES.levelTarget);
  const y = START_Y - 28;

  return {
    id: pickPowerUpId(),
    x,
    y
  };
}

function createCatActor(distraction: Distraction): CatActor | null {
  if (distraction.visual.kind !== "catWalk") return null;
  const movingRight = distraction.visual.catDirection !== "opposite";
  return {
    x: movingRight ? -70 : SCENE_WIDTH + 70,
    y: START_Y + 2,
    vx: movingRight ? CAT_SPEED : -CAT_SPEED
  };
}

function applyPowerUpPickup(state: GameState): GameState {
  if (!state.activePowerUp) return state;

  const dx = state.playerX - state.activePowerUp.x;
  const dy = state.playerY - state.activePowerUp.y;
  const pickupDistance = Math.hypot(dx, dy);
  if (pickupDistance > 40) return state;

  const next = { ...state, activePowerUp: null };
  const powerUp = POWER_UPS[state.activePowerUp.id];

  if (state.activePowerUp.id === "treatBag") {
    next.stubbornness = Math.max(0, next.stubbornness - GAME_RULES.powerUpStubbornnessDrop);
  } else if (state.activePowerUp.id === "speedBoost") {
    next.playerX = clamp(next.playerX + GAME_RULES.powerUpProgressBoost * 6, START_X, GOAL_X);
    next.progress = getProgressFromX(next.playerX);
  } else {
    next.timeLeftMs = next.timeLeftMs + GAME_RULES.powerUpTimeBonusSeconds * 1000;
  }

  next.log = `Power-up: ${powerUp.title}. ${powerUp.pickupText}`;
  next.score = next.score + 14;
  return next;
}

function applyMovement(state: GameState, tickSeconds: number, speedMultiplier = 1, autoDirection = 0): GameState {
  const { left, right } = state.movement;
  const manualHorizontal = (right ? 1 : 0) - (left ? 1 : 0);
  const horizontal = manualHorizontal !== 0 ? manualHorizontal : autoDirection;

  if (horizontal === 0) {
    return { ...state, progress: getProgressFromX(state.playerX) };
  }

  const onHill = HILL_ZONES.some((zone) => state.playerX >= zone.start && state.playerX <= zone.end);
  const terrainMultiplier = onHill ? 0.72 : 1;
  const baseSpeed = manualHorizontal !== 0 ? MOVEMENT_SPEED : SHIBA_CHASE_SPEED;
  const step = baseSpeed * speedMultiplier * terrainMultiplier * tickSeconds;

  const nextX = clamp(state.playerX + horizontal * step, START_X, GOAL_X);

  return {
    ...state,
    playerX: nextX,
    facing: horizontal > 0 ? 1 : -1,
    progress: getProgressFromX(nextX)
  };
}

function applyOptionEffects(state: GameState, effects: { progress?: number; stubbornness?: number; timeMs?: number }): GameState {
  const next = { ...state };

  if (typeof effects.progress === "number" && effects.progress !== 0) {
    const progressStepX = (GOAL_X - START_X) / GAME_RULES.levelTarget;
    next.playerX = clamp(next.playerX + progressStepX * effects.progress, START_X, GOAL_X);
    next.progress = getProgressFromX(next.playerX);
    next.score = Math.max(0, next.score + effects.progress * 9);
  }

  if (typeof effects.stubbornness === "number" && effects.stubbornness !== 0) {
    next.stubbornness = clamp(next.stubbornness + effects.stubbornness, 0, GAME_RULES.maxStubbornness);
    if (effects.stubbornness < 0) {
      next.score = next.score + Math.abs(effects.stubbornness) * 2;
    }
  }

  if (typeof effects.timeMs === "number" && effects.timeMs !== 0) {
    next.timeLeftMs = Math.max(0, next.timeLeftMs + effects.timeMs);
    if (effects.timeMs > 0) next.score = next.score + effects.timeMs / 300;
  }

  return next;
}

function getDistractionTimeoutLog(distraction: Distraction): string {
  if (distraction.visual.kind === "catWalk") return "The cat dashed away.";
  if (distraction.visual.kind === "dogWalk") return "The dog walked away.";
  return "The rain stopped.";
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "restart") return getRestartState();

  if (action.type === "setMovement") {
    return {
      ...state,
      movement: {
        ...state.movement,
        [action.direction]: action.pressed
      }
    };
  }

  if (action.type === "clearMovement") {
    return {
      ...state,
      movement: { left: false, right: false }
    };
  }

  if (state.status !== "playing") return state;

  if (action.type === "tick") {
    const tickSeconds = GAME_RULES.tickMs / 1000;
    const spawnedDistraction = spawnDistraction(state.activeDistraction, tickSeconds);
    const isNewDistraction = !state.activeDistraction && Boolean(spawnedDistraction);
    let next: GameState = {
      ...state,
      timeLeftMs: Math.max(0, state.timeLeftMs - GAME_RULES.tickMs),
      distractionAgeMs: isNewDistraction ? 0 : spawnedDistraction ? state.distractionAgeMs + GAME_RULES.tickMs : 0,
      activeDistraction: spawnedDistraction,
      activePowerUp: spawnPowerUp(state.activePowerUp, state.progress, tickSeconds)
    };
    if (!state.activeDistraction && spawnedDistraction?.visual.kind === "catWalk") {
      next.catActor = createCatActor(spawnedDistraction);
    }
    if (next.catActor) {
      next.catActor = { ...next.catActor, x: next.catActor.x + next.catActor.vx * tickSeconds };
      if (next.catActor.x < -90 || next.catActor.x > SCENE_WIDTH + 90) {
        next.catActor = null;
        next.distractionAgeMs = 0;
        if (next.activeDistraction?.visual.kind === "catWalk") {
          next.activeDistraction = null;
          next.log = "The cat ran off-screen.";
        }
      }
    }

    if (next.activeDistraction) {
      const maxLifetime = DISTRACTION_LIFETIME_MS[next.activeDistraction.visual.kind];
      if (next.distractionAgeMs >= maxLifetime) {
        next.log = getDistractionTimeoutLog(next.activeDistraction);
        next.activeDistraction = null;
        next.catActor = null;
        next.distractionAgeMs = 0;
      }
    }

    const moveSpeedMultiplier = next.activeDistraction ? 0.55 : 1;
    let autoDirection = 0;
    if (
      next.activeDistraction?.visual.kind === "catWalk" &&
      next.catActor &&
      next.activeDistraction.visual.chaseDirection &&
      next.activeDistraction.visual.chaseDirection !== "none"
    ) {
      autoDirection = next.activeDistraction.visual.chaseDirection === "forward" ? 1 : -1;
    }
    next = applyMovement(next, tickSeconds, moveSpeedMultiplier, autoDirection);
    const forwardDelta = Math.max(0, next.playerX - state.playerX);
    next.score = next.score + forwardDelta * 0.08;

    if (next.activeDistraction) {
      next.stubbornness = clampMax(
        next.stubbornness + GAME_RULES.passiveStubbornnessPerSecond * tickSeconds,
        GAME_RULES.maxStubbornness
      );
      if (!state.activeDistraction) next.log = `Distraction: ${next.activeDistraction.text}`;
    }

    return withWinLoss(applyPowerUpPickup(next));
  }

  if (action.type === "dash") {
    const next = { ...state };
    if (next.activeDistraction) {
      next.stubbornness = clampMax(next.stubbornness + GAME_RULES.blockedEncouragePenalty, GAME_RULES.maxStubbornness);
      next.log = `Blocked: ${next.activeDistraction.text}`;
      return withWinLoss(next);
    }

    next.playerX = clamp(next.playerX + DASH_DISTANCE, START_X, GOAL_X);
    next.progress = getProgressFromX(next.playerX);
    next.score = next.score + 18;
    next.log = "Dash! Miwa surges forward.";
    return withWinLoss(applyPowerUpPickup(next));
  }

  if (!state.activeDistraction) return state;
  const picked = state.activeDistraction.options.find((option) => option.id === action.action);
  if (!picked) return state;

  const succeeded = Math.random() < picked.successChance;
  const nextBase = {
    ...state,
    log: succeeded ? picked.successText : picked.failText
  };
  const next = applyOptionEffects(nextBase, succeeded ? picked.successEffects : picked.failEffects ?? {});

  const clearOnSuccess = picked.clearsOnSuccess ?? true;
  const clearOnFail = picked.clearsOnFail ?? false;
  if ((succeeded && clearOnSuccess) || (!succeeded && clearOnFail)) {
    next.activeDistraction = null;
    next.catActor = null;
    next.distractionAgeMs = 0;
  }

  return withWinLoss(applyPowerUpPickup(next));
}
