type GameStatsProps = {
  timeLeft: number;
  score: number;
  progressPct: number;
  stubbornness: number;
};

export function GameStats({ timeLeft, score, progressPct, stubbornness }: GameStatsProps) {
  return (
    <div className="miwa-stats">
      <div>
        <strong>Time</strong>
        <span>{timeLeft}s</span>
      </div>
      <div>
        <strong>Score</strong>
        <span>{score}</span>
      </div>
      <div>
        <strong>Progress</strong>
        <span>{progressPct}%</span>
      </div>
      <div>
        <strong>Stubbornness</strong>
        <span>{stubbornness}/100</span>
      </div>
    </div>
  );
}
