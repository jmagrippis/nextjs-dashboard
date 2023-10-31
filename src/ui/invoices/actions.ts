'use server'

import {sql} from '@vercel/postgres'
import {z} from 'zod'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'

const InvoiceSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	amount: z.coerce.number(),
	status: z.enum(['pending', 'paid']),
	date: z.string(),
})

const CreateInvoice = InvoiceSchema.omit({id: true, date: true})

export async function createInvoice(formData: FormData) {
	const {customerId, amount, status} = CreateInvoice.parse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	})
	const amountInCents = amount * 100
	const date = new Date().toISOString().split('T')[0]

	try {
		await sql`
			INSERT INTO invoices (customer_id, amount, status, date)
			VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
		`
	} catch (error) {
		const message = `Error creating invoice for customer ${customerId}`
		console.error(message, error)

		return {message}
	}

	revalidatePath('/dashboard/invoices')
	redirect('/dashboard/invoices')
}

const UpdateInvoice = InvoiceSchema.omit({date: true})

export async function updateInvoice(id: string, formData: FormData) {
	const {customerId, amount, status} = UpdateInvoice.parse({
		id,
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	})

	const amountInCents = amount * 100

	try {
		await sql`
			UPDATE invoices
			SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
			WHERE id = ${id}
		`

		revalidatePath('/dashboard/invoices')
		redirect('/dashboard/invoices')
	} catch (error) {
		const message = `Error updating invoice ${id}`
		console.error(message, error)

		return {message}
	}
}

export async function deleteInvoice(id: string) {
	throw new Error('Failed to Delete Invoice')

	try {
		await sql`DELETE FROM invoices WHERE id = ${id}`
		revalidatePath('/dashboard/invoices')
	} catch (error) {
		const message = `Error deleting invoice ${id}`
		console.error(message, error)

		return {message}
	}
}
