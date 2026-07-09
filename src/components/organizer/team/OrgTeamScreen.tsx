import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { relativeTime } from '../../../lib/relativeTime'
import { Avatar, Skeleton } from '../../ui'
import { ROLE_EMOJI } from '../roles'
import { useTeam, useCancelInvite } from '../../../api/queries/team.queries'
import type { PendingInvite, TeamMember } from '../../../api/services/team.service'
import { InviteForm } from './InviteForm'

/*
  Team & co-organizers — the org-level roster of teammates + pending invites. Roles
  use the REAL hierarchy (t.organizer.roles), never the prototype's dead labels.
  Invite adds a pending row; Cancel removes it; both flow through the shared team
  mutations so the list + header count refetch from one invalidation.
*/
export function OrgTeamScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const tm = t.org.team
  const { data, isPending, isError } = useTeam()

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/org/profile')}
            aria-label={t.org.detail.back}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-white/20 text-white active:scale-95"
          >
            <BackIcon />
          </button>
          <div className="min-w-0">
            <h1 className="text-subhead font-bold text-white">{tm.title}</h1>
            {data ? (
              <p className="text-caption text-white/80">
                {data.organizationName} · {interpolate(tm.people, { count: data.members.length })}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 px-5 pt-4 md:px-8">
        {isPending ? (
          <>
            <Skeleton className="h-20" tone="surface" />
            <Skeleton className="h-40" tone="surface" />
          </>
        ) : isError || !data ? (
          <p className="py-8 text-center text-body text-muted">{t.org.detail.loadError}</p>
        ) : (
          <>
            <InviteForm />

            <SectionLabel>{tm.members}</SectionLabel>
            <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
              {data.members.map((m, i) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  last={i === data.members.length - 1}
                  youLabel={tm.you}
                />
              ))}
            </div>

            {data.pending.length > 0 ? (
              <>
                <SectionLabel>{tm.pending}</SectionLabel>
                <div className="flex flex-col gap-2">
                  {data.pending.map((inv) => (
                    <PendingRow key={inv.id} invite={inv} />
                  ))}
                </div>
              </>
            ) : null}

            <p className="rounded-input border border-line bg-soft px-4 py-3 text-caption leading-relaxed text-muted">
              {tm.rolesNote}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function MemberRow({
  member,
  last,
  youLabel,
}: {
  member: TeamMember
  last: boolean
  youLabel: string
}) {
  const { t } = useTranslation()
  return (
    <div className={`flex items-center gap-3 py-3 ${last ? '' : 'border-b border-line'}`}>
      <Avatar
        name={member.name}
        initials={member.initials}
        color={member.avatarColor}
        photo={member.photo}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-title font-bold text-content">{member.name}</span>
          {member.isMe ? (
            <span className="flex-none rounded-full bg-green-tint px-1.5 py-0.5 text-[9px] font-bold text-pine">
              {youLabel}
            </span>
          ) : null}
        </div>
        <div className="text-caption text-muted">
          {ROLE_EMOJI[member.role]} {t.organizer.roles[member.role]}
        </div>
      </div>
    </div>
  )
}

function PendingRow({ invite }: { invite: PendingInvite }) {
  const { t } = useTranslation()
  const tm = t.org.team
  const cancel = useCancelInvite()
  return (
    <div className="flex items-center gap-3 rounded-input border border-dashed border-line bg-surface px-3.5 py-3">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-soft text-muted">
        ⏳
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-body font-semibold text-content">
          {invite.phone}
        </div>
        <div className="text-meta text-muted">
          {t.organizer.roles[invite.role]} ·{' '}
          {interpolate(tm.invitedAgo, { time: relativeTime(invite.sentAt, t.time) })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => cancel.mutate(invite.id)}
        disabled={cancel.isPending}
        className="flex-none text-caption font-bold text-danger-deep active:scale-95 disabled:opacity-50"
      >
        {t.org.detail.cancel}
      </button>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-meta font-bold uppercase tracking-wider text-muted">{children}</h2>
}

function BackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
