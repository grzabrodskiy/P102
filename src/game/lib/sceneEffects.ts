import { GROUND_Y, PATH_LEFT, PATH_RIGHT, PATH_Y, SCENE_HEIGHT, SCENE_WIDTH } from "./sceneConstants";

export function drawAmbientParticles(ctx: CanvasRenderingContext2D, tick: number) {
  for (let i = 0; i < 14; i += 1) {
    const phase = tick * 0.006 + i * 0.55;
    const x = ((phase * 72 + i * 43) % (SCENE_WIDTH + 60)) - 30;
    const y = 72 + ((i * 24 + tick * 0.16) % 180);
    const sway = Math.sin(phase * 1.3) * 6;
    const size = 2 + ((i % 3) * 0.9);
    const alpha = 0.18 + ((i % 4) * 0.05);

    ctx.save();
    ctx.translate(x + sway, y);
    ctx.rotate(phase);
    ctx.fillStyle = `rgba(255, 250, 215, ${alpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawForegroundDetails(ctx: CanvasRenderingContext2D, tick: number) {
  const wave = Math.sin(tick / 95) * 0.5;
  for (let x = 20; x < SCENE_WIDTH - 10; x += 14) {
    const base = (x % 5) + wave;
    ctx.fillStyle = "#5f9d53";
    ctx.fillRect(x, GROUND_Y - 5 - base, 2, 6 + base);
  }

  ctx.fillStyle = "#4e7f43";
  ctx.fillRect(0, GROUND_Y + 58, SCENE_WIDTH, SCENE_HEIGHT - (GROUND_Y + 58));

  ctx.fillStyle = "#d3ae7f66";
  ctx.fillRect(PATH_LEFT, PATH_Y + 25, PATH_RIGHT - PATH_LEFT, 2);
}

export function drawSceneFrame(ctx: CanvasRenderingContext2D) {
  const vignette = ctx.createRadialGradient(
    SCENE_WIDTH / 2,
    SCENE_HEIGHT / 2,
    SCENE_HEIGHT * 0.25,
    SCENE_WIDTH / 2,
    SCENE_HEIGHT / 2,
    SCENE_HEIGHT * 0.72
  );
  vignette.addColorStop(0, "#00000000");
  vignette.addColorStop(1, "#0f251a4d");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  ctx.strokeStyle = "#ffffff8a";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, SCENE_WIDTH - 1, SCENE_HEIGHT - 1);

  const topLight = ctx.createLinearGradient(0, 0, 0, 46);
  topLight.addColorStop(0, "#ffffff44");
  topLight.addColorStop(1, "#ffffff00");
  ctx.fillStyle = topLight;
  ctx.fillRect(0, 0, SCENE_WIDTH, 46);
}
