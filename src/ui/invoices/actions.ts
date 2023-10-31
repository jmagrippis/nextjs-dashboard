'use server'

import {sql} from '@vercel/postgres'
import {z} from 'zod'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'

const InvoiceSchema = z.object({
	id: z.string(),
	customerId: z.string({invalid_type_error: 'Please select a customer.'}),
	amount: z.coerce
		.number()
		.gt(0, {message: 'Please enter an amount greater than $0.'}),
	status: z.enum(['pending', 'paid'], {
		invalid_type_error: 'Please select an invoice status.',
	}),
	date: z.string(),
})

const CreateInvoice = InvoiceSchema.omit({id: true, date: true})

// TODO: This is temporary until @types/react-dom is updated
export type State = {
	errors?: {
		customerId?: string[]
		amount?: string[]
		status?: string[]
	}
	message?: string | null
}

export async function createInvoice(prevState: State, formData: FormData) {
	const validatedFields = CreateInvoice.safeParse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	})

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Missing Fields. Failed to Create Invoice.',
		}
	}

	const {customerId, amount, status} = validatedFields.data
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

export async function updateInvoice(
	id: string,
	prevState: State,
	formData: FormData,
) {
	const validatedFields = UpdateInvoice.safeParse({
		id,
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	})

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Missing Fields. Failed to Update Invoice.',
		}
	}

	const {customerId, amount, status} = validatedFields.data

	const amountInCents = amount * 100

	try {
		await sql`
			UPDATE invoices
			SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
			WHERE id = ${id}
		`
	} catch (error) {
		const message = `Error updating invoice ${id}`
		console.error(message, error)

		return {message}
	}

	revalidatePath('/dashboard/invoices')
	redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
	try {
		await sql`DELETE FROM invoices WHERE id = ${id}`
		revalidatePath('/dashboard/invoices')
	} catch (error) {
		const message = `Error deleting invoice ${id}`
		console.error(message, error)

		return {message}
	}
}
