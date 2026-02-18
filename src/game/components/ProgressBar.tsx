type ProgressBarProps = {
  progressPct: number;
};

export function ProgressBar({ progressPct }: ProgressBarProps) {
  return (
    <div className="miwa-progress-bar" aria-label="Progress">
      <div className="miwa-progress-fill" style={{ width: `${progressPct}%` }} />
    </div>
  );
}
