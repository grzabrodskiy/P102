import { GAME_LOGS, GAME_RULES } from "../config";
import { POWER_UPS } from "../data/powerups";
import { Action, CatActor, Distraction, PowerUp, Status, VelocityFactor } from "../types";
import { GOAL_X, HILL_ZONES, SCENE_WIDTH, START_X, START_Y } from "./sceneConstants";
import { pickDistraction, pickPowerUpId, randomRange } from "./random";

type MovementState = {
  left: boolean;
  right: boolean;
};

const CAT_SPEED = 260;
const DASH_DISTANCE = 70;
const DISTRACTION_LIFETIME_MS: Record<Distraction["visual"]["kind"], number> = {
  catWalk: 3800,
  dogWalk: 3200,
  rain: 4200
};
const SHIBA_SPEED_MIN = 110;
const SHIBA_SPEED_MAX = 260;
const HUMAN_PULL_START = 300;
const HUMAN_PULL_MIN = 25;
const HUMAN_PULL_DECAY_PER_SECOND = 28;
const HUMAN_PULL_RECOVERY_PER_SECOND = 22;
const SHIBA_VELOCITY_REFRESH_PER_SECOND = 1.1;

const INTERNAL_FACTORS = [
  "stubbornness spike",
  "curiosity wave",
  "sniff break",
  "zoomies surge",
  "suspicious mode"
] as const;

const EXTERNAL_FACTORS = ["wind gust", "street noise", "leaf chase", "new smell trail"] as const;

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
  shibaVelocity: number;
  humanPullSpeed: number;
  velocityFactor: VelocityFactor;
  flowMessage: string | null;
  flowMessageMs: number;
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
  const initialDirection = Math.random() < 0.5 ? -1 : 1;
  const initialSpeed = randomRange(SHIBA_SPEED_MIN, SHIBA_SPEED_MAX);
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
    log,
    shibaVelocity: initialDirection * initialSpeed,
    humanPullSpeed: HUMAN_PULL_START,
    velocityFactor: {
      source: "internal",
      label: "first impulse"
    },
    flowMessage: null,
    flowMessageMs: 0
  };
}

export function getInitialState(): GameState {
  return buildState(GAME_LOGS.levelStart);
}

export function getRestartState(): GameState {
  return buildState(GAME_LOGS.levelRestart);
}

