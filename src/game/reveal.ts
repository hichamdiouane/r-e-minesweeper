import { neighborsOf } from "../engine/board";
import type { Board, Cell } from "../engine/types";

/** Outcome of a reveal attempt. */
export interface RevealResult {
  readonly board: Board;
  readonly hitMine: boolean;
  readonly revealed: number;
}

function copyCells(board: Board): Cell[] {
  return board.cells.map((cell) => ({ ...cell }));
}

/** Turns every non-flagged mine face up (used when the game is lost). */
export function exposeMines(cells: Cell[]): void {
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i];
    if (cell && cell.mine && cell.state !== "flagged") {
      cells[i] = { ...cell, state: "revealed" };
    }
  }
}

/**
 * Reveals one cell.
 *
 * - A flagged or already revealed cell is a no-op.
 * - Revealing a mine loses the game and exposes every other mine.
 * - Revealing a cell with no adjacent mines triggers an iterative flood fill:
 *   zero cells reveal their neighbours, numbered cells reveal and stop.
 *
 * An unseeded board is never revealed (mines must be placed on first reveal).
 */
export function revealCell(board: Board, index: number): RevealResult {
  if (!board.seeded) {
    return { board, hitMine: false, revealed: 0 };
  }

  const target = board.cells[index];
  if (!target || target.state !== "hidden") {
    return { board, hitMine: false, revealed: 0 };
  }

  const cells = copyCells(board);

  if (target.mine) {
    cells[index] = { ...target, state: "revealed" };
    exposeMines(cells);
    return { board: { ...board, cells }, hitMine: true, revealed: 1 };
  }

  let revealed = 0;
  const stack: number[] = [index];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) break;

    const cell = cells[current];
    if (!cell || cell.state !== "hidden") continue;

    cells[current] = { ...cell, state: "revealed" };
    revealed += 1;

    if (cell.adjacent === 0) {
      for (const neighbor of neighborsOf(board.rows, board.cols, current)) {
        if (cells[neighbor]?.state === "hidden") {
          stack.push(neighbor);
        }
      }
    }
  }

  return { board: { ...board, cells }, hitMine: false, revealed };
}
