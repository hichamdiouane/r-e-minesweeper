import type { Rng } from "./types";

/**
 * Small, fast, seedable PRNG (Mulberry32).
 *
 * The engine never reaches for `Math.random` directly; callers pass an `Rng`
 * so board generation is reproducible in tests and in bug reports.
 */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle, in place, using the supplied RNG. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = items[i] as T;
    items[i] = items[j] as T;
    items[j] = swap;
  }
  return items;
}
