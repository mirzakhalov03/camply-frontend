/*
  Trilingual string config (Context.md §2 — EN/UZ/RU from day one). Adding a
  language = add one key here with the same shape; TypeScript enforces that every
  language covers every string. Screens read these through `useTranslation()`.
*/

// Language order is intentional: UZ first (first market), then RU, then EN.
export const LANGUAGES = ['uz', 'ru', 'en'] as const
export type Lang = (typeof LANGUAGES)[number]

// Short labels for the language switcher.
export const LANG_LABELS: Record<Lang, string> = {
  uz: 'UZ',
  ru: 'RU',
  en: 'EN',
}

// Full names for accessible labels.
export const LANG_NAMES: Record<Lang, string> = {
  uz: 'Oʻzbekcha',
  ru: 'Русский',
  en: 'English',
}

type LoginStrings = {
  eyebrow: string
  welcome: string
  subtitle: string
  phoneLabel: string
  phoneError: string
  cta: string
  switchLanguage: string
}

type CongratsStrings = {
  title: string
  message: string
  continue: string
}

type NotFoundStrings = {
  title: string
  message: string
  back: string
}

// Strings with {tokens} are filled at render time (see interpolate() in the
// signup components) so each language keeps correct grammar and word order.
type SignUpStrings = {
  eyebrow: string
  title: string
  subtitle: string
  badgeEmpty: string
  photoUploaded: string
  uploadPhoto: string
  nameLabel: string
  firstName: string
  surname: string
  cityLabel: string
  cityPlaceholder: string
  citySearchPlaceholder: string
  cityCount: string // '{count} cities'
  regionSuffix: string // '{region} region'
  noResults: string // 'No city matches "{query}"'
  ageLabel: string
  ageUnit: string
  bracketJunior: string
  bracketTeen: string
  bracketSenior: string
  enterValid: string
  enterInvalid: string
  consentBefore: string
  consentLink: string
  consentAfter: string
  badgeCreated: string
  welcome: string // 'Welcome to camp, {name}!'
  enterCamp: string
  editDetails: string
}

// Organizer flow copy. Shares the generic field labels with `signup` (name,
// city, age…) via ProfileForm; only the role-specific pieces live here.
type OrganizerStrings = {
  congratsMessage: string // organizer-flavored congratulations message
  eyebrow: string
  title: string
  subtitle: string
  roleLabel: string
  roles: {
    coordinator: string
    admin: string
    media: string
    brandFace: string
    eventManager: string
    photographer: string
  }
  groupLabel: string // shown only for the coordinator role
  groupPlaceholder: string // collapsed-row prompt in the group picker
  enterValid: string
  enterInvalid: string
  badgeCreated: string
  welcome: string // 'You're all set, {name}!'
  enterDashboard: string
  editDetails: string
}

// Bottom-nav tab labels (also reused as the ComingSoon screen titles).
type NavStrings = {
  home: string
  map: string
  ranks: string
  chat: string
  profile: string
}

// Participant home screen chrome. {tokens} are filled per-language.
type HomeStrings = {
  liveNow: string
  dayProgress: string // 'Day {current} of {total}'
  upNext: string
  upNextWith: string // 'with {group}'
  todaySchedule: string
  seeAll: string
  statusDone: string
  statusNow: string
  latestAnnouncement: string
  all: string
  myGroup: string
  membersCount: string // '{count} members'
}

// SOS flow — reason picker → press-and-hold → sending → active tracking.
type SosStrings = {
  title: string
  subtitle: string
  whatsHappening: string
  reasons: Record<'medical' | 'lost' | 'unsafe' | 'other', string>
  reasonDefault: string
  locationSuffix: string // '<location> · location shared live'
  alertsBefore: string // 'Alerts'
  alertsLeader: string // 'leader'
  holdToSend: string
  keepHolding: string
  holdHint: string
  sendingTitle: string
  sendingSub: string // 'Sending {reason} · sharing your live location'
  helpComing: string
  helpOnWay: string
  stayPut: string
  activeSub: string // 'Sending {reason} · {location}'
  responderRole: string
  eta: string
  teamNotified: string // '{team} notified'
  leaderAlerted: string // 'Group leader {leader} alerted'
  sharingLocation: string
  now: string
  callOrganizer: string
  imSafe: string
}

// Participant profile screen — identity, help card, editable info & links,
// settings. Tribe/points values are DATA (see membership.ts), not strings.
type ProfileStrings = {
  title: string
  roles: { participant: string }
  // Stats row
  groupRank: string
  activities: string
  points: string
  // Need-help / SOS card
  needHelp: string
  needHelpBody: string
  sendHelp: string
  organizerNotified: string
  organizerNotifiedBody: string
  cancelAlert: string
  // Info list
  email: string
  addEmail: string
  phone: string
  city: string
  notSet: string
  // Social links
  socialLinks: string
  edit: string
  save: string
  socialHint: string
  saveLinks: string
  tgPlaceholder: string
  igPlaceholder: string
  fbPlaceholder: string
  liPlaceholder: string
  // Settings
  notifications: string
  notificationsBlocked: string
  notificationsInstall: string
  language: string
  chooseLanguage: string
  locationSharing: string
  appearance: string
  logout: string
}

// PWA lifecycle prompts (service-worker update / offline-ready toast).
type PwaStrings = {
  updateReady: string
  reload: string
  offlineReady: string
  dismiss: string
}

// Participant group chat — header, composer, attachment menu, member profile sheet.
type ChatStrings = {
  membersOnline: string // '{members} members · {online} online'
  messagePlaceholder: string // 'Message {group}…'
  changePhoto: string // aria-label for the group photo button
  attach: string // aria-label for the + button
  photo: string
  file: string
  camera: string
  send: string // aria-label for send
  viewMembers: string // aria-label for the header members button
  call: string
  reply: string
  emptyThread: string
  loading: string
  loadError: string
  // Member profile sheet
  leaderRole: string // 'Group leader'
  memberRole: string // 'Member'
  you: string
  leaderBadge: string // 'Leader'
  ageYears: string // '{age} years'
  socials: string
  noSocials: string
}

// Participant ranks / leaderboard — podium, your-standing spotlight, ranked list,
// points legend. Group names, scores & trend are DATA (leaderboard.ts), not strings.
type RanksStrings = {
  title: string // 'Leaderboard'
  yourStanding: string
  you: string // 'YOU' badge
  behindLeader: string // '{delta} pts behind {name}'
  leadingBy: string // 'Leading by {delta} pts'
  points: string // 'pts'
  howPointsEarned: string
  activities: string
  attendance: string
  challenges: string
  loadError: string
  empty: string
  emptyBody: string
}

// Shared bits (empty states for the not-yet-built tabs).
type CommonStrings = {
  comingSoon: string
  comingSoonBody: string
}

// Relative-time wording — {count} is filled per language (see lib/relativeTime).
type TimeStrings = {
  justNow: string
  minAgo: string // '{count} min ago'
  hoursAgo: string // '{count}h ago'
  daysAgo: string // '{count}d ago'
  months: string[] // 12 short month names, Jan → Dec (browser ICU is unreliable for uz)
  weekdaysShort: string[] // 7 short weekday names, indexed by Date.getDay() (0 = Sunday … 6 = Saturday)
}

// Participant announcements feed + detail.
type AnnouncementsStrings = {
  title: string
  empty: string
  emptyBody: string
  error: string
  retry: string
  pinned: string
  allCamp: string
  today: string
  yesterday: string
  edited: string
  back: string
}

// Participant full schedule screen — day strip + timeline.
type ScheduleStrings = {
  title: string
  today: string
  empty: string // no activities the whole camp
  emptyDay: string // no activities on the selected day
  error: string
  back: string
}

// Organizer back-office app — its own bottom-nav/sidebar labels + the Camps
// dashboard (slice 1). Distinct from OrganizerStrings, which is the ONBOARDING
// flow. {tokens} are filled per-language so grammar can place them freely.
type OrgStrings = {
  nav: { main: string; chat: string; profile: string }
  camps: {
    welcome: string // 'Welcome back, {name}'
    yourCamps: string
    statParticipants: string
    statGroups: string
    statOnSite: string
    statWeather: string
    notifications: string // aria-label + notifications screen title
    notificationsSubtitle: string // 'Sent to participants'
    // Live help banner (SOS)
    needsHelp: string // '{name} needs help'
    reasonMedical: string
    reasonLost: string
    reasonUnsafe: string
    reasonOther: string
    tapToLocate: string
    view: string
    // Quick links
    liveMap: string
    liveMapMeta: string // '{onsite} on-site · {alerts} alert'
    leaderboard: string
    leaderboardMeta: string // '{group} lead'
    // Standings widget
    topGroups: string
    viewAll: string
    // Camp cards
    statusActive: string
    statusUpcoming: string
    statusDraft: string
    statusArchived: string
    participantsUnit: string
    groupsUnit: string
    checkIn: string
    dayProgress: string // 'Day {current} of {total}'
    // States
    error: string
    retry: string
    empty: string
    emptyBody: string
    // Generic placeholder for not-yet-built org screens
    soon: string
    soonBody: string
  }
  // Camp Detail (slice 2): header stats, tab bar, Participants + Groups tabs.
  detail: {
    back: string
    tabParticipants: string
    tabGroups: string
    tabMap: string
    tabLeaderboard: string
    tabSchedule: string
    tabAnnouncements: string
    statParticipants: string
    statGroups: string
    statCheckedIn: string
    hubParticipantsStat: string // '{count} total'
    hubGroupsStat: string // '{count} groups'
    hubScheduleStat: string // 'Day {current}/{total}'
    hubScheduleStatEmpty: string
    hubAnnouncementsStat: string
    hubStatEmpty: string
    searchParticipants: string // 'Search {count} participants…'
    statusIn: string
    statusOut: string
    seeOnMap: string
    unassigned: string
    members: string // '{count} members'
    noMembers: string
    leader: string
    noResults: string // no search matches
    loadError: string
    // Leaderboard tab
    lbTitle: string
    lbSubtitle: string
    // Schedule tab
    addActivity: string
    newActivity: string
    activityName: string
    activityNamePlaceholder: string
    dateLabel: string
    startLabel: string
    endLabel: string
    locationLabel: string
    locationPlaceholder: string
    audience: string
    activityRequired: string
    schedEmpty: string
    applyPoints: string // 'Apply {n}'
    noChange: string
    wheelAria: string
    // Announcements tab
    newAnnouncement: string
    annTitleOptional: string
    annMessage: string
    annMessagePlaceholder: string
    pinToTop: string
    annEmpty: string
    // Shared form actions
    create: string
    cancel: string
  }
  // Organizer chat (slice 4): two channels + coordinator lock.
  chat: {
    channelOrganizers: string
    channelGroup: string
    online: string // '{count} online'
    lockedTitle: string
    lockedBody: string
    membersSheetTitle: string
  }
  // Organizer profile (slice 5) — reuses t.profile.{email,phone,notSet,language,logout}.
  profile: {
    title: string
    roleOrganizer: string
    roleManager: string
    statCamps: string
    helpRequests: string
    resolve: string
    allSafe: string
    organization: string
    team: string
    campSettings: string
  }
  // Team & co-organizers (slice 5).
  team: {
    title: string
    people: string // '{count} people'
    invite: string
    inviteBody: string
    roleLabel: string
    sendInvite: string
    inviteHint: string
    members: string
    you: string
    pending: string
    invitedAgo: string // 'invited {time}'
    phonePlaceholder: string
    rolesNote: string
  }
}

