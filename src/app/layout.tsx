import './global.css'

import {Analytics} from '@vercel/analytics/react'
import type {Metadata} from 'next'
import clsx from 'clsx'

import {fontSans, fontSerif} from './fonts'

export const metadata: Metadata = {
	title: {
		template: '%s | Acme Dashboard',
		default: 'Acme Dashboard',
	},
	description: 'The official Next.js Learn Dashboard built with App Router.',
	metadataBase: new URL('https://nextjs-dashboard-ecru-theta.vercel.app'),
}

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html
			lang="en"
			className={clsx('antialiased', fontSans.variable, fontSerif.variable)}
		>
			<body>
				{children}
				<Analytics />
			</body>
		</html>
	)
}
