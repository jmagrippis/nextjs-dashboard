import {test as setup, expect} from '@playwright/test'

import {loggedInCredentials} from './credentials'

setup('authenticate', async ({page}) => {
	// Perform authentication steps. Replace these actions with your own.
	await page.goto('/login')
	await page.getByLabel('email').fill('user@nextmail.com')
	await page.getByLabel('password').fill('123456')
	await page.getByRole('button', {name: 'Log in'}).click()
	// Wait until the page receives the cookies.
	//
	// Sometimes login flow sets cookies in the process of several redirects.
	// Wait for the final URL to ensure that the cookies are actually set.
	// Alternatively, you can wait until the page reaches a state where all cookies are set.
	await expect(
		page.getByRole('heading', {name: 'Dashboard', level: 1}),
	).toBeVisible()

	// End of authentication steps.

	await page.context().storageState({path: loggedInCredentials})
})
