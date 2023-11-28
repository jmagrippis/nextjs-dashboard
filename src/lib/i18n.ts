export const availableLocales = ['en', 'el'] as const
export type AvailableLocale = (typeof availableLocales)[number]

export const defaultLocale = availableLocales[0]
export const isAvailableLocale = (locale: unknown): locale is AvailableLocale =>
	typeof locale === 'string' &&
	availableLocales.includes(locale as AvailableLocale)
