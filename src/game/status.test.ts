import { describe, expect, it } from "vitest";
import { createBoard } from "../engine/board";
import { toggleFlag } from "../game/flags";
import { revealCell } from "../game/reveal";
import { countFlags, flagAllMines, isWon, remainingMines } from "../game/status";
import { boardWithMines, flaggedIndexes } from "../test/helpers";

describe("isWon", () => {
  it("is false before the first reveal", () => {
    expect(isWon(createBoard({ rows: 3, cols: 3, mines: 1 }))).toBe(false);
  });

  it("is false while any safe cell is hidden", () => {
    const board = boardWithMines(3, 3, [8]);
    const partial = revealCell(board, 4).board;
    expect(isWon(partial)).toBe(false);
  });

  it("is true when every safe cell is revealed", () => {
    const board = boardWithMines(3, 3, [8]);
    expect(isWon(revealCell(board, 0).board)).toBe(true);
  });
});

describe("remainingMines", () => {
  it("subtracts placed flags from the mine count", () => {
    const board = boardWithMines(3, 3, [8]);
    expect(remainingMines(board)).toBe(1);
    expect(remainingMines(toggleFlag(board, 0))).toBe(0);
  });

  it("can go negative when over-flagged", () => {
    const board = boardWithMines(3, 3, [8]);
    const overFlagged = toggleFlag(toggleFlag(board, 0), 1);
    expect(remainingMines(overFlagged)).toBe(-1);
  });
});

describe("flagAllMines", () => {
  it("flags every unflagged mine and keeps existing flags", () => {
    const board = boardWithMines(3, 3, [0, 8]);
    const wronglyFlagged = toggleFlag(board, 4);
    const finished = flagAllMines(wronglyFlagged);

    expect(flaggedIndexes(finished).sort((a, b) => a - b)).toEqual([0, 4, 8]);
    expect(countFlags(finished)).toBe(3);
  });

  it("does not mutate the source board", () => {
    const board = boardWithMines(3, 3, [8]);
    flagAllMines(board);
    expect(board.cells[8]?.state).toBe("hidden");
  });
});
