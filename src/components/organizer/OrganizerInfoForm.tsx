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
  /** Show the coordinator group picker. False during first-run onboarding — a
      fresh organizer has no camp yet, so groups are assigned later per camp. */
  withGroup?: boolean
  /** Show the job sub-role picker. False for a manager — a manager is an account
      tier, not a job, so it has no sub-role (the picker is skipped entirely). */
  withRole?: boolean
  /** Fired when the profile+role commit (right after useProfileStore is written),
      with the picked role (null for a manager) — the caller's hook to persist via
      PATCH /auth/me. */
  onSubmit?: (role: OrganizerRole | null) => void
}

/*
  Organizer profile setup — the organizer twin of SignUpScreen. Same shared
  ProfileForm (name, surname, city, age, photo), plus organizer-only fields
  injected through ProfileForm's `extraFields` slot: a required role picker, and
  — for coordinators only — a required single group. Both must be satisfied
  before submit enables (extraValid), and they persist into useOrganizerStore via
  the `onCommit` seam. Copy and the success overlay use the organizer i18n bundle.
*/
export function OrganizerInfoForm({
  onBack,
  onEnterDashboard,
  active = true,
  withGroup = true,
  withRole = true,
  onSubmit,
}: Props) {
  const { t } = useTranslation()
  const [role, setRole] = useState<OrganizerRole | null>(null)
  const [group, setGroup] = useState<CampGroup | null>(null)
  const setIdentity = useOrganizerStore((s) => s.setIdentity)

  // The group step only exists when the role picker is shown, enabled, AND a
  // coordinator is picked (managers have no role picker, so never a group step).
  const showGroup = withRole && withGroup && role === 'coordinator'

  // Picking a non-coordinator role clears any group chosen earlier, so a stale
  // group never gets committed.
  const handleRole = (next: OrganizerRole) => {
    setRole(next)
    if (next !== 'coordinator') setGroup(null)
  }

  // Role required (unless this is a manager, who has none); coordinators also need
  // a group before they can enter (only when the group step is shown).
  const extraValid = (!withRole || Boolean(role)) && (!showGroup || Boolean(group))

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
        if (withRole && !role) return
        if (role) setIdentity(role, showGroup ? group : null)
        onSubmit?.(role)
      }}
      extraFields={
        <>
          {withRole && (
            <>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
                {t.organizer.roleLabel}
              </p>
              <div className="mt-2.5">
                <RolePicker value={role} onChange={handleRole} labels={t.organizer.roles} />
              </div>
            </>
          )}

          {showGroup && (
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
