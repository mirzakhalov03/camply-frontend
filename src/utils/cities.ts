/*
  Uzbekistan cities for the sign-up home-city picker (first market). Kept as
  plain data, separate from the UI, so the list can grow or move to an API later
  without touching the component. City/region names are proper nouns — they stay
  literal in every language rather than going through i18n.
*/
export type City = {
  name: string
  region: string
}

export const CITIES: City[] = [
  { name: 'Tashkent', region: 'Tashkent' },
  { name: 'Samarkand', region: 'Samarqand' },
  { name: 'Bukhara', region: 'Bukhara' },
  { name: 'Namangan', region: 'Namangan' },
  { name: 'Andijan', region: 'Andijan' },
  { name: 'Nukus', region: 'Karakalpakstan' },
  { name: 'Fergana', region: 'Fergana' },
  { name: 'Qarshi', region: 'Kashkadarya' },
  { name: 'Kokand', region: 'Fergana' },
  { name: 'Margilan', region: 'Fergana' },
  { name: 'Chirchiq', region: 'Tashkent' },
  { name: 'Jizzakh', region: 'Jizzakh' },
  { name: 'Urgench', region: 'Khorezm' },
  { name: 'Termez', region: 'Surkhandarya' },
  { name: 'Navoiy', region: 'Navoiy' },
  { name: 'Angren', region: 'Tashkent' },
  { name: 'Almalyk', region: 'Tashkent' },
  { name: 'Bekabad', region: 'Tashkent' },
  { name: 'Yangiyul', region: 'Tashkent' },
  { name: 'Nurafshon', region: 'Tashkent' },
  { name: 'Gulistan', region: 'Sirdaryo' },
  { name: 'Yangiyer', region: 'Sirdaryo' },
  { name: 'Shahrisabz', region: 'Kashkadarya' },
  { name: 'Kitob', region: 'Kashkadarya' },
  { name: 'Zarafshan', region: 'Navoiy' },
  { name: 'Kattaqurgan', region: 'Samarqand' },
  { name: 'Urgut', region: 'Samarqand' },
  { name: 'Khiva', region: 'Khorezm' },
  { name: 'Denov', region: 'Surkhandarya' },
  { name: 'Boysun', region: 'Surkhandarya' },
  { name: 'Chust', region: 'Namangan' },
  { name: 'Kosonsoy', region: 'Namangan' },
  { name: 'Rishtan', region: 'Fergana' },
  { name: 'Quva', region: 'Fergana' },
  { name: 'Gijduvon', region: 'Bukhara' },
  { name: 'Kagan', region: 'Bukhara' },
  { name: 'Beruniy', region: 'Karakalpakstan' },
  { name: 'Turtkul', region: 'Karakalpakstan' },
  { name: 'Muynak', region: 'Karakalpakstan' },
]
