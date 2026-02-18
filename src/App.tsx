import { useEffect, useMemo, useState } from "react";

type Action = "treat" | "gentlePull" | "letSniff" | "firmLead";
type Status = "playing" | "won" | "lost";

type Distraction = {
  id: string;
  text: string;
  correctAction: Action;
};

const DISTRACTIONS: Distraction[] = [
  {
    id: "refuse",
    text: "Miwa full-stops and refuses to walk.",
    correctAction: "treat"
  },
  {
    id: "cat",
    text: "Miwa spots a cat and tries to chase it.",
    correctAction: "gentlePull"
  },
  {
    id: "dog",
    text: "Miwa wants to socialize with another dog.",
    correctAction: "letSniff"
  },
  {
    id: "direction",
    text: "Miwa stubbornly picks a different direction.",
    correctAction: "firmLead"
  }
];

const ACTION_LABELS: Record<Action, string> = {
  treat: "Offer treat",
  gentlePull: "Gentle pull",
  letSniff: "Let sniff",
  firmLead: "Firm lead"
};

const LEVEL_TARGET = 100;
const START_TIME = 60;
const START_STUBBORNNESS = 10;

function pickDistraction(): Distraction {
  const index = Math.floor(Math.random() * DISTRACTIONS.length);
  return DISTRACTIONS[index];
}

export default function App() {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [stubbornness, setStubbornness] = useState(START_STUBBORNNESS);
  const [status, setStatus] = useState<Status>("playing");
  const [activeDistraction, setActiveDistraction] = useState<Distraction | null>(null);
  const [log, setLog] = useState("Level 1: Take Miwa to the park.");

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      setActiveDistraction((current) => {
        if (current) return current;
        if (Math.random() < 0.3) return pickDistraction();
        return null;
      });
      setStubbornness((prev) => prev + (activeDistraction ? 6 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status, activeDistraction]);

  useEffect(() => {
    if (status !== "playing") return;
    if (progress >= LEVEL_TARGET) {
      setStatus("won");
      setLog("You made it to the park. Miwa is happy and proud.");
      return;
    }
    if (timeLeft <= 0 || stubbornness >= 100) {
      setStatus("lost");
      setLog("Miwa wins this round. Try a different strategy.");
    }
  }, [progress, stubbornness, timeLeft, status]);

  const canPlay = status === "playing";
  const progressPct = useMemo(() => Math.min(100, Math.round(progress)), [progress]);

  function addLog(message: string) {
    setLog(message);
  }

  function walkStep() {
    if (!canPlay) return;
    if (activeDistraction) {
      setStubbornness((prev) => prev + 4);
      addLog(`Blocked: ${activeDistraction.text}`);
      return;
    }
    const step = 8 + Math.floor(Math.random() * 5);
    setProgress((prev) => prev + step);
    addLog(`You keep walking. Progress +${step}.`);
  }

  function handleAction(action: Action) {
    if (!canPlay || !activeDistraction) return;

    if (action === activeDistraction.correctAction) {
      setProgress((prev) => prev + 4);
      setStubbornness((prev) => Math.max(0, prev - 8));
      addLog(`Good call. Miwa calms down after "${ACTION_LABELS[action]}".`);
      setActiveDistraction(null);
      return;
    }

    setStubbornness((prev) => prev + 8);
    addLog(`That backfired. Miwa gets more stubborn.`);
  }

  function restart() {
    setProgress(0);
    setTimeLeft(START_TIME);
    setStubbornness(START_STUBBORNNESS);
    setStatus("playing");
    setActiveDistraction(null);
    setLog("Level 1 restarted: Take Miwa to the park.");
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Miwa</h1>
        <p className="subtitle">Shiba adventure game - Level 1: Go to the park</p>

        <div className="stats">
          <div>
            <strong>Time</strong>
            <span>{timeLeft}s</span>
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

        <div className="progressBar">
          <div className="progressFill" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="event">
          {activeDistraction ? (
            <p>
              <strong>Distraction:</strong> {activeDistraction.text}
            </p>
          ) : (
            <p>No distractions right now. Keep moving.</p>
          )}
        </div>

        <div className="controls">
          <button onClick={walkStep} disabled={!canPlay}>
            Walk step
          </button>
          <button onClick={() => handleAction("treat")} disabled={!canPlay || !activeDistraction}>
            Offer treat
          </button>
          <button onClick={() => handleAction("gentlePull")} disabled={!canPlay || !activeDistraction}>
            Gentle pull
          </button>
          <button onClick={() => handleAction("letSniff")} disabled={!canPlay || !activeDistraction}>
            Let sniff
          </button>
          <button onClick={() => handleAction("firmLead")} disabled={!canPlay || !activeDistraction}>
            Firm lead
          </button>
          <button onClick={restart}>Restart</button>
        </div>

        <p className="log">{log}</p>

        {status !== "playing" && (
          <div className="result">
            <strong>{status === "won" ? "Level Complete" : "Level Failed"}</strong>
          </div>
        )}
      </section>
    </main>
  );
}
