import type { Board, Cell } from "../engine/types";

/**
 * Cycles a hidden cell to flagged and a flagged cell back to hidden.
 * Revealed cells are immutable, and flags are allowed before the first reveal.
 */
export function toggleFlag(board: Board, index: number): Board {
  const cell = board.cells[index];
  if (!cell || cell.state === "revealed") return board;

  const cells = board.cells.map((current) => ({ ...current })) as Cell[];
  cells[index] = {
    ...cell,
    state: cell.state === "flagged" ? "hidden" : "flagged",
  };

  return { ...board, cells };
}
