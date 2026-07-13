import type { ReactNode } from 'react'
import type { OrganizerCamp, OrganizerSummary } from '../../../api/services/camps.service'
import type { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'

/*
  The camp-feature registry — the SINGLE SOURCE OF TRUTH for the organizer's camp
  features. The `/org/camps` home maps it into feature cards; `App.tsx` maps it into
  nested routes; `FeatureShell` reads a feature's title from it. Adding a feature is
  one entry here, so the launcher, the routing, and the window title can't drift apart.

  Each card's `stat` is a PURE selector over already-fetched query data (camp meta,
  summary, active help, standings) — no card triggers its own fetch, keeping the
  home light (the whole point over loading every feature's data at once).
*/

type T = ReturnType<typeof useTranslation>['t']

export type FeatureStat = { text: string; alert?: boolean }

export type FeatureStatContext = {
  t: T
  camp: OrganizerCamp
  summary?: OrganizerSummary
  alertCount: number
  leaderName: string | null
}

export type FeatureTint = 'green' | 'amber'

export type CampFeature = {
  key: string
  /** Route segment — MUST match the URL under /org/camps/:campId (deep-link contract). */
  to: string
  icon: ReactNode
  /** Icon-tile tint on the hub card (keeps the grid two-tone, matching the mock). */
  tint: FeatureTint
  /** Card label + full-screen window title. */
  label: (t: T) => string
  /** Pure selector over already-fetched data → the card's live micro-stat. */
  stat: (ctx: FeatureStatContext) => FeatureStat
}

// Icons are small inline SVGs (stroke-current) matching OrganizerNav's style.
const svg = 'stroke-current flex-none'

export const CAMP_FEATURES: CampFeature[] = [
  {
    key: 'map',
    to: 'map',
    tint: 'green',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={svg}
      >
        <path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" />
        <circle cx="12" cy="11" r="2.3" />
      </svg>
    ),
    label: (t) => t.org.detail.tabMap,
    stat: ({ t, summary, alertCount }) => ({
      text: interpolate(t.org.camps.liveMapMeta, {
        onsite: summary?.onSite ?? 0,
        alerts: alertCount,
      }),
      alert: alertCount > 0,
    }),
  },
  {
    key: 'leaderboard',
    to: 'leaderboard',
    tint: 'amber',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={svg}
      >
        {/* Loving-cup trophy — bowl, curved handles, stem, two-tier plinth. Stroke
            style (no emoji) so it flips with the theme and matches the grid. */}
        <path d="M6.5 3.5h11V7a5.5 5 0 0 1-11 0z" />
        <path d="M6.5 4.5C3 4.5 2.7 9.8 7 10.3" />
        <path d="M17.5 4.5C21 4.5 21.3 9.8 17 10.3" />
        <path d="M12 12v3" />
        <path d="M9 15h6l1 2.5H8z" />
        <path d="M7.5 17.5h9V20h-9z" />
      </svg>
    ),
    label: (t) => t.org.detail.tabLeaderboard,
    stat: ({ t, leaderName }) => ({
      text: leaderName
        ? interpolate(t.org.camps.leaderboardMeta, { group: leaderName })
        : t.org.detail.hubStatEmpty,
    }),
  },
  {
    key: 'participants',
    to: 'participants',
    tint: 'green',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={svg}
      >
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 5.2a3.2 3.2 0 0 1 0 6M17.5 20a5.5 5.5 0 0 0-2.3-4.5" />
      </svg>
    ),
    label: (t) => t.org.detail.tabParticipants,
    stat: ({ t, camp }) => ({
      text: interpolate(t.org.detail.hubParticipantsStat, { count: camp.participantCount }),
    }),
  },
  {
    key: 'groups',
    to: 'groups',
    tint: 'amber',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.1" className={svg}>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
    label: (t) => t.org.detail.tabGroups,
    stat: ({ t, camp }) => ({
      text: interpolate(t.org.detail.hubGroupsStat, { count: camp.groupCount }),
    }),
  },
  {
    key: 'schedule',
    to: 'schedule',
    tint: 'green',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={svg}
      >
        <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
        <path d="M3.5 9h17M8 3v3M16 3v3" />
      </svg>
    ),
    label: (t) => t.org.detail.tabSchedule,
    stat: ({ t, camp }) => ({
      text:
        camp.dayTotal > 0
          ? interpolate(t.org.detail.hubScheduleStat, {
              current: camp.dayCurrent,
              total: camp.dayTotal,
            })
          : t.org.detail.hubScheduleStatEmpty,
    }),
  },
  {
    key: 'announcements',
    to: 'announcements',
    tint: 'amber',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={svg}
      >
        {/* Bullhorn — diagonal bell + driver ring + handle, no sound waves. */}
        <g transform="rotate(-20 12 12)">
          <path d="M9 7.5 20 3V21L9 16.5Z" />
          <path d="M9 7.5H6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h3" />
          <circle cx="7" cy="12" r="1.6" />
          <path d="M8 16.5v2.5a1.6 1.6 0 0 0 3.2 0V16.5" />
        </g>
      </svg>
    ),
    label: (t) => t.org.detail.tabAnnouncements,
    stat: ({ t }) => ({ text: t.org.detail.hubAnnouncementsStat }),
  },
]
