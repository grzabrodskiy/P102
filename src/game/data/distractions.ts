import { CatDirection, ChaseDirection, Distraction, DistractionOption, DogSize, OutcomeEffects, RainIntent } from "../types";

const OPPOSITE_BEHAVIOR_CHANCE = 0.24;

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function oppositeBehavior<T>(expected: T, opposite: T): T {
  return chance(OPPOSITE_BEHAVIOR_CHANCE) ? opposite : expected;
}

function option(
  id: string,
  label: string,
  successChance: number,
  successText: string,
  failText: string,
  successEffects: OutcomeEffects,
  failEffects: OutcomeEffects
): DistractionOption {
  return {
    id,
    label,
    successChance,
    successText,
    failText,
    successEffects,
    failEffects
  };
}

function buildCatWalkDistraction(): Distraction {
  const catDirection: CatDirection = chance(0.5) ? "same" : "opposite";
  const expectedIntent = catDirection === "same" ? "speedUp" : "changeDirection";
  const intent = oppositeBehavior(expectedIntent, expectedIntent === "speedUp" ? "changeDirection" : "speedUp");
  const willChase = chance(0.66);
  const chaseDirection: ChaseDirection = willChase ? (catDirection === "same" ? "forward" : "backward") : "none";

  const text =
    catDirection === "same"
      ? intent === "speedUp"
        ? "A cat walks in the same direction. Miwa wants to speed up and follow it."
        : "A cat walks in the same direction, but Miwa suddenly wants to turn away."
      : intent === "changeDirection"
        ? "A cat crosses against your route. Miwa tries to change direction."
        : "A cat crosses the other way, yet Miwa unexpectedly wants to chase forward.";

  const options =
    intent === "speedUp"
      ? [
          option(
            "cat_match",
            "Match pace forward",
            0.78,
            "Perfect timing. Miwa channels it into forward speed.",
            "Too much pull. Miwa gets jittery.",
            { progress: 7, stubbornness: -4 },
            { stubbornness: 4 }
          ),
          option(
            "cat_call",
            "Call and cue",
            0.58,
            "Voice cue works. Miwa settles into rhythm.",
            "Miwa ignores the cue and locks on the cat.",
            { progress: 4, stubbornness: -3 },
            { stubbornness: 4 }
          ),
          option(
            "cat_treat",
            "Treat redirect",
            0.72,
            "Treat lands. Miwa follows you, not the cat.",
            "Treat fails. Miwa is still fixated.",
            { progress: 5, stubbornness: -6 },
            { stubbornness: 3 }
          ),
          option(
            "cat_back",
            "Step backward",
            0.4,
            "Reset works, but you lose momentum.",
            "Reset fails and costs extra time.",
            { progress: -2, timeMs: -1200, stubbornness: -2 },
            { timeMs: -2400, stubbornness: 2 }
          )
        ]
      : [
          option(
            "cat_back",
            "Step backward",
            0.76,
            "Good read. Miwa relaxes and reorients.",
            "Wrong timing. Miwa resists harder.",
            { progress: -1, stubbornness: -5 },
            { stubbornness: 4 }
          ),
          option(
            "cat_turn",
            "Turn around briefly",
            0.7,
            "Angle reset works. Miwa recenters.",
            "Detour burns time and focus.",
            { progress: -2, stubbornness: -3, timeMs: -1200 },
            { stubbornness: 3, timeMs: -2500 }
          ),
          option(
            "cat_treat",
            "Treat redirect",
            0.6,
            "Treat helps; Miwa follows your route.",
            "Treat gets ignored this time.",
            { progress: 3, stubbornness: -4 },
            { stubbornness: 3 }
          ),
          option(
            "cat_wait",
            "Pause and wait",
            0.45,
            "Patience works. Miwa calms down.",
            "Waiting just drains time.",
            { stubbornness: -5, timeMs: -1400 },
            { stubbornness: 2, timeMs: -3000 }
          )
        ];

  return {
    id: "catWalk",
    text,
    options,
    visual: {
      kind: "catWalk",
      catDirection,
      chaseDirection
    }
  };
}

function randomDogSize(): DogSize {
  const roll = Math.random();
  if (roll < 0.4) return "small";
  if (roll < 0.78) return "medium";
  return "large";
}

