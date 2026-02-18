import { PowerUpId } from "../types";

type PowerUpDefinition = {
  id: PowerUpId;
  title: string;
  pickupText: string;
};

export const POWER_UPS: Record<PowerUpId, PowerUpDefinition> = {
  treatBag: {
    id: "treatBag",
    title: "Snack Pickup",
    pickupText: "Miwa relaxes and focuses."
  },
  speedBoost: {
    id: "speedBoost",
    title: "Speed Boost",
    pickupText: "Miwa zooms forward!"
  },
  timeBonus: {
    id: "timeBonus",
    title: "Time Bonus",
    pickupText: "You gain extra time."
  }
};

export const POWER_UP_IDS: PowerUpId[] = Object.keys(POWER_UPS) as PowerUpId[];
