import { useTranslation } from '../../i18n/useTranslation'
import { ProfileForm } from './ProfileForm'
import { ProfileSuccess } from './ProfileSuccess'

type Props = {
  /** Slide back to the previous (congratulations) screen. */
  onBack?: () => void
  /** Final step after the badge is created — no home screen exists yet. */
  onEnterCamp?: () => void
  /** True once this screen is the visible step — gates the title typewriter. */
  active?: boolean
}

/*
  Participant profile setup — the "step 2" onboarding after a camper is confirmed
  on the roster. A thin wrapper over the shared ProfileForm: it supplies the
  camper-flavored copy, the age bracket (junior/teen/senior), the consent line,
  and the celebration overlay. All fields and layout live in ProfileForm, shared
  with the organizer flow.
*/
export function SignUpScreen({ onBack, onEnterCamp, active = true }: Props) {
  const { t } = useTranslation()

  return (
    <ProfileForm
      eyebrow={t.signup.eyebrow}
      title={t.signup.title}
      subtitle={t.signup.subtitle}
      submitValid={t.signup.enterValid}
      submitInvalid={t.signup.enterInvalid}
      onBack={onBack}
      active={active}
      ageBracket={(age) =>
        age < 13
          ? t.signup.bracketJunior
          : age <= 17
            ? t.signup.bracketTeen
            : t.signup.bracketSenior
      }
      consent={{
        before: t.signup.consentBefore,
        link: t.signup.consentLink,
        after: t.signup.consentAfter,
      }}
      renderSuccess={(data, onEdit) => (
        <ProfileSuccess
          initials={data.initials}
          photo={data.photo}
          name={data.name}
          badgeCreated={t.signup.badgeCreated}
          welcome={t.signup.welcome}
          primaryLabel={t.signup.enterCamp}
          onPrimary={onEnterCamp}
          editLabel={t.signup.editDetails}
          onEdit={onEdit}
        />
      )}
    />
  )
}
