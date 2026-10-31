import { describe, expect, it } from "vitest";
import { createBoard } from "../engine/board";
import { toggleFlag } from "../game/flags";
import { countFlags, remainingMines } from "../game/status";
import { boardWithMines, flaggedIndexes } from "../test/helpers";

describe("toggleFlag", () => {
  it("cycles hidden -> flagged -> hidden", () => {
    const board = boardWithMines(3, 3, [8]);

    const flagged = toggleFlag(board, 0);
    expect(flagged.cells[0]?.state).toBe("flagged");
    expect(flaggedIndexes(flagged)).toEqual([0]);

    const unflagged = toggleFlag(flagged, 0);
    expect(unflagged.cells[0]?.state).toBe("hidden");
    expect(flaggedIndexes(unflagged)).toEqual([]);
  });

  it("refuses to flag a revealed cell", () => {
    const board = boardWithMines(3, 3, [8]);
    const revealed = {
      ...board,
      cells: board.cells.map((cell, index) => (index === 0 ? { ...cell, state: "revealed" as const } : cell)),
    };

    expect(toggleFlag(revealed, 0)).toBe(revealed);
  });

  it("ignores out-of-range indexes", () => {
    const board = boardWithMines(3, 3, [8]);
    expect(toggleFlag(board, -1)).toBe(board);
    expect(toggleFlag(board, 42)).toBe(board);
  });

  it("does not touch the mine layout or numbers", () => {
    const board = boardWithMines(3, 3, [8]);
    const flagged = toggleFlag(board, 4);

    expect(flagged.cells.map((cell) => cell.mine)).toEqual(board.cells.map((cell) => cell.mine));
    expect(flagged.cells.map((cell) => cell.adjacent)).toEqual(
      board.cells.map((cell) => cell.adjacent),
    );
  });

  it("counts flags for the mine counter, including negative values", () => {
    const board = createBoard({ rows: 3, cols: 3, mines: 1 });
    expect(remainingMines(board)).toBe(1);

    const first = toggleFlag(board, 0);
    const second = toggleFlag(first, 1);
    const third = toggleFlag(second, 2);

    expect(countFlags(third)).toBe(3);
    expect(remainingMines(third)).toBe(-2);
  });
});
