import Form from '@/ui/invoices/edit-form'
import Breadcrumbs from '@/ui/invoices/breadcrumbs'
import {fetchCustomers, fetchInvoiceById} from '@/lib/data'
import {notFound} from 'next/navigation'

type Props = {params: {id: string}}
export default async function Page({params}: Props) {
	const {id} = params
	const [invoice, customers] = await Promise.all([
		fetchInvoiceById(id),
		fetchCustomers(),
	])

	if (!invoice) {
		notFound()
	}

	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{label: 'Invoices', href: '/dashboard/invoices'},
					{
						label: 'Edit Invoice',
						href: `/dashboard/invoices/${id}/edit`,
						active: true,
					},
				]}
			/>
			<Form invoice={invoice} customers={customers} />
		</main>
	)
}
