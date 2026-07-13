import { useProfileStore } from '@/store/useProfileStore'
import type { MeIdentity } from '@/lib/chat'

/*
  The current participant's identity, assembled from the profile store in ONE
  place. Screens that need "who am I" (chat roster overlay, profile header, future
  organizer views) read this instead of each re-selecting name/surname/photo/city/
  age/socials and re-joining them. Shaped as MeIdentity so it drops straight into
  withMyProfile(). When the backend serves the real user, this hook is the single
  spot to source it from there instead.
*/
export function useMe(): MeIdentity {
  const name = useProfileStore((s) => s.name)
  const surname = useProfileStore((s) => s.surname)
  const initials = useProfileStore((s) => s.initials)
  const photo = useProfileStore((s) => s.photo)
  const city = useProfileStore((s) => s.city)
  const age = useProfileStore((s) => s.age)
  const socials = useProfileStore((s) => s.socials)

  return {
    name: `${name} ${surname}`.trim(),
    initials,
    photo,
    city: city?.name ?? '',
    age,
    socials,
  }
}
