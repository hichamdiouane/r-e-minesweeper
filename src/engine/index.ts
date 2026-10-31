export {
  assertSupportedConfig,
  coordinatesOf,
  countAdjacentMines,
  createBoard,
  generateBoard,
  indexOf,
  neighborsOf,
  seedBoard,
} from "./board";
export { mulberry32, shuffle } from "./rng";
export type {
  Board,
  BoardConfig,
  Cell,
  CellState,
  DifficultyId,
  GameStatus,
  Rng,
} from "./types";
