'use server'

import {signIn} from '@/lib/auth'

export async function authenticate(
	code: 'CredentialSignin' | undefined,
	formData: FormData,
) {
	try {
		await signIn('credentials', Object.fromEntries(formData))
	} catch (error) {
		console.log('signIn error', error)
		if ((error as Error).message.includes('CredentialsSignin')) {
			return 'CredentialSignin'
		}
		throw error
	}
}
