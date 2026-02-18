export function drawLeash(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  tick: number,
  distracted: boolean
) {
  const arc = distracted ? 20 : 10;
  const pull = Math.sin(tick / 70) * (distracted ? 5 : 2);

  const leash = ctx.createLinearGradient(fromX, fromY, toX, toY);
  leash.addColorStop(0, distracted ? "#a53d3a" : "#4f6068");
  leash.addColorStop(1, distracted ? "#e46952" : "#8aa2ad");

  ctx.strokeStyle = leash;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.quadraticCurveTo((fromX + toX) / 2, Math.min(fromY, toY) - arc + pull, toX, toY);
  ctx.stroke();
}

export function drawHandler(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  const bob = Math.sin(tick / 80) * 1.4;
  const sway = Math.sin(tick / 70) * 1.2;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(1.06, 1);

  drawShadow(ctx, 4, 33, 15, 6);
  drawLeg(ctx, -2 + sway * 0.6, 8, -1 - sway * 0.5, 29, "#203447");
  drawLeg(ctx, 7 - sway * 0.4, 8, 9 + sway * 0.35, 29, "#3a4e63");

  drawTorso(ctx, sway);
  drawArms(ctx, tick, sway);
  drawNeck(ctx);
  drawHead(ctx, tick);

  ctx.restore();
}

