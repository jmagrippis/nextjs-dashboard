import 'server-only'

export const availableLocales = ['en', 'el'] as const
export type AvailableLocale = (typeof availableLocales)[number]

export const defaultLocale = availableLocales[0]
export const isAvailableLocale = (locale: unknown): locale is AvailableLocale =>
	typeof locale === 'string' &&
	availableLocales.includes(locale as AvailableLocale)

const dictionaries = {
	en: () => import('@/messages/en.json').then((module) => module.default),
	el: () => import('@/messages/el.json').then((module) => module.default),
}

export const getDictionary = async (locale: unknown) =>
	isAvailableLocale(locale)
		? dictionaries[locale]()
		: dictionaries[defaultLocale]()
