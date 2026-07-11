import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { FeatureStat, FeatureTint } from './campFeatures'

// Icon-tile tints — brand tokens from index.css @theme (same as QuickLinks).
// Amber flips to a brighter amber in dark mode: amber-ink (dark brown) is legible
// on the light amber-tint but vanishes on the dark one — matches PointsLegend.
const TINT: Record<FeatureTint, string> = {
  green: 'bg-green-tint text-pine',
  amber: 'bg-amber-tint text-amber-ink dark:text-amber',
}

/*
  One camp-hub card: a colored icon tile, the feature label, a live micro-stat, and
  a status dot (danger when an alert is active). A Link (not a button) so it's real
  navigation into the feature window — deep-linkable and right-clickable. Visual
  matches organizer/camps/QuickLinks, rendered big and laid out 2-up on the hub.
*/
export function FeatureCard({
  to,
  icon,
  label,
  stat,
  tint,
}: {
  to: string
  icon: ReactNode
  label: string
  stat: FeatureStat
  tint: FeatureTint
}) {
  return (
    <Link
      to={to}
      className="rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)] transition active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-input ${TINT[tint]}`}>
          {icon}
        </span>
        {/* Status light — only for features that actually report one (i.e. `alert`
            is defined). Today that's just the live Map: green = all clear, red =
            an active SOS. Other cards have no live status, so they show no dot. */}
        {stat.alert !== undefined && (
          <span className={`h-2 w-2 rounded-full ${stat.alert ? 'bg-danger' : 'bg-pine'}`} />
        )}
      </div>
      <div className="mt-3 text-heading font-bold text-content">{label}</div>
      <div className="truncate text-caption text-muted">{stat.text}</div>
    </Link>
  )
}
