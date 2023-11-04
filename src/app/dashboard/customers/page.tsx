import {fetchFilteredCustomers} from '@/lib/data'
import CustomersTable from '@/ui/customers/table'
import Search from '@/ui/search'
import type {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Customers',
}

export default async function Page({
	searchParams,
}: {
	searchParams?: {
		query?: string
	}
}) {
	const query = searchParams?.query || ''

	const customers = await fetchFilteredCustomers(query)

	return (
		<div className="w-full">
			<div className="flex w-full items-center justify-between">
				<h1 className="font-serif text-2xl">Customers</h1>
			</div>
			<div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
				<Search placeholder="Search customers..." />
			</div>
			<CustomersTable customers={customers} />
		</div>
	)
}