function withWinLoss(state: GameState): GameState {
  if (state.progress < GAME_RULES.levelTarget) return state;

  const initialDirection = Math.random() < 0.5 ? -1 : 1;
  const initialSpeed = randomRange(SHIBA_SPEED_MIN, SHIBA_SPEED_MAX);
  return {
    ...state,
    status: "playing",
    playerX: START_X,
    playerY: START_Y,
    progress: 0,
    movement: { left: false, right: false },
    activeDistraction: null,
    catActor: null,
    distractionAgeMs: 0,
    activePowerUp: null,
    shibaVelocity: initialDirection * initialSpeed,
    humanPullSpeed: HUMAN_PULL_START,
    flowMessage: "Level complete. Moving to next run.",
    flowMessageMs: 2200,
    log: "Level complete. Continuing without pause.",
    score: state.score + 60
  };
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

function pickVelocityFactor(distraction: Distraction | null): VelocityFactor {
  if (distraction?.visual.kind === "catWalk") {
    return { source: "external", label: "cat spotted" };
  }
  if (distraction?.visual.kind === "rain") {
    return { source: "external", label: "rain discomfort" };
  }
  if (distraction?.visual.kind === "dogWalk") {
    return { source: "external", label: "rival dog nearby" };
  }

  if (Math.random() < 0.45) {
    return {
      source: "external",
      label: EXTERNAL_FACTORS[Math.floor(Math.random() * EXTERNAL_FACTORS.length)]
    };
  }
  return {
    source: "internal",
    label: INTERNAL_FACTORS[Math.floor(Math.random() * INTERNAL_FACTORS.length)]
  };
}

function sampleShibaVelocity(state: GameState): { shibaVelocity: number; velocityFactor: VelocityFactor } {
  if (state.activeDistraction?.visual.kind === "catWalk") {
    const catDirection = state.activeDistraction.visual.catDirection === "opposite" ? -1 : 1;
    const followCatDirection = Math.random() < 0.9;
    const direction = followCatDirection ? catDirection : -catDirection;
    const speed = randomRange(220, 360);
    return {
      shibaVelocity: direction * speed,
      velocityFactor: {
        source: "external",
        label: followCatDirection ? "cat chase impulse (90%)" : "cat avoidance (10%)"
      }
    };
  }

  if (state.activeDistraction?.visual.kind === "dogWalk") {
    const dogDirection = state.activeDistraction.visual.dogDirection === "opposite" ? -1 : 1;
    const wantsToStop = Math.random() < 0.75;
    if (wantsToStop) {
      return {
        shibaVelocity: 0,
        velocityFactor: {
          source: "external",
          label: "dog social pause"
        }
      };
    }

    return {
      shibaVelocity: dogDirection * randomRange(130, 220),
      velocityFactor: {
        source: "external",
        label: "following dog direction"
      }
    };
  }

  if (state.activeDistraction?.visual.kind === "rain") {
    const wantsToStop = Math.random() < 0.5;
    if (wantsToStop) {
      return {
        shibaVelocity: 0,
        velocityFactor: {
          source: "external",
          label: "rain freeze (50%)"
        }
      };
    }

    return {
      shibaVelocity: -randomRange(140, 230),
      velocityFactor: {
        source: "external",
        label: "going home (50%)"
      }
    };
  }

  const factor = pickVelocityFactor(state.activeDistraction);
  const direction = Math.random() < 0.5 ? -1 : 1;
  let speed = randomRange(SHIBA_SPEED_MIN, SHIBA_SPEED_MAX);

  if (factor.source === "external" && factor.label === "cat spotted") speed *= 1.2;
  if (factor.source === "external" && factor.label === "rain discomfort") speed *= 0.72;
  if (factor.source === "internal" && factor.label === "stubbornness spike") speed *= 1.15;
  if (factor.source === "internal" && factor.label === "sniff break") speed *= 0.68;

  const stubbornnessInfluence = 1 + (state.stubbornness / GAME_RULES.maxStubbornness) * 0.22;
  speed *= stubbornnessInfluence;

  return {
    shibaVelocity: direction * speed,
    velocityFactor: factor
  };
}

function applyMovement(state: GameState, tickSeconds: number, speedMultiplier = 1): GameState {
  const { left, right } = state.movement;
  const manualHorizontal = (right ? 1 : 0) - (left ? 1 : 0);
  const onHill = HILL_ZONES.some((zone) => state.playerX >= zone.start && state.playerX <= zone.end);
  const terrainMultiplier = onHill ? 0.72 : 1;
  const shibaStep = state.shibaVelocity * speedMultiplier * terrainMultiplier * tickSeconds;
  const humanStep = manualHorizontal * state.humanPullSpeed * speedMultiplier * terrainMultiplier * tickSeconds;
  const totalStep = shibaStep + humanStep;
  const nextX = clamp(state.playerX + totalStep, START_X, GOAL_X);

  return {
    ...state,
    playerX: nextX,
    facing: totalStep >= 0 ? 1 : -1,
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
      flowMessageMs: Math.max(0, state.flowMessageMs - GAME_RULES.tickMs),
      flowMessage: state.flowMessageMs <= GAME_RULES.tickMs ? null : state.flowMessage,
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

    if (chancePerSecond(SHIBA_VELOCITY_REFRESH_PER_SECOND, tickSeconds)) {
      const sampled = sampleShibaVelocity(next);
      next.shibaVelocity = sampled.shibaVelocity;
      next.velocityFactor = sampled.velocityFactor;
    }

    const manualHorizontal = (next.movement.right ? 1 : 0) - (next.movement.left ? 1 : 0);
    if (manualHorizontal !== 0) {
      next.humanPullSpeed = Math.max(HUMAN_PULL_MIN, next.humanPullSpeed - HUMAN_PULL_DECAY_PER_SECOND * tickSeconds);
    } else {
      next.humanPullSpeed = Math.min(HUMAN_PULL_START, next.humanPullSpeed + HUMAN_PULL_RECOVERY_PER_SECOND * tickSeconds);
    }

    const moveSpeedMultiplier = next.activeDistraction ? 0.55 : 1;
    next = applyMovement(next, tickSeconds, moveSpeedMultiplier);
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
