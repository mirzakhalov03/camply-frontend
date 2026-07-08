import type { ButtonHTMLAttributes, ReactNode } from 'react'

/*
  The one button. Three intents that already recur across the app —
    • primary — pine, white text (confirm, call, continue)
    • accent  — the bright-amber CTA (onboarding submit, key actions)
    • ghost   — subtle, text-only (cancel, back)
  — plus sizes and a `fullWidth` flag. Pass `href` to render a styled anchor
  instead (e.g. a `tel:` call button) without duplicating the class recipe.

  Deliberately small: variants, not a config-driven mega-component. New intents
  get added here, never re-styled inline at the call site.
*/
type Variant = 'primary' | 'accent' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-pine text-white shadow-[0_4px_12px_rgba(15,107,79,0.3)] active:scale-[0.98] disabled:opacity-50',
  accent:
    'bg-amber-bright text-amber-ink shadow-[0_10px_24px_rgba(239,157,32,0.36)] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-soft disabled:text-muted disabled:shadow-none disabled:translate-y-0',
  ghost: 'bg-transparent text-muted hover:text-content active:scale-[0.98]',
}

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-body rounded-2xl',
  md: 'h-12 px-5 text-title rounded-2xl',
  lg: 'h-[58px] px-6 text-heading rounded-full',
}

type BaseProps = {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: ReactNode
  className?: string
}

type Props = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    /** Render as an anchor (e.g. tel:/mailto:) with identical styling. */
    href?: string
  }

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  href,
  className = '',
  children,
  ...rest
}: Props) {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-bold transition-all',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ')

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
