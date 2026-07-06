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

export const translations: Record<
  Lang,
  {
    login: LoginStrings
    congrats: CongratsStrings
    notfound: NotFoundStrings
    signup: SignUpStrings
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
  },
}

// Default UI language before the participant manually picks one (first market).
export const DEFAULT_LANG: Lang = 'uz'
