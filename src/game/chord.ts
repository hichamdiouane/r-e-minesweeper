import { neighborsOf } from "../engine/board";
import type { Board } from "../engine/types";
import { revealCell } from "./reveal";

/** Outcome of a chord (middle click / double click on a number). */
export interface ChordResult {
  readonly board: Board;
  readonly hitMine: boolean;
  /** Index of the mine that was detonated, when the chord lost the game. */
  readonly detonated: number | null;
  readonly revealed: number;
}

/**
 * Chording: middle-clicking (or double-clicking) a revealed number reveals all
 * of its hidden neighbours when the number of surrounding flags matches the
 * number itself.
 *
 * A wrong flag therefore detonates a mine, exactly like the original game.
 */
export function chordCell(board: Board, index: number): ChordResult {
  if (!board.seeded) {
    return { board, hitMine: false, detonated: null, revealed: 0 };
  }

  const cell = board.cells[index];
  if (!cell || cell.state !== "revealed" || cell.adjacent === 0) {
    return { board, hitMine: false, detonated: null, revealed: 0 };
  }

  const around = neighborsOf(board.rows, board.cols, index);
  const flags = around.filter((neighbor) => board.cells[neighbor]?.state === "flagged").length;
  if (flags !== cell.adjacent) {
    return { board, hitMine: false, detonated: null, revealed: 0 };
  }

  let current = board;
  let hitMine = false;
  let detonated: number | null = null;
  let revealed = 0;

  for (const neighbor of around) {
    const target = current.cells[neighbor];
    if (!target || target.state !== "hidden") continue;

    const result = revealCell(current, neighbor);
    current = result.board;
    revealed += result.revealed;

    if (result.hitMine) {
      hitMine = true;
      detonated = neighbor;
      break;
    }
  }

  return { board: current, hitMine, detonated, revealed };
}
