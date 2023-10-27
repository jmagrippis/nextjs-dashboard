import {fontSans} from './fonts'
import './global.css'
import clsx from 'clsx'

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en" className={clsx('antialiased', fontSans.variable)}>
			<body>{children}</body>
		</html>
	)
}
