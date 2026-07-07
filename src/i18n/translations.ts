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
    projectManager: string
    coordinator: string
    admin: string
    media: string
    brandFace: string
    eventManager: string
    photographer: string
  }
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
  pinned: string
  minutesAgo: string // '{minutes} min ago'
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
  language: string
  chooseLanguage: string
  locationSharing: string
  logout: string
}

// Participant group chat — header, composer, attachment menu, member profile sheet.
type ChatStrings = {
  membersOnline: string // '{members} members · {online} online'
  messagePlaceholder: string // 'Message {group}…'
  changePhoto: string // aria-label for the group photo button
  attach: string // aria-label for the + button
  photo: string
  file: string
  send: string // aria-label for send
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

// Shared bits (empty states for the not-yet-built tabs).
type CommonStrings = {
  comingSoon: string
  comingSoonBody: string
}

export const translations: Record<
  Lang,
  {
    login: LoginStrings
    congrats: CongratsStrings
    notfound: NotFoundStrings
    signup: SignUpStrings
    organizer: OrganizerStrings
    nav: NavStrings
    home: HomeStrings
    sos: SosStrings
    profile: ProfileStrings
    chat: ChatStrings
    common: CommonStrings
  }
> = {
  uz: {
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
        projectManager: 'Loyiha menejeri',
        coordinator: 'Koordinator',
        admin: 'Administrator',
        media: 'Media',
        brandFace: 'Brend yuzi',
        eventManager: 'Tadbir menejeri',
        photographer: 'Fotograf',
      },
      enterValid: 'Profil yaratish',
      enterInvalid: 'Profilni toʻldiring',
      badgeCreated: 'Profil yaratildi',
      welcome: 'Hammasi tayyor, {name}!',
      enterDashboard: 'Boshqaruv paneliga',
      editDetails: 'Maʼlumotlarni tahrirlash',
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
      pinned: 'Qadalgan',
      minutesAgo: '{minutes} daqiqa oldin',
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
      language: 'Til',
      chooseLanguage: 'Oʻzingizga qulay tilni tanlang',
      locationSharing: 'Joylashuvni ulashish',
      logout: 'Chiqish',
    },
    chat: {
      membersOnline: '{members} aʼzo · {online} onlayn',
      messagePlaceholder: '{group} guruhiga yozing…',
      changePhoto: 'Guruh rasmini oʻzgartirish',
      attach: 'Biriktirish',
      photo: 'Rasm',
      file: 'Fayl',
      send: 'Yuborish',
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
    common: {
      comingSoon: 'Tez kunda',
      comingSoonBody: 'Oromgohning bu qismi tayyorlanmoqda. Tez orada qayting!',
    },
  },
  ru: {
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
        projectManager: 'Проектный менеджер',
        coordinator: 'Координатор',
        admin: 'Администратор',
        media: 'Медиа',
        brandFace: 'Лицо бренда',
        eventManager: 'Ивент-менеджер',
        photographer: 'Фотограф',
      },
      enterValid: 'Создать профиль',
      enterInvalid: 'Заполните профиль',
      badgeCreated: 'Профиль создан',
      welcome: 'Всё готово, {name}!',
      enterDashboard: 'В панель управления',
      editDetails: 'Изменить данные',
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
      pinned: 'Закреплено',
      minutesAgo: '{minutes} мин назад',
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
      language: 'Язык',
      chooseLanguage: 'Выберите предпочитаемый язык',
      locationSharing: 'Геолокация',
      logout: 'Выйти',
    },
    chat: {
      membersOnline: '{members} участников · {online} онлайн',
      messagePlaceholder: 'Написать {group}…',
      changePhoto: 'Изменить фото группы',
      attach: 'Прикрепить',
      photo: 'Фото',
      file: 'Файл',
      send: 'Отправить',
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
    common: {
      comingSoon: 'Скоро',
      comingSoonBody: 'Эта часть лагеря ещё в разработке. Загляните позже!',
    },
  },
  en: {
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
        projectManager: 'Project Manager',
        coordinator: 'Coordinator',
        admin: 'Admin',
        media: 'Media',
        brandFace: 'Brand Face',
        eventManager: 'Event Manager',
        photographer: 'Photographer',
      },
      enterValid: 'Create profile',
      enterInvalid: 'Complete your profile',
      badgeCreated: 'Profile created',
      welcome: "You're all set, {name}!",
      enterDashboard: 'Go to dashboard',
      editDetails: 'Edit my details',
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
      pinned: 'Pinned',
      minutesAgo: '{minutes} min ago',
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
      language: 'Language',
      chooseLanguage: 'Choose your preferred language',
      locationSharing: 'Location sharing',
      logout: 'Log out',
    },
    chat: {
      membersOnline: '{members} members · {online} online',
      messagePlaceholder: 'Message {group}…',
      changePhoto: 'Change group photo',
      attach: 'Attach',
      photo: 'Photo',
      file: 'File',
      send: 'Send',
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
    common: {
      comingSoon: 'Coming soon',
      comingSoonBody: 'This part of camp is being built. Check back soon!',
    },
  },
}

// Default UI language before the participant manually picks one (first market).
export const DEFAULT_LANG: Lang = 'uz'
