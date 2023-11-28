import NextAuth from 'next-auth'
import Negotiator from 'negotiator'

import {authConfig} from './auth.config'
import {
	AvailableLocale,
	availableLocales,
	defaultLocale,
	isAvailableLocale,
} from './lib/i18n'
import {NextResponse} from 'next/server'

export default NextAuth(authConfig).auth((request) => {
	const userLanguages = request.headers.get('Accept-Language')

	let locale: AvailableLocale = defaultLocale
	if (userLanguages) {
		const userLocale = new Negotiator({
			headers: {'accept-language': userLanguages},
		}).language(availableLocales as unknown as string[])
		if (isAvailableLocale(userLocale)) {
			locale = userLocale
		}
	}

	const newHeaders = new Headers(request.headers)
	newHeaders.set('x-locale', locale)

	return NextResponse.next({
		request: {
			headers: newHeaders,
		},
	})
})

export const config = {
	// https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
