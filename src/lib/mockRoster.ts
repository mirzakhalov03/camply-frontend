import type { CheckinStatus } from '../api/services/roster.service'

/*
  Mock backing store for a camp's ROSTER — the single source of truth for who's in
  the camp. Both the Participants tab (roster.service) and the Groups tab
  (campGroups.service) read THIS list: the groups view is derived by grouping these
  rows, so member counts can never drift from the roster. Group identity (name,
  color) is NOT stored here — only `groupId`, joined to CAMP_GROUPS at the service
  boundary, keeping one source of truth for group names (same rule as
  mockLeaderboard).

  `isLeader` marks the group leader (each group has one). Iroda Bekova / River Hawks
  matches the SOS banner on the dashboard — one coherent story across the app.
*/
export type RosterSeed = {
  id: string
  name: string
  initials: string
  /** Per-person avatar tile color (runtime data, applied inline). */
  avatarColor: string
  photo?: string | null
  /** Canonical CAMP_GROUPS id, or null if not yet assigned to a group. */
  groupId: string | null
  city: string
  status: CheckinStatus
  isLeader?: boolean
}

export const rosterMock: RosterSeed[] = [
  // Pine Wolves
  {
    id: 'p-sardor',
    name: 'Sardor Aliyev',
    initials: 'SA',
    avatarColor: '#0f6b4f',
    groupId: 'wolves',
    city: 'Tashkent',
    status: 'in',
    isLeader: true,
  },
  {
    id: 'p-aziza',
    name: 'Aziza Rashidova',
    initials: 'AR',
    avatarColor: '#5aa9c4',
    groupId: 'wolves',
    city: 'Tashkent',
    status: 'in',
  },
  {
    id: 'p-bekzod',
    name: 'Bekzod Tursunov',
    initials: 'BT',
    avatarColor: '#2f8f6b',
    groupId: 'wolves',
    city: 'Samarkand',
    status: 'in',
  },
  {
    id: 'p-malika',
    name: 'Malika Yusupova',
    initials: 'MY',
    avatarColor: '#c97b5a',
    groupId: 'wolves',
    city: 'Fergana',
    status: 'out',
  },
  // River Hawks
  {
    id: 'p-jasur',
    name: 'Jasur Odilov',
    initials: 'JO',
    avatarColor: '#5f7d6a',
    groupId: 'hawks',
    city: 'Andijan',
    status: 'in',
    isLeader: true,
  },
  {
    id: 'p-dilnoza',
    name: 'Dilnoza Karimova',
    initials: 'DK',
    avatarColor: '#e0982a',
    groupId: 'hawks',
    city: 'Bukhara',
    status: 'out',
  },
  {
    id: 'p-iroda',
    name: 'Iroda Bekova',
    initials: 'IB',
    avatarColor: '#c97b5a',
    groupId: 'hawks',
    city: 'Namangan',
    status: 'out',
  },
  {
    id: 'p-kamola',
    name: 'Kamola Nazarova',
    initials: 'KN',
    avatarColor: '#3f9d8e',
    groupId: 'hawks',
    city: 'Tashkent',
    status: 'in',
  },
  // Summit Foxes
  {
    id: 'p-eldor',
    name: 'Eldor Saidov',
    initials: 'ES',
    avatarColor: '#c97b5a',
    groupId: 'foxes',
    city: 'Andijan',
    status: 'in',
    isLeader: true,
  },
  {
    id: 'p-nigora',
    name: 'Nigora Abdullayeva',
    initials: 'NA',
    avatarColor: '#5aa9c4',
    groupId: 'foxes',
    city: 'Tashkent',
    status: 'in',
  },
  {
    id: 'p-otabek',
    name: 'Otabek Rustamov',
    initials: 'OR',
    avatarColor: '#0f6b4f',
    groupId: 'foxes',
    city: 'Samarkand',
    status: 'in',
  },
  // Trail Blazers
  {
    id: 'p-gulnora',
    name: 'Gulnora Ismoilova',
    initials: 'GI',
    avatarColor: '#e0982a',
    groupId: 'blazers',
    city: 'Bukhara',
    status: 'in',
    isLeader: true,
  },
  {
    id: 'p-sherzod',
    name: 'Sherzod Kamolov',
    initials: 'SK',
    avatarColor: '#5f7d6a',
    groupId: 'blazers',
    city: 'Tashkent',
    status: 'out',
  },
  {
    id: 'p-zarina',
    name: 'Zarina Halimova',
    initials: 'ZH',
    avatarColor: '#3f9d8e',
    groupId: 'blazers',
    city: 'Fergana',
    status: 'in',
  },
]
