export const GAME_RULES = {
  levelTarget: 100,
  maxStubbornness: 100,
  startTime: 60,
  startStubbornness: 10,
  tickMs: 100,
  baseMovePerSecond: 3,
  distractionChancePerSecond: 0.2,
  powerUpChancePerSecond: 0.14,
  powerUpMinAheadProgress: 12,
  powerUpMaxAheadProgress: 18,
  passiveStubbornnessPerSecond: 7,
  blockedEncouragePenalty: 4,
  encourageBoost: 2,
  powerUpProgressBoost: 6,
  powerUpTimeBonusSeconds: 4,
  powerUpStubbornnessDrop: 14,
  failedActionPenalty: 6,
  successActionStubbornnessDrop: 10,
  actionProgressBonus: 5
} as const;

export const GAME_LOGS = {
  levelStart: "Level 1: Take Miwa to the park.",
  levelRestart: "Level 1 restarted: Take Miwa to the park.",
  win: "You made it to the park. Miwa is happy and proud.",
  lose: "Miwa wins this round. Try a different strategy."
} as const;
