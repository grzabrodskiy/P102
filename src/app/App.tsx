import { ActionControls } from "../game/components/ActionControls";
import { EventPanel } from "../game/components/EventPanel";
import { GameResult } from "../game/components/GameResult";
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
        <h1>Miwa</h1>
        <p className="miwa-subtitle">Shiba adventure game - Level 1: Go to the park</p>
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
          onDash={game.dash}
          onSetMovement={game.setMovement}
          onClearMovement={game.clearMovement}
        />

        <GameStats
          timeLeft={game.timeLeft}
          score={game.score}
          progressPct={game.progressPct}
          stubbornness={game.stubbornness}
        />
        <ProgressBar progressPct={game.progressPct} />
        <EventPanel activeDistraction={game.activeDistraction} activePowerUp={game.activePowerUp} />
        <ActionControls
          canPlay={game.canPlay}
          onDash={game.dash}
          onSetMovement={game.setMovement}
          onClearMovement={game.clearMovement}
          onRestart={game.restart}
        />

        <p className="miwa-log">{game.log}</p>
        <GameResult status={game.status} />
      </section>
    </main>
  );
}
