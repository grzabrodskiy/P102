import { CatActor, Distraction, PowerUp, Status } from "../types";
import { drawBackground, drawParkGoal } from "./sceneBackground";
import { drawHandler, drawLeash, drawMiwa } from "./sceneActors";
import { drawAmbientParticles, drawForegroundDetails, drawSceneFrame } from "./sceneEffects";
import { drawDistraction, drawPowerUp, drawRainWorldOverlay, drawStatusOverlay } from "./sceneOverlays";

export type SceneState = {
  progressPct: number;
  playerX: number;
  playerY: number;
  facing: 1 | -1;
  catActor: CatActor | null;
  activeDistraction: Distraction | null;
  activePowerUp: PowerUp | null;
  status: Status;
};

export function renderScene(ctx: CanvasRenderingContext2D, scene: SceneState, tick: number) {
  const isRaining = scene.activeDistraction?.visual.kind === "rain";
  drawBackground(ctx, tick, isRaining);
  if (isRaining) {
    drawRainWorldOverlay(ctx, tick);
  }
  drawAmbientParticles(ctx, tick);
  drawParkGoal(ctx);

  const miwaX = scene.playerX;
  const miwaY = scene.playerY;
  const handlerX = miwaX + (scene.facing === 1 ? -102 : 102);
  const handlerY = miwaY + 14;
  const actorScaleX = 1.45 * scene.facing;
  const actorScaleY = 1.45;

  if (scene.activePowerUp) {
    drawPowerUp(ctx, scene.activePowerUp, scene.activePowerUp.x, scene.activePowerUp.y, tick);
  }

  const leashFromX = handlerX + (scene.facing === 1 ? 16 : -16);
  const leashToX = miwaX + (scene.facing === 1 ? -26 : 26);
  drawLeash(ctx, leashFromX, handlerY - 32, leashToX, miwaY - 18, tick, Boolean(scene.activeDistraction));

  ctx.save();
  ctx.translate(handlerX, handlerY);
  ctx.scale(actorScaleX, actorScaleY);
  drawHandler(ctx, 0, 0, tick);
  ctx.restore();

  ctx.save();
  ctx.translate(miwaX, miwaY);
  ctx.scale(actorScaleX, actorScaleY);
  drawMiwa(ctx, 0, 0, tick, Boolean(scene.activeDistraction));
  ctx.restore();

  if (scene.activeDistraction) {
    const position = distractionPosition(scene.activeDistraction, scene.catActor, miwaX, miwaY);
    drawDistraction(ctx, scene.activeDistraction, position.x, position.y, tick);
  }

  drawForegroundDetails(ctx, tick);
  drawSceneFrame(ctx);
  drawStatusOverlay(ctx, scene.status);
}

function distractionPosition(
  distraction: Distraction,
  catActor: CatActor | null,
  miwaX: number,
  miwaY: number
): { x: number; y: number } {
  if (distraction.visual.kind === "catWalk") {
    if (catActor) {
      return { x: catActor.x, y: catActor.y };
    }
    return {
      x: distraction.visual.catDirection === "opposite" ? miwaX - 120 : miwaX + 130,
      y: miwaY + 2
    };
  }
  if (distraction.visual.kind === "dogWalk") {
    return { x: miwaX + 120, y: miwaY + 6 };
  }
  return { x: miwaX + 40, y: miwaY - 132 };
}
