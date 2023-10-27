import {Inter, Lusitana} from 'next/font/google'

export const fontSans = Inter({
	subsets: ['latin'],
	variable: '--font-sans',
})

export const fontSerif = Lusitana({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-serif',
})
