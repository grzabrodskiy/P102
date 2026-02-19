import { useEffect, useRef } from "react";
import { Action, CatActor, Distraction, PowerUp, Status } from "../types";
import { renderScene } from "../lib/sceneRenderer";
import { SCENE_HEIGHT, SCENE_WIDTH } from "../lib/sceneConstants";

type Direction = "left" | "right";

type GameSceneProps = {
  canPlay: boolean;
  progressPct: number;
  playerX: number;
  playerY: number;
  facing: 1 | -1;
  catActor: CatActor | null;
  activeDistraction: Distraction | null;
  activePowerUp: PowerUp | null;
  status: Status;
  onAction: (action: Action) => void;
  onSetMovement: (direction: Direction, pressed: boolean) => void;
  onClearMovement: () => void;
};

type Snapshot = {
  progressPct: number;
  playerX: number;
  playerY: number;
  facing: 1 | -1;
  catActor: CatActor | null;
  activeDistraction: Distraction | null;
  activePowerUp: PowerUp | null;
  status: Status;
};


function keyToDirection(code: string, key?: string): Direction | null {
  const normalizedKey = key?.toLowerCase();
  if (code === "ArrowLeft" || code === "KeyA" || normalizedKey === "a") return "left";
  if (code === "ArrowRight" || code === "KeyD" || normalizedKey === "d") return "right";
  return null;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function GameScene({
  canPlay,
  progressPct,
  playerX,
  playerY,
  facing,
  catActor,
  activeDistraction,
  activePowerUp,
  status,
  onAction,
  onSetMovement,
  onClearMovement
}: GameSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snapshotRef = useRef<Snapshot>({
    progressPct,
    playerX,
    playerY,
    facing,
    catActor,
    activeDistraction,
    activePowerUp,
    status
  });

  useEffect(() => {
    snapshotRef.current = { progressPct, playerX, playerY, facing, catActor, activeDistraction, activePowerUp, status };
  }, [activeDistraction, activePowerUp, catActor, facing, playerX, playerY, progressPct, status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const resize = () => {
      canvas.width = Math.floor(SCENE_WIDTH * dpr);
      canvas.height = Math.floor(SCENE_HEIGHT * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let rafId = 0;
    const animate = () => {
      frame += 1;
      renderScene(ctx, snapshotRef.current, frame);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    function onWindowKeyDown(event: globalThis.KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      const direction = keyToDirection(event.code, event.key);
      if (direction) {
        event.preventDefault();
        onSetMovement(direction, true);
      }
    }

    function onWindowKeyUp(event: globalThis.KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      const direction = keyToDirection(event.code, event.key);
      if (!direction) return;
      event.preventDefault();
      onSetMovement(direction, false);
    }

    function onWindowBlur() {
      onClearMovement();
    }

    window.addEventListener("keydown", onWindowKeyDown);
    window.addEventListener("keyup", onWindowKeyUp);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("keydown", onWindowKeyDown);
      window.removeEventListener("keyup", onWindowKeyUp);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [onClearMovement, onSetMovement]);

  return (
    <div className="miwa-scene-shell">
      <canvas
        ref={canvasRef}
        className="miwa-scene"
        width={SCENE_WIDTH}
        height={SCENE_HEIGHT}
        onBlur={onClearMovement}
        role="application"
        tabIndex={0}
        aria-label="Miwa game scene. Use A/D or left/right arrows to pull Miwa."
      />
      {activeDistraction ? (
        <div className="miwa-scene-choices" aria-label="Situation choices">
          {activeDistraction.options.map((option) => (
            <button key={option.id} onClick={() => onAction(option.id)} disabled={!canPlay}>
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