function buildDogWalkDistraction(): Distraction {
  const dogSize = randomDogSize();
  const expectedIntent = dogSize === "large" ? "runAway" : "followDog";
  const intent = oppositeBehavior(expectedIntent, expectedIntent === "runAway" ? "followDog" : "runAway");

  const sizeText = dogSize === "small" ? "small" : dogSize === "medium" ? "medium" : "large";
  const text =
    intent === "followDog"
      ? `A ${sizeText} dog passes by. Miwa wants to go the same direction as it.`
      : `A ${sizeText} dog passes by. Miwa wants to run away from it.`;

  const options =
    intent === "followDog"
      ? [
          option(
            "dog_follow",
            "Walk same direction",
            0.74,
            "Nice read. You turn that energy into progress.",
            "Miwa overcommits and gets distracted.",
            { progress: 6, stubbornness: -3 },
            { stubbornness: 4 }
          ),
          option(
            "dog_focus",
            "Focus game",
            0.55,
            "Focus game clicks.",
            "Miwa is too excited to focus.",
            { progress: 4, stubbornness: -3 },
            { stubbornness: 4 }
          ),
          option(
            "dog_treat",
            "Treat and lead",
            0.69,
            "Treat works and Miwa stays with you.",
            "Treat misses the moment.",
            { progress: 5, stubbornness: -4 },
            { stubbornness: 3 }
          ),
          option(
            "dog_distance",
            "Create distance",
            0.42,
            "Distance helps, but slows pace.",
            "Distance move fails and costs time.",
            { progress: -2, stubbornness: -2, timeMs: -1200 },
            { stubbornness: 2, timeMs: -2200 }
          )
        ]
      : [
          option(
            "dog_distance",
            "Create distance",
            0.77,
            "Great choice. Miwa feels safer quickly.",
            "Miwa still panics and pulls.",
            { progress: -1, stubbornness: -6 },
            { stubbornness: 5 }
          ),
          option(
            "dog_cover",
            "Move behind tree",
            0.65,
            "Cover works. Miwa settles.",
            "Cover attempt is messy and slow.",
            { stubbornness: -5, timeMs: -1300 },
            { stubbornness: 3, timeMs: -2400 }
          ),
          option(
            "dog_voice",
            "Calm voice",
            0.52,
            "Voice lowers stress.",
            "Voice cue gets ignored.",
            { stubbornness: -4, progress: 2 },
            { stubbornness: 4 }
          ),
          option(
            "dog_brisk",
            "Brisk forward pass",
            0.46,
            "Forward pass works unexpectedly well.",
            "Miwa freezes and refuses.",
            { progress: 5, stubbornness: -2 },
            { stubbornness: 5 }
          )
        ];

  return {
    id: "dogWalk",
    text,
    options,
    visual: {
      kind: "dogWalk",
      dogSize
    }
  };
}

function buildRainDistraction(): Distraction {
  const expectedIntent: RainIntent = chance(0.5) ? "stay" : "tree";
  const rainIntent = oppositeBehavior<RainIntent>(expectedIntent, expectedIntent === "stay" ? "tree" : "stay");

  const text =
    rainIntent === "stay"
      ? "Rain starts suddenly. Miwa wants to stay in place and wait it out."
      : "Rain starts suddenly. Miwa tries to take cover under a tree.";

  const options =
    rainIntent === "stay"
      ? [
          option(
            "rain_wait",
            "Wait briefly",
            0.73,
            "Short wait works. Miwa calms.",
            "Waiting too long hurts momentum.",
            { stubbornness: -5, timeMs: -1300 },
            { stubbornness: 2, timeMs: -2900 }
          ),
          option(
            "rain_jacket",
            "Put on rain jacket",
            0.62,
            "Jacket helps Miwa move again.",
            "Jacket attempt is clumsy.",
            { progress: 3, stubbornness: -4, timeMs: -1200 },
            { stubbornness: 3, timeMs: -2400 }
          ),
          option(
            "rain_dash",
            "Dash forward",
            0.44,
            "Dash succeeds; Miwa follows.",
            "Dash backfires and she resists.",
            { progress: 6, stubbornness: -1 },
            { stubbornness: 4 }
          ),
          option(
            "rain_tree",
            "Guide to tree cover",
            0.58,
            "Tree cover reset works.",
            "Tree detour wastes time.",
            { progress: -1, stubbornness: -3, timeMs: -1400 },
            { stubbornness: 2, timeMs: -2800 }
          )
        ]
      : [
          option(
            "rain_tree",
            "Guide to tree cover",
            0.78,
            "Perfect. Miwa feels safe under the tree.",
            "Tree move fails and she gets stubborn.",
            { stubbornness: -6, timeMs: -1200 },
            { stubbornness: 4, timeMs: -2300 }
          ),
          option(
            "rain_jacket",
            "Put on rain jacket",
            0.64,
            "Jacket works as backup shelter.",
            "Jacket attempt stalls progress.",
            { progress: 3, stubbornness: -3, timeMs: -1300 },
            { stubbornness: 3, timeMs: -2600 }
          ),
          option(
            "rain_voice",
            "Reassure and cue",
            0.47,
            "Miwa listens and stays with you.",
            "Rain noise drowns your cue.",
            { stubbornness: -4, progress: 2 },
            { stubbornness: 3 }
          ),
          option(
            "rain_push",
            "Keep moving forward",
            0.4,
            "It works this time.",
            "Too much pressure in rain.",
            { progress: 5, stubbornness: -1 },
            { stubbornness: 5 }
          )
        ];

  return {
    id: "rain",
    text,
    options,
    visual: {
      kind: "rain",
      rainIntent
    }
  };
}

export function createDistraction(): Distraction {
  const roll = Math.random();
  if (roll < 0.36) return buildCatWalkDistraction();
  if (roll < 0.72) return buildDogWalkDistraction();
  return buildRainDistraction();
}
