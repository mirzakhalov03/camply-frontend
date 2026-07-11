import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { Avatar, Badge, Button, Sheet } from '../../ui'
import type { ChatMember } from '../../../lib/chat'

type Props = {
  member: ChatMember | null
  onClose: () => void
}

const SOCIAL_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
}

/*
  Bottom-sheet profile peek for a tapped groupmate. Uses the shared Sheet (backdrop
  + slide-up + a11y) and shows avatar, name, city·age, role badges, and socials.
  Renders nothing when no member is selected.
*/
export function MemberSheet({ member, onClose }: Props) {
  const { t } = useTranslation()

  const socials = member?.socials ? Object.entries(member.socials).filter(([, v]) => v) : []

  return (
    <Sheet open={Boolean(member)} onClose={onClose} closeLabel={t.notfound.back}>
      {member && (
        <>
          <div className="flex flex-col items-center text-center">
            <Avatar
              name={member.name}
              initials={member.initials}
              photo={member.photo}
              color={member.color}
              size="xl"
            />
            <div className="mt-3 text-subhead font-bold text-content">{member.name}</div>
            <div className="mt-0.5 text-body text-muted">
              {member.city} · {interpolate(t.chat.ageYears, { age: member.age })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {member.isMe && <Badge tone="pine">{t.chat.you}</Badge>}
              {member.role === 'leader' && <Badge tone="amber">★ {t.chat.leaderBadge}</Badge>}
              <Badge tone="pine">
                {member.role === 'leader' ? t.chat.leaderRole : t.chat.memberRole}
              </Badge>
            </div>

            {/* Call button — a real tel: link, hidden for yourself and when no number. */}
            {!member.isMe && member.phone && (
              <Button href={`tel:${member.phone}`} fullWidth className="mt-5">
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
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                </svg>
                {t.chat.call}
              </Button>
            )}
          </div>

          <div className="mt-6">
            <div className="mb-2 text-meta font-bold uppercase tracking-wide text-muted">
              {t.chat.socials}
            </div>
            {socials.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-body text-muted">
                {t.chat.noSocials}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {socials.map(([key, handle]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3"
                  >
                    <span className="text-body font-semibold text-content">
                      {SOCIAL_LABELS[key] ?? key}
                    </span>
                    <span className="text-body text-muted">{handle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Sheet>
  )
}
