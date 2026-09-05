import { lang } from 'next/root-params'
import { redirect } from 'next/navigation'

const dictionaries = {
  'en-US': () => import('../../dictionaries/en-us.json').then((module) => module.default),
  'pt-BR': () => import('../../dictionaries/pt-br.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async () => {
  const locale = await lang()
  if (!hasLocale(locale)) {
    redirect('/en-US')
  }

  return dictionaries[locale]()
}
