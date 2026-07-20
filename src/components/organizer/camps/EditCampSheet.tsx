import { useEffect, useState } from 'react'
import { Sheet, Button } from '@/components/ui'
import { useTranslation } from '@/i18n/useTranslation'
import { useUpdateCamp } from '@/api/queries/camps.queries'
import { CampInfoFields, type CampInfoValue } from '@/components/camp-wizard/CampInfoFields'
import type { OrganizerCamp } from '@/api/services/camps.service'

/*
  Edit an existing camp's core info. Deliberately NOT the creation wizard: that
  wizard is collect-then-commit over a PERSISTED draft store (one draft, one
  clientRequestId idempotency key, nothing sent until Finish), so reusing it for
  edits would mean seeding a store that a half-finished create might already own.

  What IS shared is the part that matters — CampInfoFields — so the two forms can't
  drift apart visually. Groups, participants, and organizers are edited on their own
  camp-detail tabs against their own endpoints; this sheet covers only what had no
  edit path at all.
*/

/** ISO instant → the YYYY-MM-DD a date input expects, in LOCAL time. */
function isoToDateInput(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function EditCampSheet({
  camp,
  open,
  onClose,
}: {
  camp: OrganizerCamp
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const c = t.createCamp
  const d = t.org.detail
  const update = useUpdateCamp(camp.id)

  const [value, setValue] = useState<CampInfoValue>({
    name: '',
    location: '',
    starts: '',
    ends: '',
    capacity: '',
  })
  const [error, setError] = useState<string | null>(null)

  // Re-seed from the camp whenever the sheet opens, so a cancelled edit doesn't
  // leave stale input behind on the next open.
  useEffect(() => {
    if (!open) return
    setError(null)
    setValue({
      name: camp.name,
      location: camp.location,
      starts: isoToDateInput(camp.startsAt),
      ends: isoToDateInput(camp.endsAt),
      capacity: '', // not returned by the camp projection — hidden below
    })
  }, [open, camp])

  const patch = (p: Partial<CampInfoValue>) => setValue((v) => ({ ...v, ...p }))

  const save = () => {
    if (!value.name.trim() || !value.location.trim() || !value.starts || !value.ends) {
      setError(c.required)
      return
    }
    if (value.ends < value.starts) {
      setError(c.dateError)
      return
    }
    /*
      No past-date guard here, unlike create: an active camp legitimately started
      before today, and re-saving its unchanged dates must not be rejected.
    */
    setError(null)
    update.mutate(
      {
        name: value.name.trim(),
        location: value.location.trim(),
        // Dates are date-only in the form; send them as instants the server accepts.
        startsAt: new Date(`${value.starts}T00:00`).toISOString(),
        endsAt: new Date(`${value.ends}T23:59`).toISOString(),
      },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(err instanceof Error ? err.message : c.required),
      },
    )
  }

  return (
    <Sheet open={open} onClose={onClose} closeLabel={d.cancel} title={d.editCamp}>
      <div className="flex flex-col gap-4">
        <CampInfoFields value={value} onChange={patch} error={error} showCapacity={false} />
        <Button variant="primary" size="lg" fullWidth onClick={save} disabled={update.isPending}>
          {update.isPending ? d.savingCamp : d.saveCamp}
        </Button>
      </div>
    </Sheet>
  )
}
