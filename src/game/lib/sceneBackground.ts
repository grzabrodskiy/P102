import { GOAL_X, GROUND_Y, PATH_LEFT, PATH_RIGHT, PATH_Y, SCENE_HEIGHT, SCENE_WIDTH } from "./sceneConstants";

const FONT = "'Avenir Next', sans-serif";

export function drawBackground(ctx: CanvasRenderingContext2D, tick: number, isRaining = false) {
  drawSky(ctx);
  if (!isRaining) drawSun(ctx);
  else drawRainSkyCloud(ctx, tick);
  drawHills(ctx, tick);
  drawDistantTown(ctx, tick);
  drawCloudLayer(ctx, tick);
  drawGround(ctx);
  drawTreeBand(ctx, tick);
  drawBushAndFountainBand(ctx, tick);
}

export function drawPath(ctx: CanvasRenderingContext2D) {
  const path = ctx.createLinearGradient(0, PATH_Y - 8, 0, PATH_Y + 52);
  path.addColorStop(0, "#b2b8be");
  path.addColorStop(1, "#8f979f");
  ctx.fillStyle = path;
  ctx.beginPath();
  ctx.moveTo(PATH_LEFT, PATH_Y + 8);
  ctx.quadraticCurveTo(SCENE_WIDTH * 0.32, PATH_Y - 8, SCENE_WIDTH * 0.56, PATH_Y + 6);
  ctx.quadraticCurveTo(SCENE_WIDTH * 0.8, PATH_Y + 20, PATH_RIGHT, PATH_Y + 10);
  ctx.lineTo(PATH_RIGHT, PATH_Y + 44);
  ctx.quadraticCurveTo(SCENE_WIDTH * 0.76, PATH_Y + 56, SCENE_WIDTH * 0.45, PATH_Y + 48);
  ctx.quadraticCurveTo(SCENE_WIDTH * 0.18, PATH_Y + 42, PATH_LEFT, PATH_Y + 44);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#6e747b";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "#e7ebef";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 26]);
  ctx.beginPath();
  ctx.moveTo(PATH_LEFT + 18, PATH_Y + 26);
  ctx.quadraticCurveTo(SCENE_WIDTH * 0.46, PATH_Y + 18, PATH_RIGHT - 12, PATH_Y + 28);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#6fa458";
  for (let x = PATH_LEFT + 8; x < PATH_RIGHT - 6; x += 18) {
    const bladeHeight = 4 + ((x / 19) % 4);
    ctx.fillRect(x, PATH_Y + 3 - bladeHeight, 2, bladeHeight);
    ctx.fillRect(x + 1, PATH_Y + 44, 2, bladeHeight - 1);
  }
}

export function drawParkGoal(ctx: CanvasRenderingContext2D) {
  const postTop = PATH_Y - 68;
  const postHeight = GROUND_Y - postTop + 10;
  ctx.fillStyle = "#32583f";
  ctx.fillRect(GOAL_X, postTop, 10, postHeight);
  ctx.fillRect(GOAL_X + 58, postTop, 10, postHeight);
  ctx.fillRect(GOAL_X, postTop, 68, 10);

  drawRoundedRect(ctx, GOAL_X - 4, postTop - 28, 76, 28, 8);
  const sign = ctx.createLinearGradient(GOAL_X - 4, postTop - 28, GOAL_X - 4, postTop);
  sign.addColorStop(0, "#4ea56d");
  sign.addColorStop(1, "#2f7e52");
  ctx.fillStyle = sign;
  ctx.fill();

  ctx.fillStyle = "#f2fff5";
  ctx.font = `bold 15px ${FONT}`;
  ctx.fillText("PARK", GOAL_X + 15, postTop - 9);

  ctx.fillStyle = "#fff";
  ctx.fillRect(GOAL_X + 70, postTop - 10, 3, 30);
  ctx.fillStyle = "#ff7f73";
  ctx.beginPath();
  ctx.moveTo(GOAL_X + 73, postTop - 10);
  ctx.lineTo(GOAL_X + 96, postTop - 4);
  ctx.lineTo(GOAL_X + 73, postTop + 3);
  ctx.closePath();
  ctx.fill();
}

