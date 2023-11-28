import './global.css'

import {Analytics} from '@vercel/analytics/react'
import {headers} from 'next/headers'
import type {Metadata} from 'next'
import clsx from 'clsx'

import {fontSans, fontSerif} from './fonts'
import {defaultLocale, isAvailableLocale} from '@/lib/i18n'
import {setLanguageTag} from '@/paraglide/runtime'

export const metadata: Metadata = {
	title: {
		template: '%s | Acme Dashboard',
		default: 'Acme Dashboard',
	},
	description: 'The official Next.js Learn Dashboard built with App Router.',
	metadataBase: new URL('https://nextjs-dashboard-ecru-theta.vercel.app'),
}

export default function RootLayout({children}: {children: React.ReactNode}) {
	const xLocale = headers().get('x-locale')
	const locale = isAvailableLocale(xLocale) ? xLocale : defaultLocale
	setLanguageTag(locale)

	return (
		<html
			lang={locale}
			className={clsx('antialiased', fontSans.variable, fontSerif.variable)}
		>
			<body>
				{children}
				<Analytics />
			</body>
		</html>
	)
}
