import { POWER_UPS } from "../data/powerups";
import { Distraction, PowerUp } from "../types";

type EventPanelProps = {
  activeDistraction: Distraction | null;
  activePowerUp: PowerUp | null;
};

export function EventPanel({ activeDistraction, activePowerUp }: EventPanelProps) {
  return (
    <div className="miwa-event">
      {activeDistraction ? (
        <p>
          <strong>Situation:</strong> {activeDistraction.text}
        </p>
      ) : (
        <p>No distractions right now. Keep moving.</p>
      )}
      {activePowerUp ? (
        <p>
          <strong>Power-up:</strong> {POWER_UPS[activePowerUp.id].title} ahead.
        </p>
      ) : (
        <p>No power-up visible right now.</p>
      )}
    </div>
  );
}
