import { useCallback, useEffect, useReducer } from "react";
import type { BoardConfig, DifficultyId } from "../engine/types";
import { countFlags, remainingMines } from "../game/status";
import {
  createInitialState,
  faceOf,
  minesweeperReducer,
  presetConfig,
} from "./minesweeperReducer";

const TICK_MS = 200;

/**
 * React binding for the pure Minesweeper reducer.
 *
 * Only the timer is impure: it dispatches `tick` while the game is playing so
 * counters stay in sync without a component re-render per animation frame.
 */
export function useMinesweeper() {
  const [state, dispatch] = useReducer(minesweeperReducer, undefined, () =>
    createInitialState("beginner", presetConfig("beginner")),
  );

  useEffect(() => {
    if (state.status !== "playing") return;
    const id = window.setInterval(() => {
      dispatch({ type: "tick", now: Date.now() });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [state.status]);

  const reveal = useCallback((index: number) => {
    dispatch({ type: "reveal", index, now: Date.now() });
  }, []);

  const flag = useCallback((index: number) => {
    dispatch({ type: "flag", index });
  }, []);

  const chord = useCallback((index: number) => {
    dispatch({ type: "chord", index, now: Date.now() });
  }, []);

  const pressBoard = useCallback((pressed: boolean) => {
    dispatch({ type: "press-board", pressed });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "reset", config: state.config, difficulty: state.difficulty });
  }, [state.config, state.difficulty]);

  const startPreset = useCallback((difficulty: Exclude<DifficultyId, "custom">) => {
    dispatch({
      type: "reset",
      config: presetConfig(difficulty),
      difficulty,
    });
  }, []);

  const startCustom = useCallback((config: BoardConfig) => {
    dispatch({ type: "reset", config, difficulty: "custom" });
  }, []);

  return {
    state,
    face: faceOf(state),
    minesRemaining: remainingMines(state.board),
    flagsUsed: countFlags(state.board),
    reveal,
    flag,
    chord,
    pressBoard,
    restart,
    startPreset,
    startCustom,
  };
}

export type MinesweeperController = ReturnType<typeof useMinesweeper>;
