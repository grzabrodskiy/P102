type Direction = "left" | "right";

type ActionControlsProps = {
  canPlay: boolean;
  onDash: () => void;
  onSetMovement: (direction: Direction, pressed: boolean) => void;
  onClearMovement: () => void;
  onRestart: () => void;
};

export function ActionControls({
  canPlay,
  onDash,
  onSetMovement,
  onClearMovement,
  onRestart
}: ActionControlsProps) {
  function movementHandlers(direction: Direction) {
    return {
      onMouseDown: () => canPlay && onSetMovement(direction, true),
      onMouseUp: () => onSetMovement(direction, false),
      onMouseLeave: () => onSetMovement(direction, false),
      onTouchStart: () => canPlay && onSetMovement(direction, true),
      onTouchEnd: () => onSetMovement(direction, false)
    };
  }

  return (
    <div className="miwa-controls-wrap">
      <div className="miwa-move-controls" onMouseLeave={onClearMovement}>
        <p className="miwa-controls-label">Move (A/D or Left/Right)</p>
        <div className="miwa-horizontal-move">
          <button type="button" className="miwa-dir left" disabled={!canPlay} {...movementHandlers("left")}>
            ← Backward
          </button>
          <button type="button" className="miwa-dir right" disabled={!canPlay} {...movementHandlers("right")}>
            Forward →
          </button>
        </div>
        <button onClick={onDash} disabled={!canPlay} className="miwa-dash-btn">
          Dash (Space)
        </button>
      </div>

      <div className="miwa-controls">
        <button onClick={onRestart}>Restart</button>
      </div>
    </div>
  );
}
