import { axiosInstance } from '../axiosInstance'

/*
  The participant's OWN group within a camp — a member-level read, distinct from
  the manager-gated roster projection under /organizer/camps/:id/groups. No React here.
*/

/*
  One member of your group. Initials and a color ONLY — the server never sends
  another member's name or phone, so this type can't accidentally surface one.
*/
export type MyGroupMember = {
  initials: string
  /** Palette token ('pine' | 'amber' | 'sky' | 'deep') — resolve via paletteColor(). */
  color: string
}

export type MyGroup = {
  id: string
  name: string
  /** Organizer-chosen; a raw hex in existing data. Pass through paletteColor(). */
  color: string
  photo: string | null
  memberCount: number
  members: MyGroupMember[]
}

export const myGroupService = {
  /** null when the participant hasn't been assigned a group yet — a valid state, not an error. */
  get: async (campId: string): Promise<MyGroup | null> =>
    (await axiosInstance.get<{ group: MyGroup | null }>(`/camps/${campId}/my-group`)).data.group,
}
