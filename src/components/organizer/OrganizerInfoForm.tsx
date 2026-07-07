import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { ProfileForm } from '../signup/ProfileForm'
import { ProfileSuccess } from '../signup/ProfileSuccess'
import { RolePicker } from './RolePicker'
import { type OrganizerRole } from './roles'

type Props = {
  /** Slide back to the previous (congratulations) screen. */
  onBack?: () => void
  /** Final step after the profile is created — go to the organizer dashboard. */
  onEnterDashboard?: () => void
  /** True once this screen is the visible step — gates the title typewriter. */
  active?: boolean
}

/*
  Organizer profile setup — the organizer twin of SignUpScreen. Same shared
  ProfileForm (name, surname, city, age, photo), plus one organizer-only field:
  a required single-select role picker, injected through ProfileForm's
  `extraFields` slot. The role must be chosen before submit enables (extraValid).
  Copy and the success overlay use the organizer i18n bundle.
*/
export function OrganizerInfoForm({ onBack, onEnterDashboard, active = true }: Props) {
  const { t } = useTranslation()
  const [role, setRole] = useState<OrganizerRole | null>(null)

  return (
    <ProfileForm
      eyebrow={t.organizer.eyebrow}
      title={t.organizer.title}
      subtitle={t.organizer.subtitle}
      submitValid={t.organizer.enterValid}
      submitInvalid={t.organizer.enterInvalid}
      onBack={onBack}
      active={active}
      extraValid={Boolean(role)}
      extraFields={
        <>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
            {t.organizer.roleLabel}
          </p>
          <div className="mt-2.5">
            <RolePicker value={role} onChange={setRole} labels={t.organizer.roles} />
          </div>
        </>
      }
      renderSuccess={(data, onEdit) => (
        <ProfileSuccess
          initials={data.initials}
          photo={data.photo}
          name={data.name}
          badgeCreated={t.organizer.badgeCreated}
          welcome={t.organizer.welcome}
          primaryLabel={t.organizer.enterDashboard}
          onPrimary={onEnterDashboard}
          editLabel={t.organizer.editDetails}
          onEdit={onEdit}
        />
      )}
    />
  )
}
