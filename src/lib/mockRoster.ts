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

  `phone`, `age`, and `socials` back the organizer's participant peek sheet (call +
  socials), mirroring the shape the chat's ChatMember already exposes.
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
  age: number
  status: CheckinStatus
  isLeader?: boolean
  /** E.164 phone for the organizer's call button. */
  phone?: string
  socials?: {
    telegram?: string
    instagram?: string
    facebook?: string
    linkedin?: string
  }
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
    age: 16,
    status: 'in',
    isLeader: true,
    phone: '+998901112233',
    socials: { telegram: '@sardor', instagram: '@sardor.aliyev' },
  },
  {
    id: 'p-aziza',
    name: 'Aziza Rashidova',
    initials: 'AR',
    avatarColor: '#5aa9c4',
    groupId: 'wolves',
    city: 'Tashkent',
    age: 15,
    status: 'in',
    phone: '+998901112244',
    socials: { instagram: '@aziza.r' },
  },
  {
    id: 'p-bekzod',
    name: 'Bekzod Tursunov',
    initials: 'BT',
    avatarColor: '#2f8f6b',
    groupId: 'wolves',
    city: 'Samarkand',
    age: 17,
    status: 'in',
    phone: '+998901112255',
    socials: { telegram: '@bekzodt' },
  },
  {
    id: 'p-malika',
    name: 'Malika Yusupova',
    initials: 'MY',
    avatarColor: '#c97b5a',
    groupId: 'wolves',
    city: 'Fergana',
    age: 14,
    status: 'out',
    phone: '+998901112266',
  },
  // River Hawks
  {
    id: 'p-jasur',
    name: 'Jasur Odilov',
    initials: 'JO',
    avatarColor: '#5f7d6a',
    groupId: 'hawks',
    city: 'Andijan',
    age: 16,
    status: 'in',
    isLeader: true,
    phone: '+998901113311',
    socials: { telegram: '@jasuro', instagram: '@jasur.odilov' },
  },
  {
    id: 'p-dilnoza',
    name: 'Dilnoza Karimova',
    initials: 'DK',
    avatarColor: '#e0982a',
    groupId: 'hawks',
    city: 'Bukhara',
    age: 15,
    status: 'out',
    phone: '+998901113322',
    socials: { instagram: '@dilnoza.k' },
  },
  {
    id: 'p-iroda',
    name: 'Iroda Bekova',
    initials: 'IB',
    avatarColor: '#c97b5a',
    groupId: 'hawks',
    city: 'Namangan',
    age: 16,
    status: 'out',
    phone: '+998901113333',
    socials: { telegram: '@irodab' },
  },
  {
    id: 'p-kamola',
    name: 'Kamola Nazarova',
    initials: 'KN',
    avatarColor: '#3f9d8e',
    groupId: 'hawks',
    city: 'Tashkent',
    age: 14,
    status: 'in',
    phone: '+998901113344',
  },
  // Summit Foxes
  {
    id: 'p-eldor',
    name: 'Eldor Saidov',
    initials: 'ES',
    avatarColor: '#c97b5a',
    groupId: 'foxes',
    city: 'Andijan',
    age: 17,
    status: 'in',
    isLeader: true,
    phone: '+998901114411',
    socials: { telegram: '@eldors', instagram: '@eldor.saidov' },
  },
  {
    id: 'p-nigora',
    name: 'Nigora Abdullayeva',
    initials: 'NA',
    avatarColor: '#5aa9c4',
    groupId: 'foxes',
    city: 'Tashkent',
    age: 15,
    status: 'in',
    phone: '+998901114422',
    socials: { instagram: '@nigora.a' },
  },
  {
    id: 'p-otabek',
    name: 'Otabek Rustamov',
    initials: 'OR',
    avatarColor: '#0f6b4f',
    groupId: 'foxes',
    city: 'Samarkand',
    age: 16,
    status: 'in',
    phone: '+998901114433',
  },
  // Trail Blazers
  {
    id: 'p-gulnora',
    name: 'Gulnora Ismoilova',
    initials: 'GI',
    avatarColor: '#e0982a',
    groupId: 'blazers',
    city: 'Bukhara',
    age: 16,
    status: 'in',
    isLeader: true,
    phone: '+998901115511',
    socials: { telegram: '@gulnorai', instagram: '@gulnora.ismoilova' },
  },
  {
    id: 'p-sherzod',
    name: 'Sherzod Kamolov',
    initials: 'SK',
    avatarColor: '#5f7d6a',
    groupId: 'blazers',
    city: 'Tashkent',
    age: 17,
    status: 'out',
    phone: '+998901115522',
    socials: { telegram: '@sherzodk' },
  },
  {
    id: 'p-zarina',
    name: 'Zarina Halimova',
    initials: 'ZH',
    avatarColor: '#3f9d8e',
    groupId: 'blazers',
    city: 'Fergana',
    age: 15,
    status: 'in',
    phone: '+998901115533',
    socials: { instagram: '@zarina.h' },
  },
]
