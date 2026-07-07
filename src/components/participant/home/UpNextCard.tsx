import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { CampHome } from '../../../lib/campHome'

type Props = {
  upNext: CampHome['upNext']
  /** Jump to the full schedule. */
  onOpen: () => void
}

/*
  "Up next" — the single most useful thing on Home: what's happening now/next and
  where. Tapping anywhere opens the schedule. The time is split (09 / :30) to echo
  the prototype's chunky time chip.
*/
export function UpNextCard({ upNext, onOpen }: Props) {
  const { t } = useTranslation()
  const [hour, minute] = upNext.time.split(':')

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3.5 rounded-[20px] border border-line bg-surface p-4 text-left shadow-[0_4px_16px_rgba(20,40,30,0.06)] transition active:scale-[0.99]"
    >
      <div className="flex h-[52px] w-[52px] flex-none flex-col items-center justify-center rounded-[15px] bg-green-tint">
        <span className="text-[15px] font-bold leading-none text-pine">{hour}</span>
        <span className="text-[10px] font-semibold text-[#3f8a6e]">:{minute}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {t.home.upNext}
        </div>
        <div className="mt-0.5 text-base font-bold text-content">{upNext.title}</div>
        <div className="mt-0.5 truncate text-xs text-muted">
          {upNext.location} · {interpolate(t.home.upNextWith, { group: upNext.group })}
        </div>
      </div>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-soft">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0f6b4f"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  )
}
