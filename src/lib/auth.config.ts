import type {NextAuthConfig} from 'next-auth'

export const authConfig = {
	providers: [],
	pages: {
		signIn: '/login',
	},
	callbacks: {
		authorized({auth, request: {nextUrl}}) {
			// TODO: Turn auth on :-)
			if (!process.env.AUTH_ENABLED) {
				return true
			}

			const isLoggedIn = !!auth?.user
			const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')

			if (isOnDashboard) {
				return isLoggedIn
			} else if (isLoggedIn) {
				// redirect to dashboard if user is
				// logged but not on a dashboard route
				return Response.redirect(new URL('/dashboard', nextUrl))
			}
			return true
		},
	},
} satisfies NextAuthConfig
