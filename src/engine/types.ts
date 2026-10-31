/**
 * Core data model shared by the engine, the game logic and the UI.
 *
 * The engine is deliberately framework free: nothing in `src/engine` or
 * `src/game` imports React, so the rules can be tested without a DOM.
 */

/** How a cell currently looks to the player. */
export type CellState = "hidden" | "revealed" | "flagged";

/**
 * A single board cell.
 *
 * - `mine` and `adjacent` describe the immutable board solution.
 * - `state` is the mutable player facing state.
 */
export interface Cell {
  readonly mine: boolean;
  readonly adjacent: number;
  readonly state: CellState;
}

/** Shape of a board request (difficulty preset or custom values). */
export interface BoardConfig {
  readonly rows: number;
  readonly cols: number;
  readonly mines: number;
}

/**
 * A playable board.
 *
 * `seeded` is false until the first reveal: mines cannot be placed before the
 * player commits to a first cell, otherwise first-click safety is impossible.
 * Flagging before the first reveal is still allowed.
 */
export interface Board extends BoardConfig {
  readonly cells: readonly Cell[];
  readonly seeded: boolean;
}

/** Injectable randomness source so tests can be deterministic. */
export type Rng = () => number;

/** Stable identifier for the built-in presets plus the custom form. */
export type DifficultyId = "beginner" | "intermediate" | "expert" | "custom";

/** Derived lifecycle of a single game. */
export type GameStatus = "idle" | "playing" | "won" | "lost";
