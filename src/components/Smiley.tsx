import type { Face } from "../state/minesweeperReducer";

interface SmileyProps {
  readonly face: Face;
}

/** Original CSS/SVG smiley button face, one drawing per game state. */
export function Smiley({ face }: SmileyProps) {
  return (
    <svg className="smiley" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="13.5" fill="#ffd93b" stroke="#1a1a1a" strokeWidth="1.6" />

      {face === "dead" ? (
        <g stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
          <line x1="9.5" y1="10" x2="14" y2="14.5" />
          <line x1="14" y1="10" x2="9.5" y2="14.5" />
          <line x1="18" y1="10" x2="22.5" y2="14.5" />
          <line x1="22.5" y1="10" x2="18" y2="14.5" />
        </g>
      ) : face === "cool" ? (
        <g>
          <rect x="7" y="10" width="8" height="5" rx="1.4" fill="#1a1a1a" />
          <rect x="17" y="10" width="8" height="5" rx="1.4" fill="#1a1a1a" />
          <line x1="15" y1="12" x2="17" y2="12" stroke="#1a1a1a" strokeWidth="1.6" />
        </g>
      ) : (
        <g>
          <circle cx="11" cy="12" r="1.8" fill="#1a1a1a" />
          <circle cx="21" cy="12" r="1.8" fill="#1a1a1a" />
        </g>
      )}

      {face === "smile" ? (
        <path
          d="M10 19.5 Q16 26 22 19.5"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}

      {face === "ooh" ? (
        <ellipse
          cx="16"
          cy="21.5"
          rx="3"
          ry="3.6"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
      ) : null}

      {face === "dead" ? (
        <path
          d="M10 24 Q16 18.5 22 24"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}

      {face === "cool" ? (
        <path
          d="M10 20 Q16 25.5 22 20"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}
