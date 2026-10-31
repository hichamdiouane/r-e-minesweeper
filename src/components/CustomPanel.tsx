import { useState } from "react";
import type { BoardConfig } from "../engine/types";
import { CUSTOM_LIMITS, validateCustomConfig } from "../state/minesweeperReducer";

interface CustomPanelProps {
  readonly config: BoardConfig;
  readonly onSubmit: (config: BoardConfig) => void;
  readonly onCancel: () => void;
}

function toNumber(value: string): number {
  return Number.parseInt(value, 10);
}

/** Small form for arbitrary row / column / mine combinations. */
export function CustomPanel({ config, onSubmit, onCancel }: CustomPanelProps) {
  const [rows, setRows] = useState(String(config.rows));
  const [cols, setCols] = useState(String(config.cols));
  const [mines, setMines] = useState(String(config.mines));

  const parsed = { rows: toNumber(rows), cols: toNumber(cols), mines: toNumber(mines) };
  const error = validateCustomConfig(parsed.rows, parsed.cols, parsed.mines);

  return (
    <form
      className="custom-panel"
      onSubmit={(event) => {
        event.preventDefault();
        if (error) return;
        onSubmit(parsed);
      }}
    >
      <div className="custom-fields">
        <label htmlFor="custom-rows">
          Rows
          <input
            id="custom-rows"
            type="number"
            inputMode="numeric"
            min={CUSTOM_LIMITS.rows.min}
            max={CUSTOM_LIMITS.rows.max}
            value={rows}
            onChange={(event) => setRows(event.target.value)}
          />
        </label>
        <label htmlFor="custom-cols">
          Columns
          <input
            id="custom-cols"
            type="number"
            inputMode="numeric"
            min={CUSTOM_LIMITS.cols.min}
            max={CUSTOM_LIMITS.cols.max}
            value={cols}
            onChange={(event) => setCols(event.target.value)}
          />
        </label>
        <label htmlFor="custom-mines">
          Mines
          <input
            id="custom-mines"
            type="number"
            inputMode="numeric"
            min={1}
            value={mines}
            onChange={(event) => setMines(event.target.value)}
          />
        </label>
      </div>
      <div className="custom-actions">
        <button type="submit" className="win-button" disabled={error !== null}>
          New board
        </button>
        <button type="button" className="win-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className={error ? "custom-error" : "custom-hint"} role="status">
        {error ?? "Custom boards keep first-click safety and chording."}
      </p>
    </form>
  );
}
