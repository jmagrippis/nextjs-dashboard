import {unstable_noStore as noStore} from 'next/cache'

import type {Customer} from '@prisma/client'
import {formatCurrency} from './utils'
import prisma from './prisma'

export async function fetchRevenue() {
	// Add noStore() here prevent the response from being cached.
	// This is equivalent to in fetch(..., {cache: 'no-store'}).
	noStore()

	try {
		return prisma.revenue.findMany()
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch revenue data.')
	}
}

export async function fetchLatestInvoices() {
	noStore()

	try {
		const latestInvoices = await prisma.invoice.findMany({
			select: {
				id: true,
				amount: true,
				customer: {select: {name: true, image_url: true, email: true}},
			},
			orderBy: {date: 'desc'},
			take: 5,
		})

		return latestInvoices.map((invoice) => ({
			...invoice,
			amount: formatCurrency(invoice.amount),
		}))
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch the latest invoices.')
	}
}

export async function fetchCardData() {
	noStore()

	try {
		// You can probably combine these into a single SQL query
		// However, we are intentionally splitting them to demonstrate
		// how to initialize multiple queries in parallel with JS.
		const invoiceCountPromise = prisma.invoice.count()
		const customerCountPromise = prisma.customer.count()
		const totalPaidInvoicesPromise = prisma.invoice.aggregate({
			_sum: {amount: true},
			where: {status: 'paid'},
		})
		const totalPendingInvoicesPromise = prisma.invoice.aggregate({
			_sum: {amount: true},
			where: {status: 'pending'},
		})

		const [
			numberOfInvoices,
			numberOfCustomers,
			totalPaidInvoicesAggregate,
			totalPendingInvoicesAggregate,
		] = await Promise.all([
			invoiceCountPromise,
			customerCountPromise,
			totalPaidInvoicesPromise,
			totalPendingInvoicesPromise,
		])

		const totalPaidInvoices = formatCurrency(
			totalPaidInvoicesAggregate._sum.amount ?? 0,
		)
		const totalPendingInvoices = formatCurrency(
			totalPendingInvoicesAggregate._sum.amount ?? 0,
		)

		return {
			numberOfCustomers,
			numberOfInvoices,
			totalPaidInvoices,
			totalPendingInvoices,
		}
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch card data.')
	}
}

const ITEMS_PER_PAGE = 6
const getWhereForQuery = (query: string) => ({
	OR: [
		// TODO: Cannot find a nice way to
		// ILIKE `date` or `amount` with prisma,
		// besides a $queryRaw...
		{status: {contains: query}},
		{customer: {name: {contains: query}}},
		{customer: {email: {contains: query}}},
	],
})
export async function fetchFilteredInvoices(
	query: string,
	currentPage: number,
) {
	noStore()

	const offset = (currentPage - 1) * ITEMS_PER_PAGE

	try {
		const invoices = await prisma.invoice.findMany({
			select: {
				id: true,
				amount: true,
				date: true,
				status: true,
				customer: {select: {name: true, image_url: true, email: true}},
			},
			where: getWhereForQuery(query),
			orderBy: {date: 'desc'},
			take: ITEMS_PER_PAGE,
			skip: offset,
		})

		return invoices
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch invoices.')
	}
}

export async function fetchInvoicesPages(query: string) {
	noStore()

	try {
		const count = await prisma.invoice.count({where: getWhereForQuery(query)})

		const totalPages = Math.ceil(count / ITEMS_PER_PAGE)
		return totalPages
	} catch (error) {
		console.error('Database Error:', error)
		throw new Error('Failed to fetch total number of invoices.')
	}
}

export async function fetchInvoiceById(id: string) {
	try {
		const invoice = await prisma.invoice.findUnique({
			select: {
				id: true,
				customer_id: true,
				status: true,
				amount: true,
			},
			where: {id},
		})

		return invoice
			? {
					...invoice,
					// Convert amount from cents to dollars
					amount: invoice.amount / 100,
			  }
			: null
	} catch (error) {
		console.error('Database Error:', error)
	}
}

export type CustomerForSelect = Pick<Customer, 'id' | 'name'>
export async function fetchCustomers() {
	try {
		return prisma.customer.findMany({
			select: {id: true, name: true},
			orderBy: {name: 'asc'},
		})
	} catch (err) {
		console.error('Database Error:', err)
		throw new Error('Failed to fetch all customers.')
	}
}

export type CustomerWithInvoices = Customer & {
	total_invoices: number
	total_pending: BigInt
	total_paid: BigInt
}
export type CustomerWithFormattedInvoices = Customer & {
	total_invoices: number
	total_pending: string
	total_paid: string
}
export async function fetchFilteredCustomers(
	query: string,
): Promise<CustomerWithFormattedInvoices[]> {
	noStore()

	try {
		const dbCustomers = await prisma.$queryRaw<CustomerWithInvoices[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `

		return dbCustomers.map((customer) => ({
			...customer,
			total_pending: formatCurrency(Number(customer.total_pending)),
			total_paid: formatCurrency(Number(customer.total_paid)),
		}))
	} catch (err) {
		console.error('Database Error:', err)
		throw new Error('Failed to fetch customer table.')
	}
}

export async function getUser(email: string) {
	try {
		return prisma.user.findUnique({where: {email}})
	} catch (error) {
		console.error('Failed to fetch user:', error)
		throw new Error('Failed to fetch user.')
	}
}
