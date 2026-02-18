import { Distraction, PowerUp, Status } from "../types";
import { SCENE_HEIGHT, SCENE_WIDTH } from "./sceneConstants";

const FONT = "'Avenir Next', sans-serif";

export function drawDistraction(ctx: CanvasRenderingContext2D, distraction: Distraction, x: number, y: number, tick: number) {
  if (distraction.visual.kind === "catWalk") {
    drawWalkingCat(ctx, x, y, tick, distraction.visual.catDirection === "opposite");
    return;
  }
  if (distraction.visual.kind === "dogWalk") {
    drawWalkingDog(ctx, x, y, tick, distraction.visual.dogSize ?? "medium");
  }
}

export function drawRainWorldOverlay(ctx: CanvasRenderingContext2D, tick: number) {
  const skyTint = ctx.createLinearGradient(0, 0, 0, SCENE_HEIGHT);
  skyTint.addColorStop(0, "#5d739633");
  skyTint.addColorStop(1, "#6d829944");
  ctx.fillStyle = skyTint;
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  ctx.strokeStyle = "#7fc0ee88";
  ctx.lineWidth = 1.6;
  for (let i = -80; i < SCENE_WIDTH + 80; i += 22) {
    const shift = ((tick * 2 + i) % 26) - 13;
    ctx.beginPath();
    ctx.moveTo(i + shift * 0.3, 30);
    ctx.lineTo(i + 22 + shift * 0.3, SCENE_HEIGHT - 80);
    ctx.stroke();
  }

  const mist = ctx.createLinearGradient(0, SCENE_HEIGHT - 170, 0, SCENE_HEIGHT);
  mist.addColorStop(0, "#ffffff00");
  mist.addColorStop(1, "#c6d8e266");
  ctx.fillStyle = mist;
  ctx.fillRect(0, SCENE_HEIGHT - 190, SCENE_WIDTH, 190);
}

export function drawStatusOverlay(ctx: CanvasRenderingContext2D, status: Status) {
  if (status === "playing") return;
  ctx.fillStyle = "#0f152066";
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  const panelWidth = 420;
  const panelHeight = 130;
  const panelX = SCENE_WIDTH / 2 - panelWidth / 2;
  const panelY = SCENE_HEIGHT / 2 - panelHeight / 2;
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 16);
  const panel = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
  panel.addColorStop(0, "#ffffff");
  panel.addColorStop(1, "#ecf8f1");
  ctx.fillStyle = panel;
  ctx.fill();

  ctx.strokeStyle = "#86bda0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#2d5340";
  ctx.font = `bold 34px ${FONT}`;
  ctx.fillText("Level Complete", panelX + 56, panelY + 52);

  ctx.fillStyle = "#4d6e5e";
  ctx.font = `600 14px ${FONT}`;
  ctx.fillText("Press Restart to try again", panelX + 100, panelY + 84);
}

export function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp, x: number, y: number, tick: number) {
  const bob = Math.sin(tick / 150) * 6;
  ctx.save();
  ctx.translate(x, y - 36 + bob);
  const glow = ctx.createRadialGradient(0, 0, 8, 0, 0, 40);
  glow.addColorStop(0, "#fff6ad");
  glow.addColorStop(1, "#fff6ad00");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();

  const beacon = ctx.createLinearGradient(0, -110, 0, 16);
  beacon.addColorStop(0, "#ffe9877a");
  beacon.addColorStop(1, "#ffe98700");
  ctx.fillStyle = beacon;
  ctx.fillRect(-14, -110, 28, 126);

  drawRoundedRect(ctx, -20, -20, 40, 40, 10);
  const card = ctx.createLinearGradient(0, -20, 0, 20);
  card.addColorStop(0, "#fffde0");
  card.addColorStop(1, "#ffe28d");
  ctx.fillStyle = card;
  ctx.fill();
  ctx.strokeStyle = "#d4b254";
  ctx.lineWidth = 3;
  ctx.stroke();

  drawTreatIcon(ctx);

  ctx.restore();
}

function drawWalkingCat(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number, reverse: boolean) {
  const legShift = Math.sin(tick / 34) * 2;
  ctx.save();
  ctx.translate(x, y);
  if (reverse) ctx.scale(-1, 1);

  ctx.fillStyle = "#5a6068";
  ctx.beginPath();
  ctx.ellipse(0, -8, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(21, -12, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(16, -17);
  ctx.lineTo(19, -26);
  ctx.lineTo(23, -18);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(23, -17);
  ctx.lineTo(26, -26);
  ctx.lineTo(30, -18);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#4c525a";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-20, -9);
  ctx.quadraticCurveTo(-36, -18, -31, -28);
  ctx.stroke();

  drawAnimalLeg(ctx, -12 + legShift, -1);
  drawAnimalLeg(ctx, -1 - legShift, -1);
  drawAnimalLeg(ctx, 10 + legShift * 0.8, -1);

  ctx.fillStyle = "#1c1f22";
  ctx.beginPath();
  ctx.arc(24, -13, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWalkingDog(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number, size: "small" | "medium" | "large") {
  const scale = size === "small" ? 0.82 : size === "medium" ? 1 : 1.24;
  const legShift = Math.sin(tick / 36) * 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = size === "large" ? "#9f6f49" : "#bf8b55";
  ctx.beginPath();
  ctx.ellipse(0, -9, 24, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(24, -13, 9.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#efd8be";
  ctx.beginPath();
  ctx.ellipse(26, -10, 5.2, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#7b5130";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-21, -10);
  ctx.quadraticCurveTo(-34, -22, -28, -30);
  ctx.stroke();

  drawAnimalLeg(ctx, -12 + legShift, 0);
  drawAnimalLeg(ctx, 0 - legShift, 0);
  drawAnimalLeg(ctx, 12 + legShift * 0.8, 0);

  ctx.fillStyle = "#1d1f23";
  ctx.beginPath();
  ctx.arc(26, -14, 1.3, 0, Math.PI * 2);
  ctx.arc(31, -9, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAnimalLeg(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, 8);
  ctx.stroke();
}

function drawTreatIcon(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#ce5b45";
  ctx.fillRect(-9, -6, 18, 14);
  ctx.fillStyle = "#f9e7cc";
  ctx.beginPath();
  ctx.arc(-10, 1, 4.5, 0, Math.PI * 2);
  ctx.arc(10, 1, 4.5, 0, Math.PI * 2);
  ctx.fill();
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