// Organization admin surface (/admin): login, nav, organizer management, create form.
type AdminStrings = {
  login: {
    title: string
    subtitle: string
    username: string
    password: string
    cta: string
    error: string
  }
  nav: {
    dashboard: string
    camps: string
    managers: string
    profile: string
    logout: string
  }
  // Managers (PM) — the org's people list. Organizers belong to a manager's camp
  // (invited via the camp wizard), so the org has no standalone organizers list.
  managers: {
    title: string
    subtitle: string // '{count} managers'
    new: string
    empty: string
    emptyHint: string
    loadError: string
    active: string
    deactivated: string
    deactivate: string
    reactivate: string
    confirmDeactivate: string
    pending: string
    resend: string
    revoke: string
    confirmRevoke: string
    delete: string
    confirmDelete: string
  }
  create: {
    title: string
    name: string
    surname: string
    phone: string
    password: string
    email: string
    sent: string // 'Invitation sent to {email}'
    copyLink: string
    copied: string
    submit: string
    duplicate: string
    duplicatePhone: string
    success: string
  }
  // Manager invite sheet — mirror of `create` with manager-flavored labels.
  createManager: {
    title: string
    submit: string
    success: string
  }
  dashboard: {
    title: string
    subtitle: string
    stats: {
      organizers: string
      active: string
      deactivated: string
      pending: string
      camps: string
    }
    quickActions: { addOrganizer: string; viewCamps: string }
    recentOrganizers: string
    loadError: string
  }
  camps: {
    title: string
    subtitle: string // '{count} camps'
    by: string // 'by {name}'
    statusActive: string
    statusUpcoming: string
    statusDraft: string
    statusArchived: string
    empty: string
    emptyHint: string
    loadError: string
    participants: string // '{count} participants'
    total: string
    active: string
    create: string
    createHint: string
  }
}

// Organization profile screen (/admin/profile) — identity card + settings list.
type OrgProfileStrings = {
  title: string
  role: string
  email: string
  phone: string
  language: string
  logout: string
  statCamps: string
  statParticipants: string
  statOrganizers: string
}

// Invite landing (organizer onboarding, step 1): a one-tap confirmation for
// whoever opens the invite link an organization sent them. The phone was set by
// the org at invite time, so there's nothing to type here — just accept.
type InviteStrings = {
  greeting: string // 'Welcome, {name}'
  subtitle: string
  submit: string
  invalid: string
  expired: string
}

// Organizer dashboard → new camp form.
type CreateCampStrings = {
  title: string
  name: string
  location: string
  starts: string
  ends: string
  capacity: string
  submit: string
  dateError: string
  required: string
  success: string
}

// Organizer dashboard → add participant by phone.
type AddParticipantStrings = {
  title: string
  phone: string
  submit: string
  duplicate: string
  tooMany: string
  success: string
}

// Reusable camp-creation wizard (org + organizer surfaces).
type CampWizardStrings = {
  title: string
  stepInfo: string
  stepGroups: string
  stepOrganizers: string
  stepParticipants: string
  stepReview: string
  next: string
  back: string
  finish: string
  groupsTitle: string
  groupsHint: string
  groupNamePlaceholder: string
  addGroup: string
  groupCount: string // '{count} groups created'
  remove: string
  organizersTitle: string
  organizersHint: string
  participantsTitle: string
  participantsHint: string
  pending: string
  reviewTitle: string
  reviewHint: string
  statGroups: string
  statOrganizers: string
  statParticipants: string
  orgName: string
  orgSurname: string
  orgEmail: string
  stepProgress: string // 'Step {n} of {total}'
  namePlaceholder: string
  capacityPlaceholder: string
  locationPlaceholder: string
  bannerCta: string
  bannerHint: string
  bannerChange: string
  bannerRemove: string
  commitError: string
  retry: string
  creating: string
}

export const translations: Record<
  Lang,
  {
    login: LoginStrings
    invite: InviteStrings
    congrats: CongratsStrings
    notfound: NotFoundStrings
    signup: SignUpStrings
    organizer: OrganizerStrings
    org: OrgStrings
    admin: AdminStrings
    nav: NavStrings
    home: HomeStrings
    sos: SosStrings
    profile: ProfileStrings
    chat: ChatStrings
    ranks: RanksStrings
    common: CommonStrings
    time: TimeStrings
    announcements: AnnouncementsStrings
    schedule: ScheduleStrings
    pwa: PwaStrings
    createCamp: CreateCampStrings
    addParticipant: AddParticipantStrings
    campWizard: CampWizardStrings
    orgProfile: OrgProfileStrings
  }
