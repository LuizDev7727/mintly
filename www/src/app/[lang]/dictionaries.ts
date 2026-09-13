import { lang } from 'next/root-params'
import { redirect } from 'next/navigation'
import { hasLocale } from './locales'

const dictionaries = {
  'en': () => import('../../dictionaries/en-us.json').then((module) => module.default),
  'pt': () => import('../../dictionaries/pt-br.json').then((module) => module.default),
}

export const getDictionary = async () => {
  const locale = await lang()
  if (!hasLocale(locale)) {
    redirect('/en')
  }

  return dictionaries[locale]()
}
