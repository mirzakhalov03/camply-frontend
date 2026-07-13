import { useState } from 'react'
import { Sheet, Avatar } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import type { RankedGroup } from '../../../../lib/leaderboard'
import { PointsWheel } from './PointsWheel'

/*
  The award-points sheet: pick a group on the Leaderboard tab → this slides up with
  the wheel + an Apply button. It commits a single delta (via the caller's
  useAdjustGroupPoints) and closes. Open state is derived from `group !== null`.
*/
export function PointsWheelSheet({
  group,
  onClose,
  onApply,
}: {
  group: RankedGroup | null
  onClose: () => void
  onApply: (delta: number) => void
}) {
  const { t } = useTranslation()
  const d = t.org.detail
  const [delta, setDelta] = useState(0)

  // Always reopen centered on 0. PointsWheel sets its scroll position from `value`
  // only on mount, so resetting on close (rather than in an open-effect) keeps the
  // scroll position and the selected value from desyncing on the next open.
  const close = () => {
    setDelta(0)
    onClose()
  }

  return (
    <Sheet
      open={group !== null}
      onClose={close}
      closeLabel={d.cancel}
      title={
        group ? (
          <span className="flex items-center gap-2.5">
            <Avatar
              name={group.name}
              initials={group.initials}
              color={group.color}
              photo={group.photo}
              size="sm"
            />
            {group.name} · {group.score}
          </span>
        ) : null
      }
    >
      <PointsWheel value={delta} onChange={setDelta} ariaLabel={d.wheelAria} />
      <button
        type="button"
        disabled={delta === 0}
        onClick={() => {
          onApply(delta)
          close()
        }}
        className="mt-4 h-12 w-full rounded-input bg-pine text-body font-bold text-white shadow-[0_6px_16px_rgba(15,107,79,0.22)] transition active:scale-[0.99] disabled:opacity-40"
      >
        {delta === 0
          ? d.noChange
          : interpolate(d.applyPoints, { n: delta > 0 ? `+${delta}` : String(delta) })}
      </button>
    </Sheet>
  )
}
