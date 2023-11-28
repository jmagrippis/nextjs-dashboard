import {PrismaClient} from '@prisma/client'

import {customers, invoices, revenue, users} from './placeholderData'

const prisma = new PrismaClient()

try {
	await prisma.user.createMany({data: users, skipDuplicates: true})
	console.log(`Seeded ${users.length} users`)

	await prisma.customer.createMany({data: customers, skipDuplicates: true})
	console.log(`Seeded ${customers.length} customers`)

	await prisma.invoice.createMany({data: invoices, skipDuplicates: true})
	console.log(`Seeded ${invoices.length} invoices`)

	await prisma.revenue.createMany({data: revenue, skipDuplicates: true})
	console.log(`Seeded ${revenue.length} revenue`)

	await prisma.$disconnect()
} catch (error) {
	console.error(error)
	await prisma.$disconnect()
	process.exit(1)
}
