import { describe, expect, it } from "vitest";
import { mulberry32 } from "../engine/rng";
import { boardWithMines } from "../test/helpers";
import {
  createInitialState,
  minesweeperReducer,
  presetConfig,
  validateCustomConfig,
} from "./minesweeperReducer";

describe("minesweeperReducer", () => {
  it("starts idle with an unseeded board", () => {
    const state = createInitialState();

    expect(state.status).toBe("idle");
    expect(state.board.seeded).toBe(false);
    expect(state.startedAt).toBeNull();
    expect(state.board.mines).toBe(10);
  });

  it("seeds the board on first reveal and starts the timer", () => {
    const state = createInitialState();
    const next = minesweeperReducer(state, {
      type: "reveal",
      index: 40,
      now: 5_000,
      rng: mulberry32(11),
    });

    expect(next.board.seeded).toBe(true);
    expect(next.board.cells[40]?.mine).toBe(false);
    expect(next.status).toBe("playing");
    expect(next.startedAt).toBe(5_000);
    expect(next.elapsed).toBe(0);
  });

  it("allows flagging before the first reveal without starting the clock", () => {
    const state = createInitialState();
    const flagged = minesweeperReducer(state, { type: "flag", index: 0 });

    expect(flagged.status).toBe("idle");
    expect(flagged.startedAt).toBeNull();
    expect(flagged.board.cells[0]?.state).toBe("flagged");

    const revealed = minesweeperReducer(flagged, {
      type: "reveal",
      index: 40,
      now: 1_000,
      rng: mulberry32(3),
    });

    expect(revealed.board.cells[0]?.state).toBe("flagged");
    expect(revealed.status).toBe("playing");
  });

  it("reports a win, flags the mines and freezes the clock", () => {
    const base = createInitialState("custom", { rows: 1, cols: 2, mines: 1 });
    const state = {
      ...base,
      board: boardWithMines(1, 2, [1]),
      status: "playing" as const,
      startedAt: 1_000,
    };

    const next = minesweeperReducer(state, { type: "reveal", index: 0, now: 6_500 });

    expect(next.status).toBe("won");
    expect(next.board.cells[1]?.state).toBe("flagged");
    expect(next.elapsed).toBe(5);
  });

  it("reports a loss and remembers the detonated cell", () => {
    const base = createInitialState("custom", { rows: 1, cols: 2, mines: 1 });
    const state = {
      ...base,
      board: boardWithMines(1, 2, [1]),
      status: "playing" as const,
      startedAt: 0,
    };

    const next = minesweeperReducer(state, { type: "reveal", index: 1, now: 2_000 });

    expect(next.status).toBe("lost");
    expect(next.exploded).toBe(1);
    expect(next.elapsed).toBe(2);
  });

  it("ignores board input once the game is over", () => {
    const base = createInitialState("custom", { rows: 1, cols: 2, mines: 1 });
    const state = {
      ...base,
      board: boardWithMines(1, 2, [1]),
      status: "lost" as const,
      startedAt: 0,
    };

    expect(minesweeperReducer(state, { type: "reveal", index: 0, now: 1 })).toBe(state);
    expect(minesweeperReducer(state, { type: "flag", index: 0 })).toBe(state);
    expect(minesweeperReducer(state, { type: "chord", index: 0, now: 1 })).toBe(state);
  });

  it("resets to a new board with the requested preset", () => {
    const state = createInitialState();
    const next = minesweeperReducer(state, {
      type: "reset",
      config: presetConfig("expert"),
      difficulty: "expert",
    });

    expect(next.difficulty).toBe("expert");
    expect(next.board.rows).toBe(16);
    expect(next.board.cols).toBe(30);
    expect(next.board.mines).toBe(99);
    expect(next.status).toBe("idle");
    expect(next.elapsed).toBe(0);
  });
});

describe("validateCustomConfig", () => {
  it("accepts playable boards", () => {
    expect(validateCustomConfig(9, 9, 10)).toBeNull();
    expect(validateCustomConfig(1, 2, 1)).toBeNull();
  });

  it("rejects impossible boards", () => {
    expect(validateCustomConfig(0, 9, 1)).not.toBeNull();
    expect(validateCustomConfig(9, 9, 81)).not.toBeNull();
    expect(validateCustomConfig(9, 9, 0)).not.toBeNull();
    expect(validateCustomConfig(2.5, 9, 1)).not.toBeNull();
  });
});
