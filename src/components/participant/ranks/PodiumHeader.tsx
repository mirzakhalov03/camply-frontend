import type { RankedGroup } from '../../../lib/leaderboard'

type Props = {
  title: string
  /** Full ranked list; the header renders the top three. */
  rows: RankedGroup[]
}

// Per-place visual treatment. This is PRESENTATION math, so it lives in the
// component, not in deriveLeaderboard — the view model only knows "rank 1/2/3".
const PLACE = {
  1: { medal: '#e7b34e', avatar: 64, pedestal: 92, badge: '#3a2807' },
  2: { medal: '#c7d0d9', avatar: 54, pedestal: 68, badge: '#2b333a' },
  3: { medal: '#cf9270', avatar: 54, pedestal: 54, badge: '#3a2408' },
} as const

// Faint concentric-circle texture, same spirit as the prototype's header.
const TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.06'%3E%3Ccircle cx='60' cy='60' r='40'/%3E%3Ccircle cx='60' cy='60' r='80'/%3E%3Ccircle cx='240' cy='200' r='40'/%3E%3Ccircle cx='240' cy='200' r='80'/%3E%3C/g%3E%3C/svg%3E\")"

/*
  The green podium header. Stays vivid green in light AND dark mode (brand
  surface, like CampCover). Renders the top-three groups arranged visually as
  2nd · 1st · 3rd, each on a stepped pedestal with a medal-ringed avatar.
*/
export function PodiumHeader({ title, rows }: Props) {
  // Display order puts the winner in the middle: [2nd, 1st, 3rd].
  const podium = [rows[1], rows[0], rows[2]].filter(Boolean) as RankedGroup[]

  return (
    <div className="relative flex-none overflow-hidden bg-[linear-gradient(160deg,#0f6b4f_0%,#0a5039_55%,#083b2b_100%)] px-5 pb-6 pt-4 text-white">
      <div className="absolute inset-0" style={{ backgroundImage: TEXTURE }} />

      <div className="relative">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>

        <div className="mt-4 flex items-end justify-center gap-3.5">
          {podium.map((g) => {
            const place = g.rank as 1 | 2 | 3
            const s = PLACE[place] ?? PLACE[3]
            return (
              <div key={g.id} className="flex w-[84px] flex-col items-center gap-1.5">
                <div className="relative" style={{ width: s.avatar, height: s.avatar }}>
                  {/* Inner layer clips the photo to a circle; the medal ring and
                      place badge sit outside it so they're never cropped. */}
                  <div
                    className="flex h-full w-full items-center justify-center overflow-hidden rounded-full font-bold text-white"
                    style={{
                      backgroundColor: g.color,
                      border: `3px solid ${s.medal}`,
                      fontSize: s.avatar > 60 ? 16 : 13,
                    }}
                  >
                    {g.photo ? (
                      <img src={g.photo} alt={g.name} className="h-full w-full object-cover" />
                    ) : (
                      g.initials
                    )}
                  </div>
                  <span
                    className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-deep text-[10px] font-extrabold"
                    style={{ backgroundColor: s.medal, color: s.badge }}
                  >
                    {g.rank}
                  </span>
                </div>
                <div className="mt-1 text-center text-[11px] font-bold leading-tight">{g.name}</div>
                <div className="text-[12px] font-extrabold text-[#f4d9a8]">{g.score}</div>
                <div className="w-full rounded-t-xl bg-white/12" style={{ height: s.pedestal }} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
