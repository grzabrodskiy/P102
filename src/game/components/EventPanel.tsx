import { POWER_UPS } from "../data/powerups";
import { Distraction, PowerUp } from "../types";

type EventPanelProps = {
  activeDistraction: Distraction | null;
  activePowerUp: PowerUp | null;
};

export function EventPanel({ activeDistraction, activePowerUp }: EventPanelProps) {
  return (
    <div className="miwa-event">
      <div className="miwa-event-row">
        <span className="miwa-event-tag">Situation</span>
        <p>{activeDistraction ? activeDistraction.text : "No distractions right now. Keep moving."}</p>
      </div>
      <div className="miwa-event-row">
        <span className="miwa-event-tag power">Power-up</span>
        <p>{activePowerUp ? `${POWER_UPS[activePowerUp.id].title} ahead.` : "No power-up visible right now."}</p>
      </div>
    </div>
  );
}
