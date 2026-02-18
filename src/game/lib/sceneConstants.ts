export const SCENE_WIDTH = 1280;
export const SCENE_HEIGHT = 720;
export const GROUND_Y = 520;
export const PATH_Y = 452;
export const PATH_LEFT = 84;
export const PATH_RIGHT = SCENE_WIDTH - 84;
export const START_X = 130;
export const GOAL_X = SCENE_WIDTH - 180;
export const START_Y = PATH_Y + 18;
export const MIN_Y = PATH_Y - 54;
export const MAX_Y = GROUND_Y - 16;
export const HILL_ZONES: Array<{ start: number; end: number }> = [
  { start: 290, end: 430 },
  { start: 610, end: 760 },
  { start: 930, end: 1080 }
];
