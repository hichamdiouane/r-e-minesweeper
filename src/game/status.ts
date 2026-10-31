import type { Board, Cell } from "../engine/types";

/** Number of flags currently placed. */
export function countFlags(board: Board): number {
  return board.cells.reduce((total, cell) => (cell.state === "flagged" ? total + 1 : total), 0);
}

/** Mine counter value: mines on the board minus placed flags (may go negative). */
export function remainingMines(board: Board): number {
  return board.mines - countFlags(board);
}

/** True when every safe cell is revealed (and the board is actually seeded). */
export function isWon(board: Board): boolean {
  if (!board.seeded) return false;
  return board.cells.every((cell) => cell.mine || cell.state === "revealed");
}

/**
 * Flags every mine that is not flagged yet, used to finish a won game the way
 * classic Minesweeper does.
 */
export function flagAllMines(board: Board): Board {
  const cells: Cell[] = board.cells.map((cell) => {
    if (!cell.mine || cell.state === "flagged") return cell;
    return { ...cell, state: "flagged" };
  });
  return { ...board, cells };
}
