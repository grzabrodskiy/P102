import { VelocityFactor } from "../types";

type GameStatsProps = {
  timeLeft: number;
  score: number;
  progressPct: number;
  stubbornness: number;
  shibaSpeed: number;
  shibaDirection: "left" | "right";
  humanPullSpeed: number;
  shibaVelocityFactor: VelocityFactor;
};

export function GameStats({
  timeLeft,
  score,
  progressPct,
  stubbornness,
  shibaSpeed,
  shibaDirection,
  humanPullSpeed,
  shibaVelocityFactor
}: GameStatsProps) {
  const shibaPct = Math.min(100, Math.round((shibaSpeed / 380) * 100));
  const humanPct = Math.min(100, Math.round((humanPullSpeed / 300) * 100));
  const timePct = Math.min(100, Math.round((timeLeft / 60) * 100));
  const stubbornPct = Math.min(100, stubbornness);
  const totalEffort = shibaSpeed + humanPullSpeed;
  const shibaShare = totalEffort === 0 ? 50 : Math.round((shibaSpeed / totalEffort) * 100);
  const humanShare = 100 - shibaShare;
  const shibaDirectionGlyph = shibaDirection === "right" ? "->" : "<-";
  const factorToneClass = shibaVelocityFactor.source === "external" ? "external" : "internal";
  const hypeTier = score > 500 ? "legend" : score > 250 ? "hot" : score > 120 ? "warm" : "calm";

  return (
    <div className="miwa-stats">
      <div className="miwa-stat-card theme-time">
        <strong>Clock</strong>
        <span>{timeLeft}s left</span>
        <div className="miwa-meter mini" aria-hidden="true">
          <div className="miwa-meter-fill time" style={{ width: `${timePct}%` }} />
        </div>
      </div>
      <div className="miwa-stat-card theme-score">
        <strong>Hype</strong>
        <span>{score}</span>
        <span className={`miwa-mini-chip ${hypeTier}`}>{hypeTier}</span>
      </div>
      <div className="miwa-stat-card theme-progress">
        <strong>Park Run</strong>
        <span className="miwa-mini-chip bright">{progressPct >= 100 ? "arrived" : "en route"}</span>
      </div>
      <div className="miwa-stat-card theme-mood">
        <strong>Mood Meter</strong>
        <span className="miwa-mini-chip mood">{stubbornness < 35 ? "chill" : stubbornness < 70 ? "tense" : "chaos"}</span>
        <div className="miwa-meter mini" aria-hidden="true">
          <div className="miwa-meter-fill mood" style={{ width: `${stubbornPct}%` }} />
        </div>
      </div>
      <div className="miwa-stat-card">
        <strong>Shiba Drive</strong>
        <div className="miwa-metric-row">
          <span className={`miwa-dir-chip ${shibaDirection}`}>{shibaDirectionGlyph}</span>
        </div>
        <div className="miwa-meter" aria-hidden="true">
          <div className="miwa-meter-fill shiba" style={{ width: `${shibaPct}%` }} />
        </div>
      </div>
      <div className="miwa-stat-card">
        <strong>Human Pull</strong>
        <div className="miwa-metric-row">
          <span className="miwa-dir-chip human">pull</span>
        </div>
        <div className="miwa-meter" aria-hidden="true">
          <div className="miwa-meter-fill human" style={{ width: `${humanPct}%` }} />
        </div>
      </div>
      <div className="miwa-stat-card miwa-stat-factor">
        <strong>Current Impulse</strong>
        <span className={`miwa-factor-chip ${factorToneClass}`}>{shibaVelocityFactor.source}</span>
        <span>{shibaVelocityFactor.label}</span>
      </div>
      <div className="miwa-stat-card miwa-stat-balance">
        <strong>Leash Clash</strong>
        <div className="miwa-balance-track" aria-hidden="true">
          <div className="miwa-balance-fill shiba" style={{ width: `${shibaShare}%` }} />
          <div className="miwa-balance-fill human" style={{ width: `${humanShare}%` }} />
        </div>
      </div>
    </div>
  );
}
