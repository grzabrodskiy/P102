type ProgressBarProps = {
  progressPct: number;
};

export function ProgressBar({ progressPct }: ProgressBarProps) {
  return (
    <div className="miwa-progress-wrap" aria-label="Progress">
      <div className="miwa-progress-meta">
        <strong>Path To Park</strong>
      </div>
      <div className="miwa-progress-bar">
        <div className="miwa-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}
