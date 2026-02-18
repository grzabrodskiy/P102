import { createDistraction } from "../data/distractions";
import { Distraction, PowerUpId } from "../types";

export function pickDistraction(): Distraction {
  return createDistraction();
}

export function pickPowerUpId(): PowerUpId {
  return "treatBag";
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
