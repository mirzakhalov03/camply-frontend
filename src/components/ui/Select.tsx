import type { SelectHTMLAttributes } from 'react'

/*
  The one dropdown. Mirrors Field's look — soft raised surface, 16px radius, pine
  focus ring — for a native <select> (best mobile UX: the OS picker, a11y for free,
  no dependency). Shows `placeholder` as a disabled first option and dims the
  control until a real value is chosen, matching Field's placeholder color.
*/
type Option = { value: string; label: string }
type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[]
  placeholder?: string
}

export function Select({ options, placeholder, className = '', value, ...rest }: Props) {
  return (
    <select
      value={value}
      className={`h-[52px] w-full rounded-input border-[1.5px] border-line bg-surface-2 px-[15px] text-title font-semibold text-content shadow-[0_3px_10px_rgba(20,40,30,0.04)] outline-none transition-colors focus:border-pine focus:bg-surface focus:shadow-[0_0_0_4px_var(--color-focus)] ${value ? '' : 'text-muted'} ${className}`}
      {...rest}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-content">
          {o.label}
        </option>
      ))}
    </select>
  )
}
