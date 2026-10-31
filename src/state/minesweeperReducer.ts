import { createBoard, seedBoard } from "../engine/board";
import type { Board, BoardConfig, DifficultyId, GameStatus, Rng } from "../engine/types";
import { chordCell, flagAllMines, isWon, revealCell, toggleFlag } from "../game";

/** Preset boards, matching the classic Windows/Minesweeper Online sizes. */
export interface Preset {
  readonly id: Exclude<DifficultyId, "custom">;
  readonly label: string;
  readonly rows: number;
  readonly cols: number;
  readonly mines: number;
}

export const PRESETS: readonly Preset[] = [
  { id: "beginner", label: "Beginner", rows: 9, cols: 9, mines: 10 },
  { id: "intermediate", label: "Intermediate", rows: 16, cols: 16, mines: 40 },
  { id: "expert", label: "Expert", rows: 16, cols: 30, mines: 99 },
];

export function presetConfig(id: Exclude<DifficultyId, "custom">): BoardConfig {
  const preset = PRESETS.find((entry) => entry.id === id);
  if (!preset) throw new Error(`Unknown difficulty: ${id}`);
  return { rows: preset.rows, cols: preset.cols, mines: preset.mines };
}

/** Bounds for the custom board form. */
export const CUSTOM_LIMITS = {
  rows: { min: 1, max: 40 },
  cols: { min: 1, max: 40 },
  mines: { min: 1, max: 1599 },
} as const;

/** Returns an error message, or null when the custom values are playable. */
export function validateCustomConfig(rows: number, cols: number, mines: number): string | null {
  if (![rows, cols, mines].every(Number.isInteger)) return "Use whole numbers only.";
  if (rows < CUSTOM_LIMITS.rows.min || rows > CUSTOM_LIMITS.rows.max) {
    return `Rows must be between ${CUSTOM_LIMITS.rows.min} and ${CUSTOM_LIMITS.rows.max}.`;
  }
  if (cols < CUSTOM_LIMITS.cols.min || cols > CUSTOM_LIMITS.cols.max) {
    return `Columns must be between ${CUSTOM_LIMITS.cols.min} and ${CUSTOM_LIMITS.cols.max}.`;
  }
  const maxMines = rows * cols - 1;
  if (mines < 1 || mines > maxMines) {
    return `Mines must be between 1 and ${maxMines} for this board.`;
  }
  return null;
}

/** The four faces the smiley can show. */
export type Face = "smile" | "ooh" | "dead" | "cool";

/** Complete UI state for one game. */
export interface MinesweeperState {
  readonly difficulty: DifficultyId;
  readonly config: BoardConfig;
  readonly board: Board;
  readonly status: GameStatus;
  readonly startedAt: number | null;
  readonly elapsed: number;
  readonly pressing: boolean;
  /** Cell that was clicked when the game was lost, highlighted in red. */
  readonly exploded: number | null;
}

export interface CustomConfig {
  readonly config: BoardConfig;
  readonly difficulty: DifficultyId;
}

export type MinesweeperAction =
  | { readonly type: "reveal"; readonly index: number; readonly now: number; readonly rng?: Rng }
  | { readonly type: "flag"; readonly index: number }
  | { readonly type: "chord"; readonly index: number; readonly now: number }
  | { readonly type: "reset"; readonly config: BoardConfig; readonly difficulty: DifficultyId }
  | { readonly type: "tick"; readonly now: number }
  | { readonly type: "press-board"; readonly pressed: boolean };

export function createInitialState(
  difficulty: DifficultyId = "beginner",
  config: BoardConfig = presetConfig("beginner"),
): MinesweeperState {
  return {
    difficulty,
    config,
    board: createBoard(config),
    status: "idle",
    startedAt: null,
    elapsed: 0,
    pressing: false,
    exploded: null,
  };
}

/** The smiley face implied by the current state. */
export function faceOf(state: MinesweeperState): Face {
  if (state.status === "lost") return "dead";
  if (state.status === "won") return "cool";
  if (state.pressing) return "ooh";
  return "smile";
}

function elapsedAt(startedAt: number | null, now: number): number {
  if (startedAt === null) return 0;
  return Math.min(999, Math.max(0, Math.floor((now - startedAt) / 1000)));
}

/**
 * Resolves a board transition into the next state, collapsing the timer and
 * win/loss bookkeeping that every interaction shares.
 */
function settle(
  state: MinesweeperState,
  board: Board,
  hitMine: boolean,
  detonated: number | null,
  now: number,
  startedAt: number,
): MinesweeperState {
  let nextBoard = board;
  let status: GameStatus = state.status === "idle" ? "playing" : state.status;

  if (hitMine) {
    status = "lost";
  } else if (isWon(nextBoard)) {
    status = "won";
    nextBoard = flagAllMines(nextBoard);
  }

  return {
    ...state,
    board: nextBoard,
    status,
    startedAt,
    elapsed: status === "playing" ? state.elapsed : elapsedAt(startedAt, now),
    pressing: false,
    exploded: status === "lost" ? detonated : null,
  };
}

export function minesweeperReducer(
  state: MinesweeperState,
  action: MinesweeperAction,
): MinesweeperState {
  switch (action.type) {
    case "reset":
      return createInitialState(action.difficulty, action.config);

    case "press-board":
      if (state.status === "won" || state.status === "lost") return state;
      if (state.pressing === action.pressed) return state;
      return { ...state, pressing: action.pressed };

    case "tick": {
      if (state.status !== "playing" || state.startedAt === null) return state;
      const elapsed = elapsedAt(state.startedAt, action.now);
      return elapsed === state.elapsed ? state : { ...state, elapsed };
    }

    case "flag": {
      if (state.status === "won" || state.status === "lost") return state;
      const board = toggleFlag(state.board, action.index);
      return board === state.board ? state : { ...state, board };
    }

    case "reveal": {
      if (state.status === "won" || state.status === "lost") return state;

      const rng = action.rng ?? Math.random;
      const board = state.board.seeded
        ? state.board
        : seedBoard(state.board, action.index, rng);
      const startedAt = state.startedAt ?? action.now;
      const result = revealCell(board, action.index);

      return settle(
        state,
        result.board,
        result.hitMine,
        result.hitMine ? action.index : null,
        action.now,
        startedAt,
      );
    }

    case "chord": {
      if (state.status !== "playing" || !state.board.seeded) return state;
      const startedAt = state.startedAt ?? action.now;
      const result = chordCell(state.board, action.index);

      return settle(state, result.board, result.hitMine, result.detonated, action.now, startedAt);
    }

    default:
      return state;
  }
}
