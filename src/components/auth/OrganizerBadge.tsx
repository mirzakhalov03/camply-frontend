type Props = {
  className?: string
}

/*
  Organizer illustration — a lanyard ID badge in Camply's palette (sky lanyard,
  amber clip, pine card with a paper avatar + an amber verified check). Signals
  "organizer / team" where the participant screen shows the party popper. Custom
  SVG so it renders identically everywhere and stays on-brand. Decorative →
  aria-hidden.
*/
export function OrganizerBadge({ className }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient
          id="orgcard"
          x1="70"
          y1="56"
          x2="130"
          y2="168"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#12805e" />
          <stop offset="1" stopColor="#0a5039" />
        </linearGradient>
        <clipPath id="orgav">
          <circle cx="100" cy="106" r="17" />
        </clipPath>
      </defs>

      {/* Lanyard straps meeting at the clip */}
      <path
        d="M74 20 L100 66 L126 20"
        fill="none"
        stroke="var(--color-sky)"
        strokeWidth="9"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M74 20 L100 66 L126 20"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Metal clip */}
      <rect x="92" y="52" width="16" height="20" rx="5" fill="var(--color-amber)" />

      {/* Card body */}
      <rect x="56" y="64" width="88" height="104" rx="18" fill="url(#orgcard)" />
      {/* Card slot under the clip */}
      <rect x="90" y="74" width="20" height="6" rx="3" fill="#ffffff" fillOpacity="0.5" />

      {/* Avatar (clipped so the shoulders stay inside the circle) */}
      <circle cx="100" cy="106" r="17" fill="var(--color-paper)" />
      <g clipPath="url(#orgav)">
        <circle cx="100" cy="101" r="6.5" fill="#0f6b4f" />
        <path d="M83 126 c0-10 8-15 17-15 s17 5 17 15 z" fill="#0f6b4f" />
      </g>

      {/* Name + role lines */}
      <rect x="72" y="134" width="56" height="8" rx="4" fill="#ffffff" fillOpacity="0.85" />
      <rect x="80" y="148" width="40" height="6" rx="3" fill="var(--color-amber)" />

      {/* Verified check badge, corner */}
      <circle cx="133" cy="151" r="14" fill="var(--color-amber)" />
      <path
        d="M127 151 l4 4 7-8"
        fill="none"
        stroke="#3a2807"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
