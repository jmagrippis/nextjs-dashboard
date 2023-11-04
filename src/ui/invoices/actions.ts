'use server'

import {z} from 'zod'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import prisma from '@/lib/prisma'

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

	const date = new Date().toISOString()

	try {
		await prisma.invoice.create({
			data: {
				customer_id: customerId,
				amount: amountInCents,
				status,
				date,
			},
		})
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
		await prisma.invoice.update({
			where: {id},
			data: {customer_id: customerId, amount: amountInCents, status},
		})
	} catch (error) {
		const message = `Error updating invoice ${id}`
		console.error(message, error)

		return {message}
	}

	revalidatePath('/dashboard/invoices')
	revalidatePath(`/dashboard/invoices/${id}/edit`)

	redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
	try {
		await prisma.invoice.delete({where: {id}})
		revalidatePath('/dashboard/invoices')
		revalidatePath(`/dashboard/invoices/${id}/edit`)
	} catch (error) {
		const message = `Error deleting invoice ${id}`
		console.error(message, error)

		return {message}
	}
}
