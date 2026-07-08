import type { InputHTMLAttributes } from 'react'

/*
  The one text input. The design's field look — soft raised surface, 16px radius,
  and the pine focus ring (border + halo) — in one place, so forms across all
  three surfaces stay identical instead of each re-typing the class recipe. Takes
  every native <input> prop; style is layered on top.
*/
type Props = InputHTMLAttributes<HTMLInputElement>

export function Field({ className = '', ...rest }: Props) {
  return (
    <input
      className={`h-[52px] w-full rounded-input border-[1.5px] border-line bg-surface-2 px-[15px] text-title font-semibold text-content shadow-[0_3px_10px_rgba(20,40,30,0.04)] outline-none transition-colors placeholder:font-medium placeholder:text-muted focus:border-pine focus:bg-surface focus:shadow-[0_0_0_4px_var(--color-focus)] ${className}`}
      {...rest}
    />
  )
}
