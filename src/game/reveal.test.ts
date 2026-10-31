import { describe, expect, it } from "vitest";
import { createBoard } from "../engine/board";
import { revealCell } from "../game/reveal";
import { toggleFlag } from "../game/flags";
import { isWon } from "../game/status";
import { boardWithMines, revealedIndexes } from "../test/helpers";

describe("revealCell", () => {
  it("ignores unseeded boards", () => {
    const board = createBoard({ rows: 9, cols: 9, mines: 10 });
    const result = revealCell(board, 0);

    expect(result.board).toBe(board);
    expect(result.revealed).toBe(0);
    expect(result.hitMine).toBe(false);
  });

  it("reveals only the clicked number cell", () => {
    const board = boardWithMines(3, 3, [8]);
    const result = revealCell(board, 4);

    expect(result.hitMine).toBe(false);
    expect(result.revealed).toBe(1);
    expect(revealedIndexes(result.board)).toEqual([4]);
  });

  it("flood fills an empty region and its numbered border", () => {
    const board = boardWithMines(5, 5, [12]);
    const result = revealCell(board, 0);

    expect(result.hitMine).toBe(false);
    expect(result.revealed).toBe(24);
    expect(revealedIndexes(result.board)).toHaveLength(24);
    expect(result.board.cells[12]?.state).toBe("hidden");
    // Border cells keep their number so the player can count around the mine.
    expect(result.board.cells[7]?.state).toBe("revealed");
    expect(result.board.cells[7]?.adjacent).toBe(1);
  });

  it("does not reveal through a flagged cell", () => {
    const board = boardWithMines(1, 5, []);
    const flagged = toggleFlag(board, 2);
    const result = revealCell(flagged, 0);

    expect(revealedIndexes(result.board)).toEqual([0, 1]);
    expect(result.board.cells[2]?.state).toBe("flagged");
    expect(result.board.cells[3]?.state).toBe("hidden");
    expect(result.board.cells[4]?.state).toBe("hidden");
  });

  it("ignores a flagged cell", () => {
    const board = toggleFlag(boardWithMines(3, 3, [8]), 0);
    const result = revealCell(board, 0);

    expect(result.board).toBe(board);
    expect(result.revealed).toBe(0);
  });

  it("ignores an already revealed cell and out-of-range indexes", () => {
    const board = boardWithMines(3, 3, [8]);
    const first = revealCell(board, 4);

    expect(revealCell(first.board, 4).board).toBe(first.board);
    expect(revealCell(first.board, 999).board).toBe(first.board);
  });

  it("loses on a mine and exposes every mine", () => {
    const board = boardWithMines(3, 3, [0, 8]);
    const result = revealCell(board, 8);

    expect(result.hitMine).toBe(true);
    expect(result.revealed).toBe(1);
    expect(result.board.cells[0]?.state).toBe("revealed");
    expect(result.board.cells[8]?.state).toBe("revealed");
    expect(result.board.cells[1]?.state).toBe("hidden");
    expect(isWon(result.board)).toBe(false);
  });

  it("detects a win once every safe cell is revealed", () => {
    const board = boardWithMines(3, 3, [8]);
    const result = revealCell(board, 0);

    expect(result.hitMine).toBe(false);
    expect(isWon(result.board)).toBe(true);
  });
});
