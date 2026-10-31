interface CounterProps {
  readonly value: number;
  readonly label: string;
}

/** Seven segment glyph definitions for a single digit. */
const DIGIT_SEGMENTS: Record<string, readonly string[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "d", "e", "g"],
  "3": ["a", "b", "c", "d", "g"],
  "4": ["b", "c", "f", "g"],
  "5": ["a", "c", "d", "f", "g"],
  "6": ["a", "c", "d", "e", "f", "g"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
  "-": ["g"],
  " ": [],
};

const SEGMENT_RECTS: Record<string, { x: number; y: number; width: number; height: number }> = {
  a: { x: 4, y: 2, width: 12, height: 3 },
  b: { x: 15, y: 5, width: 3, height: 10 },
  c: { x: 15, y: 19, width: 3, height: 10 },
  d: { x: 4, y: 31, width: 12, height: 3 },
  e: { x: 2, y: 19, width: 3, height: 10 },
  f: { x: 2, y: 5, width: 3, height: 10 },
  g: { x: 4, y: 16, width: 12, height: 3 },
};

function SegmentDigit({ char }: { readonly char: string }) {
  const active = new Set(DIGIT_SEGMENTS[char] ?? []);
  return (
    <svg className="digit" viewBox="0 0 20 36" aria-hidden="true" focusable="false">
      {Object.entries(SEGMENT_RECTS).map(([name, rect]) => (
        <rect
          key={name}
          {...rect}
          rx="0.8"
          className={active.has(name) ? "segment-on" : "segment-off"}
        />
      ))}
    </svg>
  );
}

/**
 * Three-digit, zero padded digital readout. Negative values are shown with a
 * leading minus, which is how classic Minesweeper renders a negative counter.
 */
export function Counter({ value, label }: CounterProps) {
  const clamped = Math.max(-99, Math.min(999, Math.trunc(value)));
  const text =
    clamped < 0
      ? `-${String(Math.abs(clamped)).padStart(2, "0")}`
      : String(clamped).padStart(3, "0");

  return (
    <div className="counter" role="img" aria-label={`${label}: ${clamped}`}>
      {[...text].map((char, index) => (
        <SegmentDigit key={`${index}-${char}`} char={char} />
      ))}
    </div>
  );
}
