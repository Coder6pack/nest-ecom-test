import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prismaService = new PrismaService()
const hashingPassword = new HashingService()

const initSeedData = async () => {
	const roleCount = await prismaService.role.count()
	if (roleCount > 0) {
		throw new Error('Role data already seeded')
	}

	const roles = await prismaService.role.createMany({
		data: [
			{
				name: RoleName.Admin,
				description: 'Admin role',
			},
			{
				name: RoleName.Client,
				description: 'Client role',
			},
			{
				name: RoleName.Seller,
				description: 'Seller role',
			},
		],
	})

	const adminRole = await prismaService.role.findFirstOrThrow({
		where: {
			name: RoleName.Admin,
		},
	})

	const adminPassword = await hashingPassword.hash(envConfig.ADMIN_PASSWORD)
	const adminUser = await prismaService.user.create({
		data: {
			name: RoleName.Admin,
			email: envConfig.ADMIN_EMAIL,
			password: adminPassword,
			phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
			roleId: adminRole.id,
		},
	})

	return { roles, adminUser }
}

initSeedData()
	.then(({ roles, adminUser }) => {
		console.log(`created ${roles.count} roles`)
		console.log(`created admin user ${adminUser.id}`)
	})
	.catch((error) => {
		console.error(error)
	})
