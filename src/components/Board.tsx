import type { CSSProperties } from "react";
import type { Board as BoardModel, GameStatus } from "../engine/types";
import { CellButton } from "./Cell";

interface BoardProps {
  readonly board: BoardModel;
  readonly status: GameStatus;
  readonly exploded: number | null;
  readonly onReveal: (index: number) => void;
  readonly onFlag: (index: number) => void;
  readonly onChord: (index: number) => void;
  readonly onPress: (pressed: boolean) => void;
}

/** Sunken playfield grid. Cell size is driven by the `--cols` custom property. */
export function Board({
  board,
  status,
  exploded,
  onReveal,
  onFlag,
  onChord,
  onPress,
}: BoardProps) {
  const lost = status === "lost";
  const style = { "--cols": board.cols } as CSSProperties;

  return (
    <div className="board-wrap">
      <div
        className="board"
        style={style}
        role="group"
        aria-label={`Minesweeper board, ${board.rows} rows by ${board.cols} columns`}
        onContextMenu={(event) => event.preventDefault()}
      >
        {board.cells.map((cell, index) => (
          <CellButton
            key={index}
            cell={cell}
            index={index}
            lost={lost}
            exploded={exploded === index}
            onReveal={onReveal}
            onFlag={onFlag}
            onChord={onChord}
            onPress={onPress}
          />
        ))}
      </div>
    </div>
  );
}