export function drawMiwa(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number, distracted: boolean) {
  const bounce = Math.sin(tick / 65) * 1.4;
  const stride = Math.sin(tick / 50) * 2.8;
  const tailSway = Math.sin(tick / 45) * 2.4;

  ctx.save();
  ctx.translate(x, y + bounce);

  drawShadow(ctx, 1, 24, 34, 8);
  drawDogTail(ctx, tailSway, distracted);
  drawDogLegs(ctx, stride);
  drawDogBody(ctx);
  drawDogChestPatch(ctx);
  drawDogFrontLegs(ctx, stride);
  drawDogHead(ctx, distracted);
  drawDogHarness(ctx, distracted);

  ctx.restore();
}

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const shadow = ctx.createRadialGradient(x, y, 1, x, y, width);
  shadow.addColorStop(0, "#00000033");
  shadow.addColorStop(1, "#00000000");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLeg(ctx: CanvasRenderingContext2D, hipX: number, hipY: number, footX: number, footY: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.quadraticCurveTo((hipX + footX) / 2, (hipY + footY) / 2 + 2, footX, footY);
  ctx.stroke();

  ctx.fillStyle = "#e7eef7";
  ctx.beginPath();
  ctx.ellipse(footX, footY + 1.5, 3.6, 1.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTorso(ctx: CanvasRenderingContext2D, sway: number) {
  drawRoundedRect(ctx, -10, -26 + sway * 0.15, 22, 36, 8);
  const jacket = ctx.createLinearGradient(-10, -28, 14, 12);
  jacket.addColorStop(0, "#2f4f6e");
  jacket.addColorStop(0.5, "#3f6e95");
  jacket.addColorStop(1, "#6e99bc");
  ctx.fillStyle = jacket;
  ctx.fill();

  ctx.fillStyle = "#244158";
  drawRoundedRect(ctx, -10, -22, 6, 28, 3);
  ctx.fill();

  ctx.fillStyle = "#87abc8";
  drawRoundedRect(ctx, 6, -19, 4, 23, 2);
  ctx.fill();
}

function drawArms(ctx: CanvasRenderingContext2D, tick: number, sway: number) {
  const swing = Math.sin(tick / 52) * 1.8;

  ctx.strokeStyle = "#294057";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  // Rear arm
  ctx.beginPath();
  ctx.moveTo(-8, -20 + sway * 0.15);
  ctx.quadraticCurveTo(-14, -10 + swing, -13, 4 + swing * 0.3);
  ctx.stroke();

  // Front arm holding toward leash direction (right/road).
  ctx.beginPath();
  ctx.moveTo(6, -19 - sway * 0.2);
  ctx.quadraticCurveTo(14, -12 - swing * 0.3, 18, -6 - swing * 0.2);
  ctx.quadraticCurveTo(20, -2 - swing * 0.2, 18, 2);
  ctx.stroke();

  ctx.fillStyle = "#f6be96";
  ctx.beginPath();
  ctx.arc(-13, 4 + swing * 0.3, 2.6, 0, Math.PI * 2);
  ctx.arc(18, 2, 2.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawNeck(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#f3b88f";
  drawRoundedRect(ctx, 2.5, -31, 6.8, 6, 2);
  ctx.fill();
}

function drawHead(ctx: CanvasRenderingContext2D, tick: number) {
  const tilt = Math.sin(tick / 120) * 0.02;

  ctx.save();
  ctx.translate(8, -38);
  ctx.rotate(tilt);

  const skin = ctx.createLinearGradient(-6, -12, 10, 10);
  skin.addColorStop(0, "#f8c59f");
  skin.addColorStop(1, "#e7a379");
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.8, 10.3, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Hair mass (back/side view).
  ctx.fillStyle = "#3d2a1f";
  ctx.beginPath();
  ctx.moveTo(-8, -3);
  ctx.quadraticCurveTo(-3, -15, 8, -8);
  ctx.lineTo(7, 1);
  ctx.quadraticCurveTo(-2, -2, -8, 4);
  ctx.closePath();
  ctx.fill();

  // Profile nose.
  ctx.fillStyle = "#d79167";
  ctx.beginPath();
  ctx.moveTo(7, -1);
  ctx.lineTo(11, 0.5);
  ctx.lineTo(7, 2.6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1d2128";
  ctx.beginPath();
  ctx.arc(2.7, -1.1, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8d5d40";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(3.8, 3.8);
  ctx.quadraticCurveTo(6.5, 4.1, 8.7, 3.4);
  ctx.stroke();

  ctx.restore();
}

function drawDogLegs(ctx: CanvasRenderingContext2D, stride: number) {
  const hind = [
    { x: -20, y: 8, swing: stride },
    { x: -10, y: 8, swing: -stride * 0.9 }
  ];

  hind.forEach((leg, index) => {
    ctx.strokeStyle = index === 0 ? "#8a4c23" : "#744016";
    ctx.lineWidth = 4.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(leg.x, leg.y);
    ctx.quadraticCurveTo(leg.x + leg.swing * 0.38, 15, leg.x + leg.swing * 0.25, 23);
    ctx.stroke();

    ctx.fillStyle = "#f7e8d6";
    ctx.beginPath();
    ctx.ellipse(leg.x + leg.swing * 0.25, 23, 4.3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDogFrontLegs(ctx: CanvasRenderingContext2D, stride: number) {
  const front = [
    { x: 8, y: 8, swing: -stride * 0.7 },
    { x: 20, y: 8, swing: stride * 0.75 }
  ];

  front.forEach((leg, index) => {
    ctx.strokeStyle = index === 0 ? "#8a4c23" : "#77431a";
    ctx.lineWidth = 4.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(leg.x, leg.y);
    ctx.quadraticCurveTo(leg.x + leg.swing * 0.34, 15, leg.x + leg.swing * 0.2, 23);
    ctx.stroke();

    ctx.fillStyle = "#f7e8d6";
    ctx.beginPath();
    ctx.ellipse(leg.x + leg.swing * 0.2, 23, 4.3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDogBody(ctx: CanvasRenderingContext2D) {
  const coat = ctx.createLinearGradient(-34, -20, 30, 14);
  coat.addColorStop(0, "#f0a458");
  coat.addColorStop(0.5, "#d27f39");
  coat.addColorStop(1, "#b2642e");

  ctx.fillStyle = coat;
  ctx.beginPath();
  ctx.moveTo(-29, 2);
  ctx.quadraticCurveTo(-30, -12, -12, -16);
  ctx.quadraticCurveTo(12, -19, 31, -9);
  ctx.quadraticCurveTo(34, -3, 31, 7);
  ctx.quadraticCurveTo(16, 13, -8, 12);
  ctx.quadraticCurveTo(-24, 12, -29, 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#c77635";
  ctx.beginPath();
  ctx.ellipse(-9, -5, 10, 6.8, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f9edde";
  ctx.beginPath();
  ctx.moveTo(3, -2);
  ctx.quadraticCurveTo(13, -1, 19, 5);
  ctx.quadraticCurveTo(16, 12, 7, 12);
  ctx.quadraticCurveTo(1, 8, 3, -2);
  ctx.closePath();
  ctx.fill();
}

function drawDogChestPatch(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#fff8ee";
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.quadraticCurveTo(14, 4, 13, 9);
  ctx.quadraticCurveTo(10, 12, 8, 9);
  ctx.quadraticCurveTo(7, 5, 8, 1);
  ctx.quadraticCurveTo(9, 0, 12, 0);
  ctx.closePath();
  ctx.fill();
}

function drawDogTail(ctx: CanvasRenderingContext2D, sway: number, distracted: boolean) {
  const rootX = -24;
  const rootY = -5;
  const loopX = -20 + sway * 0.24;
  const loopY = -21 + sway * 0.08;

  const fur = ctx.createLinearGradient(loopX - 14, loopY - 15, loopX + 12, loopY + 15);
  fur.addColorStop(0, distracted ? "#da5c4a" : "#94602d");
  fur.addColorStop(1, distracted ? "#b74435" : "#6e471e");
  ctx.strokeStyle = fur;
  ctx.lineCap = "round";

  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(rootX, rootY);
  ctx.quadraticCurveTo(-28, -13, loopX - 5.5, loopY - 2.2);
  ctx.stroke();

  // Broad fluffy shiba curl over the back.
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.arc(loopX, loopY, 6, Math.PI * 0.25, Math.PI * 2.0);
  ctx.stroke();

  // Inner curve to suggest volume instead of a flat spiral.
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(loopX + 0.6, loopY + 0.4, 3, Math.PI * 0.3, Math.PI * 2.0);
  ctx.stroke();

  ctx.strokeStyle = "#f2e3d1";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(loopX + 1.3, loopY + 0.6, 1.1, Math.PI * 0.5, Math.PI * 2);
  ctx.stroke();
}

function drawDogHead(ctx: CanvasRenderingContext2D, distracted: boolean) {
  ctx.save();
  ctx.translate(23, -8);

  const head = ctx.createLinearGradient(-16, -12, 18, 13);
  head.addColorStop(0, "#e89a52");
  head.addColorStop(1, "#b96c33");
  ctx.fillStyle = head;
  ctx.beginPath();
  ctx.moveTo(-10, -2);
  ctx.quadraticCurveTo(-6, -13, 7, -12);
  ctx.quadraticCurveTo(18, -10, 19, -1);
  ctx.quadraticCurveTo(20, 7, 10, 12);
  ctx.quadraticCurveTo(-1, 14, -7, 8);
  ctx.quadraticCurveTo(-10, 4, -10, -2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff3e7";
  ctx.beginPath();
  ctx.moveTo(2, 1);
  ctx.quadraticCurveTo(12, 1, 15, 7);
  ctx.quadraticCurveTo(8, 12, 1, 9);
  ctx.quadraticCurveTo(-1, 6, 2, 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d78240";
  ctx.beginPath();
  ctx.moveTo(-1, -8);
  ctx.lineTo(2, -21);
  ctx.lineTo(8, -10);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(9, -8);
  ctx.lineTo(12, -20);
  ctx.lineTo(17, -8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1d1f22";
  ctx.beginPath();
  ctx.arc(8.6, -1.4, 1.5, 0, Math.PI * 2);
  ctx.arc(16.5, 2.3, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#805539";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(8.1, 6);
  ctx.quadraticCurveTo(12, 7.2, 15.7, 6);
  ctx.stroke();

  if (distracted) {
    ctx.strokeStyle = "#e83d32";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-13, -26);
    ctx.lineTo(-4, -33);
    ctx.moveTo(13, -26);
    ctx.lineTo(4, -33);
    ctx.stroke();
  }

  ctx.restore();
}

function drawDogHarness(ctx: CanvasRenderingContext2D, distracted: boolean) {
  ctx.strokeStyle = distracted ? "#d45448" : "#274f62";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(5, 0, 12.5, 0.25, 2.9);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.lineTo(14, 7);
  ctx.stroke();

  ctx.fillStyle = "#f8dc64";
  ctx.beginPath();
  ctx.arc(13, 3, 2.4, 0, Math.PI * 2);
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
