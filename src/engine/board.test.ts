import { describe, expect, it } from "vitest";
import {
  createBoard,
  generateBoard,
  indexOf,
  neighborsOf,
  seedBoard,
} from "../engine/board";
import { mulberry32 } from "../engine/rng";
import type { BoardConfig } from "../engine/types";
import { boardWithMines, mineIndexes } from "../test/helpers";

const BEGINNER: BoardConfig = { rows: 9, cols: 9, mines: 10 };

describe("createBoard", () => {
  it("starts hidden, unseeded and mine free", () => {
    const board = createBoard(BEGINNER);

    expect(board.cells).toHaveLength(81);
    expect(board.seeded).toBe(false);
    expect(board.cells.every((cell) => !cell.mine && cell.state === "hidden")).toBe(true);
  });

  it("rejects boards without a safe cell", () => {
    expect(() => createBoard({ rows: 1, cols: 1, mines: 1 })).toThrow(RangeError);
    expect(() => createBoard({ rows: 0, cols: 5, mines: 1 })).toThrow(RangeError);
    expect(() => createBoard({ rows: 5, cols: 5, mines: -1 })).toThrow(RangeError);
  });
});

describe("mine placement", () => {
  it("places exactly the requested number of unique mines inside the board", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const board = generateBoard(BEGINNER, 40, mulberry32(seed));
      const mines = mineIndexes(board);

      expect(board.seeded).toBe(true);
      expect(mines).toHaveLength(BEGINNER.mines);
      expect(new Set(mines).size).toBe(BEGINNER.mines);
      expect(mines.every((index) => index >= 0 && index < 81)).toBe(true);
    }
  });

  it("is deterministic for a given seed", () => {
    const first = generateBoard(BEGINNER, 40, mulberry32(2024));
    const second = generateBoard(BEGINNER, 40, mulberry32(2024));
    const other = generateBoard(BEGINNER, 40, mulberry32(2025));

    expect(mineIndexes(first)).toEqual(mineIndexes(second));
    expect(mineIndexes(first)).not.toEqual(mineIndexes(other));
  });

  it("keeps flags that were placed before the first reveal", () => {
    const board = createBoard(BEGINNER);
    const flagged = { ...board, cells: board.cells.map((cell, i) => (i === 0 ? { ...cell, state: "flagged" as const } : cell)) };

    const seeded = seedBoard(flagged, 40, mulberry32(7));

    expect(seeded.cells[0]?.state).toBe("flagged");
    expect(seeded.cells[0]?.mine).toBe(false);
  });
});

describe("first-click safety", () => {
  it("never puts a mine on the first click or its neighbours", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const first = 40; // centre of a 9x9 board
      const board = generateBoard(BEGINNER, first, mulberry32(seed));

      expect(board.cells[first]?.mine).toBe(false);
      for (const neighbor of neighborsOf(board.rows, board.cols, first)) {
        expect(board.cells[neighbor]?.mine).toBe(false);
      }
    }
  });

  it("always leaves the first clicked cell safe, even on a crowded board", () => {
    const board = generateBoard({ rows: 3, cols: 3, mines: 8 }, 4, mulberry32(3));

    expect(board.cells[4]?.mine).toBe(false);
    expect(mineIndexes(board)).toHaveLength(8);
  });

  it("treats a negative safe index as unprotected placement", () => {
    const board = generateBoard({ rows: 3, cols: 3, mines: 1 }, -1, mulberry32(1));
    expect(mineIndexes(board)).toHaveLength(1);
  });
});

describe("neighbour counting", () => {
  it("counts the eight neighbours of a corner, edge and centre cell", () => {
    const board = boardWithMines(3, 3, [0]);

    expect(board.cells[1]?.adjacent).toBe(1);
    expect(board.cells[3]?.adjacent).toBe(1);
    expect(board.cells[4]?.adjacent).toBe(1);
    expect(board.cells[2]?.adjacent).toBe(0);
    expect(board.cells[6]?.adjacent).toBe(0);
    expect(board.cells[8]?.adjacent).toBe(0);
    expect(board.cells[0]?.adjacent).toBe(0);
  });

  it("counts multiple mines around a single cell", () => {
    const board = boardWithMines(3, 3, [0, 1, 3]);

    // Cell 4 touches all three mines.
    expect(board.cells[4]?.adjacent).toBe(3);
    // Cell 2 touches mines 1 only (0 and 3 are not neighbours).
    expect(board.cells[2]?.adjacent).toBe(1);
    // Cell 8 touches none of them.
    expect(board.cells[8]?.adjacent).toBe(0);
  });

  it("does not wrap around row edges", () => {
    const board = boardWithMines(3, 3, [8]);

    // 5 is above 8, 7 is left of 8, 4 is diagonal; 6 and 2 are in other rows.
    expect(neighborsOf(3, 3, 8)).toEqual([4, 5, 7]);
    expect(board.cells[5]?.adjacent).toBe(1);
    expect(board.cells[7]?.adjacent).toBe(1);
    expect(board.cells[4]?.adjacent).toBe(1);
    expect(board.cells[2]?.adjacent).toBe(0);
    expect(board.cells[6]?.adjacent).toBe(0);
    expect(indexOf(3, 2, 2)).toBe(8);
  });
});
