type CamplyMarkProps = {
  className?: string
  /**
   * `full` — the brand-color peak mark (pine peak + amber ridge + off-white facet),
   * for light surfaces. `mono` — a single peak in `currentColor`, for colored tiles.
   */
  variant?: 'full' | 'mono'
  /** Accessible label. Omit for a decorative mark (renders aria-hidden). */
  title?: string
}

/*
  The Camply "peak mark" — two overlapping peaks (growth + the outdoors) with an
  off-white facet for structure and an amber ridge highlight. Geometry is taken
  verbatim from the brand sheet (viewBox 0 0 80 56).

  NOTE — the hex values here are the LOGO's fixed brand identity, not theme tokens.
  This is the documented "real brand colors" exception to the no-raw-hex rule: the
  mark must look the same in light and dark mode, so it must NOT flip with the theme.
  Use `variant="mono"` (currentColor) when you need it to adopt a surface's text color.
*/
export function CamplyMark({ className, variant = 'full', title }: CamplyMarkProps) {
  return (
    <svg
      viewBox="0 0 80 56"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {variant === 'mono' ? (
        <polygon points="28,4 58,52 2,52" fill="currentColor" />
      ) : (
        <>
          <polygon points="54,18 80,52 40,52" fill="#E0982A" />
          <polygon points="28,4 58,52 2,52" fill="#0F6B4F" />
          <polygon points="28,4 39,22 17,22" fill="#F4F1EA" />
        </>
      )}
    </svg>
  )
}
