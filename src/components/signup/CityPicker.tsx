import { useState } from 'react'
import { CITIES, type City } from '@/utils/cities'
import { useTranslation } from '../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'

type Props = {
  /** The chosen city, or null before the camper picks one. */
  value: City | null
  onChange: (city: City) => void
}

/*
  Home-city field. Collapsed, it's a tappable row showing the choice (or a
  prompt). Open, it drops a searchable list of every Uzbekistan city — filtered
  live by name or region. The parent owns the selected city; this component only
  owns its open/search UI state. Picking a city closes it and reports up.
*/
export function CityPicker({ value, onChange }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()
  const matches = CITIES.filter(
    (c) => c.name.toLowerCase().includes(query) || c.region.toLowerCase().includes(query),
  )

  const toggle = () => {
    setOpen((o) => !o)
    setSearch('')
  }

  const select = (city: City) => {
    onChange(city)
    setOpen(false)
    setSearch('')
  }

  return (
    <div>
      {/* Collapsed field */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={[
          'flex min-h-[52px] w-full items-center gap-3 rounded-[16px] bg-[#fffdf8] px-3.5 text-left shadow-[0_3px_10px_rgba(20,40,30,0.04)] transition-shadow',
          open
            ? 'border-[1.5px] border-pine shadow-[0_0_0_4px_rgba(15,107,79,0.12)]'
            : 'border-[1.5px] border-[#e7e1d3]',
        ].join(' ')}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="flex-none"
          aria-hidden
        >
          <path
            d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"
            stroke="#0f6b4f"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="10" r="2.4" fill="#0f6b4f" />
        </svg>

        {value ? (
          <span className="flex-1">
            <span className="block text-[15px] font-semibold leading-tight text-ink">
              {value.name}
            </span>
            <span className="mt-px block text-[11px] font-medium text-[#9aa79f]">
              {interpolate(t.signup.regionSuffix, { region: value.region })}
            </span>
          </span>
        ) : (
          <span className="flex-1 text-[15px] font-medium text-[#a9b0a8]">
            {t.signup.cityPlaceholder}
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

      {/* Expanded search + list */}
      {open && (
        <div className="animate-drop mt-2 overflow-hidden rounded-[18px] border-[1.5px] border-[#e7e1d3] bg-[#fffdf8] shadow-[0_14px_34px_rgba(20,40,30,0.14)]">
          <div className="flex items-center gap-2.5 border-b border-[#f0ebdf] px-3 py-2.5">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="5.5" stroke="#9aa79f" strokeWidth="1.8" />
              <path d="M12.5 12.5l3 3" stroke="#9aa79f" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
              placeholder={t.signup.citySearchPlaceholder}
              className="flex-1 bg-transparent text-[14px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-[#a9b0a8]"
            />
            <span className="font-mono text-[11px] text-[#c2c8bf]">
              {interpolate(t.signup.cityCount, { count: matches.length })}
            </span>
          </div>

          <div className="max-h-[214px] overflow-y-auto">
            {matches.map((city) => {
              const selected = value?.name === city.name
              return (
                <button
                  type="button"
                  key={city.name}
                  onClick={() => select(city)}
                  className={[
                    'flex w-full items-center gap-2.5 border-b border-[#f4efe4] px-3.5 py-2.5 text-left',
                    selected ? 'bg-[#f3f8f5]' : 'bg-transparent',
                  ].join(' ')}
                >
                  <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] bg-[#e6efe9] font-mono text-[13px] font-bold text-pine">
                    {city.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-semibold leading-tight text-ink">
                      {city.name}
                    </span>
                    <span className="mt-px block text-[11px] text-[#9aa79f]">{city.region}</span>
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

            {matches.length === 0 && (
              <div className="px-3.5 py-6 text-center text-[13px] text-[#9aa79f]">
                {interpolate(t.signup.noResults, { query: search })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
