import { countAdjacentMines } from "../engine/board";
import type { Board, Cell, CellState } from "../engine/types";

/**
 * Builds a fully seeded board with an explicit mine layout, so rule tests do
 * not depend on random placement.
 */
export function boardWithMines(
  rows: number,
  cols: number,
  mineIndexes: readonly number[],
): Board {
  const cells: Cell[] = Array.from({ length: rows * cols }, (_, index) => ({
    mine: mineIndexes.includes(index),
    adjacent: 0,
    state: "hidden" as CellState,
  }));

  return countAdjacentMines({
    rows,
    cols,
    mines: mineIndexes.length,
    cells,
    seeded: true,
  });
}

/** Indices of every revealed cell. */
export function revealedIndexes(board: Board): number[] {
  const result: number[] = [];
  board.cells.forEach((cell, index) => {
    if (cell.state === "revealed") result.push(index);
  });
  return result;
}

/** Indices of every flagged cell. */
export function flaggedIndexes(board: Board): number[] {
  const result: number[] = [];
  board.cells.forEach((cell, index) => {
    if (cell.state === "flagged") result.push(index);
  });
  return result;
}

/** Indices of every cell holding a mine. */
export function mineIndexes(board: Board): number[] {
  const result: number[] = [];
  board.cells.forEach((cell, index) => {
    if (cell.mine) result.push(index);
  });
  return result;
}
