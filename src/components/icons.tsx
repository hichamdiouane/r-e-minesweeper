interface MineIconProps {
  /** Draws a red cross over the mine (wrong flag on a lost board). */
  readonly crossed?: boolean;
}

/** Original vector mine: spiked ball with a highlight. */
export function MineIcon({ crossed = false }: MineIconProps) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g stroke="#101010" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="21.5" y2="12" />
        <line x1="5.3" y1="5.3" x2="18.7" y2="18.7" />
        <line x1="18.7" y1="5.3" x2="5.3" y2="18.7" />
      </g>
      <circle cx="12" cy="12" r="6" fill="#101010" />
      <circle cx="9.9" cy="9.9" r="1.6" fill="#ffffff" />
      {crossed ? (
        <g stroke="#d40000" strokeWidth="2.6" strokeLinecap="round">
          <line x1="4" y1="4" x2="20" y2="20" />
          <line x1="20" y1="4" x2="4" y2="20" />
        </g>
      ) : null}
    </svg>
  );
}

/** Original vector flag: pole, red pennant, base. */
export function FlagIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g stroke="#101010" strokeLinecap="round">
        <line x1="7" y1="3.5" x2="7" y2="19" strokeWidth="2.4" />
        <line x1="3" y1="20.5" x2="16" y2="20.5" strokeWidth="2.6" />
        <line x1="7" y1="20.5" x2="7" y2="17" strokeWidth="2.2" />
      </g>
      <path d="M7 4 L18 6.6 L7 9.6 Z" fill="#d40000" stroke="#101010" strokeWidth="1.1" />
    </svg>
  );
}
