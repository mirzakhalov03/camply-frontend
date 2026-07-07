import { useTranslation } from '../../../i18n/useTranslation'

/*
  "How points are earned" — the three scoring categories as tinted chips. Static
  reference content (the categories are fixed by the product), so no data prop.
  The `breakdown` numbers exist in the contract for a future per-category view.
*/
export function PointsLegend() {
  const { t } = useTranslation()

  const chips = [
    { emoji: '⚽', label: t.ranks.activities, className: 'bg-green-tint text-pine' },
    {
      emoji: '✓',
      label: t.ranks.attendance,
      className: 'bg-[#e4f0f4] text-[#2b6e82] dark:bg-sky/15 dark:text-sky',
    },
    {
      emoji: '🎯',
      label: t.ranks.challenges,
      className: 'bg-amber-tint text-[#a86a08] dark:text-amber',
    },
  ]

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-2.5 text-[13px] font-bold text-content">{t.ranks.howPointsEarned}</div>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c.label}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${c.className}`}
          >
            {c.emoji} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}
