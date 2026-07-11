/*
  The signature: a layered pine ridgeline the login card sits above, turning the
  screen into "arrival at camp" rather than a form on a flat background. Two hill
  layers (Pine behind, Deep in front) with a scatter of pine trees. Purely
  decorative, so it's aria-hidden and ignores pointer events.
*/
export function PineRidge() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] max-h-80 w-full"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* back ridge — lighter Pine */}
      <path
        fill="var(--color-pine)"
        fillOpacity="0.55"
        d="M0 180 L120 150 L260 185 L420 135 L560 175 L720 130 L900 180 L1080 140 L1260 178 L1440 150 L1440 320 L0 320 Z"
      />
      {/* front ridge — Deep */}
      <path
        fill="var(--color-deep)"
        d="M0 235 L160 205 L320 240 L500 200 L680 245 L860 210 L1040 248 L1220 212 L1440 244 L1440 320 L0 320 Z"
      />
      {/* a few pine trees along the front ridge */}
      <g fill="var(--color-deep)">
        <path d="M240 236 l14 26 h-28 Z M240 224 l11 20 h-22 Z" />
        <path d="M610 232 l16 30 h-32 Z M610 218 l12 22 h-24 Z" />
        <path d="M980 238 l14 26 h-28 Z M980 226 l11 20 h-22 Z" />
        <path d="M1300 234 l16 30 h-32 Z M1300 220 l12 22 h-24 Z" />
      </g>
    </svg>
  )
}
