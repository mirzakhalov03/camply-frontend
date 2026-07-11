import { useTranslation } from '../../../../i18n/useTranslation'
import { interpolate } from '../../../../lib/interpolate'
import { Avatar, Button, Sheet } from '../../../ui'
import type { RosterParticipant } from '../../../../api/services/roster.service'

type Props = {
  participant: RosterParticipant | null
  onClose: () => void
  onSeeOnMap: (participant: RosterParticipant) => void
}

const SOCIAL_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
}

/*
  Bottom-sheet profile peek for a tapped roster participant — the organizer twin of
  the participant chat's MemberSheet. Same shared Sheet + Avatar + Button primitives
  and the same layout (avatar, name, city·age, call, socials); adds a "See on map"
  button so the organizer can jump to that person on the live map. Presentational —
  the parent owns selection state and the actual map navigation.
*/
export function ParticipantPeekSheet({ participant, onClose, onSeeOnMap }: Props) {
  const { t } = useTranslation()
  const d = t.org.detail

  const socials = participant?.socials
    ? Object.entries(participant.socials).filter(([, v]) => v)
    : []

  return (
    <Sheet open={Boolean(participant)} onClose={onClose} closeLabel={t.notfound.back}>
      {participant && (
        <>
          <div className="flex flex-col items-center text-center">
            <Avatar
              name={participant.name}
              initials={participant.initials}
              photo={participant.photo}
              color={participant.avatarColor}
              size="xl"
            />
            <div className="mt-3 text-subhead font-bold text-content">{participant.name}</div>
            <div className="mt-0.5 text-body text-muted">
              {participant.city} · {interpolate(t.chat.ageYears, { age: participant.age })}
            </div>

            <div className="mt-5 flex w-full flex-col gap-2">
              {/* Call — a real tel: link, only when we have a number. */}
              {participant.phone && (
                <Button href={`tel:${participant.phone}`} fullWidth>
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

              {/* See on map — jumps to the camp's map tab focused on this participant. */}
              <Button
                variant="ghost"
                fullWidth
                onClick={() => onSeeOnMap(participant)}
                className="border border-line text-content"
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
                  <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {d.seeOnMap}
              </Button>
            </div>
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
