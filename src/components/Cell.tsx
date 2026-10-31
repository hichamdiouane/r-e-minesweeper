import { memo } from "react";
import type { Cell as CellModel } from "../engine/types";
import { FlagIcon, MineIcon } from "./icons";

interface CellButtonProps {
  readonly cell: CellModel;
  readonly index: number;
  readonly lost: boolean;
  readonly exploded: boolean;
  readonly onReveal: (index: number) => void;
  readonly onFlag: (index: number) => void;
  readonly onChord: (index: number) => void;
  readonly onPress: (pressed: boolean) => void;
}

function describe(cell: CellModel, exploded: boolean): string {
  if (exploded) return "Mine, game over";
  if (cell.state === "flagged") return "Flagged cell";
  if (cell.state === "revealed") {
    if (cell.mine) return "Mine";
    return cell.adjacent === 0 ? "Empty cell" : `${cell.adjacent} adjacent mines`;
  }
  return "Hidden cell";
}

/**
 * One board cell rendered as a real <button> so the board is keyboard
 * reachable and screen readers can announce cell state.
 */
export const CellButton = memo(function CellButton({
  cell,
  index,
  lost,
  exploded,
  onReveal,
  onFlag,
  onChord,
  onPress,
}: CellButtonProps) {
  const revealed = cell.state === "revealed";
  const flagged = cell.state === "flagged";
  const wrongFlag = lost && flagged && !cell.mine;
  const showMine = revealed && cell.mine;
  const number = revealed && !cell.mine && cell.adjacent > 0 ? cell.adjacent : 0;

  const className = [
    "cell",
    revealed ? "revealed" : "hidden",
    exploded ? "exploded" : "",
    number > 0 ? `n${number}` : "",
    wrongFlag ? "wrong" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      aria-label={describe(cell, exploded)}
      onClick={() => {
        if (!revealed && !flagged) onReveal(index);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        if (!revealed) onFlag(index);
      }}
      onAuxClick={(event) => {
        if (event.button === 1) {
          event.preventDefault();
          onChord(index);
        }
      }}
      onMouseDown={(event) => {
        if (event.button === 1) event.preventDefault();
        if (event.button === 0 && !revealed) onPress(true);
      }}
      onMouseUp={() => onPress(false)}
      onMouseLeave={() => onPress(false)}
      onDoubleClick={() => onChord(index)}
    >
      {showMine ? <MineIcon /> : null}
      {wrongFlag ? <MineIcon crossed /> : null}
      {flagged && !wrongFlag ? <FlagIcon /> : null}
      {number > 0 ? <span className="cell-number">{number}</span> : null}
    </button>
  );
});
