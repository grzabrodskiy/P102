import { EventPanel } from "../game/components/EventPanel";
import { GameScene } from "../game/components/GameScene";
import { GameStats } from "../game/components/GameStats";
import { ProgressBar } from "../game/components/ProgressBar";
import { useMiwaGame } from "../game/hooks/useMiwaGame";
import "../game/styles/game.css";

export default function App() {
  const game = useMiwaGame();

  return (
    <main className="miwa-page">
      <section className="miwa-card">
        <GameScene
          canPlay={game.canPlay}
          progressPct={game.progressPct}
          playerX={game.playerX}
          playerY={game.playerY}
          facing={game.facing}
          catActor={game.catActor}
          activeDistraction={game.activeDistraction}
          activePowerUp={game.activePowerUp}
          status={game.status}
          onAction={game.chooseAction}
          onSetMovement={game.setMovement}
          onClearMovement={game.clearMovement}
        />
        <div className="miwa-overlay-top">
          <h1>Miwa</h1>
          <p className="miwa-subtitle">Shiba adventure game - Level 1: Go to the park</p>
          <div className="miwa-top-hud">
            <GameStats
              timeLeft={game.timeLeft}
              score={game.score}
              progressPct={game.progressPct}
              stubbornness={game.stubbornness}
              shibaSpeed={game.shibaSpeed}
              shibaDirection={game.shibaDirection}
              humanPullSpeed={game.humanPullSpeed}
              shibaVelocityFactor={game.shibaVelocityFactor}
            />
            <EventPanel activeDistraction={game.activeDistraction} activePowerUp={game.activePowerUp} />
          </div>
          {game.flowMessage ? <p className="miwa-flow-message">{game.flowMessage}</p> : null}
        </div>
        <div className="miwa-overlay-bottom">
          <ProgressBar progressPct={game.progressPct} />
        </div>
      </section>
    </main>
  );
}
