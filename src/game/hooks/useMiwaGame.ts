import { useCallback, useEffect, useMemo, useReducer } from "react";
import { GAME_RULES } from "../config";
import { Action } from "../types";
import { gameReducer, getInitialState } from "../lib/gameLoop";

function clampMax(value: number, max: number): number {
  return Math.min(value, max);
}

export function useMiwaGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState);

  const canPlay = state.status === "playing";
  const progressPct = useMemo(() => clampMax(Math.round(state.progress), 100), [state.progress]);
  const timeLeft = useMemo(() => Math.max(0, Math.ceil(state.timeLeftMs / 1000)), [state.timeLeftMs]);

  useEffect(() => {
    if (!canPlay) return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), GAME_RULES.tickMs);
    return () => window.clearInterval(timer);
  }, [canPlay]);

  const dash = useCallback(() => {
    dispatch({ type: "dash" });
  }, []);

  const setMovement = useCallback((direction: "left" | "right", pressed: boolean) => {
    dispatch({ type: "setMovement", direction, pressed });
  }, []);

  const clearMovement = useCallback(() => {
    dispatch({ type: "clearMovement" });
  }, []);

  const chooseAction = useCallback((action: Action) => {
    dispatch({ type: "chooseAction", action });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "restart" });
  }, []);

  return {
    activeDistraction: state.activeDistraction,
    activePowerUp: state.activePowerUp,
    canPlay,
    catActor: state.catActor,
    clearMovement,
    chooseAction,
    dash,
    facing: state.facing,
    log: state.log,
    playerX: Math.round(state.playerX),
    playerY: Math.round(state.playerY),
    progressPct,
    score: Math.round(state.score),
    restart,
    setMovement,
    status: state.status,
    stubbornness: Math.round(state.stubbornness),
    timeLeft
  };
}
