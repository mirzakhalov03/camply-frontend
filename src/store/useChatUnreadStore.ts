import { create } from 'zustand'

/*
  CLIENT UI state: unread message counts per chat room. Seeded by the socket's
  chat:unread on connect, bumped when a chat:message arrives for a room the user
  isn't viewing, cleared when they open that thread (which also emits chat:read).
  NOT server data mirrored — it's a derived view counter the badge reads.
*/
export const roomKey = (channel: 'group' | 'organizers', groupId: string | null) =>
  channel === 'group' && groupId ? `group:${groupId}` : 'organizers'

type UnreadState = {
  counts: Record<string, number>
  seed: (
    rooms: { channel: 'group' | 'organizers'; groupId: string | null; count: number }[],
  ) => void
  bump: (key: string) => void
  clear: (key: string) => void
  total: () => number
}

export const useChatUnreadStore = create<UnreadState>((set, get) => ({
  counts: {},
  seed: (rooms) =>
    set(() => ({
      counts: Object.fromEntries(rooms.map((r) => [roomKey(r.channel, r.groupId), r.count])),
    })),
  bump: (key) => set((s) => ({ counts: { ...s.counts, [key]: (s.counts[key] ?? 0) + 1 } })),
  clear: (key) => set((s) => ({ counts: { ...s.counts, [key]: 0 } })),
  total: () => Object.values(get().counts).reduce((a, b) => a + b, 0),
}))