> = {
  uz: {
    admin: {
      login: {
        title: 'Tashkilot uchun kirish',
        subtitle: 'Administrator maʼlumotlarini kiriting',
        username: 'Foydalanuvchi nomi',
        password: 'Parol',
        cta: 'Kirish',
        error: 'Notoʻgʻri maʼlumotlar',
      },
      nav: {
        dashboard: 'Boshqaruv',
        camps: 'Oromgohlar',
        managers: 'Menejerlar',
        profile: 'Profil',
        logout: 'Chiqish',
      },
      managers: {
        title: 'Menejerlar',
        subtitle: '{count} ta menejer',
        new: 'Yangi menejer',
        empty: 'Hozircha menejerlar yoʻq',
        emptyHint: 'Oromgoh yaratib boshqarish uchun menejer taklif qiling.',
        loadError: 'Menejerlarni yuklab boʻlmadi',
        active: 'Faol',
        deactivated: 'Faolsizlantirilgan',
        deactivate: 'Faolsizlantirish',
        reactivate: 'Qayta faollashtirish',
        confirmDeactivate: 'Bu menejer faolsizlantirilsinmi? U darhol tizimdan chiqariladi.',
        pending: 'Kutilmoqda',
        resend: 'Qayta yuborish',
        revoke: 'Bekor qilish',
        confirmRevoke: 'Bu taklifnoma bekor qilinsinmi?',
        delete: "O'chirish",
        confirmDelete: "{name} o'chirilsinmi? Buni ortga qaytarib bo'lmaydi.",
      },
      create: {
        title: 'Yangi tashkilotchi',
        name: 'Ism',
        surname: 'Familiya',
        phone: 'Telefon',
        password: 'Parol',
        email: 'Email',
        sent: '{email} manziliga taklifnoma yuborildi',
        copyLink: 'Havoladan nusxa olish',
        copied: 'Nusxa olindi!',
        submit: 'Tashkilotchi yaratish',
        duplicate: 'Bu email allaqachon roʻyxatdan oʻtgan',
        duplicatePhone: 'Bu telefon raqami allaqachon roʻyxatdan oʻtgan',
        success: 'Tashkilotchi yaratildi',
      },
      createManager: {
        title: 'Yangi menejer',
        submit: 'Menejer yaratish',
        success: 'Menejer yaratildi',
      },
      dashboard: {
        title: 'Boshqaruv paneli',
        subtitle: 'Tashkilot umumiy koʻrinishi',
        stats: {
          organizers: 'Tashkilotchilar',
          active: 'Faol',
          deactivated: 'Faolsiz',
          pending: 'Kutilmoqda',
          camps: 'Oromgohlar',
        },
        quickActions: {
          addOrganizer: 'Tashkilotchi qoʻshish',
          viewCamps: 'Oromgohlarni koʻrish',
        },
        recentOrganizers: 'Soʻnggi tashkilotchilar',
        loadError: 'Maʼlumotlarni yuklab boʻlmadi',
      },
      camps: {
        title: 'Oromgohlar',
        subtitle: '{count} ta oromgoh',
        by: '{name} tomonidan',
        statusActive: 'Faol',
        statusUpcoming: 'Tez orada',
        statusDraft: 'Qoralama',
        statusArchived: 'Arxivlangan',
        empty: 'Hozircha oromgohlar yoʻq',
        emptyHint: 'Tashkilotchilar oromgoh yaratganda, ular shu yerda koʻrinadi.',
        loadError: 'Oromgohlarni yuklab boʻlmadi',
        participants: '{count} ishtirokchi',
        total: 'Jami lager',
        active: 'Faol',
        create: 'Yangi lager yaratish',
        createHint: 'Maʼlumot · tashkilotchilar · ishtirokchilar',
      },
    },
    login: {
      eyebrow: 'Ishtirokchilar uchun',
      welcome: 'Xush kelibsiz!',
      subtitle: 'Oromgohga kirish uchun telefon raqamingizni kiriting.',
      phoneLabel: 'Telefon raqam',
      phoneError: 'Toʻliq 9 xonali raqam kiriting.',
      cta: 'Kirish',
      switchLanguage: 'Tilni tanlash',
    },
    congrats: {
      title: 'Tabriklaymiz',
      message: 'Oromgohga qabul qilinganingiz bilan tabriklaymiz!',
      continue: 'Davom etish',
    },
    notfound: {
      title: 'Maʼlumot topilmadi',
      message: 'Afsuski, bunday ishtirokchi mavjud emas',
      back: 'Orqaga',
    },
    signup: {
      eyebrow: 'Lagerga roʻyxatdan oʻtish',
      title: 'Sarguzashtga tayyormisiz?',
      subtitle:
        'Bir necha maʼlumot — va oromgoh nishoningiz tayyor. Tashkilotchilar va sheriklaringiz sizni shu orqali topadi.',
      badgeEmpty: 'Rasm yuklang',
      photoUploaded: 'Rasm yuklandi',
      uploadPhoto: 'Rasm yuklash',
      nameLabel: 'Ismingiz',
      firstName: 'Ism',
      surname: 'Familiya',
      cityLabel: 'Shahringiz',
      cityPlaceholder: 'Oʻzbekistonning barcha shaharlari boʻyicha qidiring',
      citySearchPlaceholder: 'Shahar nomini yozing…',
      cityCount: '{count} ta shahar',
      regionSuffix: '{region} viloyati',
      noResults: '"{query}" boʻyicha shahar topilmadi',
      ageLabel: 'Necha yoshdasiz',
      ageUnit: 'yoshda',
      bracketJunior: 'Kichik lagerchi',
      bracketTeen: 'Oʻsmir lagerchi',
      bracketSenior: 'Katta lagerchi',
      enterValid: 'Lagerga kirish',
      enterInvalid: 'Profilni toʻldiring',
      consentBefore: 'Kirish orqali siz lagerning',
      consentLink: 'xatti-harakatlar qoidalari',
      consentAfter: 'va xavfsizlik qoidalariga rozilik bildirasiz.',
      badgeCreated: 'Profil yaratildi',
      welcome: 'Oromgohga xush kelibsiz, {name}!',
      enterCamp: 'Oromgohga kirish',
      editDetails: 'Maʼlumotlarni tahrirlash',
    },
    organizer: {
      congratsMessage: 'Jamoaga xush kelibsiz — siz oromgoh tashkilotchisisiz!',
      eyebrow: 'Tashkilotchi profili',
      title: 'Profilingizni sozlaymiz',
      subtitle:
        'Bir necha maʼlumot — jamoa va ishtirokchilar oromgohni kim boshqarayotganini bilishi uchun.',
      roleLabel: 'Rolingiz qanday?',
      roles: {
        coordinator: 'Koordinator',
        admin: 'Administrator',
        media: 'Media',
        brandFace: 'Brend yuzi',
        eventManager: 'Tadbir menejeri',
        photographer: 'Fotograf',
      },
      groupLabel: 'Guruhingiz',
      groupPlaceholder: 'Guruhni tanlang',
      enterValid: 'Profil yaratish',
      enterInvalid: 'Profilni toʻldiring',
      badgeCreated: 'Profil yaratildi',
      welcome: 'Hammasi tayyor, {name}!',
      enterDashboard: 'Boshqaruv paneliga',
      editDetails: 'Maʼlumotlarni tahrirlash',
    },
    org: {
      nav: { main: 'Asosiy', chat: 'Chat', profile: 'Profil' },
      camps: {
        welcome: 'Xush kelibsiz, {name}',
        yourCamps: 'Lagerlaringiz',
        statParticipants: 'Ishtirokchi',
        statGroups: 'Guruh',
        statOnSite: 'Hozir shu yerda',
        statWeather: 'Harorat',
        notifications: 'Bildirishnomalar',
        notificationsSubtitle: 'Ishtirokchilarga yuborilgan',
        needsHelp: '{name} yordamga muhtoj',
        reasonMedical: 'Tibbiy',
        reasonLost: 'Yoʻqolgan',
        reasonUnsafe: 'Xavf',
        reasonOther: 'Boshqa',
        tapToLocate: 'joylashuvni koʻrish uchun bosing',
        view: 'Koʻrish',
        liveMap: 'Jonli xarita',
        liveMapMeta: '{onsite} hududda · {alerts} signal',
        leaderboard: 'Reyting',
        leaderboardMeta: '{group} yetakchi',
        topGroups: 'Eng yaxshi guruhlar',
        viewAll: 'Barchasi',
        statusActive: 'Faol',
        statusUpcoming: 'Kutilmoqda',
        statusDraft: 'Qoralama',
        statusArchived: 'Arxiv',
        participantsUnit: 'ishtirokchi',
        groupsUnit: 'guruh',
        checkIn: 'Roʻyxat',
        dayProgress: '{total} kundan {current}-kun',
        error: 'Lagerlarni yuklab boʻlmadi',
        retry: 'Qayta urinish',
        empty: 'Hali lager yoʻq',
        emptyBody: 'Birinchi lageringizni yarating.',
        soon: 'Tez orada',
        soonBody: 'Bu boʻlim tayyorlanmoqda.',
      },
      detail: {
        back: 'Orqaga',
        tabParticipants: 'Ishtirokchilar',
        tabGroups: 'Guruhlar',
        tabMap: 'Xarita',
        tabLeaderboard: 'Reyting',
        tabSchedule: 'Jadval',
        tabAnnouncements: 'Eʼlonlar',
        statParticipants: 'Ishtirokchi',
        statGroups: 'Guruh',
        statCheckedIn: 'Roʻyxatda',
        hubParticipantsStat: 'Jami {count} ta',
        hubGroupsStat: '{count} guruh',
        hubScheduleStat: '{current}/{total}-kun',
        hubScheduleStatEmpty: 'Jadval',
        hubAnnouncementsStat: 'Eʼlonlar',
        hubStatEmpty: '—',
        searchParticipants: '{count} ishtirokchini qidirish…',
        statusIn: 'Hududda',
        statusOut: 'Tashqarida',
        seeOnMap: 'Xaritada koʻrish',
        unassigned: 'Guruhsiz',
        members: '{count} aʼzo',
        noMembers: 'Hali aʼzo yoʻq',
        leader: 'Rahbar',
        noResults: 'Hech narsa topilmadi',
        loadError: 'Maʼlumotni yuklab boʻlmadi',
        lbTitle: 'Guruhlar reytingi',
        lbSubtitle: 'Ball berish yoki tuzatish uchun +/− bosing',
        addActivity: 'Mashgʻulot qoʻshish',
        newActivity: 'Yangi mashgʻulot',
        activityName: 'Mashgʻulot nomi',
        activityNamePlaceholder: 'Ertalabki yugurish',
        dateLabel: 'Sana',
        startLabel: 'Boshlanish',
        endLabel: 'Tugash',
        locationLabel: 'Manzil',
        locationPlaceholder: 'Asosiy maydon',
        audience: 'Kim uchun?',
        activityRequired: 'Iltimos, majburiy maydonlarni toʻldiring',
        schedEmpty: 'Hali mashgʻulot yoʻq',
        applyPoints: '{n} qoʻllash',
        noChange: 'Oʻzgarishsiz',
        wheelAria: 'Ballar gʻildiragi',
        newAnnouncement: 'Yangi eʼlon',
        annTitleOptional: 'Sarlavha (ixtiyoriy)',
        annMessage: 'Xabar',
        annMessagePlaceholder: 'Eʼloningizni yozing…',
        pinToTop: 'Yuqoriga qadash',
        annEmpty: 'Hali eʼlon yoʻq',
        create: 'Yaratish',
        cancel: 'Bekor qilish',
      },
      chat: {
        channelOrganizers: 'Tashkilotchilar',
        channelGroup: 'Mening guruhim',
        online: '{count} onlayn',
        lockedTitle: 'Faqat koordinatorlar uchun',
        lockedBody:
          'Bu boʻlimni faqat guruh koordinatorlari koʻra oladi. Siz bu guruhning koordinatori emassiz.',
        membersSheetTitle: 'Aʼzolar',
      },
      profile: {
        title: 'Profil',
        roleOrganizer: 'Tashkilotchi',
        roleManager: 'Menejer',
        statCamps: 'Lager',
        helpRequests: 'Yordam soʻrovlari',
        resolve: 'Hal qilindi',
        allSafe: 'Faol soʻrov yoʻq — barcha ishtirokchilar xavfsiz.',
        organization: 'Tashkilot',
        team: 'Jamoa va hamkorlar',
        campSettings: 'Lager sozlamalari',
      },
      team: {
        title: 'Jamoa va hamkorlar',
        people: '{count} kishi',
        invite: 'Hamkor tashkilotchi taklif qilish',
        inviteBody: 'Telefon raqami orqali qoʻshing',
        roleLabel: 'Rol',
        sendInvite: 'Taklif yuborish',
        inviteHint: 'Ular shu raqam bilan kirib qoʻshiladi — email shart emas.',
        members: 'Aʼzolar',
        you: 'Siz',
        pending: 'Kutilayotgan takliflar',
        invitedAgo: '{time} taklif qilindi',
        phonePlaceholder: '90 123 45 67',
        rolesNote:
          'Har bir hamkorga roli boʻyicha huquqlar beriladi. Tashkilotchilar yangi tashkilot yoki tashkilotchi yarata olmaydi.',
      },
    },
    nav: {
      home: 'Asosiy',
      map: 'Xarita',
      ranks: 'Reyting',
      chat: 'Chat',
      profile: 'Profil',
    },
    home: {
      liveNow: 'Jonli efir',
      dayProgress: '{total} kundan {current}-kun',
      upNext: 'Keyingisi',
      upNextWith: '{group} bilan',
      todaySchedule: 'Bugungi jadval',
      seeAll: 'Barchasi',
      statusDone: 'Tugadi',
      statusNow: 'Hozir',
      latestAnnouncement: 'Soʻnggi eʼlon',
      all: 'Hammasi',
      myGroup: 'Mening guruhim',
      membersCount: '{count} ta aʼzo',
    },
    sos: {
      title: 'Favqulodda yordam',
      subtitle: 'Tashkilotchi va guruh sardori darhol xabardor qilinadi.',
      whatsHappening: 'Nima boʻlyapti?',
      reasons: {
        medical: 'Tibbiy yordam',
        lost: 'Adashib qoldim',
        unsafe: 'Xavf his qilyapman',
        other: 'Boshqa sabab',
      },
      reasonDefault: 'Favqulodda',
      locationSuffix: 'joylashuv jonli ulashilmoqda',
      alertsBefore: 'Xabar beriladi:',
      alertsLeader: 'sardor',
      holdToSend: 'SOS yuborish uchun bosib turing',
      keepHolding: 'Bosib turing…',
      holdHint: 'Bir lahza bosib turing — bu tasodifiy signalning oldini oladi.',
      sendingTitle: 'Tashkilotchilar xabardor qilinmoqda…',
      sendingSub: '{reason} yuborilmoqda · joylashuvingiz ulashilmoqda',
      helpComing: 'Yordam kelmoqda',
      helpOnWay: 'Yordam yoʻlda',
      stayPut: 'Joyingizda qoling',
      activeSub: '{reason} yuborilmoqda · {location}',
      responderRole: 'Tashkilotchi · siz tomon yoʻlda',
      eta: 'Taxminan',
      teamNotified: '{team} xabardor qilindi',
      leaderAlerted: 'Guruh sardori {leader} xabardor qilindi',
      sharingLocation: 'Joylashuvingiz ulashilmoqda',
      now: 'hozir',
      callOrganizer: 'Tashkilotchiga qoʻngʻiroq',
      imSafe: 'Endi xavfsizman',
    },
    profile: {
      title: 'Profil',
      roles: { participant: 'Ishtirokchi' },
      groupRank: 'Guruh reytingi',
      activities: 'Faoliyatlar',
      points: 'Ballar',
      needHelp: 'Yordam kerakmi?',
      needHelpBody: 'Tashkilotchilar jamoasini joylashuvingiz bilan darhol ogohlantiring.',
      sendHelp: 'Yordam soʻrash',
      organizerNotified: 'Tashkilotchi xabardor qilindi',
      organizerNotifiedBody: 'Yordam joylashuvingiz tomon yoʻlda. Joyingizda qoling.',
      cancelAlert: 'Yaxshiman — signalni bekor qilish',
      email: 'Email',
      addEmail: 'Email qoʻshing',
      phone: 'Telefon',
      city: 'Shahar',
      notSet: 'Kiritilmagan',
      socialLinks: 'Ijtimoiy tarmoqlar',
      edit: 'Tahrirlash',
      save: 'Saqlash',
      socialHint: 'Ochish uchun belgini bosing — boshqa lagerchilar sizni shu orqali topadi.',
      saveLinks: 'Havolalarni saqlash',
      tgPlaceholder: 'Telegram (t.me/…)',
      igPlaceholder: 'Instagram (@foydalanuvchi)',
      fbPlaceholder: 'Facebook havolasi',
      liPlaceholder: 'LinkedIn havolasi',
      notifications: 'Bildirishnomalar',
      notificationsBlocked: 'Bildirishnomalarni brauzer sozlamalaridan yoqing.',
      notificationsInstall: 'Ogohlantirishlar uchun Camply’ni bosh ekranga oʻrnating.',
      language: 'Til',
      chooseLanguage: 'Oʻzingizga qulay tilni tanlang',
      locationSharing: 'Joylashuvni ulashish',
      appearance: 'Koʻrinish',
      logout: 'Chiqish',
    },
    chat: {
      membersOnline: '{members} aʼzo · {online} onlayn',
      messagePlaceholder: '{group} guruhiga yozing…',
      changePhoto: 'Guruh rasmini oʻzgartirish',
      attach: 'Biriktirish',
      photo: 'Rasm / Galereya',
      file: 'Fayl biriktirish',
      camera: 'Kamera',
      send: 'Yuborish',
      viewMembers: 'Aʼzolarni koʻrish',
      call: 'Qoʻngʻiroq qilish',
      reply: 'Javob berish',
      emptyThread: 'Hali xabar yoʻq. Birinchi boʻlib salom bering!',
      loading: 'Yuklanmoqda…',
      loadError: 'Chatni yuklab boʻlmadi',
      leaderRole: 'Guruh sardori',
      memberRole: 'Ishtirokchi',
      you: 'Siz',
      leaderBadge: 'Sardor',
      ageYears: '{age} yosh',
      socials: 'Ijtimoiy tarmoqlar',
      noSocials: 'Havolalar yoʻq',
    },
    ranks: {
      title: 'Reyting jadvali',
      yourStanding: 'Sizning oʻrningiz',
      you: 'SIZ',
      behindLeader: '{name}dan {delta} ball orqada',
      leadingBy: 'Yetakchi · +{delta} ball',
      points: 'ball',
      howPointsEarned: 'Ballar qanday yigʻiladi',
      activities: 'Faoliyatlar',
      attendance: 'Davomat',
      challenges: 'Sinovlar',
      loadError: 'Reytingni yuklab boʻlmadi.',
      empty: 'Hali reyting yoʻq',
      emptyBody: 'Ballar berilgach, reyting shu yerda paydo boʻladi.',
    },
    common: {
      comingSoon: 'Tez kunda',
      comingSoonBody: 'Oromgohning bu qismi tayyorlanmoqda. Tez orada qayting!',
    },
    time: {
      justNow: 'hozirgina',
      minAgo: '{count} daq oldin',
      hoursAgo: '{count} soat oldin',
      daysAgo: '{count} kun oldin',
      months: [
        'yan',
        'fev',
        'mar',
        'apr',
        'may',
        'iyun',
        'iyul',
        'avg',
        'sen',
        'okt',
        'noy',
        'dek',
      ],
      weekdaysShort: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
    },
    announcements: {
      title: 'Eʼlonlar',
      empty: 'Hozircha eʼlonlar yoʻq',
      emptyBody: 'Tashkilotchilar eʼlon joʻnatganda, u shu yerda koʻrinadi.',
      error: 'Eʼlonlarni yuklab boʻlmadi',
      retry: 'Qayta urinish',
      pinned: 'Qadalgan',
      allCamp: 'Butun lager',
      today: 'Bugun',
      yesterday: 'Kecha',
      edited: 'tahrirlangan',
      back: 'Orqaga',
    },
    schedule: {
      title: 'Jadval',
      today: 'Bugun',
      empty: 'Hali jadval yoʻq',
      emptyDay: 'Bu kunga faoliyat yoʻq',
      error: 'Jadvalni yuklab boʻlmadi',
      back: 'Orqaga',
    },
    pwa: {
      updateReady: 'Yangi versiya mavjud.',
      reload: 'Yangilash',
      offlineReady: 'Camply oflayn ishlashga tayyor.',
      dismiss: 'Yopish',
    },
    invite: {
      greeting: 'Xush kelibsiz, {name}',
      subtitle: 'Sizni tashkilotchi sifatida qoʻshdik.',
      submit: 'Qabul qilish va davom etish',
      invalid: 'Taklif havolasi yaroqsiz.',
      expired:
        'Taklif havolasining muddati tugagan. Tashkilotingizdan yangisini yuborishni soʻrang.',
    },
    createCamp: {
      title: 'Yangi oromgoh',
      name: 'Oromgoh nomi',
      location: 'Manzil',
      starts: 'Boshlanish sanasi',
      ends: 'Tugash sanasi',
      capacity: 'Sigʻim (ixtiyoriy)',
      submit: 'Oromgoh yaratish',
      dateError: 'Tugash sanasi boshlanish sanasidan keyin boʻlishi kerak.',
      required: 'Iltimos, barcha majburiy maydonlarni toʻldiring',
      success: 'Oromgoh yaratildi',
    },
    addParticipant: {
      title: 'Ishtirokchi qoʻshish',
      phone: 'Telefon raqam',
      submit: 'Ishtirokchi qoʻshish',
      duplicate: 'Bu telefon raqami bu oromgohda allaqachon mavjud.',
      tooMany: 'Bu telefon raqami allaqachon 2 ta oromgohda ishtirok etmoqda.',
      success: 'Ishtirokchi qoʻshildi',
    },
    campWizard: {
      title: 'Yangi lager',
      stepInfo: 'Maʼlumot',
      stepGroups: 'Guruhlar',
      stepOrganizers: 'Tashkilotchi',
      stepParticipants: 'Ishtirokchi',
      stepReview: 'Koʻrib chiqish',
      next: 'Davom etish',
      back: 'Orqaga',
      finish: 'Lagerni yaratish',
      groupsTitle: 'Guruhlarni yaratish',
      groupsHint: 'Avval guruhlarni tuzing va nomlang. Keyin ularga odam qoʻshasiz.',
      groupNamePlaceholder: 'Yangi guruh nomi',
      addGroup: 'Qoʻshish',
      groupCount: '{count} ta guruh tuzildi',
      remove: 'Oʻchirish',
      organizersTitle: 'Tashkilotchilarni qoʻshish',
      organizersHint:
        'Ism, email va telefon qoʻshing. Har bir tashkilotchiga roʻyxatdan oʻtish uchun email havola yuboriladi.',
      participantsTitle: 'Ishtirokchilarni qoʻshish',
      participantsHint:
        'Guruhni tanlang, soʻng telefon raqamlarini qoʻshing. Har bir ishtirokchi oʻz raqami bilan kiradi.',
      pending: 'Roʻyxatdan oʻtishni kutmoqda',
      reviewTitle: 'Koʻrib chiqing va tasdiqlang',
      reviewHint: 'Hammasi toʻgʻrimi? Tayyor boʻlsangiz, lagerni yarating.',
      statGroups: 'Guruh',
      statOrganizers: 'Tashkilotchi',
      statParticipants: 'Ishtirokchi',
      orgName: 'Ism',
      orgSurname: 'Familiya',
      orgEmail: 'Email',
      stepProgress: 'Qadam {n} / {total}',
      namePlaceholder: 'Summer camp 2026',
      capacityPlaceholder: '40',
      locationPlaceholder: 'Manzilni tanlang',
      bannerCta: 'Muqova rasmini qoʻshing',
      bannerHint: 'PNG yoki JPG · lager sahifasida koʻrinadi',
      bannerChange: 'Oʻzgartirish',
      bannerRemove: 'Olib tashlash',
      commitError: 'Lagerni yaratib boʻlmadi. Qayta urinib koʻring.',
      retry: 'Qayta urinish',
      creating: 'Yaratilmoqda…',
    },
    orgProfile: {
      title: 'Tashkilot profili',
      role: 'Tashkilot',
      email: 'Email',
      phone: 'Telefon',
      language: 'Til',
      logout: 'Chiqish',
      statCamps: 'Lager',
      statParticipants: 'Ishtirokchi',
      statOrganizers: 'Tashkilotchi',
    },
  },
  ru: {
    admin: {
      login: {
        title: 'Вход для организации',
        subtitle: 'Введите данные администратора',
        username: 'Имя пользователя',
        password: 'Пароль',
        cta: 'Войти',
        error: 'Неверные данные',
      },
      nav: {
        dashboard: 'Панель',
        camps: 'Лагеря',
        managers: 'Менеджеры',
        profile: 'Профиль',
        logout: 'Выйти',
      },
      managers: {
        title: 'Менеджеры',
        subtitle: '{count} менеджеров',
        new: 'Новый менеджер',
        empty: 'Менеджеров пока нет',
        emptyHint: 'Пригласите менеджера, чтобы создать и вести лагерь.',
        loadError: 'Не удалось загрузить менеджеров',
        active: 'Активен',
        deactivated: 'Деактивирован',
        deactivate: 'Деактивировать',
        reactivate: 'Активировать',
        confirmDeactivate: 'Деактивировать этого менеджера? Он будет немедленно отключён.',
        pending: 'Ожидает',
        resend: 'Отправить снова',
        revoke: 'Отменить',
        confirmRevoke: 'Отменить это приглашение?',
        delete: 'Удалить',
        confirmDelete: 'Удалить {name}? Это действие необратимо.',
      },
      create: {
        title: 'Новый организатор',
        name: 'Имя',
        surname: 'Фамилия',
        phone: 'Телефон',
        password: 'Пароль',
        email: 'Email',
        sent: 'Приглашение отправлено на {email}',
        copyLink: 'Скопировать ссылку',
        copied: 'Скопировано!',
        submit: 'Создать организатора',
        duplicate: 'Этот email уже зарегистрирован',
        duplicatePhone: 'Этот номер телефона уже зарегистрирован',
        success: 'Организатор создан',
      },
      createManager: {
        title: 'Новый менеджер',
        submit: 'Создать менеджера',
        success: 'Менеджер создан',
      },
      dashboard: {
        title: 'Панель управления',
        subtitle: 'Обзор организации',
        stats: {
          organizers: 'Организаторы',
          active: 'Активные',
          deactivated: 'Неактивные',
          pending: 'Ожидают',
          camps: 'Лагеря',
        },
        quickActions: {
          addOrganizer: 'Добавить организатора',
          viewCamps: 'Посмотреть лагеря',
        },
        recentOrganizers: 'Недавние организаторы',
        loadError: 'Не удалось загрузить данные',
      },
      camps: {
        title: 'Лагеря',
        subtitle: '{count} лагерей',
        by: 'Организатор: {name}',
        statusActive: 'Активный',
        statusUpcoming: 'Скоро',
        statusDraft: 'Черновик',
        statusArchived: 'Архив',
        empty: 'Пока нет лагерей',
        emptyHint: 'Когда организаторы создадут лагеря, они появятся здесь.',
        loadError: 'Не удалось загрузить лагеря',
        participants: '{count} участников',
        total: 'Всего лагерей',
        active: 'Активные',
        create: 'Создать лагерь',
        createHint: 'Данные · организаторы · участники',
      },
    },
    login: {
      eyebrow: 'Для участников',
      welcome: 'Добро пожаловать!',
      subtitle: 'Введите номер телефона, чтобы войти в лагерь.',
      phoneLabel: 'Номер телефона',
      phoneError: 'Введите корректный 9-значный номер.',
      cta: 'Войти',
      switchLanguage: 'Выбрать язык',
    },
    congrats: {
      title: 'Поздравляем',
      message: 'Поздравляем с зачислением в лагерь!',
      continue: 'Продолжить',
    },
    notfound: {
      title: 'Ничего не найдено',
      message: 'К сожалению, такого участника нет',
      back: 'Назад',
    },
    signup: {
      eyebrow: 'Регистрация в лагерь',
      title: 'Готовы к приключению?',
      subtitle:
        'Пара деталей — и твой лагерный бейдж готов. Так тебя найдут вожатые и соседи по палатке.',
      badgeEmpty: 'Загрузите фото',
      photoUploaded: 'Фото загружено',
      uploadPhoto: 'Загрузить фото',
      nameLabel: 'Ваше имя',
      firstName: 'Имя',
      surname: 'Фамилия',
      cityLabel: 'Родной город',
      cityPlaceholder: 'Поиск по всем городам Узбекистана',
      citySearchPlaceholder: 'Введите город…',
      cityCount: '{count} городов',
      regionSuffix: 'регион {region}',
      noResults: 'Нет городов по запросу «{query}»',
      ageLabel: 'Сколько тебе лет',
      ageUnit: 'лет',
      bracketJunior: 'Младший турист',
      bracketTeen: 'Подросток',
      bracketSenior: 'Старший турист',
      enterValid: 'Войти в лагерь',
      enterInvalid: 'Заполните профиль',
      consentBefore: 'Входя, вы соглашаетесь с',
      consentLink: 'кодексом поведения',
      consentAfter: 'и правилами безопасности лагеря.',
      badgeCreated: 'Бейдж создан',
      welcome: 'Добро пожаловать в лагерь, {name}!',
      enterCamp: 'Войти в лагерь',
      editDetails: 'Изменить данные',
    },
    organizer: {
      congratsMessage: 'Добро пожаловать в команду лагеря!',
      eyebrow: 'Профиль организатора',
      title: 'Настроим ваш профиль',
      subtitle: 'Пара деталей, чтобы команда и участники знали, кто ведёт лагерь.',
      roleLabel: 'Какая у вас роль?',
      roles: {
        coordinator: 'Координатор',
        admin: 'Администратор',
        media: 'Медиа',
        brandFace: 'Лицо бренда',
        eventManager: 'Ивент-менеджер',
        photographer: 'Фотограф',
      },
      groupLabel: 'Ваша группа',
      groupPlaceholder: 'Выберите группу',
      enterValid: 'Создать профиль',
      enterInvalid: 'Заполните профиль',
      badgeCreated: 'Профиль создан',
      welcome: 'Всё готово, {name}!',
      enterDashboard: 'В панель управления',
      editDetails: 'Изменить данные',
    },
    org: {
      nav: { main: 'Главная', chat: 'Чат', profile: 'Профиль' },
      camps: {
        welcome: 'С возвращением, {name}',
        yourCamps: 'Ваши лагеря',
        statParticipants: 'Участников',
        statGroups: 'Групп',
        statOnSite: 'На месте',
        statWeather: 'Погода',
        notifications: 'Уведомления',
        notificationsSubtitle: 'Отправлено участникам',
        needsHelp: '{name} нужна помощь',
        reasonMedical: 'Медицина',
        reasonLost: 'Потерялся',
        reasonUnsafe: 'Опасность',
        reasonOther: 'Другое',
        tapToLocate: 'нажмите, чтобы найти',
        view: 'Открыть',
        liveMap: 'Живая карта',
        liveMapMeta: '{onsite} на месте · {alerts} сигнал',
        leaderboard: 'Рейтинг',
        leaderboardMeta: '{group} лидирует',
        topGroups: 'Лучшие группы',
        viewAll: 'Все',
        statusActive: 'Активный',
        statusUpcoming: 'Скоро',
        statusDraft: 'Черновик',
        statusArchived: 'Архив',
        participantsUnit: 'участников',
        groupsUnit: 'групп',
        checkIn: 'Отметка',
        dayProgress: 'День {current} из {total}',
        error: 'Не удалось загрузить лагеря',
        retry: 'Повторить',
        empty: 'Пока нет лагерей',
        emptyBody: 'Создайте свой первый лагерь.',
        soon: 'Скоро',
        soonBody: 'Этот раздел в разработке.',
      },
      detail: {
        back: 'Назад',
        tabParticipants: 'Участники',
        tabGroups: 'Группы',
        tabMap: 'Карта',
        tabLeaderboard: 'Рейтинг',
        tabSchedule: 'Расписание',
        tabAnnouncements: 'Объявления',
        statParticipants: 'Участников',
        statGroups: 'Групп',
        statCheckedIn: 'Отмечено',
        hubParticipantsStat: 'Всего {count}',
        hubGroupsStat: '{count} групп',
        hubScheduleStat: 'День {current}/{total}',
        hubScheduleStatEmpty: 'Расписание',
        hubAnnouncementsStat: 'Объявления',
        hubStatEmpty: '—',
        searchParticipants: 'Поиск среди {count} участников…',
        statusIn: 'На месте',
        statusOut: 'Снаружи',
        seeOnMap: 'Показать на карте',
        unassigned: 'Без группы',
        members: '{count} участн.',
        noMembers: 'Пока нет участников',
        leader: 'Лидер',
        noResults: 'Ничего не найдено',
        loadError: 'Не удалось загрузить данные',
        lbTitle: 'Рейтинг групп',
        lbSubtitle: 'Нажмите +/−, чтобы начислить или изменить баллы',
        addActivity: 'Добавить занятие',
        newActivity: 'Новое занятие',
        activityName: 'Название занятия',
        activityNamePlaceholder: 'Утренняя пробежка',
        dateLabel: 'Дата',
        startLabel: 'Начало',
        endLabel: 'Конец',
        locationLabel: 'Место',
        locationPlaceholder: 'Главное поле',
        audience: 'Для кого?',
        activityRequired: 'Пожалуйста, заполните обязательные поля',
        schedEmpty: 'Пока нет занятий',
        applyPoints: 'Применить {n}',
        noChange: 'Без изменений',
        wheelAria: 'Колесо баллов',
        newAnnouncement: 'Новое объявление',
        annTitleOptional: 'Заголовок (необязательно)',
        annMessage: 'Сообщение',
        annMessagePlaceholder: 'Напишите объявление…',
        pinToTop: 'Закрепить сверху',
        annEmpty: 'Пока нет объявлений',
        create: 'Создать',
        cancel: 'Отмена',
      },
      chat: {
        channelOrganizers: 'Организаторы',
        channelGroup: 'Моя группа',
        online: '{count} онлайн',
        lockedTitle: 'Только для координаторов',
        lockedBody: 'Этот канал видят только координаторы группы. Вы не координатор этой группы.',
        membersSheetTitle: 'Участники',
      },
      profile: {
        title: 'Профиль',
        roleOrganizer: 'Организатор',
        roleManager: 'Менеджер',
        statCamps: 'Лагеря',
        helpRequests: 'Запросы о помощи',
        resolve: 'Решено',
        allSafe: 'Нет активных запросов — все участники в безопасности.',
        organization: 'Организация',
        team: 'Команда и соорганизаторы',
        campSettings: 'Настройки лагеря',
      },
      team: {
        title: 'Команда и соорганизаторы',
        people: '{count} чел.',
        invite: 'Пригласить соорганизатора',
        inviteBody: 'Добавьте по номеру телефона',
        roleLabel: 'Роль',
        sendInvite: 'Отправить приглашение',
        inviteHint: 'Они войдут по этому номеру — email не нужен.',
        members: 'Участники',
        you: 'Вы',
        pending: 'Ожидающие приглашения',
        invitedAgo: 'приглашён {time}',
        phonePlaceholder: '90 123 45 67',
        rolesNote:
          'Каждому соорганизатору даются права по роли. Организаторы не могут создавать организации или других организаторов.',
      },
    },
    nav: {
      home: 'Главная',
      map: 'Карта',
      ranks: 'Рейтинг',
      chat: 'Чат',
      profile: 'Профиль',
    },
    home: {
      liveNow: 'В эфире',
      dayProgress: 'День {current} из {total}',
      upNext: 'Далее',
      upNextWith: 'с группой {group}',
      todaySchedule: 'Расписание на сегодня',
      seeAll: 'Всё',
      statusDone: 'Завершено',
      statusNow: 'Сейчас',
      latestAnnouncement: 'Последнее объявление',
      all: 'Все',
      myGroup: 'Моя группа',
      membersCount: '{count} участников',
    },
    sos: {
      title: 'Экстренная помощь',
      subtitle: 'Организатор и лидер группы будут оповещены мгновенно.',
      whatsHappening: 'Что случилось?',
      reasons: {
        medical: 'Медпомощь',
        lost: 'Я потерялся',
        unsafe: 'Мне небезопасно',
        other: 'Другое',
      },
      reasonDefault: 'Тревога',
      locationSuffix: 'геопозиция передаётся в реальном времени',
      alertsBefore: 'Оповещаем:',
      alertsLeader: 'лидер',
      holdToSend: 'Удерживайте, чтобы отправить SOS',
      keepHolding: 'Удерживайте…',
      holdHint: 'Удерживайте пару секунд — это защищает от случайных сигналов.',
      sendingTitle: 'Оповещаем команду организаторов…',
      sendingSub: 'Отправляем {reason} · передаём вашу геопозицию',
      helpComing: 'Помощь идёт',
      helpOnWay: 'Помощь в пути',
      stayPut: 'Оставайтесь на месте',
      activeSub: 'Отправлено {reason} · {location}',
      responderRole: 'Организатор · направляется к вам',
      eta: 'Прибытие',
      teamNotified: '{team} оповещена',
      leaderAlerted: 'Лидер группы {leader} оповещён',
      sharingLocation: 'Передаём вашу геопозицию',
      now: 'сейчас',
      callOrganizer: 'Позвонить организатору',
      imSafe: 'Я в безопасности',
    },
    profile: {
      title: 'Профиль',
      roles: { participant: 'Участник' },
      groupRank: 'Рейтинг группы',
      activities: 'Активности',
      points: 'Очки',
      needHelp: 'Нужна помощь?',
      needHelpBody: 'Мгновенно оповестите команду организаторов о вашем местоположении.',
      sendHelp: 'Запросить помощь',
      organizerNotified: 'Организатор оповещён',
      organizerNotifiedBody: 'Помощь уже в пути к вам. Оставайтесь на месте.',
      cancelAlert: 'Я в порядке — отменить',
      email: 'Email',
      addEmail: 'Добавьте email',
      phone: 'Телефон',
      city: 'Город',
      notSet: 'Не указано',
      socialLinks: 'Соцсети',
      edit: 'Изменить',
      save: 'Сохранить',
      socialHint: 'Нажмите на логотип, чтобы открыть — так вас найдут другие участники.',
      saveLinks: 'Сохранить ссылки',
      tgPlaceholder: 'Telegram (t.me/…)',
      igPlaceholder: 'Instagram (@имя)',
      fbPlaceholder: 'Ссылка Facebook',
      liPlaceholder: 'Ссылка LinkedIn',
      notifications: 'Уведомления',
      notificationsBlocked: 'Включите уведомления в настройках браузера.',
      notificationsInstall: 'Установите Camply на главный экран, чтобы получать уведомления.',
      language: 'Язык',
      chooseLanguage: 'Выберите предпочитаемый язык',
      locationSharing: 'Геолокация',
      appearance: 'Оформление',
      logout: 'Выйти',
    },
    chat: {
      membersOnline: '{members} участников · {online} онлайн',
      messagePlaceholder: 'Написать {group}…',
      changePhoto: 'Изменить фото группы',
      attach: 'Прикрепить',
      photo: 'Фото / Галерея',
      file: 'Прикрепить файл',
      camera: 'Камера',
      send: 'Отправить',
      viewMembers: 'Участники',
      call: 'Позвонить',
      reply: 'Ответить',
      emptyThread: 'Сообщений пока нет. Напишите первым!',
      loading: 'Загрузка…',
      loadError: 'Не удалось загрузить чат',
      leaderRole: 'Лидер группы',
      memberRole: 'Участник', // participant
      you: 'Вы',
      leaderBadge: 'Лидер',
      ageYears: '{age} лет',
      socials: 'Соцсети',
      noSocials: 'Нет ссылок',
    },
    ranks: {
      title: 'Таблица лидеров',
      yourStanding: 'Ваше место',
      you: 'ВЫ',
      behindLeader: 'На {delta} очк. позади {name}',
      leadingBy: 'Лидирует · +{delta} очк.',
      points: 'очк.',
      howPointsEarned: 'Как начисляются очки',
      activities: 'Активности',
      attendance: 'Посещаемость',
      challenges: 'Испытания',
      loadError: 'Не удалось загрузить рейтинг.',
      empty: 'Рейтинга пока нет',
      emptyBody: 'Рейтинг появится, как только начислят очки.',
    },
    common: {
      comingSoon: 'Скоро',
      comingSoonBody: 'Эта часть лагеря ещё в разработке. Загляните позже!',
    },
    time: {
      justNow: 'только что',
      minAgo: '{count} мин назад',
      hoursAgo: '{count} ч назад',
      daysAgo: '{count} дн назад',
      months: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
      weekdaysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    },
    announcements: {
      title: 'Объявления',
      empty: 'Объявлений пока нет',
      emptyBody: 'Когда организаторы опубликуют объявление, оно появится здесь.',
      error: 'Не удалось загрузить объявления',
      retry: 'Повторить',
      pinned: 'Закреплено',
      allCamp: 'Весь лагерь',
      today: 'Сегодня',
      yesterday: 'Вчера',
      edited: 'изменено',
      back: 'Назад',
    },
    schedule: {
      title: 'Расписание',
      today: 'Сегодня',
      empty: 'Расписания пока нет',
      emptyDay: 'В этот день активностей нет',
      error: 'Не удалось загрузить расписание',
      back: 'Назад',
    },
    pwa: {
      updateReady: 'Доступна новая версия.',
      reload: 'Обновить',
      offlineReady: 'Camply готов к работе офлайн.',
      dismiss: 'Закрыть',
    },
    invite: {
      greeting: 'Добро пожаловать, {name}',
      subtitle: 'Вас добавили как организатора.',
      submit: 'Принять и продолжить',
      invalid: 'Ссылка-приглашение недействительна.',
      expired: 'Срок действия ссылки-приглашения истёк. Попросите организацию отправить новую.',
    },
    createCamp: {
      title: 'Новый лагерь',
      name: 'Название лагеря',
      location: 'Место проведения',
      starts: 'Дата начала',
      ends: 'Дата окончания',
      capacity: 'Вместимость (необязательно)',
      submit: 'Создать лагерь',
      dateError: 'Дата окончания должна быть позже даты начала.',
      required: 'Пожалуйста, заполните все обязательные поля',
      success: 'Лагерь создан',
    },
    addParticipant: {
      title: 'Добавить участника',
      phone: 'Номер телефона',
      submit: 'Добавить участника',
      duplicate: 'Этот номер уже добавлен в этот лагерь.',
      tooMany: 'Этот номер уже участвует в 2 лагерях.',
      success: 'Участник добавлен',
    },
    campWizard: {
      title: 'Новый лагерь',
      stepInfo: 'Данные',
      stepGroups: 'Группы',
      stepOrganizers: 'Организаторы',
      stepParticipants: 'Участники',
      stepReview: 'Проверка',
      next: 'Продолжить',
      back: 'Назад',
      finish: 'Создать лагерь',
      groupsTitle: 'Создать группы',
      groupsHint: 'Сначала создайте и назовите группы. Затем добавите в них людей.',
      groupNamePlaceholder: 'Название новой группы',
      addGroup: 'Добавить',
      groupCount: 'Создано групп: {count}',
      remove: 'Удалить',
      organizersTitle: 'Пригласить организаторов',
      organizersHint:
        'Добавьте имя, email и телефон. Каждый организатор получит ссылку для регистрации.',
      participantsTitle: 'Добавить участников',
      participantsHint:
        'Выберите группу, затем добавьте номера. Каждый участник входит по своему номеру.',
      pending: 'Ожидает регистрации',
      reviewTitle: 'Проверьте и подтвердите',
      reviewHint: 'Всё верно? Создайте лагерь, когда будете готовы.',
      statGroups: 'Группы',
      statOrganizers: 'Организаторы',
      statParticipants: 'Участники',
      orgName: 'Имя',
      orgSurname: 'Фамилия',
      orgEmail: 'Email',
      stepProgress: 'Шаг {n} из {total}',
      namePlaceholder: 'Summer camp 2026',
      capacityPlaceholder: '40',
      locationPlaceholder: 'Выберите локацию',
      bannerCta: 'Добавьте обложку',
      bannerHint: 'PNG или JPG · показывается на странице лагеря',
      bannerChange: 'Заменить',
      bannerRemove: 'Убрать',
      commitError: 'Не удалось создать лагерь. Попробуйте ещё раз.',
      retry: 'Повторить',
      creating: 'Создание…',
    },
    orgProfile: {
      title: 'Профиль организации',
      role: 'Организация',
      email: 'Email',
      phone: 'Телефон',
      language: 'Язык',
      logout: 'Выйти',
      statCamps: 'Лагеря',
      statParticipants: 'Участники',
      statOrganizers: 'Организаторы',
    },
  },
  en: {
    admin: {
      login: {
        title: 'Organization sign in',
        subtitle: 'Enter your admin credentials',
        username: 'Username',
        password: 'Password',
        cta: 'Sign in',
        error: 'Invalid credentials',
      },
      nav: {
        dashboard: 'Dashboard',
        camps: 'Camps',
        managers: 'Managers',
        profile: 'Profile',
        logout: 'Log out',
      },
      managers: {
        title: 'Managers',
        subtitle: '{count} managers',
        new: 'New manager',
        empty: 'No managers yet',
        emptyHint: 'Invite a manager to create and run a camp.',
        loadError: 'Could not load managers',
        active: 'Active',
        deactivated: 'Deactivated',
        deactivate: 'Deactivate',
        reactivate: 'Reactivate',
        confirmDeactivate: 'Deactivate this manager? They will be signed out immediately.',
        pending: 'Pending',
        resend: 'Resend',
        revoke: 'Revoke',
        confirmRevoke: 'Revoke this invitation?',
        delete: 'Delete',
        confirmDelete: "Delete {name}? This can't be undone.",
      },
      create: {
        title: 'New organizer',
        name: 'Name',
        surname: 'Surname',
        phone: 'Phone',
        password: 'Password',
        email: 'Email',
        sent: 'Invitation sent to {email}',
        copyLink: 'Copy link',
        copied: 'Copied!',
        submit: 'Create organizer',
        duplicate: 'That email is already registered',
        duplicatePhone: 'That phone number is already registered',
        success: 'Organizer created',
      },
      createManager: {
        title: 'New manager',
        submit: 'Create manager',
        success: 'Manager created',
      },
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Organization overview',
        stats: {
          organizers: 'Organizers',
          active: 'Active',
          deactivated: 'Deactivated',
          pending: 'Pending',
          camps: 'Camps',
        },
        quickActions: {
          addOrganizer: 'Add organizer',
          viewCamps: 'View camps',
        },
        recentOrganizers: 'Recent organizers',
        loadError: "Couldn't load data",
      },
      camps: {
        title: 'Camps',
        subtitle: '{count} camps',
        by: 'by {name}',
        statusActive: 'Active',
        statusUpcoming: 'Upcoming',
        statusDraft: 'Draft',
        statusArchived: 'Archived',
        empty: 'No camps yet',
        emptyHint: "When organizers create camps, they'll appear here.",
        loadError: "Couldn't load camps",
        participants: '{count} participants',
        total: 'Total camps',
        active: 'Active',
        create: 'Create new camp',
        createHint: 'Details · organizers · participants',
      },
    },
    login: {
      eyebrow: 'For participants',
      welcome: 'Welcome!',
      subtitle: 'Enter your phone number to step into camp.',
      phoneLabel: 'Phone number',
      phoneError: 'Enter a valid 9-digit number.',
      cta: 'Log in',
      switchLanguage: 'Choose language',
    },
    congrats: {
      title: 'Congratulations',
      message: "Congratulations, you've been accepted to camp!",
      continue: 'Continue',
    },
    notfound: {
      title: 'Nothing found',
      message: "Sorry, there's no such participant",
      back: 'Back',
    },
    signup: {
      eyebrow: 'Camp registration',
      title: 'Ready for an adventure?',
      subtitle:
        'A few quick details and your camp badge is ready. This is how counsellors and groupmates will find you.',
      badgeEmpty: 'Upload a photo',
      photoUploaded: 'Photo uploaded',
      uploadPhoto: 'Upload photo',
      nameLabel: 'Your name',
      firstName: 'First name',
      surname: 'Surname',
      cityLabel: 'Home city',
      cityPlaceholder: 'Search all cities of Uzbekistan',
      citySearchPlaceholder: 'Type a city…',
      cityCount: '{count} cities',
      regionSuffix: '{region} region',
      noResults: 'No city matches "{query}"',
      ageLabel: 'How old are you',
      ageUnit: 'years old',
      bracketJunior: 'Junior camper',
      bracketTeen: 'Teen camper',
      bracketSenior: 'Senior camper',
      enterValid: 'Enter camp',
      enterInvalid: 'Complete your profile',
      consentBefore: 'By entering you agree to the camp',
      consentLink: 'code of conduct',
      consentAfter: '& safety rules.',
      badgeCreated: 'Profile created',
      welcome: 'Welcome to camp, {name}!',
      enterCamp: 'Enter the camp',
      editDetails: 'Edit my details',
    },
    organizer: {
      congratsMessage: "Welcome aboard — you're part of the camp team!",
      eyebrow: 'Organizer setup',
      title: "Let's set up your profile",
      subtitle: "A few details so your team and campers know who's running the show.",
      roleLabel: 'What is your role?',
      roles: {
        coordinator: 'Coordinator',
        admin: 'Admin',
        media: 'Media',
        brandFace: 'Brand Face',
        eventManager: 'Event Manager',
        photographer: 'Photographer',
      },
      groupLabel: 'Your group',
      groupPlaceholder: 'Choose your group',
      enterValid: 'Create profile',
      enterInvalid: 'Complete your profile',
      badgeCreated: 'Profile created',
      welcome: "You're all set, {name}!",
      enterDashboard: 'Go to dashboard',
      editDetails: 'Edit my details',
    },
    org: {
      nav: { main: 'Main', chat: 'Chat', profile: 'Profile' },
      camps: {
        welcome: 'Welcome back, {name}',
        yourCamps: 'Your camps',
        statParticipants: 'Participants',
        statGroups: 'Groups',
        statOnSite: 'On-site',
        statWeather: 'Weather',
        notifications: 'Notifications',
        notificationsSubtitle: 'Sent to participants',
        needsHelp: '{name} needs help',
        reasonMedical: 'Medical',
        reasonLost: 'Lost',
        reasonUnsafe: 'Unsafe',
        reasonOther: 'Other',
        tapToLocate: 'tap to locate',
        view: 'View',
        liveMap: 'Live map',
        liveMapMeta: '{onsite} on-site · {alerts} alert',
        leaderboard: 'Leaderboard',
        leaderboardMeta: '{group} lead',
        topGroups: 'Top groups',
        viewAll: 'View all',
        statusActive: 'Active',
        statusUpcoming: 'Upcoming',
        statusDraft: 'Draft',
        statusArchived: 'Archived',
        participantsUnit: 'participants',
        groupsUnit: 'groups',
        checkIn: 'Check-in',
        dayProgress: 'Day {current} of {total}',
        error: 'Couldn’t load camps',
        retry: 'Retry',
        empty: 'No camps yet',
        emptyBody: 'Create your first camp.',
        soon: 'Coming soon',
        soonBody: 'This section is coming soon.',
      },
      detail: {
        back: 'Back',
        tabParticipants: 'Participants',
        tabGroups: 'Groups',
        tabMap: 'Map',
        tabLeaderboard: 'Leaderboard',
        tabSchedule: 'Schedule',
        tabAnnouncements: 'Announcements',
        statParticipants: 'Participants',
        statGroups: 'Groups',
        statCheckedIn: 'Checked in',
        hubParticipantsStat: '{count} total',
        hubGroupsStat: '{count} groups',
        hubScheduleStat: 'Day {current}/{total}',
        hubScheduleStatEmpty: 'Timeline',
        hubAnnouncementsStat: 'Broadcasts',
        hubStatEmpty: '—',
        searchParticipants: 'Search {count} participants…',
        statusIn: 'In',
        statusOut: 'Out',
        seeOnMap: 'See on map',
        unassigned: 'Unassigned',
        members: '{count} members',
        noMembers: 'No members yet',
        leader: 'Leader',
        noResults: 'No matches',
        loadError: 'Couldn’t load data',
        lbTitle: 'Group standings',
        lbSubtitle: 'Tap +/− to award or adjust points',
        addActivity: 'Add activity',
        newActivity: 'New activity',
        activityName: 'Activity name',
        activityNamePlaceholder: 'e.g. Morning Run',
        dateLabel: 'Date',
        startLabel: 'Start',
        endLabel: 'End',
        locationLabel: 'Location',
        locationPlaceholder: 'e.g. Main Field',
        audience: 'Who is it for?',
        activityRequired: 'Please fill in the required fields',
        schedEmpty: 'No activities yet',
        applyPoints: 'Apply {n}',
        noChange: 'No change',
        wheelAria: 'Points wheel',
        newAnnouncement: 'New announcement',
        annTitleOptional: 'Title (optional)',
        annMessage: 'Message',
        annMessagePlaceholder: 'Write your announcement…',
        pinToTop: 'Pin to top',
        annEmpty: 'No announcements yet',
        create: 'Create',
        cancel: 'Cancel',
      },
      chat: {
        channelOrganizers: 'Organizers',
        channelGroup: 'My group',
        online: '{count} online',
        lockedTitle: 'Coordinators only',
        lockedBody:
          'Only group coordinators can see this channel. You’re not a coordinator of this group.',
        membersSheetTitle: 'Members',
      },
      profile: {
        title: 'Profile',
        roleOrganizer: 'Organizer',
        roleManager: 'Manager',
        statCamps: 'Camps',
        helpRequests: 'Help requests',
        resolve: 'Resolve',
        allSafe: 'No active requests — all participants safe.',
        organization: 'Organization',
        team: 'Team & co-organizers',
        campSettings: 'Camp settings',
      },
      team: {
        title: 'Team & co-organizers',
        people: '{count} people',
        invite: 'Invite co-organizer',
        inviteBody: 'Add a teammate by phone number',
        roleLabel: 'Role',
        sendInvite: 'Send invite',
        inviteHint: 'They join by entering this number — no email needed.',
        members: 'Members',
        you: 'You',
        pending: 'Pending invites',
        invitedAgo: 'invited {time}',
        phonePlaceholder: '90 123 45 67',
        rolesNote:
          'Each teammate gets rights by role. Organizers can’t create organizations or other organizers.',
      },
    },
    nav: {
      home: 'Home',
      map: 'Map',
      ranks: 'Ranks',
      chat: 'Chat',
      profile: 'Profile',
    },
    home: {
      liveNow: 'Live now',
      dayProgress: 'Day {current} of {total}',
      upNext: 'Up next',
      upNextWith: 'with {group}',
      todaySchedule: "Today's schedule",
      seeAll: 'See all',
      statusDone: 'Done',
      statusNow: 'Now',
      latestAnnouncement: 'Latest announcement',
      all: 'All',
      myGroup: 'My group',
      membersCount: '{count} members',
    },
    sos: {
      title: 'Emergency help',
      subtitle: 'Your organizer & group leader are alerted instantly.',
      whatsHappening: "What's happening?",
      reasons: {
        medical: 'Medical',
        lost: "I'm lost",
        unsafe: 'Feel unsafe',
        other: 'Something else',
      },
      reasonDefault: 'Emergency',
      locationSuffix: 'location shared live',
      alertsBefore: 'Alerts',
      alertsLeader: 'leader',
      holdToSend: 'Hold to send SOS',
      keepHolding: 'Keep holding…',
      holdHint: 'Press and hold for a moment — this prevents accidental alerts.',
      sendingTitle: 'Alerting the organizer team…',
      sendingSub: 'Sending {reason} · sharing your live location',
      helpComing: 'Help coming',
      helpOnWay: 'Help on the way',
      stayPut: 'Stay where you are',
      activeSub: 'Sending {reason} · {location}',
      responderRole: 'Organizer · en route to you',
      eta: 'ETA',
      teamNotified: '{team} notified',
      leaderAlerted: 'Group leader {leader} alerted',
      sharingLocation: 'Sharing your live location',
      now: 'now',
      callOrganizer: 'Call organizer',
      imSafe: "I'm safe now",
    },
    profile: {
      title: 'Profile',
      roles: { participant: 'Participant' },
      groupRank: 'Group rank',
      activities: 'Activities',
      points: 'Points',
      needHelp: 'Need help?',
      needHelpBody: 'Instantly alert the organizer team with your location.',
      sendHelp: 'Send help request',
      organizerNotified: 'Organizer notified',
      organizerNotifiedBody: 'Help is on the way to your location. Stay where you are.',
      cancelAlert: "I'm OK — cancel alert",
      email: 'Email',
      addEmail: 'Add your email',
      phone: 'Phone',
      city: 'City',
      notSet: 'Not set',
      socialLinks: 'Social links',
      edit: 'Edit',
      save: 'Save',
      socialHint: 'Tap a logo to open — this is how other campers reach you.',
      saveLinks: 'Save links',
      tgPlaceholder: 'Telegram (t.me/…)',
      igPlaceholder: 'Instagram (@username)',
      fbPlaceholder: 'Facebook link',
      liPlaceholder: 'LinkedIn link',
      notifications: 'Notifications',
      notificationsBlocked: 'Turn on notifications in your browser settings.',
      notificationsInstall: 'Install Camply to your home screen to get alerts.',
      language: 'Language',
      chooseLanguage: 'Choose your preferred language',
      locationSharing: 'Location sharing',
      appearance: 'Appearance',
      logout: 'Log out',
    },
    chat: {
      membersOnline: '{members} members · {online} online',
      messagePlaceholder: 'Message {group}…',
      changePhoto: 'Change group photo',
      attach: 'Attach',
      photo: 'Photo / Gallery',
      file: 'Attach file',
      camera: 'Camera',
      send: 'Send',
      viewMembers: 'View members',
      call: 'Call',
      reply: 'Reply',
      emptyThread: 'No messages yet. Say hi!',
      loading: 'Loading…',
      loadError: "Couldn't load chat",
      leaderRole: 'Group leader',
      memberRole: 'Participant',
      you: 'You',
      leaderBadge: 'Leader',
      ageYears: '{age} years',
      socials: 'Socials',
      noSocials: 'No links yet',
    },
    ranks: {
      title: 'Leaderboard',
      yourStanding: 'Your standing',
      you: 'YOU',
      behindLeader: '{delta} pts behind {name}',
      leadingBy: 'Leading by {delta} pts',
      points: 'pts',
      howPointsEarned: 'How points are earned',
      activities: 'Activities',
      attendance: 'Attendance',
      challenges: 'Challenges',
      loadError: 'Couldn’t load the leaderboard.',
      empty: 'No rankings yet',
      emptyBody: 'Standings appear once points are awarded.',
    },
    common: {
      comingSoon: 'Coming soon',
      comingSoonBody: 'This part of camp is being built. Check back soon!',
    },
    time: {
      justNow: 'just now',
      minAgo: '{count} min ago',
      hoursAgo: '{count}h ago',
      daysAgo: '{count}d ago',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    announcements: {
      title: 'Announcements',
      empty: 'No announcements yet',
      emptyBody: "When organizers post an announcement, it'll show up here.",
      error: "Couldn't load announcements",
      retry: 'Try again',
      pinned: 'Pinned',
      allCamp: 'All camp',
      today: 'Today',
      yesterday: 'Yesterday',
      edited: 'edited',
      back: 'Back',
    },
    schedule: {
      title: 'Schedule',
      today: 'Today',
      empty: 'No schedule yet',
      emptyDay: 'No activities this day',
      error: "Couldn't load the schedule",
      back: 'Back',
    },
    pwa: {
      updateReady: 'A new version is available.',
      reload: 'Reload',
      offlineReady: 'Camply is ready to work offline.',
      dismiss: 'Dismiss',
    },
    invite: {
      greeting: 'Welcome, {name}',
      subtitle: "You've been added as an organizer.",
      submit: 'Accept & continue',
      invalid: 'This invite link is invalid.',
      expired: 'This invite link has expired. Ask your organization to send a new one.',
    },
    createCamp: {
      title: 'New camp',
      name: 'Camp name',
      location: 'Location',
      starts: 'Start date',
      ends: 'End date',
      capacity: 'Capacity (optional)',
      submit: 'Create camp',
      dateError: 'End date must be after the start date.',
      required: 'Please fill in all required fields',
      success: 'Camp created',
    },
    addParticipant: {
      title: 'Add participant',
      phone: 'Phone number',
      submit: 'Add participant',
      duplicate: 'That phone is already in this camp.',
      tooMany: 'That phone is already in 2 camps.',
      success: 'Participant added',
    },
    campWizard: {
      title: 'New camp',
      stepInfo: 'Details',
      stepGroups: 'Groups',
      stepOrganizers: 'Organizers',
      stepParticipants: 'Participants',
      stepReview: 'Review',
      next: 'Continue',
      back: 'Back',
      finish: 'Create camp',
      groupsTitle: 'Create groups',
      groupsHint: "Name your groups first. You'll add people to them next.",
      groupNamePlaceholder: 'New group name',
      addGroup: 'Add',
      groupCount: '{count} groups created',
      remove: 'Remove',
      organizersTitle: 'Invite organizers',
      organizersHint:
        'Add name, email and phone. Each organizer gets an email link to finish signing up.',
      participantsTitle: 'Add participants',
      participantsHint:
        'Pick a group, then add phone numbers. Each participant signs up with their own number.',
      pending: 'Awaiting sign-up',
      reviewTitle: 'Review & confirm',
      reviewHint: 'Everything correct? Create the camp when ready.',
      statGroups: 'Groups',
      statOrganizers: 'Organizers',
      statParticipants: 'Participants',
      orgName: 'First name',
      orgSurname: 'Last name',
      orgEmail: 'Email',
      stepProgress: 'Step {n} of {total}',
      namePlaceholder: 'Summer camp 2026',
      capacityPlaceholder: '40',
      locationPlaceholder: 'Select location',
      bannerCta: 'Add a cover image',
      bannerHint: 'PNG or JPG · shown on the camp page',
      bannerChange: 'Change',
      bannerRemove: 'Remove',
      commitError: 'Could not create the camp. Please try again.',
      retry: 'Try again',
      creating: 'Creating…',
    },
    orgProfile: {
      title: 'Organization profile',
      role: 'Organization',
      email: 'Email',
      phone: 'Phone',
      language: 'Language',
      logout: 'Log out',
      statCamps: 'Camps',
      statParticipants: 'Participants',
      statOrganizers: 'Organizers',
    },
  },
}

// Default UI language before the participant manually picks one (first market).
export const DEFAULT_LANG: Lang = 'uz'
