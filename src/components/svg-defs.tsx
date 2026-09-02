export function SvgDefs() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="sparkleGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--sparkle-a)" />
          <stop offset="55%" stopColor="var(--sparkle-c)" />
          <stop offset="100%" stopColor="var(--sparkle-b)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
