import { useState } from "react";
import { Board } from "./components/Board";
import { CustomPanel } from "./components/CustomPanel";
import { Toolbar } from "./components/Toolbar";
import { PRESETS } from "./state/minesweeperReducer";
import { useMinesweeper } from "./state/useMinesweeper";

const STATUS_TEXT: Record<string, string> = {
  idle: "Ready. Click a cell to start.",
  playing: "Game in progress.",
  won: "Board cleared. Well played!",
  lost: "Mine hit. Press the smiley to try again.",
};

export default function App() {
  const game = useMinesweeper();
  const { state } = game;
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="title">Minesweeper</h1>
        <p className="subtitle">
          Clean-room recreation · React + TypeScript + Vite
        </p>
      </header>

      <nav className="difficulty-bar" aria-label="Difficulty">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="win-button"
            aria-pressed={state.difficulty === preset.id}
            onClick={() => {
              setCustomOpen(false);
              game.startPreset(preset.id);
            }}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          className="win-button"
          aria-pressed={state.difficulty === "custom"}
          aria-expanded={customOpen}
          onClick={() => setCustomOpen((open) => !open)}
        >
          Custom
        </button>
      </nav>

      {customOpen ? (
        <CustomPanel
          config={state.config}
          onSubmit={(config) => {
            game.startCustom(config);
            setCustomOpen(false);
          }}
          onCancel={() => setCustomOpen(false)}
        />
      ) : null}

      <section className="game-window" aria-label="Game">
        <Toolbar
          minesRemaining={game.minesRemaining}
          elapsed={state.elapsed}
          face={game.face}
          onRestart={game.restart}
        />
        <Board
          board={state.board}
          status={state.status}
          exploded={state.exploded}
          onReveal={game.reveal}
          onFlag={game.flag}
          onChord={game.chord}
          onPress={game.pressBoard}
        />
      </section>

      <p className="status-line" role="status" aria-live="polite">
        {STATUS_TEXT[state.status] ?? ""}
      </p>

      <footer className="help">
        <p>
          <strong>Left click</strong> reveals · <strong>Right click</strong> flags ·{" "}
          <strong>Middle click</strong> or <strong>double click</strong> a number chords.
        </p>
        <p>
          Current board: {state.config.rows} × {state.config.cols} with{" "}
          {state.config.mines} mines.
        </p>
      </footer>
    </main>
  );
}
