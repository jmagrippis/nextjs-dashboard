type Props = {
	id: string
	errors?: string[]
}

export const FormErrorMessage = ({errors, id}: Props) =>
	errors ? (
		<div
			id="customer-error"
			aria-live="polite"
			className="mt-2 text-sm text-red-500"
		>
			{errors.map((error: string) => (
				<p key={error}>{error}</p>
			))}
		</div>
	) : null
