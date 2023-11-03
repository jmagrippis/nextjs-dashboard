'use client'

import {useFormStatus} from 'react-dom'
import {Button} from './button'

type Props = {
	children: React.ReactNode
	className?: string
}

export function SubmitButton({children, className}: Props) {
	const {pending} = useFormStatus()

	return (
		<Button className={className} disabled={pending}>
			{children}
		</Button>
	)
}
