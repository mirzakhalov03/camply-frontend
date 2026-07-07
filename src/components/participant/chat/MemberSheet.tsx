import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
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
  Bottom-sheet profile peek for a tapped groupmate. Same sheet language as
  LanguageSheet: dimmed backdrop + slide-up surface. Shows avatar, name, city·age,
  role badge, and social links. Renders nothing when no member is selected.
*/
export function MemberSheet({ member, onClose }: Props) {
  const { t } = useTranslation()
  if (!member) return null

  const socials = member.socials ? Object.entries(member.socials).filter(([, v]) => v) : []

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label={t.notfound.back}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="animate-sheet-up absolute inset-x-0 bottom-0 rounded-t-[24px] bg-surface-2 px-[18px] pb-7 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.22)]">
        <div className="mx-auto mb-4 mt-1.5 h-1 w-10 rounded-full bg-line" />

        <div className="flex flex-col items-center text-center">
          <span
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: member.color }}
          >
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
            ) : (
              member.initials
            )}
          </span>
          <div className="mt-3 text-[19px] font-bold text-content">{member.name}</div>
          <div className="mt-0.5 text-[13px] text-muted">
            {member.city} · {interpolate(t.chat.ageYears, { age: member.age })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {member.isMe && (
              <span className="rounded-full bg-green-tint px-3 py-1 text-[11px] font-bold text-pine">
                {t.chat.you}
              </span>
            )}
            {member.role === 'leader' && (
              <span className="rounded-full bg-amber-tint px-3 py-1 text-[11px] font-bold text-amber">
                ★ {t.chat.leaderBadge}
              </span>
            )}
            <span className="rounded-full bg-green-tint px-3 py-1 text-[11px] font-bold text-pine">
              {member.role === 'leader' ? t.chat.leaderRole : t.chat.memberRole}
            </span>
          </div>

          {/* Call button — a real tel: link, hidden for yourself and when no number. */}
          {!member.isMe && member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-pine py-3 text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(15,107,79,0.3)] transition active:scale-[0.98]"
            >
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
            </a>
          )}
        </div>

        <div className="mt-6">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
            {t.chat.socials}
          </div>
          {socials.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] text-muted">
              {t.chat.noSocials}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {socials.map(([key, handle]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3"
                >
                  <span className="text-[13px] font-semibold text-content">
                    {SOCIAL_LABELS[key] ?? key}
                  </span>
                  <span className="text-[13px] text-muted">{handle}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
