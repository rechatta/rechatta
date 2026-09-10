type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconSparkle({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C13 8 16 11 22 12 16 13 13 16 12 22 11 16 8 13 2 12 8 11 11 8 12 2Z" />
    </svg>
  );
}

export function IconPencil({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M4 20l1-4.3L15.5 5 19 8.5 8.3 19 4 20z" />
      <line x1="13.7" y1="6.8" x2="17.2" y2="10.3" />
    </svg>
  );
}

export function IconCompass({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="15,9 13,13 9,15 11,11" />
    </svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5,12 10,17 19,7" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

export function IconClip({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M8 12.5l6.2-6.2a3 3 0 1 1 4.2 4.2l-8 8a5 5 0 1 1-7-7l6.6-6.6" />
    </svg>
  );
}

export function IconSliders({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="9" cy="6" r="2" fill="var(--surface)" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="16" cy="12" r="2" fill="var(--surface)" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="8" cy="18" r="2" fill="var(--surface)" />
    </svg>
  );
}

export function IconMic({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <line x1="12" y1="17.5" x2="12" y2="21" />
      <line x1="8.5" y1="21" x2="15.5" y2="21" />
    </svg>
  );
}

export function IconArrowUp({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="6,11 12,5 18,11" />
    </svg>
  );
}

export function IconCopy({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconThumbsUp({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1H7v10z" />
      <path d="M7 11l3.4-6.6a1.6 1.6 0 0 1 2.9 1.3L12.4 9H17a2 2 0 0 1 1.9 2.7l-1.9 6A2 2 0 0 1 15.1 19H10a3 3 0 0 1-3-3z" />
    </svg>
  );
}

export function IconThumbsDown({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <g transform="scale(1,-1) translate(0,-24)">
        <path d="M7 20H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1H7v10z" />
        <path d="M7 11l3.4-6.6a1.6 1.6 0 0 1 2.9 1.3L12.4 9H17a2 2 0 0 1 1.9 2.7l-1.9 6A2 2 0 0 1 15.1 19H10a3 3 0 0 1-3-3z" />
      </g>
    </svg>
  );
}

export function IconWrench({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.6 17.2a1.6 1.6 0 0 0 2.3 2.3l5.6-5.7a4 4 0 0 0 5.2-5.4l-2.6 2.6-2-2z" />
    </svg>
  );
}

export function IconLink({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5l5-5" />
      <path d="M10.5 6.5l1-1a4 4 0 1 1 6 6l-1 1" />
      <path d="M13.5 17.5l-1 1a4 4 0 1 1-6-6l1-1" />
    </svg>
  );
}
