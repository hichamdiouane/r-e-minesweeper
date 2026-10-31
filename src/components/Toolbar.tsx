import type { Face } from "../state/minesweeperReducer";
import { Counter } from "./Counter";
import { Smiley } from "./Smiley";

interface ToolbarProps {
  readonly minesRemaining: number;
  readonly elapsed: number;
  readonly face: Face;
  readonly onRestart: () => void;
}

/** Counter / smiley / counter header of the game window. */
export function Toolbar({ minesRemaining, elapsed, face, onRestart }: ToolbarProps) {
  return (
    <div className="toolbar">
      <Counter value={minesRemaining} label="Mines remaining" />
      <button
        type="button"
        className="face-button"
        onClick={onRestart}
        aria-label="Start a new game"
        title="New game"
      >
        <Smiley face={face} />
      </button>
      <Counter value={elapsed} label="Elapsed seconds" />
    </div>
  );
}
