import {test, expect} from '@playwright/test'
import {loggedInCredentials} from './credentials'

test('guest navigation smoke test', async ({page}) => {
	await page.goto('/')

	await expect(page).toHaveTitle(/Acme Dashboard/)
	await expect(
		page.getByRole('heading', {level: 1, name: 'Acme'}),
	).toBeVisible()

	// Navigate to the log in page
	await page.getByRole('link', {name: 'Log in'}).click()

	await expect(page).toHaveTitle(/Log in/)
	await expect(
		page.getByRole('heading', {level: 1, name: 'Log in'}),
	).toBeVisible()
})

test('guest gets redirected to login for protected routes', async ({page}) => {
	await page.goto('/dashboard')

	await expect(page).toHaveTitle(/Log in/)
	await expect(
		page.getByRole('heading', {level: 1, name: 'Log in'}),
	).toBeVisible()
})

test.describe(() => {
	test.use({storageState: loggedInCredentials})

	test('authorized user navigation smoke test', async ({page}) => {
		await page.goto('/dashboard')

		await expect(page).toHaveTitle(/Acme Dashboard/)
		await expect(
			page.getByRole('heading', {level: 1, name: 'Dashboard'}),
		).toBeVisible()

		// Navigate to the invoices page
		await page.getByRole('link', {name: 'invoices'}).click()

		await expect(page).toHaveTitle(/Invoices/)
		await expect(
			page.getByRole('heading', {level: 1, name: 'Invoices'}),
		).toBeVisible()

		// Navigate to the invoices page
		await page.getByRole('link', {name: 'customers'}).click()

		await expect(page).toHaveTitle(/Customers/)
		await expect(
			page.getByRole('heading', {level: 1, name: 'Customers'}),
		).toBeVisible()
	})

	test('authorized user cannot visit the homepage', async ({page}) => {
		await page.goto('/')

		await expect(page).toHaveTitle(/Acme Dashboard/)
		await expect(
			page.getByRole('heading', {level: 1, name: 'Dashboard'}),
		).toBeVisible()
	})
})
