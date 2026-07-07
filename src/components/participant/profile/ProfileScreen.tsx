import { useTranslation } from '../../../i18n/useTranslation'
import { useMembership } from '../../../lib/membership'
import type { useSos } from '../sos/useSos'
import { IdentityCard } from './IdentityCard'
import { SosCard } from './SosCard'
import { InfoList } from './InfoList'
import { SocialLinks } from './SocialLinks'
import { SettingsList } from './SettingsList'

type Props = {
  /** The one shared SOS state (owned by ParticipantDashboard, passed down). */
  sos: ReturnType<typeof useSos>
  /** Open the notifications screen (hero bell + settings row). */
  onNotifications: () => void
  /** Clear the profile and return to login. */
  onLogout: () => void
}

// Faint concentric-circle texture on the hero (from the prototype).
const HERO_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.06'%3E%3Ccircle cx='60' cy='70' r='40'/%3E%3Ccircle cx='60' cy='70' r='80'/%3E%3Ccircle cx='250' cy='220' r='40'/%3E%3Ccircle cx='250' cy='220' r='80'/%3E%3C/g%3E%3C/svg%3E\")"

/*
  The participant Profile tab. A green hero, then a stack of cards overlapping it:
  identity (name/avatar/tribe/stats), the SOS help card, the editable info & social
  cards, settings, and log out. Reads the user's own data from useProfileStore (via
  the child cards) and the organizer-owned tribe/stats from useMembership().
*/
export function ProfileScreen({ sos, onNotifications, onLogout }: Props) {
  const { t } = useTranslation()
  const { data: membership } = useMembership()

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[linear-gradient(155deg,#0f6b4f,#0a5039)] px-5 pb-14 pt-[max(1.375rem,env(safe-area-inset-top))]">
        <div className="absolute inset-0" style={{ backgroundImage: HERO_TEXTURE }} />
        <div className="relative flex items-center justify-between">
          <div className="text-[13px] font-semibold text-white/80">{t.profile.title}</div>
          <button
            type="button"
            onClick={onNotifications}
            aria-label={t.profile.notifications}
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-white/15"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
            <span className="absolute right-2 top-[7px] h-2 w-2 rounded-full border-[1.5px] border-[#0d5c43] bg-amber" />
          </button>
        </div>
      </div>

      {/* Cards — overlap the hero */}
      <div className="-mt-11 flex flex-col gap-[14px] px-5 pb-6">
        {membership ? (
          <IdentityCard membership={membership} />
        ) : (
          <div className="h-[188px] animate-pulse rounded-[22px] bg-surface" />
        )}
        <SosCard helpActive={sos.helpActive} onOpen={sos.open} onCancel={sos.cancelHelp} />
        <InfoList />
        <SocialLinks />
        <SettingsList onNotifications={onNotifications} />
        <button
          type="button"
          onClick={onLogout}
          className="p-1 text-center text-[13px] font-bold text-[#c43a22]"
        >
          {t.profile.logout}
        </button>
      </div>
    </div>
  )
}
