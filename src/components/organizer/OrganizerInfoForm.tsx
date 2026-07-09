import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { ProfileForm } from '../signup/ProfileForm'
import { ProfileSuccess } from '../signup/ProfileSuccess'
import { RolePicker } from './RolePicker'
import { GroupPicker } from './GroupPicker'
import { type OrganizerRole } from './roles'
import { type CampGroup } from '../../lib/groups'
import { useOrganizerStore } from '../../store/useOrganizerStore'

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
  ProfileForm (name, surname, city, age, photo), plus organizer-only fields
  injected through ProfileForm's `extraFields` slot: a required role picker, and
  — for coordinators only — a required single group. Both must be satisfied
  before submit enables (extraValid), and they persist into useOrganizerStore via
  the `onCommit` seam. Copy and the success overlay use the organizer i18n bundle.
*/
export function OrganizerInfoForm({ onBack, onEnterDashboard, active = true }: Props) {
  const { t } = useTranslation()
  const [role, setRole] = useState<OrganizerRole | null>(null)
  const [group, setGroup] = useState<CampGroup | null>(null)
  const setIdentity = useOrganizerStore((s) => s.setIdentity)

  const isCoordinator = role === 'coordinator'

  // Picking a non-coordinator role clears any group chosen earlier, so a stale
  // group never gets committed.
  const handleRole = (next: OrganizerRole) => {
    setRole(next)
    if (next !== 'coordinator') setGroup(null)
  }

  // Role required; coordinators also need a group before they can enter.
  const extraValid = Boolean(role) && (!isCoordinator || Boolean(group))

  return (
    <ProfileForm
      eyebrow={t.organizer.eyebrow}
      title={t.organizer.title}
      subtitle={t.organizer.subtitle}
      submitValid={t.organizer.enterValid}
      submitInvalid={t.organizer.enterInvalid}
      onBack={onBack}
      active={active}
      extraValid={extraValid}
      onCommit={() => {
        if (role) setIdentity(role, isCoordinator ? group : null)
      }}
      extraFields={
        <>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
            {t.organizer.roleLabel}
          </p>
          <div className="mt-2.5">
            <RolePicker value={role} onChange={handleRole} labels={t.organizer.roles} />
          </div>

          {isCoordinator && (
            <div className="animate-drop">
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
                {t.organizer.groupLabel}
              </p>
              <div className="mt-2.5">
                <GroupPicker value={group} onChange={setGroup} />
              </div>
            </div>
          )}
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
