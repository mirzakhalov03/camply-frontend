type Props = {
  className?: string
}

/*
  Custom party-popper + confetti in Camply's palette (amber cone; pine / sky /
  amber / coral confetti). Replaces the reference's purple emoji so it renders
  identically everywhere and stays on-brand. Decorative → aria-hidden.
*/
export function PartyPopper({ className }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cone" x1="66" y1="146" x2="132" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c8781a" />
          <stop offset="0.55" stopColor="var(--color-amber)" />
          <stop offset="1" stopColor="#f4c67a" />
        </linearGradient>
      </defs>

      {/* Cone body — tip at lower-left, wide opening up-right */}
      <path d="M66 146 L148 98 L104 58 Z" fill="url(#cone)" />
      {/* Highlight along the upper-left edge */}
      <path d="M66 146 L104 58 L112 66 Z" fill="#fff" fillOpacity="0.16" />
      {/* Mouth of the cone (dark opening for depth) */}
      <ellipse cx="126" cy="78" rx="30" ry="11" fill="#8a5212" transform="rotate(41 126 78)" />
      <ellipse cx="126" cy="78" rx="23" ry="7" fill="#5f3608" transform="rotate(41 126 78)" />

      {/* Streamers */}
      <path
        d="M118 52 q10 -14 22 -6 t18 -4"
        fill="none"
        stroke="var(--color-sky)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M150 118 q16 -6 20 -20 t20 -10"
        fill="none"
        stroke="#ef8a5a"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M150 150 q14 6 14 22 t14 14"
        fill="none"
        stroke="var(--color-sky)"
        strokeOpacity="0.75"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Little curl, top-left */}
      <path
        d="M70 58 q-10 -8 -4 -18 t-2 -14"
        fill="none"
        stroke="#f4c67a"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Confetti dots */}
      <circle cx="96" cy="70" r="6" fill="#ef8a5a" />
      <circle cx="76" cy="116" r="7" fill="var(--color-amber)" />
      <circle cx="112" cy="138" r="6" fill="var(--color-pine)" />
      <circle cx="172" cy="92" r="6" fill="#f4c67a" />
      <circle cx="176" cy="146" r="5" fill="var(--color-sky)" />
      <circle cx="142" cy="66" r="5" fill="var(--color-pine)" />
    </svg>
  )
}
