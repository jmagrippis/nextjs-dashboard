import type {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Customers',
}

export default function Page() {
	return (
		<div className="w-full">
			<div className="flex w-full items-center justify-between">
				<h1 className="font-serif text-2xl">Customers</h1>
			</div>
			<p>TODO: Implement Customers View 😄</p>
		</div>
	)
}
