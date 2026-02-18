import { Status } from "../types";

type GameResultProps = {
  status: Status;
};

export function GameResult({ status }: GameResultProps) {
  if (status === "playing") return null;

  return (
    <div className="miwa-result">
      <strong>{status === "won" ? "Level Complete" : "Level Failed"}</strong>
    </div>
  );
}