function drawSky(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_HEIGHT);
  sky.addColorStop(0, "#8fd4ff");
  sky.addColorStop(0.6, "#d6f0ff");
  sky.addColorStop(1, "#f3fcff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
}

function drawSun(ctx: CanvasRenderingContext2D) {
  const glow = ctx.createRadialGradient(74, 56, 4, 74, 56, 44);
  glow.addColorStop(0, "#ffeaa0");
  glow.addColorStop(1, "#ffeaa000");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(74, 56, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd86c";
  ctx.beginPath();
  ctx.arc(74, 56, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawRainSkyCloud(ctx: CanvasRenderingContext2D, tick: number) {
  const x = 170;
  const y = 86;
  ctx.fillStyle = "#637e9d";
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.arc(x - 22, y + 2, 16, 0, Math.PI * 2);
  ctx.arc(x + 22, y + 4, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#5aa6e8cc";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  for (let i = -24; i <= 24; i += 12) {
    const sway = Math.sin(tick / 20 + i) * 1.1;
    ctx.beginPath();
    ctx.moveTo(x + i + sway, y + 26);
    ctx.lineTo(x + i + 3 + sway, y + 56);
    ctx.stroke();
  }
}

function drawHills(ctx: CanvasRenderingContext2D, tick: number) {
  const offset = (tick / 90) % 180;
  for (let i = 0; i < 8; i += 1) {
    const seed = i * 23.17;
    const width = 230 + seeded(seed + 1) * 140;
    const height = 52 + seeded(seed + 2) * 34;
    const x = i * 190 - 220 - offset + seeded(seed + 3) * 40;
    const colorMix = 0.48 + seeded(seed + 4) * 0.18;
    const color = `rgb(${Math.round(110 + colorMix * 40)}, ${Math.round(165 + colorMix * 28)}, ${Math.round(120 + colorMix * 32)})`;
    drawHill(ctx, x, GROUND_Y - 84 + seeded(seed + 5) * 20, width, height, color);
  }
}

function drawHill(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y);
  ctx.quadraticCurveTo(x + width / 2, y - height, x + width, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawCloudLayer(ctx: CanvasRenderingContext2D, tick: number) {
  const fast = (tick / 44) % 820;
  const slow = (tick / 63) % 920;
  drawCloud(ctx, 134 - fast, 70, 1);
  drawCloud(ctx, 432 - fast, 96, 0.9);
  drawCloud(ctx, 748 - fast, 62, 1.05);
  drawCloud(ctx, 220 - slow, 44, 0.8);
  drawCloud(ctx, 610 - slow, 80, 0.75);
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.fillStyle = "#ffffffdd";
  ctx.beginPath();
  ctx.arc(x, y, 16 * scale, 0, Math.PI * 2);
  ctx.arc(x + 18 * scale, y - 8 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 38 * scale, y, 14 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround(ctx: CanvasRenderingContext2D) {
  const ground = ctx.createLinearGradient(0, GROUND_Y, 0, SCENE_HEIGHT);
  ground.addColorStop(0, "#95d282");
  ground.addColorStop(1, "#5ea15f");
  ctx.fillStyle = ground;
  ctx.fillRect(0, GROUND_Y, SCENE_WIDTH, SCENE_HEIGHT - GROUND_Y);
}

function drawDistantTown(ctx: CanvasRenderingContext2D, tick: number) {
  const offset = (tick / 50) % 180;
  for (let x = -80 - offset; x < SCENE_WIDTH + 90; x += 90) {
    const width = 24 + ((x / 9) % 7);
    const height = 28 + ((x / 13) % 20);
    ctx.fillStyle = "#7ca5a355";
    ctx.fillRect(x, GROUND_Y - 2 - height, width, height);
    ctx.fillStyle = "#c5e4de66";
    ctx.fillRect(x + 4, GROUND_Y - height + 4, 4, 4);
    ctx.fillRect(x + 12, GROUND_Y - height + 9, 4, 4);
  }
}

function drawTreeBand(ctx: CanvasRenderingContext2D, tick: number) {
  const offset = (tick / 30) % 84;
  for (let i = -2; i < 22; i += 1) {
    const seed = i * 8.13;
    const x = i * 84 - offset + seeded(seed + 1) * 22;
    const scale = 0.95 + seeded(seed + 2) * 0.55;
    drawTree(ctx, x, GROUND_Y - 6, scale, seed, tick);
  }
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, seed: number, tick: number) {
  ctx.fillStyle = "#5a4a35";
  ctx.fillRect(x + 12 * scale, y - 40 * scale, 10 * scale, 38 * scale);

  ctx.fillStyle = "#4a9f60";
  ctx.beginPath();
  ctx.arc(x + 18 * scale, y - 44 * scale, 26 * scale, 0, Math.PI * 2);
  ctx.arc(x + 2 * scale, y - 36 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 34 * scale, y - 34 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 16 * scale, y - 22 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.fill();

  const critterRoll = seeded(seed + 7);
  if (critterRoll > 0.82) drawTreeCat(ctx, x + 14 * scale, y - 34 * scale, scale);
  else if (critterRoll > 0.64) drawTreeBird(ctx, x + 18 * scale, y - 42 * scale + Math.sin(tick / 34 + seed) * 1.2, scale);
}

function drawTreeCat(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = Math.max(0.6, scale * 0.8);
  ctx.fillStyle = "#5a5f66";
  ctx.beginPath();
  ctx.ellipse(x, y, 7 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 3 * s, y - 3 * s);
  ctx.lineTo(x - 4.5 * s, y - 7 * s);
  ctx.lineTo(x - 1 * s, y - 4 * s);
  ctx.closePath();
  ctx.fill();
}

function drawTreeBird(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = Math.max(0.55, scale * 0.7);
  ctx.fillStyle = "#3f6db1";
  ctx.beginPath();
  ctx.ellipse(x, y, 4.3 * s, 2.7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#efb84f";
  ctx.beginPath();
  ctx.moveTo(x + 4.2 * s, y);
  ctx.lineTo(x + 6 * s, y - 1 * s);
  ctx.lineTo(x + 6 * s, y + 1 * s);
  ctx.closePath();
  ctx.fill();
}

function drawBushAndFountainBand(ctx: CanvasRenderingContext2D, tick: number) {
  const offset = (tick / 45) % 110;
  for (let i = -1; i < 16; i += 1) {
    const seed = i * 5.31;
    const x = i * 110 - offset + seeded(seed + 2) * 26;
    const roll = seeded(seed + 9);

    if (roll > 0.82) drawFountain(ctx, x, GROUND_Y - 4, 0.75 + seeded(seed + 10) * 0.45, tick);
    else if (roll > 0.22) drawBush(ctx, x, GROUND_Y - 2, 0.7 + seeded(seed + 4) * 0.6);
  }
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.fillStyle = "#4f9a56";
  ctx.beginPath();
  ctx.arc(x, y, 13 * scale, 0, Math.PI * 2);
  ctx.arc(x - 11 * scale, y + 2, 9 * scale, 0, Math.PI * 2);
  ctx.arc(x + 12 * scale, y + 3, 10 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawFountain(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, tick: number) {
  ctx.fillStyle = "#8aa0a8";
  ctx.fillRect(x - 12 * scale, y + 6, 24 * scale, 10 * scale);
  ctx.fillRect(x - 4 * scale, y - 7 * scale, 8 * scale, 13 * scale);

  const jet = 16 * scale + Math.sin(tick / 22 + x * 0.02) * 2;
  ctx.strokeStyle = "#7ac5f2cc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 7 * scale);
  ctx.quadraticCurveTo(x + 4, y - jet, x + 7, y - 7 * scale);
  ctx.moveTo(x, y - 7 * scale);
  ctx.quadraticCurveTo(x - 4, y - jet + 1, x - 7, y - 7 * scale);
  ctx.stroke();
}

function seeded(value: number): number {
  const n = Math.sin(value * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
