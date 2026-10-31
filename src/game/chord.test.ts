import { describe, expect, it } from "vitest";
import { chordCell } from "../game/chord";
import { toggleFlag } from "../game/flags";
import { revealCell } from "../game/reveal";
import { isWon } from "../game/status";
import { boardWithMines, revealedIndexes } from "../test/helpers";

describe("chordCell", () => {
  it("does nothing when the surrounding flag count does not match", () => {
    const board = boardWithMines(3, 3, [8]);
    const opened = revealCell(board, 4).board;

    const result = chordCell(opened, 4);

    expect(result.board).toBe(opened);
    expect(result.revealed).toBe(0);
    expect(result.hitMine).toBe(false);
  });

  it("does nothing on hidden cells or on revealed cells with no number", () => {
    const board = boardWithMines(3, 3, [8]);

    expect(chordCell(board, 0).board).toBe(board);

    const opened = revealCell(board, 0).board;
    expect(opened.cells[0]?.state).toBe("revealed");
    expect(opened.cells[0]?.adjacent).toBe(0);
    expect(chordCell(opened, 0).board).toBe(opened);
  });

  it("reveals unflagged neighbours when flags match the number", () => {
    const board = boardWithMines(3, 3, [8]);
    const opened = revealCell(board, 4).board;
    const flagged = toggleFlag(opened, 8);

    const result = chordCell(flagged, 4);

    expect(result.hitMine).toBe(false);
    expect(result.detonated).toBeNull();
    expect(isWon(result.board)).toBe(true);
    expect(revealedIndexes(result.board)).toHaveLength(8);
    // The correctly flagged mine is never auto-revealed.
    expect(result.board.cells[8]?.state).toBe("flagged");
  });

  it("keeps flags in place while chording", () => {
    const board = boardWithMines(3, 3, [8]);
    const opened = revealCell(board, 4).board;
    const flagged = toggleFlag(opened, 8);

    const result = chordCell(flagged, 4);

    expect(result.board.cells[8]?.state).toBe("flagged");
  });

  it("loses when a flag is wrong", () => {
    const board = boardWithMines(3, 3, [0, 8]);
    const opened = revealCell(board, 4).board;
    // Cell 4 reports 2 adjacent mines; flag one real mine and one empty cell.
    const flagged = toggleFlag(toggleFlag(opened, 8), 1);

    const result = chordCell(flagged, 4);

    expect(result.hitMine).toBe(true);
    expect(result.detonated).toBe(0);
    expect(result.board.cells[0]?.state).toBe("revealed");
    // A flagged mine keeps its flag when the game is lost.
    expect(result.board.cells[8]?.state).toBe("flagged");
    expect(isWon(result.board)).toBe(false);
  });

  it("reports detonation so the UI can highlight the cell", () => {
    const board = boardWithMines(3, 3, [8]);
    const opened = revealCell(board, 4).board;
    const flagged = toggleFlag(opened, 0);
    const chorded = chordCell(flagged, 4);

    // Flagging an empty cell makes the count match, so the mine at 8 explodes.
    expect(chorded.hitMine).toBe(true);
    expect(chorded.detonated).toBe(8);
  });
});
