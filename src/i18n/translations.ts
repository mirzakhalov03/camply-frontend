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

export const translations: Record<
  Lang,
  { login: LoginStrings; congrats: CongratsStrings; notfound: NotFoundStrings }
> = {
  uz: {
    login: {
      eyebrow: 'Ishtirokchilar uchun',
      welcome: 'Xush kelibsiz',
      subtitle: 'Lagerga kirish uchun telefon raqamingizni kiriting.',
      phoneLabel: 'Telefon raqami',
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
  },
  ru: {
    login: {
      eyebrow: 'Для участников',
      welcome: 'Добро пожаловать',
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
  },
  en: {
    login: {
      eyebrow: 'For participants',
      welcome: 'Welcome',
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
  },
}

// Default UI language before the participant manually picks one (first market).
export const DEFAULT_LANG: Lang = 'uz'
