# Minesweeper

A clean-room Minesweeper recreation built with React, TypeScript and Vite.
All visuals are drawn with CSS and inline SVG, so no proprietary assets are
included.

## Scripts

```bash
npm install
npm run dev      # development server
npm test         # engine and logic test suite (Vitest)
npm run build    # type-check and production build
npm run preview  # serve the production build
```

## Architecture

```
src/
  engine/          Board representation and generation (framework free)
    types.ts       Cell / Board / config model
    rng.ts         Seedable PRNG + shuffle
    board.ts       Create board, place mines, count neighbours
  game/            Rules, all pure functions
    reveal.ts      Reveal, flood fill, mine exposure
    flags.ts       Flag / unflag
    chord.ts       Chording
    status.ts      Win detection, counters, end-of-game flagging
  state/           Game state and timer
    minesweeperReducer.ts   Reducer, presets, custom board validation
    useMinesweeper.ts       React binding + timer
  components/      Presentation only
    Board.tsx, Cell.tsx, Toolbar.tsx, Counter.tsx, Smiley.tsx, icons.tsx
  styles/global.css
```

The engine never imports React. Every rule function takes a board and returns a
new board, which keeps the reducer deterministic and the tests simple.

## Rules implemented

- Beginner 9×9 / 10 mines, Intermediate 16×16 / 40, Expert 16×30 / 99.
- Custom boards from 1 to 40 rows or columns, at least one safe cell.
- First-click safety: the clicked cell and, when the board has room, its eight
  neighbours are mine free.
- Left click reveals, right click flags, middle click or double click chords.
- Numbered cells, flood-fill expansion, chording with wrong-flag detonation.
- Mine counter (flags remaining, may go negative) and a 999-second timer.
- Win detection, automatic flagging of remaining mines, smiley states.

## Notes

- Mines are placed on the first reveal, not on page load, so the first click can
  be guaranteed safe. Flags placed before the first reveal are preserved.
- `seedBoard` is injected with an RNG, so board generation is reproducible in
  tests.
