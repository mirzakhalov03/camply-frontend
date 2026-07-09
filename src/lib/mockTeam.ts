import type { Team } from '../api/services/team.service'

/*
  Mock backing store for the organizer TEAM. Roles use the REAL hierarchy
  (ORGANIZER_ROLES from components/organizer/roles) — the prototype's dead
  "Owner/Admin/Co-organizer" labels are gone. `teamService` is the swap seam; the
  invite/cancel mutations mutate this store for the session.

  The `isMe` member is Madina, the logged-in organizer (matches the seeded session,
  the same way the roster ships an isMe placeholder).
*/
export const teamMock: Team = {
  organizationName: 'Yoshlar Foundation',
  members: [
    {
      id: 'me',
      name: 'Madina Yusupova',
      initials: 'MY',
      avatarColor: '#e0982a',
      role: 'projectManager',
      isMe: true,
    },
    {
      id: 't-nodira',
      name: 'Nodira Abdullayeva',
      initials: 'NA',
      avatarColor: '#5aa9c4',
      role: 'coordinator',
    },
    {
      id: 't-jasur',
      name: 'Jasur Karimov',
      initials: 'JK',
      avatarColor: '#0f6b4f',
      role: 'eventManager',
    },
    {
      id: 't-dilnoza',
      name: 'Dilnoza Aliyeva',
      initials: 'DA',
      avatarColor: '#c97b5a',
      role: 'photographer',
    },
  ],
  pending: [
    {
      id: 'inv-1',
      phone: '+998 90 777 12 34',
      role: 'coordinator',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
}
