import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { useAuthStore } from '../../../store/useAuthStore'
import { useOrganizerCamps, useOrganizerSummary } from '../../../api/queries/camps.queries'
import { useAdmin } from '../adminContext'
import { Badge, SupportRow } from '../../ui'
import { LanguageSheet } from '../../participant/profile/LanguageSheet'

/*
  Organization profile — /admin/profile. Identity is the org's own auth session
  (useAuthStore), NOT fabricated. There is no email row here: the org signs in by
  username and `user.email` is null in practice (the field is populated for
  organizers/managers, who ARE invited by email — see OrgProfileScreen). Phone exists on AuthUser
  but the org signs in by username and has none in practice, so that row only shows
  up if the backend ever puts one on the session. Address isn't in the model at all
  — no row, ever. Stats reuse the same organizer-facing queries the Camps screen
  reads (no new endpoint): camps + participants come straight off them; organizers
  is summed from each camp's own organizerCount since there's no dedicated
  "org-wide organizer count" field on OrganizerSummary.
*/
export function AdminProfileScreen() {
  const { t, selectedLang, setLanguage } = useTranslation()
  const p = t.orgProfile
  const { logout } = useAdmin()
  const user = useAuthStore((s) => s.user)
  const camps = useOrganizerCamps()
  const summary = useOrganizerSummary()
  const [langOpen, setLangOpen] = useState(false)

  const name = [user?.name, user?.surname].filter(Boolean).join(' ').trim() || p.role
  const campList = camps.data ?? []
  const statCamps = campList.length
  const statParticipants = summary.data?.totalParticipants ?? 0
  const statOrganizers = campList.reduce((sum, c) => sum + c.organizerCount, 0)

  return (
    <div className="pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-14 pt-6 md:px-8">
        <h1 className="text-subhead font-bold text-white">{p.title}</h1>
      </div>

      <div className="-mt-11 flex flex-col gap-3.5 px-5 md:px-8">
        {/* Identity */}
        <div className="flex flex-col items-center rounded-card border border-line bg-surface p-4 text-center shadow-[0_8px_22px_rgba(20,40,30,0.08)]">
          {/* Bespoke gradient tile, not the shared Avatar — the org has no photo
              identity, just an emoji mark on the brand gradient. */}
          <span className="-mt-11 flex h-[88px] w-[88px] flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-pine to-deep text-4xl shadow-[0_6px_16px_rgba(20,40,30,0.18)]">
            🏛
          </span>
          <div className="mt-3 text-subhead font-bold text-content">{name}</div>
          <div className="mt-2">
            <Badge tone="amber">{p.role}</Badge>
          </div>

          <div className="mt-4 flex w-full border-t border-line pt-3.5">
            <StatCell value={statCamps} label={p.statCamps} />
            <StatCell value={statParticipants} label={p.statParticipants} divided />
            <StatCell value={statOrganizers} label={p.statOrganizers} />
          </div>
        </div>

        {/* Contact — only fields the auth session actually carries. */}
        {user?.phone ? (
          <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
            <InfoRow icon="📞" label={p.phone} value={user.phone} last />
          </div>
        ) : null}

        {/* Settings */}
        <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
          <SettingsRow
            icon="🌐"
            label={p.language}
            hint={(selectedLang ?? 'uz').toUpperCase()}
            onClick={() => setLangOpen(true)}
          />
          <SupportRow />
        </div>

        <button
          type="button"
          onClick={logout}
          className="py-1 text-center text-body font-bold text-danger-deep active:scale-[0.99]"
        >
          {p.logout}
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
      <ChevronIcon />
    </button>
  )
}

function ChevronIcon() {
  return (
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
  )
}
