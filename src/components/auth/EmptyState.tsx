type Props = {
  className?: string
}

/*
  Friendly "no match" illustration: a paper roster card with muted rows under a
  magnifying glass — reads instantly as "we searched the list and found nothing."
  Camply palette (paper card, sky/amber avatars, amber glass). Decorative →
  aria-hidden.
*/
export function EmptyState({ className }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Roster card (with a soft drop shadow) */}
      <rect x="43" y="52" width="98" height="96" rx="14" fill="#000" fillOpacity="0.18" />
      <rect x="40" y="48" width="98" height="96" rx="14" fill="var(--color-paper)" />

      {/* List rows: two filled, one faded (the "missing" one) */}
      <g>
        <circle cx="60" cy="74" r="8" fill="var(--color-sky)" />
        <rect
          x="76"
          y="70"
          width="46"
          height="8"
          rx="4"
          fill="var(--color-ink)"
          fillOpacity="0.16"
        />

        <circle cx="60" cy="100" r="8" fill="var(--color-amber)" />
        <rect
          x="76"
          y="96"
          width="38"
          height="8"
          rx="4"
          fill="var(--color-ink)"
          fillOpacity="0.16"
        />

        <circle cx="60" cy="126" r="8" fill="var(--color-ink)" fillOpacity="0.12" />
        <rect
          x="76"
          y="122"
          width="50"
          height="8"
          rx="4"
          fill="var(--color-ink)"
          fillOpacity="0.12"
        />
      </g>

      {/* Magnifying glass */}
      <line
        x1="153"
        y1="151"
        x2="178"
        y2="176"
        stroke="#c8781a"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="132" cy="130" r="30" fill="var(--color-sky)" fillOpacity="0.22" />
      <circle cx="132" cy="130" r="30" fill="none" stroke="var(--color-amber)" strokeWidth="9" />
      {/* Lens highlight */}
      <path
        d="M119 121 q6 -11 19 -8"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}
