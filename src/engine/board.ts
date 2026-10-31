import { shuffle } from "./rng";
import type { Board, BoardConfig, Cell, Rng } from "./types";

/**
 * Board generation: empty board -> mine placement -> neighbour counts.
 *
 * Every function is pure; a new board object is returned instead of mutating
 * the argument. Boards are small (480 cells on Expert) so copying is cheap and
 * keeps React state updates predictable.
 */

const HIDDEN_CELL: Cell = { mine: false, adjacent: 0, state: "hidden" };

/** Throws when a config cannot represent a playable game. */
export function assertSupportedConfig(config: BoardConfig): void {
  const { rows, cols, mines } = config;
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || !Number.isInteger(mines)) {
    throw new RangeError("Rows, columns and mines must be integers.");
  }
  if (rows < 1 || cols < 1) {
    throw new RangeError("A board needs at least one row and one column.");
  }
  if (mines < 0) {
    throw new RangeError("Mine count cannot be negative.");
  }
  if (mines > rows * cols - 1) {
    throw new RangeError("A board needs at least one cell without a mine.");
  }
}

/** Converts a row/column pair to a flat index. */
export function indexOf(cols: number, row: number, col: number): number {
  return row * cols + col;
}

/** Converts a flat index to a row/column pair. */
export function coordinatesOf(cols: number, index: number): { row: number; col: number } {
  return { row: Math.floor(index / cols), col: index % cols };
}

/** Flat indices touching `index` (8-neighbourhood, no wrap-around). */
export function neighborsOf(rows: number, cols: number, index: number): number[] {
  const { row, col } = coordinatesOf(cols, index);
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      result.push(indexOf(cols, r, c));
    }
  }
  return result;
}

/** Builds a hidden board with no mines placed yet. */
export function createBoard(config: BoardConfig): Board {
  assertSupportedConfig(config);
  const cells: Cell[] = Array.from({ length: config.rows * config.cols }, () => HIDDEN_CELL);
  return { ...config, cells, seeded: false };
}

/**
 * Places mines, guaranteeing that `safeIndex` and its neighbours stay clear
 * when there is enough room (classic first-click safety).
 *
 * If the requested mine count does not fit outside the safe area, protection
 * degrades to the clicked cell only. With `safeIndex = -1` no cell is
 * protected.
 */
export function seedBoard(board: Board, safeIndex: number, rng: Rng): Board {
  const total = board.rows * board.cols;
  const excluded = new Set<number>();

  if (safeIndex >= 0 && safeIndex < total) {
    excluded.add(safeIndex);
    for (const neighbor of neighborsOf(board.rows, board.cols, safeIndex)) {
      excluded.add(neighbor);
    }
  }

  if (total - excluded.size < board.mines) {
    excluded.clear();
    if (safeIndex >= 0 && safeIndex < total) {
      excluded.add(safeIndex);
    }
  }

  if (total - excluded.size < board.mines) {
    throw new RangeError("Not enough free cells to place the requested mines.");
  }

  const candidates: number[] = [];
  for (let i = 0; i < total; i += 1) {
    if (!excluded.has(i)) candidates.push(i);
  }
  shuffle(candidates, rng);

  const cells: Cell[] = board.cells.map((cell) => ({ ...cell }));
  for (let i = 0; i < board.mines; i += 1) {
    const target = candidates[i];
    if (target === undefined) throw new RangeError("Mine placement ran out of cells.");
    const existing = cells[target];
    if (existing === undefined) throw new RangeError("Mine placement index out of range.");
    cells[target] = { ...existing, mine: true };
  }

  return countAdjacentMines({ ...board, cells, seeded: true });
}

/** Fills `adjacent` for every cell from the current mine layout. */
export function countAdjacentMines(board: Board): Board {
  const cells: Cell[] = board.cells.map((cell, index) => {
    let adjacent = 0;
    for (const neighbor of neighborsOf(board.rows, board.cols, index)) {
      if (board.cells[neighbor]?.mine) adjacent += 1;
    }
    return { ...cell, adjacent };
  });
  return { ...board, cells };
}

/**
 * Convenience wrapper: creates and seeds a board in one call.
 * Used by the UI on the first reveal and by tests.
 */
export function generateBoard(config: BoardConfig, safeIndex: number, rng: Rng): Board {
  return seedBoard(createBoard(config), safeIndex, rng);
}
