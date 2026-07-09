import { useState } from 'react'
import { CAMP_GROUPS, type CampGroup } from '../../lib/groups'
import { useTranslation } from '../../i18n/useTranslation'

type Props = {
  /** The chosen group, or null before the coordinator picks one. */
  value: CampGroup | null
  onChange: (group: CampGroup) => void
}

/*
  Group field for the coordinator role — the sibling of CityPicker, minus the
  search (a camp has ~5–10 groups, so we list them all). Collapsed, it's a
  tappable row showing the chosen group's color + name (or a prompt). Open, it
  drops the full list. The parent owns the selected group; this owns only its
  open state. Reads CAMP_GROUPS statically today — becomes useCampGroups(campId)
  when camp-selection + backend land.
*/
export function GroupPicker({ value, onChange }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const select = (group: CampGroup) => {
    onChange(group)
    setOpen(false)
  }

  return (
    <div>
      {/* Collapsed field */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={[
          'flex min-h-[52px] w-full items-center gap-3 rounded-[16px] bg-[#fffdf8] px-3.5 text-left shadow-[0_3px_10px_rgba(20,40,30,0.04)] transition-shadow',
          open
            ? 'border-[1.5px] border-pine shadow-[0_0_0_4px_rgba(15,107,79,0.12)]'
            : 'border-[1.5px] border-[#e7e1d3]',
        ].join(' ')}
      >
        <span
          aria-hidden
          className="h-4 w-4 flex-none rounded-full"
          style={{ backgroundColor: value ? value.color : '#d8d2c4' }}
        />

        {value ? (
          <span className="flex-1 text-[15px] font-semibold leading-tight text-ink">
            {value.name}
          </span>
        ) : (
          <span className="flex-1 text-[15px] font-medium text-[#a9b0a8]">
            {t.organizer.groupPlaceholder}
          </span>
        )}

        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden
          className="flex-none transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path
            d="M5 7l4 4 4-4"
            stroke="#9aa79f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expanded list (no search — groups are few) */}
      {open && (
        <div className="animate-drop mt-2 overflow-hidden rounded-[18px] border-[1.5px] border-[#e7e1d3] bg-[#fffdf8] shadow-[0_14px_34px_rgba(20,40,30,0.14)]">
          <div className="max-h-[214px] overflow-y-auto">
            {CAMP_GROUPS.map((group) => {
              const selected = value?.id === group.id
              return (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => select(group)}
                  className={[
                    'flex w-full items-center gap-2.5 border-b border-[#f4efe4] px-3.5 py-3 text-left',
                    selected ? 'bg-[#f3f8f5]' : 'bg-transparent',
                  ].join(' ')}
                >
                  <span
                    aria-hidden
                    className="h-[26px] w-[26px] flex-none rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="flex-1 text-[14px] font-semibold leading-tight text-ink">
                    {group.name}
                  </span>
                  {selected && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                      <path
                        d="M4 9.5l3 3 7-7.5"
                        stroke="#0f6b4f"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
