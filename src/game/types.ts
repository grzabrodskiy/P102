export type Action = string;
export type Status = "playing" | "won" | "lost";
export type PowerUpId = "treatBag" | "speedBoost" | "timeBonus";
export type CatDirection = "same" | "opposite";
export type DogSize = "small" | "medium" | "large";
export type RainIntent = "stop" | "home";
export type ChaseDirection = "forward" | "backward" | "none";
export type FactorSource = "external" | "internal";

export type OutcomeEffects = {
  progress?: number;
  stubbornness?: number;
  timeMs?: number;
};

export type DistractionOption = {
  id: string;
  label: string;
  successChance: number;
  successText: string;
  failText: string;
  successEffects: OutcomeEffects;
  failEffects?: OutcomeEffects;
  clearsOnSuccess?: boolean;
  clearsOnFail?: boolean;
};

export type Distraction = {
  id: string;
  text: string;
  options: DistractionOption[];
  visual: {
    kind: "catWalk" | "dogWalk" | "rain";
    catDirection?: CatDirection;
    chaseDirection?: ChaseDirection;
    dogSize?: DogSize;
    dogDirection?: CatDirection;
    rainIntent?: RainIntent;
  };
};

export type CatActor = {
  x: number;
  y: number;
  vx: number;
};

export type VelocityFactor = {
  source: FactorSource;
  label: string;
};

export type PowerUp = {
  id: PowerUpId;
  x: number;
  y: number;
};
