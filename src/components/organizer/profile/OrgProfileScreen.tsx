import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { initials } from '../../../lib/initials'
import { useAuthStore } from '../../../store/useAuthStore'
import { useProfileStore } from '../../../store/useProfileStore'
import { useOrganizerStore } from '../../../store/useOrganizerStore'
import { useThemeStore } from '../../../store/useThemeStore'
import { useOrganizerSummary } from '../../../api/queries/camps.queries'
import { ROLE_EMOJI } from '../roles'
import { Avatar } from '../../ui'
import { LanguageSheet } from '../../participant/profile/LanguageSheet'
import { useOrg } from '../orgContext'
import { OrgHelpRequestsCard } from './OrgHelpRequestsCard'

/*
  Organizer profile — identity, incoming SOS (shared help domain), contact, and
  settings. Identity is sourced from the auth session (reliable across onboarded and
  restored sessions); the sub-role comes from useOrganizerStore, stats from the
  shared summary query. Reuses the participant LanguageSheet + generic profile
  strings; logout runs through the shell's centralized handler.
*/
function fmtPhone(digits: string): string {
  return digits.length === 9
    ? `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
    : `+998 ${digits}`
}

export function OrgProfileScreen() {
  const { t, selectedLang, setLanguage } = useTranslation()
  const p = t.org.profile
  const { openTeam, logout } = useOrg()

  const user = useAuthStore((s) => s.user)
  const photo = useProfileStore((s) => s.photo)
  const email = useProfileStore((s) => s.email)
  const subRole = useOrganizerStore((s) => s.role)
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const { data: summary } = useOrganizerSummary()
  const [langOpen, setLangOpen] = useState(false)

  const name = user ? `${user.name} ${user.surname}`.trim() : 'Organizer'

  return (
    <div className="pb-6 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-14 pt-6 md:px-8">
        <p className="text-caption font-semibold text-white/80">{p.title}</p>
      </div>

      <div className="-mt-11 flex flex-col gap-3.5 px-5 md:px-8">
        {/* Identity */}
        <div className="flex flex-col items-center rounded-card border border-line bg-surface p-4 text-center shadow-[0_8px_22px_rgba(20,40,30,0.08)]">
          <div className="-mt-11">
            <Avatar
              name={name}
              initials={initials(name)}
              photo={photo}
              color="var(--color-amber)"
              size={88}
            />
          </div>
          <div className="mt-3 text-subhead font-bold text-content">{name}</div>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            <span className="rounded-full bg-amber-tint px-3 py-1 text-meta font-bold text-amber">
              ★ {p.roleOrganizer}
            </span>
            {subRole ? (
              <span className="rounded-full bg-green-tint px-3 py-1 text-meta font-bold text-pine">
                {ROLE_EMOJI[subRole]} {t.organizer.roles[subRole]}
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex w-full border-t border-line pt-3.5">
            <StatCell value={summary?.activeCamps ?? 0} label={p.statCamps} />
            <StatCell
              value={summary?.totalParticipants ?? 0}
              label={t.org.camps.statParticipants}
              divided
            />
            <StatCell value={summary?.totalGroups ?? 0} label={t.org.camps.statGroups} />
          </div>
        </div>

        <OrgHelpRequestsCard />

        {/* Contact */}
        <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
          <InfoRow icon="✉️" label={t.profile.email} value={email || t.profile.notSet} />
          <InfoRow icon="🏢" label={p.organization} value={summary?.organizationName ?? '—'} />
          <InfoRow
            icon="📞"
            label={t.profile.phone}
            value={user?.phone ? fmtPhone(user.phone) : '—'}
            last
          />
        </div>

        {/* Settings */}
        <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
          <SettingsRow icon="👥" label={p.team} onClick={openTeam} />
          <SettingsRow
            icon="🌐"
            label={t.profile.language}
            hint={(selectedLang ?? 'uz').toUpperCase()}
            onClick={() => setLangOpen(true)}
          />
          <ThemeRow label={t.profile.appearance} isDark={theme === 'dark'} onToggle={toggleTheme} />
          <SettingsRow icon="⚙️" label={p.campSettings} onClick={() => {}} last />
        </div>

        <button
          type="button"
          onClick={logout}
          className="py-1 text-center text-body font-bold text-danger-deep active:scale-[0.99]"
        >
          {t.profile.logout}
        </button>
      </div>

      <LanguageSheet
        open={langOpen}
        selected={selectedLang}
        onSelect={setLanguage}
        onClose={() => setLangOpen(false)}
      />
    </div>
  )
}

function StatCell({
  value,
  label,
  divided = false,
}: {
  value: number
  label: string
  divided?: boolean
}) {
  return (
    <div className={`flex-1 ${divided ? 'border-x border-line' : ''}`}>
      <div className="text-subhead font-extrabold text-content">{value}</div>
      <div className="text-meta text-muted">{label}</div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: string
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 py-3 ${last ? '' : 'border-b border-line'}`}>
      <span className="w-5 flex-none text-center text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-meta text-muted">{label}</div>
        <div className="truncate text-body font-semibold text-content">{value}</div>
      </div>
    </div>
  )
}

/*
  Settings row whose control lives in-place: a light/dark switch instead of a
  chevron (SettingsRow's chevron implies navigation — this flips a preference on
  the spot). The sliding pill mirrors the participant toggle in CampCover; the
  white knob is intentionally constant so it reads on the track in both themes.
*/
function ThemeRow({
  label,
  isDark,
  onToggle,
}: {
  label: string
  isDark: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex w-full items-center gap-3 border-b border-line py-3.5">
      <span className="w-5 flex-none text-center text-base">🌙</span>
      <span className="flex-1 text-body font-semibold text-content">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        aria-pressed={isDark}
        className="relative flex h-8 w-[62px] flex-none items-center justify-between rounded-full border border-line bg-soft px-2"
      >
        <span className="text-[11px] leading-none opacity-70">☀️</span>
        <span className="text-[11px] leading-none opacity-70">🌙</span>
        <span
          className={`absolute top-[3px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[13px] shadow transition-[left] duration-300 ${
            isDark ? 'left-[33px]' : 'left-[3px]'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.45,0.5,1)' }}
        >
          {isDark ? '🌙' : '☀️'}
        </span>
      </button>
    </div>
  )
}

function SettingsRow({
  icon,
  label,
  hint,
  onClick,
  last = false,
}: {
  icon: string
  label: string
  hint?: string
  onClick: () => void
  last?: boolean
}): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 py-3.5 text-left ${last ? '' : 'border-b border-line'}`}
    >
      <span className="w-5 flex-none text-center text-base">{icon}</span>
      <span className="flex-1 text-body font-semibold text-content">{label}</span>
      {hint ? <span className="text-caption font-semibold text-muted">{hint}</span> : null}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-none text-line"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  )
}
